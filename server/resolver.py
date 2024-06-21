from ariadne import QueryType
from db.queries import *

query = QueryType()

@query.field("medicalRecords")
def resolve_medical_records(*_):
    return get_medical_records()