from .mysql_results import mysql_results

def get_medical_records() -> list[dict]:
    return mysql_results('SELECT * FROM MedicalRecords;')