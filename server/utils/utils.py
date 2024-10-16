import re
import jwt
import openai
import redis
import fitz
import pytesseract
from PIL import Image
import io
from openai import OpenAIError
from cryptography.fernet import Fernet
from os import getenv


UPLOAD_DIR = "uploads"


fernet = Fernet(getenv('FERNET_KEY'))


openai.api_key = getenv('OPENAI_API_KEY')


redis_host = getenv('REDIS_HOST')
redis_port = getenv('REDIS_PORT')
redis_req = redis.Redis(host=redis_host, port=redis_port, decode_responses=True)


def encrypt(msg: str) -> bytes:
    encrypted = fernet.encrypt(msg.encode())
    return encrypted


def decrypt(encrypted: bytes) -> str:
    decrypted = fernet.decrypt(encrypted).decode('utf-8')
    return decrypted


def generate_token(exp: int, patient: dict) -> str:
    token = jwt.encode({"exp": exp} | patient , getenv('SECRET'), algorithm="HS256")
    return token


def validate_email(email: str) -> bool:
    if re.search(r'^[a-zA-Z0-9_.±]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$', email):
        return True
    return False


def validate_password(password: str) -> bool:
    if re.search(r'^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$', password):
        return True
    return False


def validate_name(name: str) -> bool:
    if re.search(r'^\w{2,}', name):
        return True
    return False


def validate_file_format(file_type: str) -> bool:
    supported_file_formats = ["image/jpeg", "image/png", "image/svg+xml", "image/webp", "application/pdf"]
    return file_type in supported_file_formats


def validate_file_size(file_size: int) -> bool:
    return file_size <= 2 * 1024 * 1024


def validate_files_length(files: list) -> bool:
    return len(files) <= 10


def validate_files_size(files: list) -> bool:
    return sum(file.size for file in files) <= 10 * 1024 * 1024


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


def openai_chat(conversation: list[dict]) -> dict:
    try:
        response = openai.chat.completions.create(
            messages=conversation,
            model="gpt-4",
            max_tokens=2000,
            temperature=0.7
        )
    except OpenAIError as e:
        return {'conversationError': str(e)}
    print('[openai response]:', response)

    content = response.choices[0].message.content.strip()
    return {"role": "assistant", "content": content}
