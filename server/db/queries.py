from .mysql_results import mysql_results
from utils.utils import decrypt

def get_user(id: int) -> list[dict]:
    query = rf'SELECT * FROM Users WHERE userId = {id};'
    return mysql_results(query)[0]

def get_users_patient(id: int) -> (None | dict):
    query = rf'SELECT * FROM Patients WHERE userId = {id};'
    patient = mysql_results(query)
    if len(patient) == 0:
        return None
    return patient[0]

def get_users_doctor(id: int) -> (None | dict):
    query = rf'SELECT * FROM Doctors WHERE userId = {id};'
    doctor = mysql_results(query)
    if len(doctor) == 0:
        return None
    return doctor[0]

def get_user_by_email_password(email:str, password:str) -> (None | dict):
    query = rf"SELECT * FROM Users WHERE email = '{email}';"
    user = mysql_results(query)
    if len(user) == 0:
        return None
    if decrypt(user[0]['password']) != password:
        return None
    return user[0]

def get_medical_records() -> list[dict]:
    return mysql_results('SELECT * FROM MedicalRecords;')

