from elasticsearch import Elasticsearch
from os import getenv


elasticsearch_host = getenv('ELASTICSEARCH_HOST')
elasticsearch_port = getenv('ELASTICSEARCH_PORT')
es = Elasticsearch([{"host": elasticsearch_host, "port": int(elasticsearch_port), "scheme": "http"}])


settings = {
    "index": {
        "max_ngram_diff": 19
    },
    "analysis": {
        "analyzer": {
            "n_gram_analyzer": {
                "type": "custom",
                "tokenizer": "n_gram_tokenizer",
                "filter": ["lowercase"]
            },
            "standard_analyzer": {
                "type": "standard"
            }
        },
        "tokenizer": {
            "n_gram_tokenizer": {
                "type": "ngram",
                "min_gram": 1,
                "max_gram": 20
            }
        }
    }
}

field_settings = {
    "type": "text",
    "analyzer": "n_gram_analyzer",
    "search_analyzer": "standard_analyzer"
}

medical_records_mapping = {
    "settings": settings,
    "mappings": {
        "properties": {
            "recordId": {"type": "integer"},
            "recordData": field_settings,
            "dateCreated": {"type": "date", "format": "strict_date_optional_time||epoch_millis"},
            "doctorFullName": field_settings,
            "recordTypeName": field_settings,
            "patientId": {"type": "integer"}
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
            "textContent": field_settings,
            "patientId": {"type": "integer"}
        }
    }
}


es.indices.create(index="medical_records", body=medical_records_mapping, ignore=400)
es.indices.create(index="files", body=files_mapping, ignore=400)


field_highlight = {
    "type": "unified",
    "fragment_size": 20,
    "number_of_fragments": 1,
    "pre_tags": ["<span class='font-bold text-primary text-lg'>"],
    "post_tags": ["</span>"]
}


def extract_highlighted_field(hit, field_name):
    return hit["highlight"].get(field_name, [hit["_source"].get(field_name)])[0]


async def search_with_highlights(index, term, search_fields, patient_id):
    query_body = {
        "query": {
            "bool": {
                "must": [
                    {
                        "multi_match": {
                            "query": term,
                            "fields": search_fields,
                            "type": "best_fields"
                        }
                    }
                ],
                "filter": [{"term": {"patientId": patient_id}}]
            }
        },
        "highlight": {
            "fields": {field: field_highlight for field in search_fields}
        }
    }

    res = es.search(index=index, body=query_body)

    return [
        {
            **hit["_source"],
            **{field: extract_highlighted_field(hit, field) for field in search_fields}
        }
        for hit in res["hits"]["hits"]
    ]
