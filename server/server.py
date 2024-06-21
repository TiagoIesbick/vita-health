from dotenv import load_dotenv
from ariadne.asgi import GraphQL
from ariadne import load_schema_from_path, make_executable_schema
from resolver import query

load_dotenv()

type_defs = load_schema_from_path("schema.graphql")

schema = make_executable_schema(type_defs, query)

app = GraphQL(schema, debug=True)
