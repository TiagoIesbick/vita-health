from dotenv import load_dotenv
from ariadne.asgi import GraphQL
from ariadne import load_schema_from_path, make_executable_schema
from starlette.applications import Starlette
from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.authentication import AuthenticationMiddleware
from resolver import query, users, mutation

load_dotenv()

type_defs = load_schema_from_path("schema.graphql")

schema = make_executable_schema(type_defs, query, users, mutation)

app = CORSMiddleware(GraphQL(schema, debug=True), allow_origins=['*'], allow_methods=("GET", "POST", "OPTIONS"))
