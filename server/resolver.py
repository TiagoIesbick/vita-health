from ariadne import QueryType, ObjectType, MutationType
from datetime import datetime
from pytz import timezone
from db.queries import *
from db.mutations import *
from utils.utils import encrypt, validate_email, validate_password, \
    validate_name, generate_token
from auth import handle_login
import nh3


query = QueryType()
users = ObjectType("Users")
mutation = MutationType()
medical_records = ObjectType("MedicalRecords")

@query.field("user")
def resolve_user(*_, userId):
    return get_user(userId)

@users.field("patient")
def resolve_users_patient(users, *_):
    if not users['userId']:
        return None
    return get_users_patient(users['userId'])

@users.field("doctor")
def resolve_users_patient(users, *_):
    if not users['userId']:
        return None
    return get_users_doctor(users['userId'])

@mutation.field("createUser")
def resolve_create_user(*_, input):
    email, firstName, lastName, password, userType, acceptTerms = \
        input['email'], input['firstName'].strip().capitalize(), input['lastName'].strip().capitalize(), input['password'], input['userType'], input['acceptTerms']
    if not validate_email(email):
        return { 'userError': 'Invalid e-mail'}
    if not validate_name(firstName):
        return { 'userError': 'First name must start with at least 2 word characters' }
    if not validate_name(lastName):
        return { 'userError': 'Last name must start with at least 2 word characters' }
    if not validate_password(password):
        return { 'userError': 'Invalid password' }
    res = create_user(
        email,
        nh3.clean(firstName),
        nh3.clean(lastName),
        encrypt(password),
        userType,
        acceptTerms
    )
    if res['userConfirmation']:
        res['user'] = get_user_by_email_password(email, password)
    return res

@mutation.field("createPatientOrDoctorUser")
def resolve_create_patient_or_doctor_user(*_, userId, userType):
    res = create_patient_or_doctor_user(userId, userType)
    if res['userConfirmation']:
        res['user'] = get_user(userId)
    return res

@mutation.field("updateUser")
def resolve_update_user(_, info, input):
    if not info.context['authenticated']:
        return {'userError': 'Missing authentication'}
    email, firstName, lastName, userId = \
        input['email'], input['firstName'].strip().capitalize(), \
        input['lastName'].strip().capitalize(), info.context['user_detail']['userId']
    if not validate_email(email):
        return { 'userError': 'Invalid e-mail'}
    if not validate_name(firstName):
        return { 'userError': 'First name must start with at least 2 word characters' }
    if not validate_name(lastName):
        return { 'userError': 'Last name must start with at least 2 word characters' }
    res = update_user(email, firstName, lastName, userId)
    if res['userConfirmation']:
        res['user'] = get_user(userId)
        res['token'] = handle_login(res['user'])
    return res

@mutation.field("updatePatientUser")
def resolve_update_patient_user(_, info, input):
    if not info.context['authenticated']:
        return {'userError': 'Missing authentication'}
    patient = get_users_patient(info.context['user_detail']['userId'])
    if not patient:
        return {'userError': 'Missing patient credential'}
    # as my mysql database is recording dates in the Brazilian time zone, it is necessary to transform the date to my respective time zone,
    # if your mysql database is recording dates in different time zone, transform the 'dateOfBirth' variable into your respective time zone
    dateOfBirth = datetime.fromisoformat(input['dateOfBirth']).astimezone(timezone('America/Sao_Paulo')).strftime("%Y-%m-%d")
    res = update_patient_user(dateOfBirth, input['gender'], patient['patientId'])
    if res['userConfirmation']:
        res['user'] = get_user(info.context['user_detail']['userId'])
    return res

@mutation.field("updateDoctorUser")
def resolve_update_doctor_user(_, info, input):
    if not info.context['authenticated']:
        return {'userError': 'Missing authentication'}
    doctor = get_users_doctor(info.context['user_detail']['userId'])
    if not doctor:
        return {'userError': 'Missing doctor credential'}
    res = update_doctor_user(input['specialty'].strip().capitalize(), input['licenseNumber'], doctor['doctorId'])
    if res['userConfirmation']:
        res['user'] = get_user(info.context['user_detail']['userId'])
    return res

@mutation.field("login")
def resolve_login(*_, email, password):
    user = get_user_by_email_password(email, password)
    if user:
        token = handle_login(user)
        return { 'user': user, 'token': token }
    return { 'error': 'Invalid email or password' }

@query.field("medicalRecords")
def resolve_medical_records(_, info):
    if not info.context['authenticated']:
        return None
    patient = get_users_patient(info.context['user_detail']['userId'])
    if not patient:
        return None
    return get_medical_records_by_pacient(patient['patientId'])

@query.field("medicalRecordsByPatientId")
def resolve_medical_records_by_patient_id(_, info, patientId):
    if not info.context['authenticated']:
        return None
    if info.context['user_detail']['userType'] != 'Doctor':
        return None
    return get_medical_records_by_pacient(patientId)

@medical_records.field("recordType")
def resolve_medical_records_type(medicalRecords, *_):
    return get_medical_records_type(medicalRecords['recordTypeId'])

@mutation.field("generateToken")
def resolve_generate_token(_, info, expirationDate):
    if not info.context['authenticated']:
        return {'tokenError': 'Missing authentication'}
    patient = get_users_patient(info.context['user_detail']['userId'])
    if not patient:
        return {'tokenError': 'Missing patient credential'}
    # as my mysql database is recording dates in the Brazilian time zone, it is necessary to transform the date to my respective time zone,
    # if your mysql database is recording dates in different time zone, transform the 'exp' variable into your respective time zone
    exp = datetime.fromisoformat(expirationDate).astimezone(timezone('America/Sao_Paulo')).strftime("%Y-%m-%d %H:%M:%S")
    reserve_tokenId = reserve_token_id(patient['patientId'], exp)
    if reserve_tokenId['tokenError']:
        return {'tokenError': reserve_tokenId['tokenError']}
    token = generate_token(
        expirationDate,
        {
            'patientId': patient['patientId'],
            'userId': patient['userId'],
            'tokenId': reserve_tokenId['tokenId']
        }
        )
    res = create_token(reserve_tokenId['tokenId'], token)
    if res['tokenError']:
        return {'tokenError': res['tokenError']}
    if res['tokenConfirmation']:
        res['token'] = get_token(reserve_tokenId['tokenId'])
    return res

@mutation.field("saveTokenAccess")
def resolve_save_token_access(_, info, tokenId, doctorId):
    if not info.context['authenticated']:
        return {'acessError': 'Missing authentication'}
    if info.context['user_detail']['userType'] != 'Doctor':
        return {'acessError': 'Missing healthcare professional credential'}
    return create_token_access(tokenId, doctorId)
