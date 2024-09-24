from .mysql_results import mysql_results
from utils.utils import decrypt
from datetime import datetime


def get_user(id: int) -> (None | dict):
    query = rf'SELECT * FROM Users WHERE userId = {id};'
    user = mysql_results(query)
    if len(user) == 0:
        return None
    return user[0]


def get_patient(id: int) -> (None | dict):
    query = rf'SELECT * FROM Patients WHERE patientId = {id};'
    patient = mysql_results(query)
    if len(patient) == 0:
        return None
    return patient[0]


def get_record_types() -> list[dict]:
    return mysql_results('SELECT * FROM RecordTypes;')


def get_medical_record(id: int) -> (None | dict):
    query = rf'SELECT * FROM MedicalRecords WHERE recordId = {id};'
    medical_record = mysql_results(query)
    if len(medical_record) == 0:
        None
    return medical_record[0]


def get_users_patient(id: int) -> (None | dict):
    query = rf'SELECT * FROM Patients WHERE userId = {id};'
    patient = mysql_results(query)
    if len(patient) == 0:
        return None
    return patient[0]


def get_patients_tokens(id: int) -> (None | list[dict]):
    query = rf'SELECT * FROM Tokens WHERE patientId = {id};'
    tokens = mysql_results(query)
    if len(tokens) == 0:
        return None
    return tokens


def get_doctor(id: int) -> (None | dict):
    query = rf'SELECT * FROM Doctors WHERE doctorId = {id};'
    doctor = mysql_results(query)
    if len(doctor) == 0:
        return None
    return doctor[0]


def get_users_doctor(id: int) -> (None | dict):
    query = rf'SELECT * FROM Doctors WHERE userId = {id};'
    doctor = mysql_results(query)
    if len(doctor) == 0:
        return None
    return doctor[0]


def get_doctors_tokens_access(id: int) -> (None | list[dict]):
    query = rf'SELECT * FROM TokenAccess WHERE doctorId = {id};'
    tokens_access = mysql_results(query)
    if len(tokens_access) == 0:
        return None
    return tokens_access


def get_user_by_email_password(email:str, password:str) -> (None | dict):
    query = rf"SELECT * FROM Users WHERE email = '{email}';"
    user = mysql_results(query)
    if len(user) == 0:
        return None
    if decrypt(user[0]['password']) != password:
        return None
    return user[0]


def get_medical_records_by_pacient(id: int) -> (None | list[dict]):
    query = rf'SELECT * FROM MedicalRecords WHERE patientId = {id} ORDER BY dateCreated DESC;'
    records = mysql_results(query)
    if len(records) == 0:
        return None
    return records


def get_medical_records_type(id: int) -> (None | dict):
    query = rf'SELECT * FROM RecordTypes WHERE recordTypeId = {id};'
    record_type = mysql_results(query)
    if len(record_type) == 0:
        return None
    return record_type[0]


def get_token(id: int) -> (None | dict):
    query = rf'SELECT * FROM Tokens WHERE tokenId = {id};'
    token = mysql_results(query)
    if len(token) == 0:
        return None
    return token[0]


def get_active_tokens_by_patient(id: int) -> (None | list[dict]):
    query = rf"SELECT * FROM Tokens WHERE patientId = {id} AND expirationDate > '{datetime.now()}' ORDER BY expirationDate;"
    tokens = mysql_results(query)
    if len(tokens) == 0:
        return None
    return tokens


def get_tokens_token_access(id: int) -> (None | list[dict]):
    query = rf'SELECT * FROM TokenAccess WHERE tokenId = {id};'
    token_accesses = mysql_results(query)
    if len(token_accesses) == 0:
        return None
    return token_accesses


def get_token_access(id: int) -> (None | dict):
    query = rf'SELECT * FROM TokenAccess WHERE tokenAccessId = {id};'
    token_access = mysql_results(query)
    if len(token_access) == 0:
        return None
    return token_access[0]


def get_active_tokens_by_doctor(id: int) -> (None | list[dict]):
    query = rf'''SELECT a.tokenId, a.token, a.patientId, a.expirationDate from Tokens a INNER JOIN
        (SELECT DISTINCT tokenId FROM TokenAccess WHERE doctorId = {id}) v ON a.tokenId = v.tokenId
        WHERE expirationDate > '{datetime.now()}' ORDER BY expirationDate;'''
    tokens = mysql_results(query)
    if len(tokens) == 0:
        return None
    return tokens


def get_inactive_tokens(id: int, limit: int, offset: int) -> (None | list[dict]):
    query = rf'''SELECT * FROM Tokens WHERE patientId = {id} AND expirationDate < '{datetime.now()}'
        ORDER BY expirationDate DESC LIMIT {limit} OFFSET {offset};'''
    tokens = mysql_results(query)
    if len(tokens) == 0:
        return None
    return tokens


def count_inactive_tokens(id: int) -> dict:
    query = rf"SELECT COUNT(tokenId) AS totalCount FROM Tokens WHERE patientId = {id} AND expirationDate < '{datetime.now()}';"
    total_count= mysql_results(query)
    if len(total_count) == 0:
        return None
    return total_count[0]
