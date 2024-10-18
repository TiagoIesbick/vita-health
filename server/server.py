from ariadne.asgi import GraphQL
from ariadne.asgi.handlers import GraphQLTransportWSHandler
from ariadne import load_schema_from_path, make_executable_schema, upload_scalar
from starlette.applications import Starlette
from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.authentication import AuthenticationMiddleware
from starlette.routing import Route, WebSocketRoute
from auth import BasicAuthBackend, get_context_value
from routes import serve_file
from utils.utils import pubsub
from resolver import query, users, patients, doctors, mutation, medical_records, \
    tokens, token_access, subscription


type_defs = load_schema_from_path("schema.graphql")


schema = make_executable_schema(
    type_defs, query, users, patients, doctors, mutation, medical_records,
    tokens, token_access, upload_scalar, subscription
)


middleware = [
    Middleware(CORSMiddleware, allow_origins=['*'], allow_methods=("GET", "POST", "OPTIONS", "WEBSOCKET"), allow_headers=['*']),
    Middleware(AuthenticationMiddleware, backend=BasicAuthBackend())
]


graphql_app = GraphQL(
    schema,
    debug=True,
    context_value=get_context_value,
    websocket_handler=GraphQLTransportWSHandler()
)


routes = [
    Route("/graphql/", graphql_app.handle_request, methods=["GET", "POST", "OPTIONS"]),
    WebSocketRoute("/graphql/", graphql_app.handle_websocket),
    Route("/uploads/{filename}", serve_file, methods=["GET"])
]


app = Starlette(
    debug=True,
    middleware=middleware,
    routes=routes,
    on_startup=[pubsub.connect],
    on_shutdown=[pubsub.disconnect],
)
