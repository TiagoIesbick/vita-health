import io
import openai
import fitz
import pytesseract
import json
import asyncio
from typing import List, Dict
from PIL import Image
from openai import OpenAIError
from os import getenv
from db.redis import redis_client, pubsub


openai.api_key = getenv('OPENAI_API_KEY')


def extract_text_from_pdf(file_path: str) -> str:
    """
    Extract text content from a PDF file.

    This function opens a PDF file, iterates through all its pages,
    and extracts the text content from each page.

    Parameters:
    file_path (str): The path to the PDF file to be processed.

    Returns:
    str: A string containing all the extracted text from the PDF file.
    """
    doc = fitz.open(file_path)
    text = ""
    for page_num in range(doc.page_count):
        page = doc.load_page(page_num)
        text += page.get_text("text")
    return text



def extract_text_with_ocr(file_path: str, content_type: str ="application/pdf") -> str:
    """
    Extract text from a file using OCR (Optical Character Recognition).

    This function can handle both PDF files and image files. For PDF files,
    it extracts text from each page using OCR. For other file types (assumed to be images),
    it directly applies OCR to the entire image.

    Parameters:
    file_path (str): The path to the file from which to extract text.
    content_type (str, optional): The MIME type of the file. Defaults to "application/pdf".

    Returns:
    str: The extracted text from the file.
    """
    if content_type == "application/pdf":
        doc = fitz.open(file_path)
        text = ""
        for page_num in range(doc.page_count):
            page = doc.load_page(page_num)
            pix = page.get_pixmap()
            img = Image.open(io.BytesIO(pix.tobytes()))
            text += pytesseract.image_to_string(img)
        return text
    else:
        img = Image.open(file_path)
        text = pytesseract.image_to_string(img)
        return text



async def openai_chat_stream(conversation: List[Dict[str, str]], key: str) -> None:
    """
    This function is responsible for streaming a conversation with OpenAI's GPT-4o-mini model.
    It takes a list of conversation messages and a key as parameters.

    Parameters:
    - conversation (List[Dict[str, str]]): A list of dictionaries representing the conversation messages. Each dictionary should have a 'role' and 'content' key.
    - key (str): A unique identifier for the conversation.

    Returns:
    - None. The function is asynchronous and does not return a value.

    The function sends the conversation messages to OpenAI's GPT-4o-mini model and streams the response.
    It then publishes each chunk of the response to a Redis Pub/Sub channel identified by the provided key.
    It also updates the conversation history in Redis with the assistant's response.
    If an OpenAIError occurs during the conversation, it publishes an error message to the Redis Pub/Sub channel.
    """
    try:
        response = await asyncio.to_thread(
            openai.chat.completions.create,
            model="gpt-4o-mini",
            messages=conversation,
            max_tokens=2000,
            temperature=0.7,
            stream=True
        )

        full_response = ""
        for chunk in response:
            if hasattr(chunk, 'choices') and len(chunk.choices) > 0:
                delta = chunk.choices[0].delta
                if hasattr(delta, 'content') and delta.content:
                    full_response += delta.content

                    await pubsub.publish(channel=key, message=json.dumps({
                        "role": "assistant",
                        "content": delta.content
                    }))

        conversation_history = json.loads(redis_client.get(key))
        conversation_history.append({"role": "assistant", "content": full_response})

        ttl = redis_client.ttl(key)
        if ttl > 0:
            await asyncio.to_thread(redis_client.set, key, json.dumps(conversation_history))
            await asyncio.to_thread(redis_client.expire, key, ttl)

    except OpenAIError as e:
        await pubsub.publish(channel=key, message=json.dumps({
            "role": "error",
            "content": str(e)
        }))
