from cryptography.fernet import Fernet
from os import getenv
import re
import jwt


UPLOAD_DIR = "uploads"

fernet = Fernet(getenv('FERNET_KEY'))

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
