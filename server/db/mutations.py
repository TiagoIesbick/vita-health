from .mysql_results import mysql_results

def create_user(email: str, firstName: str, lastName: str, password: bytes, userType: str, acceptTerms: bool) -> (None | dict):
    args = [email, firstName, lastName, password, userType, acceptTerms]
    query = 'AddUser'
    confirmation = mysql_results(query, type='procedure', args=args)
    if len(confirmation) == 0:
        return None
    return confirmation[0]

def createPatientOrDoctorUser(userId: int, userType: str) -> (None | dict):
    args = [userId, userType]
    query = 'AddPatientOrDoctorUser'
    confirmation = mysql_results(query, type='procedure', args=args)
    if len(confirmation) == 0:
        return None
    return confirmation[0]
