from starlette.authentication import AuthCredentials, AuthenticationBackend, AuthenticationError, SimpleUser
import jwt
import starlette.authentication
import starlette.requests
from os import getenv

def handle_login(user: dict) -> str:
    token = jwt.encode(user, getenv('SECRET'), algorithm="HS256")
    return token