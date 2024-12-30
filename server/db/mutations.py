from .mysql import mysql_client


def create_user(email: str, firstName: str, lastName: str, password: bytes, userType: str, acceptTerms: bool) -> None | dict:
    """
    Create a new user in the database.

    Args:
        email (str): The email address of the user.
        firstName (str): The first name of the user.
        lastName (str): The last name of the user.
        password (bytes): The hashed password of the user.
        userType (str): The type of user (e.g., 'patient', 'doctor').
        acceptTerms (bool): Whether the user has accepted the terms and conditions.

    Returns:
        None | dict: None if the user creation failed, or a dictionary containing user information if successful.
    """
    args = [email, firstName, lastName, password, userType, acceptTerms]
    query = 'AddUser'
    confirmation = mysql_client(query, type='procedure', args=args)
    return None if not confirmation else confirmation[0]


def create_patient_or_doctor_user(userId: int, userType: str) -> (None | dict):
    args = [userId, userType]
    query = 'AddPatientOrDoctorUser'
    confirmation = mysql_client(query, type='procedure', args=args)
    return None if not confirmation else confirmation[0]


def update_user(email: str, firstName: str, lastName: str, userId: int) -> (None | dict):
    args = [email, firstName, lastName, userId]
    query = 'UpdateUser'
    confirmation = mysql_client(query, type='procedure', args=args)
    return None if not confirmation else confirmation[0]


def update_patient_user(dateOfBirth: str, gender: str, patientId: int) -> (None | dict):
    args = [dateOfBirth, gender, patientId]
    query = 'UpdatePatientUser'
    confirmation = mysql_client(query, type='procedure', args=args)
    return None if not confirmation else confirmation[0]


def update_doctor_user(specialty: str, licenseNumber: str, doctorId: int) -> (None | dict):
    args = [specialty, licenseNumber, doctorId]
    query = 'UpdateDoctorUser'
    confirmation = mysql_client(query, type='procedure', args=args)
    return None if not confirmation else confirmation[0]


def reserve_token_id(patientId: int, expirationDate: str, token: str = 'reserve') -> (None | dict):
    args = [token, patientId, expirationDate]
    query = 'ReserveTokenId'
    confirmation = mysql_client(query, type='procedure', args=args)
    return None if not confirmation else confirmation[0]


def create_token(tokenId: int, token: str) -> (None | dict):
    args = [tokenId, token]
    query = 'AddToken'
    confirmation = mysql_client(query, type='procedure', args=args)
    return None if not confirmation else confirmation[0]


def create_token_access(tokenId: int, doctorId: int) -> (None | dict):
    args = [tokenId, doctorId]
    query = 'AddTokenAccess'
    confirmation = mysql_client(query, 'procedure', args)
    return None if not confirmation else confirmation[0]


def create_record_type(recordName: str) -> (None | dict):
    args = [recordName]
    query = 'AddRecordType'
    confirmation = mysql_client(query, 'procedure', args)
    return None if not confirmation else confirmation[0]


def create_medical_record(patientId: int, doctor_id: int | None, recordTypeId: int, recordData: str) -> (None | dict):
    args = [patientId, doctor_id, recordTypeId, recordData]
    query = 'AddMedicalRecord'
    confirmation = mysql_client(query, 'procedure', args)
    return None if not confirmation else confirmation[0]


def deactivate_token(tokenId: int) -> None | dict:
    args = [tokenId]
    query = 'DeactivateToken'
    confirmation = mysql_client(query, 'procedure', args)
    return None if not confirmation else confirmation[0]


def add_file_info(recordId: int, fileName: str, mimeType: str, url: str) -> None | dict:
    args = [recordId, fileName, mimeType, url]
    query = 'AddFiles'
    confirmation = mysql_client(query, 'procedure', args)
    return None if not confirmation else confirmation[0]


def update_file_text_content(fileId: int, textContent: str) -> None | dict:
    args = [fileId, textContent]
    query = 'UpdateFileTextContent'
    confirmation = mysql_client(query, 'procedure', args)
    return None if not confirmation else confirmation[0]
