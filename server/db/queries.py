from .mysql import mysql_client
from utils.utils import decrypt
from datetime import datetime


def get_user(id: int) -> None | dict:
    """
    Retrieve user information from the database based on the user ID.

    This function queries the Users table in the database to fetch all information
    associated with the specified user ID.

    Args:
        id (int): The unique identifier of the user to retrieve.

    Returns:
        None | dict: A dictionary containing the user's information if found,
                     or None if no user matches the given ID.
    """
    query = rf'SELECT * FROM Users WHERE userId = {id};'
    user = mysql_client(query)
    return None if not user else user[0]


def get_patient(id: int) -> None | dict:
    """
    Retrieve patient information from the database based on the patient ID.

    This function queries the Patients table in the database to fetch all information
    associated with the specified patient ID.

    Args:
        id (int): The unique identifier of the patient to retrieve.

    Returns:
        None | dict: A dictionary containing the patient's information if found,
                     or None if no patient matches the given ID.
    """
    query = rf'SELECT * FROM Patients WHERE patientId = {id};'
    patient = mysql_client(query)
    return None if not patient else patient[0]


def get_record_types() -> list[dict]:
    """
    Retrieve all medical record types from the database.

    This function queries the RecordTypes table in the database to fetch all available
    medical record types. Each record type is represented as a dictionary with the following keys:
    - recordTypeId (int): The unique identifier of the record type.
    - recordName (str): The name of the record type.

    Returns:
        list[dict]: A list of dictionaries, where each dictionary represents a medical record type.
    """
    return mysql_client('SELECT * FROM RecordTypes;')


def get_medical_record(recordId: int, patientId: int) -> None | dict:
    """
    Retrieve a specific medical record for a patient from the database.

    This function queries the MedicalRecords table in the database to fetch
    a specific medical record associated with the given record ID and patient ID.

    Args:
        recordId (int): The unique identifier of the medical record to retrieve.
        patientId (int): The unique identifier of the patient associated with the record.

    Returns:
        None | dict: A dictionary containing the medical record information if found,
                     or None if no record matches the given recordId and patientId.
    """
    query = rf'SELECT * FROM MedicalRecords WHERE recordId = {recordId} AND patientId = {patientId};'
    medical_record = mysql_client(query)
    return None if not medical_record else medical_record[0]


def get_users_patient(id: int) -> None | dict:
    """
    Retrieve patient information associated with a specific user ID from the database.

    This function queries the Patients table in the database to fetch all information
    for the patient associated with the given user ID.

    Args:
        id (int): The unique identifier of the user whose patient information is to be retrieved.

    Returns:
        None | dict: A dictionary containing the patient's information if found,
                     or None if no patient is associated with the given user ID.
    """
    query = rf'SELECT * FROM Patients WHERE userId = {id};'
    patient = mysql_client(query)
    return None if not patient else patient[0]


def get_patients_tokens(id: int) -> None | list[dict]:
    """
    Retrieve all tokens associated with a specific patient from the database.

    This function queries the Tokens table in the database to fetch all tokens
    associated with the given patient ID. Each token is represented as a dictionary
    with the following keys:
    - tokenId (int): The unique identifier of the token.
    - token (str): The actual token value.
    - patientId (int): The unique identifier of the patient associated with the token.
    - expirationDate (datetime): The date and time when the token will expire.

    Args:
        id (int): The unique identifier of the patient whose tokens are to be retrieved.

    Returns:
        None | list[dict]: A list of dictionaries, where each dictionary represents a token,
                           or None if no tokens are associated with the given patient ID.
    """
    query = rf'SELECT * FROM Tokens WHERE patientId = {id};'
    tokens = mysql_client(query)
    return None if not tokens else tokens


def get_doctor(id: int) -> None | dict:
    """
    Retrieve doctor information from the database based on the doctor ID.

    This function queries the Doctors table in the database to fetch all information
    associated with the specified doctor ID.

    Args:
        id (int): The unique identifier of the doctor to retrieve.

    Returns:
        None | dict: A dictionary containing the doctor's information if found,
                     or None if no doctor matches the given ID.
    """
    query = rf'SELECT * FROM Doctors WHERE doctorId = {id};'
    doctor = mysql_client(query)
    return None if not doctor else doctor[0]


def get_doctor_full_name(id: int) -> None | str:
    """
    Retrieve the full name of a doctor from the database based on the doctor ID.

    This function queries the Doctors and Users tables in the database to fetch
    the concatenated first name and last name of the doctor associated with the
    specified doctor ID.

    Args:
        id (int): The unique identifier of the doctor whose full name is to be retrieved.

    Returns:
        None | str: A string containing the doctor's full name if found,
                    or None if no doctor matches the given ID.
    """
    query = rf'''SELECT CONCAT(u.firstName, ' ', u.lastName) AS fullName
        FROM Doctors d JOIN Users u ON d.userId = u.userId WHERE d.doctorId = {id};'''
    doctor_full_name = mysql_client(query)
    return None if not doctor_full_name else doctor_full_name[0]['fullName']


def get_users_doctor(id: int) -> None | dict:
    """
    Retrieve doctor information associated with a specific user ID from the database.

    This function queries the Doctors table in the database to fetch all information
    for the doctor associated with the given user ID.

    Parameters:
    id (int): The unique identifier of the user whose doctor information is to be retrieved.

    Returns:
    None | dict: A dictionary containing the doctor's information if found,
                 or None if no doctor is associated with the given user ID.
    """
    query = rf'SELECT * FROM Doctors WHERE userId = {id};'
    doctor = mysql_client(query)
    return None if not doctor else doctor[0]


def get_doctors_tokens_access(id: int) -> None | list[dict]:
    """
    Retrieve all token access records for a specific doctor from the database.

    This function queries the TokenAccess table in the database to fetch all token access
    records associated with the given doctor ID. Each token access record is represented
    as a dictionary containing information about the access granted to the doctor for
    specific tokens.

    Args:
        id (int): The unique identifier of the doctor whose token access records are to be retrieved.

    Returns:
        None | list[dict]: A list of dictionaries, where each dictionary represents a token access record,
                           or None if no token access records are found for the given doctor ID.
                           Each dictionary in the list contains details about the token access,
                           such as the token ID, access permissions, and any other relevant information.
    """
    query = rf'SELECT * FROM TokenAccess WHERE doctorId = {id};'
    tokens_access = mysql_client(query)
    return None if not tokens_access else tokens_access


def get_user_by_email_password(email:str, password:str) -> None | dict:
    """
    Retrieve user information from the database based on email and password.

    This function queries the Users table in the database to fetch user information
    associated with the provided email. It then verifies if the provided password
    matches the decrypted password stored in the database.

    Args:
        email (str): The email address of the user to retrieve.
        password (str): The password to verify against the stored password.

    Returns:
        None | dict: A dictionary containing the user's information if found and the
                     password is correct, or None if no user matches the given email
                     or the password is incorrect.
    """
    query = rf"SELECT * FROM Users WHERE email = '{email}';"
    user = mysql_client(query)
    if not user:
        return None
    if decrypt(user[0]['password']) != password:
        return None
    return user[0]


def get_medical_records_by_pacient(id: int, limit: int, offset: int) -> None | list[dict]:
    """
    Retrieve medical records for a specific patient from the database.

    This function queries the MedicalRecords table in the database to fetch all medical records
    associated with the given patient ID. The records are sorted in descending order based on the
    date they were created, and pagination is applied using the provided limit and offset parameters.

    Parameters:
    id (int): The unique identifier of the patient whose medical records are to be retrieved.
    limit (int): The maximum number of records to retrieve per page.
    offset (int): The number of records to skip before starting to retrieve records.

    Returns:
    None | list[dict]: A list of dictionaries, where each dictionary represents a medical record,
                      or None if no records are found for the given patient ID.
                      Each dictionary in the list contains details about the medical record,
                      such as the record ID, patient ID, doctor ID, record type ID, date created,
                      and any other relevant information.
    """
    query = rf'SELECT * FROM MedicalRecords WHERE patientId = {id} ORDER BY dateCreated DESC LIMIT {limit} OFFSET {offset};'
    records = mysql_client(query)
    return None if not records else records


def count_medical_records(id: int) -> None | dict:
    """
    Count the total number of medical records for a specific patient.

    This function queries the MedicalRecords table in the database to count
    the number of records associated with the given patient ID.

    Args:
        id (int): The unique identifier of the patient whose medical records are to be counted.

    Returns:
        None | dict: A dictionary containing the total count of medical records if found,
                     with the key 'totalCount', or None if no records are found for the given patient ID.
    """
    query = rf"SELECT COUNT(recordId) AS totalCount FROM MedicalRecords WHERE patientId = {id};"
    total_count= mysql_client(query)
    return None if not total_count else total_count[0]


def get_patient_records_by_doctor(patientId: int, doctorId: int, limit: int, offset: int) -> None | list[dict]:
    """
    Retrieve medical records for a specific patient and doctor from the database.

    This function queries the MedicalRecords table to fetch medical records associated
    with the given patient ID and doctor ID. The records are sorted in descending order
    based on the date they were created, and pagination is applied using the provided
    limit and offset parameters.

    Args:
        patientId (int): The unique identifier of the patient whose records are to be retrieved.
        doctorId (int): The unique identifier of the doctor associated with the records.
        limit (int): The maximum number of records to retrieve per page.
        offset (int): The number of records to skip before starting to retrieve records.

    Returns:
        None | list[dict]: A list of dictionaries, where each dictionary represents a medical record,
                           or None if no records are found for the given patient and doctor IDs.
                           Each dictionary contains details about the medical record such as
                           record ID, patient ID, doctor ID, record type ID, date created, etc.
    """
    query = rf'SELECT * FROM MedicalRecords WHERE patientId = {patientId} AND doctorId = {doctorId} ORDER BY dateCreated DESC LIMIT {limit} OFFSET {offset};'
    records = mysql_client(query)
    return None if not records else records


def count_patient_records_by_doctor(patientId: int, doctorId: int) -> None | dict:
    """
    Count the total number of medical records for a specific patient and doctor.

    This function queries the MedicalRecords table in the database to count
    the number of records associated with the given patient ID and doctor ID.

    Parameters:
    patientId (int): The unique identifier of the patient whose medical records are to be counted.
    doctorId (int): The unique identifier of the doctor associated with the records.

    Returns:
    None | dict: A dictionary containing the total count of medical records if found,
                 with the key 'totalCount', or None if no records are found for the given patient ID and doctor ID.
    """
    query = rf"SELECT COUNT(recordId) AS totalCount FROM MedicalRecords WHERE patientId = {patientId} AND doctorId = {doctorId};"
    total_count = mysql_client(query)
    return None if not total_count else total_count[0]


def get_medical_records_type(id: int) -> None | dict:
    """
    Retrieve information about a specific medical record type from the database.

    This function queries the RecordTypes table in the database to fetch all information
    associated with the specified record type ID.

    Args:
        id (int): The unique identifier of the record type to retrieve.

    Returns:
        None | dict: A dictionary containing the record type information if found,
                     or None if no record type matches the given ID.
                     The dictionary includes details such as recordTypeId, recordName,
                     and any other fields present in the RecordTypes table.
    """
    query = rf'SELECT * FROM RecordTypes WHERE recordTypeId = {id};'
    record_type = mysql_client(query)
    return None if not record_type else record_type[0]


def get_record_type_name(id: int) -> None | str:
    """
    Retrieve the name of a medical record type from the database based on its ID.

    This function queries the RecordTypes table to fetch the name of the record type
    associated with the given record type ID.

    Args:
        id (int): The unique identifier of the record type.

    Returns:
        None | str: The name of the record type if found, or None if no record type
                    matches the given ID.
    """
    query = rf'SELECT recordName FROM RecordTypes WHERE recordTypeId = {id};'
    record_name = mysql_client(query)
    return None if not record_name else record_name[0]['recordName']


def get_token(id: int) -> None | dict:
    query = rf'SELECT * FROM Tokens WHERE tokenId = {id};'
    token = mysql_client(query)
    return None if not token else token[0]


def get_active_tokens_by_patient(id: int) -> None | list[dict]:
    query = rf"SELECT * FROM Tokens WHERE patientId = {id} AND expirationDate > '{datetime.now()}' ORDER BY expirationDate;"
    tokens = mysql_client(query)
    return None if not tokens else tokens


def get_tokens_token_access(id: int) -> None | list[dict]:
    query = rf'SELECT * FROM TokenAccess WHERE tokenId = {id};'
    token_accesses = mysql_client(query)
    return None if not token_accesses else token_accesses


def get_token_access(id: int) -> None | dict:
    query = rf'SELECT * FROM TokenAccess WHERE tokenAccessId = {id};'
    token_access = mysql_client(query)
    return None if not token_access else token_access[0]


def get_active_tokens_by_doctor(id: int) -> None | list[dict]:
    query = rf'''SELECT a.tokenId, a.token, a.patientId, a.expirationDate from Tokens a INNER JOIN
        (SELECT DISTINCT tokenId FROM TokenAccess WHERE doctorId = {id}) v ON a.tokenId = v.tokenId
        WHERE expirationDate > '{datetime.now()}' ORDER BY expirationDate;'''
    tokens = mysql_client(query)
    return None if not tokens else tokens


def get_inactive_tokens(id: int, limit: int, offset: int) -> None | list[dict]:
    query = rf'''SELECT * FROM Tokens WHERE patientId = {id} AND expirationDate < '{datetime.now()}'
        ORDER BY expirationDate DESC LIMIT {limit} OFFSET {offset};'''
    tokens = mysql_client(query)
    return None if not tokens else tokens


def count_inactive_tokens(id: int) -> None | dict:
    query = rf"SELECT COUNT(tokenId) AS totalCount FROM Tokens WHERE patientId = {id} AND expirationDate < '{datetime.now()}';"
    total_count = mysql_client(query)
    return None if not total_count else total_count[0]


def get_doctor_patients(id: int) -> None | dict:
    query = rf'''SELECT p.patientId, CONCAT(u.firstName, ' ', u.lastName) AS patientFullName,
        mr.dateCreated AS lastRecordCreated FROM (
            SELECT *, ROW_NUMBER() OVER (PARTITION BY patientId ORDER BY dateCreated DESC) AS row_num
            FROM MedicalRecords WHERE doctorId = {id}
        ) mr
        JOIN Patients p ON mr.patientId = p.patientId
        JOIN Users u ON p.userId = u.userId
        WHERE mr.row_num = 1 ORDER BY patientFullName ASC;'''
    doctor_patients = mysql_client(query)
    return None if not doctor_patients else doctor_patients


def get_medical_records_files(id: int) -> list[dict]:
    query = rf'SELECT * FROM Files WHERE recordId = {id};'
    return mysql_client(query)


def get_filename_by_user(fileName: str, userId: int) -> list[dict]:
    query = rf'''
    SELECT f.fileName, u.userId FROM Files f
    INNER JOIN MedicalRecords mr ON f.recordId = mr.recordId
    INNER JOIN Patients p ON mr.patientId = p.patientId
    INNER JOIN Users u ON p.userId = u.userId
    WHERE f.fileName = '{fileName}' and u.userId = {userId};
    '''
    return mysql_client(query)
