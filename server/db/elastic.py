from elasticsearch import Elasticsearch
from os import getenv
from .mysql import mysql_client
from utils.utils import strip_html_tags


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
            "recordTypeTranslations": {
                "type": "nested",
                "properties": {
                    "languageCode": {"type": "keyword"},
                    "translatedName": field_settings
                }
            },
            "patientId": {"type": "integer"},
            "doctorId": {"type": "integer"}
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

field_highlight = {
    "type": "unified",
    "fragment_size": 20,
    "number_of_fragments": 1,
    "pre_tags": ["<span class='font-bold text-primary text-lg'>"],
    "post_tags": ["</span>"]
}


es.indices.create(index="medical_records", body=medical_records_mapping, ignore=400)
es.indices.create(index="files", body=files_mapping, ignore=400)


def migrate_medical_records():
    """
    Migrates medical records from a MySQL database to an Elasticsearch index.

    This function performs the following steps:
    1. Executes a SQL query to retrieve medical records data from the MySQL database.
    2. Processes each record, stripping HTML tags from the record data.
    3. Indexes each processed record in the Elasticsearch 'medical_records' index.

    The function uses a predefined SQL query to join multiple tables (MedicalRecords, RecordTypes, Doctors, Users)
    to gather all necessary information for each medical record.

    Parameters:
    None

    Returns:
    None

    Side Effects:
    - Prints the number of migrated records to the console.
    - Indexes medical records in the Elasticsearch 'medical_records' index.
    """
    print("Migrating Medical Records...")

    query = """
        SELECT
            r.recordId,
            r.recordData,
            r.dateCreated,
            r.patientId,
            r.doctorId,
            d.userId AS doctorUserId,
            p.userId AS patientUserId,
            rt.recordName AS recordTypeName,
            CONCAT(u.firstName, ' ', u.lastName) AS doctorFullName,
            CONCAT(up.firstName, ' ', up.lastName) AS patientFullName,
            rtt.languageCode,
            rtt.translatedName
        FROM MedicalRecords r
        JOIN RecordTypes rt ON r.recordTypeId = rt.recordTypeId
        LEFT JOIN Doctors d ON r.doctorId = d.doctorId
        LEFT JOIN Users u ON d.userId = u.userId
        LEFT JOIN Patients p ON r.patientId = p.patientId
        LEFT JOIN Users up ON p.userId = up.userId
        LEFT JOIN RecordTypeTranslations rtt ON rt.recordTypeId = rtt.recordTypeId;
    """

    records = mysql_client(query)

    records_by_id = {}
    for record in records:
        record_id = record["recordId"]
        if record_id not in records_by_id:
            records_by_id[record_id] = {
                "recordId": record_id,
                "recordData": strip_html_tags(record["recordData"]),
                "dateCreated": record["dateCreated"],
                "doctorFullName": record.get("doctorFullName", None),
                "patientFullName": record.get("patientFullName", None),
                "recordTypeName": record["recordTypeName"],
                "recordTypeTranslations": [],
                "patientId": record["patientId"],
                "doctorId": record["doctorId"]
            }
        if record["languageCode"]:
            records_by_id[record_id]["recordTypeTranslations"].append({
                "languageCode": record["languageCode"],
                "translatedName": record["translatedName"]
            })

    for record in records_by_id.values():
        es.index(index="medical_records", id=record["recordId"], document=record)

    print(f"{len(records_by_id)} medical records migrated.")


def migrate_files():
    """
    This function migrates files from the MySQL database to the Elasticsearch index.

    The function connects to the MySQL database, executes a query to retrieve file data,
    and then indexes each file document in the Elasticsearch 'files' index.

    Parameters:
    None

    Returns:
    None

    Side Effects:
    - Prints the number of files migrated to the console.
    - Indexes each file document in the Elasticsearch 'files' index.
    """
    print("Migrating Files...")

    query = """
        SELECT
            f.fileId,
            f.recordId,
            f.fileName,
            f.mimeType,
            f.url,
            f.textContent,
            r.patientId
        FROM Files f
        JOIN MedicalRecords r ON f.recordId = r.recordId
    """

    files = mysql_client(query)

    for file in files:
        document = {
            "fileId": file["fileId"],
            "recordId": file["recordId"],
            "fileName": file["fileName"],
            "mimeType": file["mimeType"],
            "url": file["url"],
            "textContent": file.get("textContent", None),
            "patientId": file["patientId"]
        }

        es.index(
            index="files",
            id=file["fileId"],
            document=document
        )

    print(f"{len(files)} files migrated.")


# SQL to Elasticsearch Migration: Uncomment the next two lines to migrate the data
migrate_medical_records()
migrate_files()


def extract_highlighted_field(hit: dict, field_name: str) -> str:
    """
    Extracts the highlighted field from a search hit result.

    This function attempts to retrieve the highlighted version of a field from the search hit.
    If the highlighted version is not available, it falls back to the original field value from the source.

    Args:
        hit (dict): A dictionary representing a single hit from an Elasticsearch search result.
        field_name (str): The name of the field to extract.

    Returns:
        str: The highlighted field value if available, otherwise the original field value.
              Returns the first element if the result is a list.
    """
    return hit.get("highlight", {}).get(field_name, [hit["_source"].get(field_name)])[0]


async def search_with_highlights(index: str, term: str, search_fields: list[str], patient_id: int, language_code: str = None) -> list[dict]:
    """
    This function performs a search operation on the specified Elasticsearch index with highlighting.

    Parameters:
    - index (str): The name of the Elasticsearch index to search.
    - term (str): The search term to look for.
    - search_fields (list[str]): A list of fields to search within.
    - patient_id (int): The ID of the patient to filter the search results.

    Returns:
    - list[dict]: A list of dictionaries, where each dictionary represents a search result.
    Each dictionary contains the original document source, plus the highlighted fields.
    """
    query_body = {
        "query": {
            "bool": {
                "should": [
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
        },
        "min_score": 1.0
    }

    if language_code not in ["en-us", None]:
        query_body["query"]["bool"]["should"].append({
            "nested": {
                "path": "recordTypeTranslations",
                "query": {
                    "bool": {
                        "must": [
                            {"term": {"recordTypeTranslations.languageCode": language_code}},
                            {"match": {"recordTypeTranslations.translatedName": term}}
                        ]
                    }
                },
                "inner_hits": {
                    "highlight": {
                        "fields": {
                            "recordTypeTranslations.translatedName": field_highlight
                        }
                    }
                }
            }
        })

    res = es.search(index=index, body=query_body)

    return [
        {
            **hit["_source"],
            **{field: extract_highlighted_field(hit, field) for field in search_fields},
            "recordTypeTranslations": hit.get("inner_hits", {}).get("recordTypeTranslations", {}).get("hits", {}).get("hits", [])
        }
        for hit in res["hits"]["hits"]
    ]
