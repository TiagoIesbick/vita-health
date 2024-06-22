from ariadne import QueryType, ObjectType, MutationType
from db.queries import *
from db.mutations import *
from utils.utils import encrypt, validate_email, validate_password, validate_name
from auth import handle_login
import nh3

query = QueryType()
users = ObjectType("Users")
mutation = MutationType()

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
    res = createPatientOrDoctorUser(userId, userType)
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
def resolve_medical_records(*_):
    return get_medical_records()
