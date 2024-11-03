import io
import openai
import fitz
import pytesseract
import json
import asyncio
from PIL import Image
from openai import OpenAIError
from os import getenv
from db.redis import redis_client, pubsub


openai.api_key = getenv('OPENAI_API_KEY')


def extract_text_from_pdf(file_path: str) -> str:
    doc = fitz.open(file_path)
    text = ""
    for page_num in range(doc.page_count):
        page = doc.load_page(page_num)
        text += page.get_text("text")
    return text


def extract_text_with_ocr(file_path: str, content_type: str ="application/pdf") -> str:
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


async def openai_chat_stream(conversation: list[dict], key: str):
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
