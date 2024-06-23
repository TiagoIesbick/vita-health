from starlette.authentication import AuthCredentials, AuthenticationBackend, AuthenticationError, SimpleUser
import jwt
import starlette.authentication
import starlette.requests
from os import getenv
from db.queries import get_user_by_email_password
from utils.utils import decrypt

def handle_login(user: dict) -> str:
    token = jwt.encode(user, getenv('SECRET'), algorithm="HS256")
    return token

class UserDetail(SimpleUser):
    def __init__(self, user: dict) -> None:
        self.username = user['firstName']
        self.user_detail = user

class BasicAuthBackend(AuthenticationBackend):
    async def authenticate(self, conn: starlette.requests.HTTPConnection) -> (None | starlette.authentication.AuthCredentials):
        if "Authorization" not in conn.headers:
            return

        auth = conn.headers["Authorization"]
        try:
            scheme, credentials = auth.split()
            if scheme.lower() != 'bearer':
                return
            decoded = jwt.decode(credentials, getenv('SECRET'), algorithms=["HS256"])
        except jwt.exceptions.PyJWTError as exc:
            print('[JWT Error]:', exc)
            raise AuthenticationError('Invalid basic auth credentials')
        email, password = decoded['email'], decrypt(decoded['password'])
        user = get_user_by_email_password(email, password)
        if not user:
            return
        return AuthCredentials(["authenticated"]), UserDetail(user)