from starlette.authentication import AuthCredentials, AuthenticationBackend, AuthenticationError, SimpleUser
import jwt
import starlette.authentication
import starlette.requests
from starlette.requests import Request
from os import getenv
from datetime import datetime
from db.queries import get_user_by_email_password, get_token
from utils.utils import decrypt


class UserDetail(SimpleUser):
    def __init__(self, user: dict, medical_access: None | dict = None) -> None:
        """
        Initialize a UserDetail instance with user information and optional medical access data.

        This constructor sets up a UserDetail object with the user's basic information and,
        if provided, their medical access details.

        Parameters:
        user (dict): A dictionary containing the user's information. It must include
                     at least a 'firstName' key.
        medical_access (None | dict, optional): A dictionary containing the user's medical
                                                access information, or None if not applicable.
                                                Defaults to None.

        Returns:
        None
        """
        self.username = user['firstName']
        self.user_detail = user
        self.medical_access = medical_access


class BasicAuthBackend(AuthenticationBackend):
    async def authenticate(self, conn: starlette.requests.HTTPConnection) -> (None | starlette.authentication.AuthCredentials):
        """
        Authenticate a user based on access tokens in cookies or Authorization headers.

        This method attempts to authenticate a user using either an access token from cookies
        or an Authorization header. It also handles medical access tokens if present.

        Parameters:
        conn (starlette.requests.HTTPConnection): The HTTP connection object containing
                                                  request information including headers and cookies.

        Returns:
        tuple | None: A tuple containing AuthCredentials and UserDetail objects if authentication
                      is successful, or None if authentication fails.

        Raises:
        AuthenticationError: If the provided authentication credentials are invalid.
        """
        cookies = conn.cookies
        access_token = cookies.get('accessToken')
        medical_access_token = cookies.get('accessMedicalToken')

        if not access_token and "Authorization" not in conn.headers:
            return

        if not access_token:
            auth = conn.headers["Authorization"]
            scheme, credentials = auth.split()
            if scheme.lower() != 'bearer':
                return
            access_token = credentials

        try:
            decoded = jwt.decode(access_token, getenv('SECRET'), algorithms=["HS256"])
        except jwt.exceptions.PyJWTError as exc:
            print('[JWT Error]:', exc)
            raise AuthenticationError('Invalid basic auth credentials')

        email, password = decoded['email'], decrypt(decoded['password'])
        user = get_user_by_email_password(email, password)

        if not user:
            return

        medical_access = None
        if medical_access_token:
            try:
                medical_access = jwt.decode(medical_access_token, getenv('SECRET'), algorithms=["HS256"])
            except jwt.exceptions.PyJWTError as exc:
                print('[JWT Error]:', exc)
        elif "Medical-Authorization" in conn.headers:
            medical_auth = conn.headers["Medical-Authorization"]
            try:
                scheme, credentials = medical_auth.split()
                if scheme.lower() == 'bearer':
                    medical_access = jwt.decode(credentials, getenv('SECRET'), algorithms=["HS256"])
            except jwt.exceptions.PyJWTError as exc:
                print('[JWT Error]:', exc)

        # Check medical access token expiration and validate against the database
        if medical_access:
            token = get_token(medical_access['tokenId'])
            if token['expirationDate'] and token['expirationDate'] == datetime.fromtimestamp(medical_access['exp']):
                return AuthCredentials(["authenticated"]), UserDetail(user, medical_access)

        return AuthCredentials(["authenticated"]), UserDetail(user)


async def get_context_value(request: Request) -> dict:
    return {
        "request": request,
        "authenticated": request.user.is_authenticated,
        "user_detail": None if not request.user.is_authenticated else request.user.user_detail,
        "medical_access": None if not request.user.is_authenticated else request.user.medical_access
    }
