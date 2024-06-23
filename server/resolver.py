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
        input['email'], input['firstName'], input['lastName'], input['password'], input['userType'], input['acceptTerms']
    if not validate_email(email):
        return { 'userError': 'E-mail inválido'}
    if not validate_name(firstName.strip()):
        return { 'userError': 'Nome deve começar com pelo menos 2 caracteres de palavra' }
    if not validate_name(lastName.strip()):
        return { 'userError': 'Sobrenome deve começar com pelo menos 2 caracteres de palavra' }
    if not validate_password(password):
        return { 'userError': 'Senha inválida'}
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

@mutation.field("login")
def resolve_login(*_, email, password):
    user = get_user_by_email_password(email, password)
    if user:
        token = handle_login(user)
        return { 'user': user, 'token': token }
    return { 'error': 'E-mail ou senha inválidos' }

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
        return None
    patient = get_users_patient(info.context['user_detail']['userId'])
    if not patient:
        return None
    token = generate_token(
        expirationDate,
        {'patientId': patient['patientId'], 'userId': patient['userId']}
        )
    res = create_token(
        token,
        patient['patientId'],
        datetime.fromisoformat(expirationDate).astimezone(timezone('America/Sao_Paulo')).strftime("%Y-%m-%d %H:%M:%S")
        )
    if res['tokenConfirmation']:
        res['token'] = get_token(res['tokenId'])
    return res
