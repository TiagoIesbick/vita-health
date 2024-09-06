from .mysql_results import mysql_results


def create_user(email: str, firstName: str, lastName: str, password: bytes, userType: str, acceptTerms: bool) -> (None | dict):
    args = [email, firstName, lastName, password, userType, acceptTerms]
    query = 'AddUser'
    confirmation = mysql_results(query, type='procedure', args=args)
    if len(confirmation) == 0:
        return None
    return confirmation[0]


def create_patient_or_doctor_user(userId: int, userType: str) -> (None | dict):
    args = [userId, userType]
    query = 'AddPatientOrDoctorUser'
    confirmation = mysql_results(query, type='procedure', args=args)
    if len(confirmation) == 0:
        return None
    return confirmation[0]


def update_user(email: str, firstName: str, lastName: str, userId: int) -> (None | dict):
    args = [email, firstName, lastName, userId]
    query = 'UpdateUser'
    confirmation = mysql_results(query, type='procedure', args=args)
    if len(confirmation) == 0:
        return None
    return confirmation[0]


def update_patient_user(dateOfBirth: str, gender: str, patientId: int) -> (None | dict):
    args = [dateOfBirth, gender, patientId]
    query = 'UpdatePatientUser'
    confirmation = mysql_results(query, type='procedure', args=args)
    if len(confirmation) == 0:
        return None
    return confirmation[0]


def update_doctor_user(specialty: str, licenseNumber: str, doctorId: int) -> (None | dict):
    args = [specialty, licenseNumber, doctorId]
    query = 'UpdateDoctorUser'
    confirmation = mysql_results(query, type='procedure', args=args)
    if len(confirmation) == 0:
        return None
    return confirmation[0]


def reserve_token_id(patientId: int, expirationDate: str, token: str = 'reserve') -> (None | dict):
    args = [token, patientId, expirationDate]
    query = 'ReserveTokenId'
    confirmation = mysql_results(query, type='procedure', args=args)
    if len(confirmation) == 0:
        return None
    return confirmation[0]


def create_token(tokenId: int, token: str) -> (None | dict):
    args = [tokenId, token]
    query = 'AddToken'
    confirmation = mysql_results(query, type='procedure', args=args)
    if len(confirmation) == 0:
        return None
    return confirmation[0]


def create_token_access(tokenId: int, doctorId: int) -> (None | dict):
    args = [tokenId, doctorId]
    query = 'AddTokenAccess'
    confirmation = mysql_results(query, 'procedure', args)
    if len(confirmation) == 0:
        return None
    return confirmation[0]


def create_record_type(recordName: str) -> (None | dict):
    args = [recordName]
    query = 'AddRecordType'
    confirmation = mysql_results(query, 'procedure', args)
    if len(confirmation) == 0:
        return None
    return confirmation[0]


def create_medical_record(patientId: int, recordTypeId: int, recordData: str) -> (None | dict):
    args = [patientId, recordTypeId, recordData]
    query = 'AddMedicalRecord'
    confirmation = mysql_results(query, 'procedure', args)
    if len(confirmation) == 0:
        return None
    return confirmation[0]