from elasticsearch import Elasticsearch
from os import getenv


elasticsearch_host = getenv('ELASTICSEARCH_HOST')
elasticsearch_port = getenv('ELASTICSEARCH_PORT')
es = Elasticsearch([{"host": elasticsearch_host, "port": int(elasticsearch_port), "scheme": "http"}])


settings = {
    "analysis": {
        "analyzer": {
            "edge_ngram_analyzer": {
                "type": "custom",
                "tokenizer": "edge_ngram_tokenizer",
                "filter": ["lowercase"]
            }
        },
        "tokenizer": {
            "edge_ngram_tokenizer": {
                "type": "edge_ngram",
                "min_gram": 2,
                "max_gram": 10,
                "token_chars": ["letter", "digit"]
            }
        }
    }
}

field_settings = {
    "type": "text",
    "fields": {
        "prefix": {
            "type": "text",
            "analyzer": "edge_ngram_analyzer"
        },
        "full": {
            "type": "text",
            "analyzer": "standard"
        }
    }
}

medical_records_mapping = {
    "settings": settings,
    "mappings": {
        "properties": {
            "recordId": {"type": "integer"},
            "patientId": {"type": "integer", "index": True},
            "doctorId": {"type": "integer", "index": True, "null_value": -1},
            "recordTypeId": {"type": "integer", "index": True},
            "recordData": field_settings,
            "dateCreated": {"type": "date", "format": "strict_date_optional_time||epoch_millis"}
        }
    }
}


files_mapping = {
    "settings": settings,
    "mappings": {
        "properties": {
            "fileId": {"type": "integer"},
            "recordId": {"type": "integer"},
            "fileName": {"type": "keyword"},
            "mimeType": {"type": "keyword"},
            "url": {"type": "keyword"},
            "textContent": field_settings
        }
    }
}


es.indices.create(index="medical_records", body=medical_records_mapping, ignore=400)
es.indices.create(index="files", body=files_mapping, ignore=400)
