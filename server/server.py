from dotenv import load_dotenv
from ariadne.asgi import GraphQL
from ariadne import load_schema_from_path, make_executable_schema
from starlette.applications import Starlette
from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.authentication import AuthenticationMiddleware
from starlette.routing import Route
from starlette.requests import Request
from auth import BasicAuthBackend
from resolver import query, users, patients, doctors, mutation, medical_records, \
    tokens, token_access

load_dotenv()

type_defs = load_schema_from_path("schema.graphql")

schema = make_executable_schema(
    type_defs, query, users, patients, doctors, mutation, medical_records,
    tokens, token_access
)

middleware = [
    Middleware(CORSMiddleware, allow_origins=['*'], allow_methods=("GET", "POST", "OPTIONS"), allow_headers=['*']),
    Middleware(AuthenticationMiddleware, backend=BasicAuthBackend())
]

async def get_context_value(request: Request):
    return {
        "request": request,
        "authenticated": request.user.is_authenticated,
        "user_detail": None if not request.user.is_authenticated else request.user.user_detail,
    }

graphql_app = GraphQL(
    schema,
    debug=True,
    context_value=get_context_value
)

routes = [
    Route("/graphql/", graphql_app.handle_request, methods=["GET", "POST", "OPTIONS"])
]

app = Starlette(debug=True, middleware=middleware, routes=routes)
