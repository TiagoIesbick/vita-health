import re
import jwt
from cryptography.fernet import Fernet
from bs4 import BeautifulSoup
from os import getenv


UPLOAD_DIR = "uploads"


fernet = Fernet(getenv('FERNET_KEY'))


def encrypt(msg: str) -> bytes:
    """
    Encrypts a given message using the Fernet symmetric encryption algorithm.

    Parameters:
    msg (str): The message to be encrypted. It should be a string.

    Returns:
    bytes: The encrypted message as bytes.
    """
    encrypted = fernet.encrypt(msg.encode())
    return encrypted


def decrypt(encrypted: bytes) -> str:
    """
    Decrypts a given encrypted message using the Fernet symmetric encryption algorithm.

    Parameters:
    encrypted (bytes): The encrypted message as bytes.

    Returns:
    str: The decrypted message as a UTF-8 encoded string.
    """
    decrypted = fernet.decrypt(encrypted).decode('utf-8')
    return decrypted


def generate_token(exp: int, patient: dict) -> str:
    """
    Generate a JSON Web Token (JWT) for a patient.

    This function creates a JWT by encoding the expiration time and patient information
    using a secret key. The token is signed using the HS256 algorithm.

    Parameters:
    exp (int): The expiration time of the token in Unix timestamp format.
    patient (dict): A dictionary containing the patient's information to be encoded in the token.

    Returns:
    str: A string representation of the generated JWT.
    """
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
    return file_size <= 5 * 1024 * 1024


def validate_files_length(files: list) -> bool:
    return len(files) <= 10


def validate_files_size(files: list) -> bool:
    return sum(file.size for file in files) <= 10 * 1024 * 1024


def strip_html_tags(html):
    soup = BeautifulSoup(html, "html.parser")
    return soup.get_text()
