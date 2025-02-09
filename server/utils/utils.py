import re
import jwt
from bcrypt import hashpw, gensalt, checkpw
from bs4 import BeautifulSoup
from os import getenv
from google.cloud import translate_v2 as translate


UPLOAD_DIR = "uploads"


def hash_password(password: str) -> str:
    """
    Hash a password using bcrypt.

    This function generates a salt and uses it to hash the provided password
    using the bcrypt algorithm. The resulting hash is returned as a string.

    Parameters:
    password (str): The plain-text password to be hashed.

    Returns:
    str: The bcrypt hash of the password, encoded as a string.
    """
    salt = gensalt()
    return hashpw(password.encode(), salt).decode()


def verify_password(input_password: str, stored_hash: str) -> bool:
    return checkpw(input_password.encode(), stored_hash.encode())


def generate_token(exp: int, user: dict) -> str:
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
    token = jwt.encode({"exp": exp} | user , getenv('SECRET'), algorithm="HS256")
    return token


def validate_email(email: str) -> bool:
    """
    Validates an email address using a regular expression pattern.

    This function checks if the given email address matches the standard email format.
    It uses a regular expression pattern to validate the email address.

    Parameters:
    email (str): The email address to be validated.

    Returns:
    bool: True if the email address is valid, False otherwise.
    """
    if re.search(r'^[a-zA-Z0-9_.±]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$', email):
        return True
    return False


def validate_password(password: str) -> bool:
    """
    Validates a password based on specific criteria.

    This function checks if the given password meets the following requirements:
    - Contains at least one digit
    - Contains at least one lowercase letter
    - Contains at least one uppercase letter
    - Is at least 8 characters long

    Parameters:
    password (str): The password string to be validated.

    Returns:
    bool: True if the password meets all criteria, False otherwise.
    """
    if re.search(r'^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$', password):
        return True
    return False


def validate_name(name: str) -> bool:
    """
    Validates a name string based on specific criteria.

    This function checks if the given name meets the following requirement:
    - Contains at least two word characters (letters, digits, or underscores)

    Parameters:
    name (str): The name string to be validated.

    Returns:
    bool: True if the name meets the criteria, False otherwise.
    """
    if re.search(r'^\w{2,}', name):
        return True
    return False


def validate_file_format(file_type: str) -> bool:
    """
    Validates if the given file type is supported.

    This function checks if the provided file type is in the list of supported file formats.

    Parameters:
    file_type (str): The MIME type of the file to be validated.

    Returns:
    bool: True if the file type is supported, False otherwise.
    """
    supported_file_formats = ["image/jpeg", "image/png", "image/svg+xml", "image/webp", "application/pdf"]
    return file_type in supported_file_formats


def validate_file_size(file_size: int) -> bool:
    """
    Validates if the given file size is within the allowed limit.

    This function checks if the provided file size is less than or equal to 5 MB (5,242,880 bytes).

    Parameters:
    file_size (int): The size of the file in bytes.

    Returns:
    bool: True if the file size is within the allowed limit (5 MB or less), False otherwise.
    """
    return file_size <= 5 * 1024 * 1024


def validate_files_length(files: list) -> bool:
    """
    Validates if the number of files in the given list is within the allowed limit.

    This function checks if the provided list of files contains a number of elements
    that is less than or equal to 10.

    Parameters:
    files (list): A list of file objects. Each file object can be of any type.

    Returns:
    bool: True if the number of files in the list is within the allowed limit (10 or less),
          False otherwise.
    """
    return len(files) <= 10


def validate_files_size(files: list) -> bool:
    """
    Validates if the total size of all files in the given list is within the allowed limit.

    This function checks if the sum of sizes of all files in the provided list
    is less than or equal to 10 MB (10,485,760 bytes).

    Parameters:
    files (list): A list of file objects. Each file object is expected to have a 'size' attribute
                  representing the size of the file in bytes.

    Returns:
    bool: True if the total size of all files is within the allowed limit (10 MB or less),
          False otherwise.
    """
    return sum(file.size for file in files) <= 10 * 1024 * 1024


def strip_html_tags(html):
    """
    Remove HTML tags from a given HTML string and return the plain text content.

    This function uses BeautifulSoup to parse the HTML and extract the text content
    without any HTML tags or formatting.

    Parameters:
    html (str): A string containing HTML content to be stripped of tags.

    Returns:
    str: The plain text content of the HTML, with all tags removed.
    """
    soup = BeautifulSoup(html, "html.parser")
    return soup.get_text()


def check_translate_word(word: str) -> dict:
    """
    Detects the language of a given word and translates it to specified target languages.

    This function uses Google Cloud Translation API to detect the language of the input word
    and translate it to English and Portuguese. It returns a dictionary containing the detected
    language, confidence score, translations, and any errors encountered during the process.

    Parameters:
    word (str): The word to be detected and translated.

    Returns:
    dict: A dictionary containing the following keys:
        - 'detected_language': The detected language code of the input word.
        - 'confidence': The confidence score of the language detection.
        - 'translations': A dictionary of translations, where keys are target language codes
                          ('en' for English, 'pt' for Portuguese) and values are the translated words.
        - 'error': A list of error messages, if any occurred during the translation process.
    """
    translate_client = translate.Client()
    detection = translate_client.detect_language(word)
    detected_language = detection.get("language")
    confidence = detection.get("confidence")
    result = {
        "detected_language": detected_language,
        "confidence": confidence,
        "translations": {},
        "error": []
    }

    target_languages = ['en', 'pt']

    for target_language in target_languages:
        try:
            translation = translate_client.translate(word, target_language=target_language)
            translated_text = translation.get("translatedText")
            if translated_text:
                result["translations"][target_language] = translated_text.title()
        except Exception as e:
            msg = f"Error processing language {target_language}: {e}"
            result["error"].append(msg)
            print(msg)

    return result
