from starlette.authentication import AuthCredentials, AuthenticationBackend, AuthenticationError, SimpleUser
import jwt
import starlette.authentication
import starlette.requests
from os import getenv
from db.queries import get_user_by_email_password
from utils.utils import decrypt


class UserDetail(SimpleUser):
    def __init__(self, user: dict, medical_access: (None | dict) = None) -> None:
        self.username = user['firstName']
        self.user_detail = user
        self.medical_access = medical_access


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
        if "Medical-Authorization" in conn.headers:
            medical_auth = conn.headers["Medical-Authorization"]
            try:
                scheme, credentials = medical_auth.split()
                if scheme.lower() != 'bearer':
                    return AuthCredentials(["authenticated"]), UserDetail(user)
                medical_access = jwt.decode(credentials, getenv('SECRET'), algorithms=["HS256"])
            except jwt.exceptions.PyJWTError as exc:
                print('[JWT Error]:', exc)
                return AuthCredentials(["authenticated"]), UserDetail(user)
            return AuthCredentials(["authenticated"]), UserDetail(user, medical_access)

        return AuthCredentials(["authenticated"]), UserDetail(user)