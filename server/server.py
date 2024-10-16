from ariadne.asgi import GraphQL
from ariadne import load_schema_from_path, make_executable_schema, upload_scalar
from starlette.applications import Starlette
from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.authentication import AuthenticationMiddleware
from starlette.routing import Route
from auth import BasicAuthBackend, get_context_value
from routes import serve_file, get_chatgpt_insights
from resolver import query, users, patients, doctors, mutation, medical_records, \
    tokens, token_access


type_defs = load_schema_from_path("schema.graphql")


schema = make_executable_schema(
    type_defs, query, users, patients, doctors, mutation, medical_records,
    tokens, token_access, upload_scalar
)


middleware = [
    Middleware(CORSMiddleware, allow_origins=['*'], allow_methods=("GET", "POST", "OPTIONS"), allow_headers=['*']),
    Middleware(AuthenticationMiddleware, backend=BasicAuthBackend())
]


graphql_app = GraphQL(
    schema,
    debug=True,
    context_value=get_context_value
)


routes = [
    Route("/graphql/", graphql_app.handle_request, methods=["GET", "POST", "OPTIONS"]),
    Route("/uploads/{filename}", serve_file, methods=["GET"]),
    Route("/ai/", get_chatgpt_insights, methods=["POST"])
]


app = Starlette(debug=True, middleware=middleware, routes=routes)
