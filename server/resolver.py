import nh3
import jwt
import aiofiles
import uuid
import os
import json
from os import getenv
from ariadne import QueryType, ObjectType, MutationType, SubscriptionType
from datetime import datetime
from db.queries import *
from db.mutations import *
from db.redis import pubsub
from db.elastic import es, search_with_highlights
from db.openai import openai_chat_stream, extract_text_from_pdf, extract_text_with_ocr
from utils.decorators import *
from utils.utils import check_translate_word
from pathlib import Path
from utils.utils import *


query = QueryType()
mutation = MutationType()
subscription = SubscriptionType()
users = ObjectType("Users")
patients = ObjectType("Patients")
doctors = ObjectType("Doctors")
record_types = ObjectType("RecordTypes")
medical_records = ObjectType("MedicalRecords")
tokens = ObjectType("Tokens")
token_access = ObjectType("TokenAccess")


@query.field("user")
def resolve_user(*_, userId):
    """
    Resolves and retrieves a user based on the provided user ID.

    Parameters:
    _ (Any): Placeholder parameter (unused).
    userId (str): The unique identifier of the user to retrieve.

    Returns:
    dict: A dictionary containing the user's information if found, or None if not found.
    """
    return get_user(userId)


@users.field("patient")
def resolve_users_patient(users, *_):
    """
    Resolve the 'patient' field for a user.

    This function retrieves the doctor information associated with a user.
    If the user's userId is not present, it returns None.

    Parameters:
    users (dict): A dictionary containing user information, including 'userId'.
    *_ : Variable length argument list for any additional parameters (unused).

    Returns:
    dict or None: A dictionary containing patient information if the userId exists,
                  otherwise None.
    """
    return None if not users['userId'] else get_users_patient(users['userId'])


@users.field("doctor")
def resolve_users_patient(users, *_):
    """
    Resolve the 'doctor' field for a user.

    This function retrieves the doctor information associated with a user.
    If the user's userId is not present, it returns None.

    Parameters:
    users (dict): A dictionary containing user information, including 'userId'.
    *_ : Variable length argument list for any additional parameters (unused).

    Returns:
    dict or None: A dictionary containing doctor information if the userId exists,
                  otherwise None.
    """
    return None if not users['userId'] else get_users_doctor(users['userId'])


@patients.field("user")
def resolve_patients_user(patients, *_):
    """
    Resolve the 'user' field for a patient.

    This function retrieves the user information associated with a patient.
    If the patient's userId is not present, it returns None.

    Parameters:
    patients (dict): A dictionary containing patient information, including 'userId'.
    *_ : Variable length argument list for any additional parameters (unused).

    Returns:
    dict or None: A dictionary containing user information if the userId exists,
                  otherwise None.
    """
    return None if not patients['userId'] else get_user(patients['userId'])


@patients.field("tokens")
@requires_authentication(return_none=True)
def resolve_patients_tokens(patients, *_):
    """
    Resolves and retrieves the tokens associated with a patient.

    This function fetches the tokens associated with a specific patient.
    It requires authentication to perform this operation.

    Parameters:
    patients (dict): A dictionary containing patient information, including 'patientId'.
    *_ : Variable length argument list for any additional parameters (unused).

    Returns:
    list or None: A list of tokens associated with the given patient if the patient ID is present.
                   Returns None if the patient ID is not present.
    """
    return None if not patients['patientId'] else get_patients_tokens(patients['patientId'])


@doctors.field("user")
def resolve_doctors_user(doctors, *_):
    """
    Resolve the 'user' field for a doctor.

    This function retrieves the user information associated with a doctor.
    If the doctor's userId is not present, it returns None.

    Parameters:
    doctors (dict): A dictionary containing doctor information, including 'userId'.
    *_ : Variable length argument list for any additional parameters (unused).

    Returns:
    dict or None: A dictionary containing user information if the userId exists,
                  otherwise None.
    """
    return None if not doctors['userId'] else get_user(doctors['userId'])


@doctors.field("tokensAccess")
@requires_authentication(return_none=True)
def resolve_doctor_tokens_access(doctors, *_):
    """
    Resolve the 'tokensAccess' field for a doctor.

    This function retrieves the tokens access information for a given doctor.
    It requires authentication and returns None if the doctor ID is not present.

    Parameters:
    doctors (dict): A dictionary containing doctor information, including 'doctorId' and 'userId'.
    *_ : Variable length argument list for any additional parameters (unused).

    Returns:
    list or None: A list of token access information for the doctor if the doctorId exists,
                  otherwise None.
    """
    return None if not doctors['doctorId'] else get_doctors_tokens_access(doctors['userId'])


@mutation.field("createUser")
def resolve_create_user(*_, input):
    """
    Resolve the createUser mutation to create a new user account.

    This function validates user input, creates a new user account, and returns the result.

    Parameters:
    *_ : Variable length argument list (unused).
    input (dict): A dictionary containing user information with the following keys:
        - 'email': The user's email address.
        - 'firstName': The user's first name.
        - 'lastName': The user's last name.
        - 'password': The user's password.
        - 'userType': The type of user account.
        - 'acceptTerms': Boolean indicating if the user accepted the terms.

    Returns:
    dict: A dictionary containing the result of the user creation:
        - If validation fails: {'userError': <error_message>}
        - If creation is successful: {
            'userConfirmation': True,
            'user': <user_object>
          }
        - If creation fails: The result from the create_user function.
    """
    email, firstName, lastName, password, userType, acceptTerms = \
        input['email'], nh3.clean(input['firstName'].strip().capitalize()), nh3.clean(input['lastName'].strip().capitalize()), input['password'], input['userType'], input['acceptTerms']
    if not validate_email(email):
        return { 'userError': 'noEmail'}
    if not validate_name(firstName):
        return { 'userError': 'firstNameValidation' }
    if not validate_name(lastName):
        return { 'userError': 'lastNameValidation' }
    if not validate_password(password):
        return { 'userError': 'invalidPassword' }
    res = create_user(
        email,
        firstName,
        lastName,
        encrypt(password),
        userType,
        acceptTerms
    )
    if res['userConfirmation']:
        res['user'] = get_user_by_email_password(email, password)
    return res


@mutation.field("createPatientOrDoctorUser")
def resolve_create_patient_or_doctor_user(*_, userId, userType):
    """
    Create a patient or doctor user based on the provided user ID and user type.

    This function creates a new patient or doctor user entry in the database,
    associated with an existing user account.

    Parameters:
    *_ : Variable length argument list (unused).
    userId (str): The unique identifier of the existing user account.
    userType (str): The type of user to create ('Patient' or 'Doctor').

    Returns:
    dict: A dictionary containing the result of the operation.
        If successful:
            {
                'userConfirmation': True,
                'user': <user_object>
            }
        If unsuccessful:
            {
                'userConfirmation': False,
                'error': <error_message>
            }
    """
    res = create_patient_or_doctor_user(userId, userType)
    if res['userConfirmation']:
        res['user'] = get_user(userId)
    return res


@mutation.field("updateUser")
@requires_authentication('userError')
def resolve_update_user(_, info, input):
    """
    Resolve the updateUser mutation to update a user's information.

    This function updates a user's email, first name, and last name. It performs
    validation on the input data and updates the user information in the database.

    Parameters:
    _ (any): Placeholder parameter (unused).
    info (GraphQLResolveInfo): Contains the context and execution information.
    input (dict): A dictionary containing the user's updated information:
                  - 'email': The user's new email address.
                  - 'firstName': The user's new first name.
                  - 'lastName': The user's new last name.

    Returns:
    dict: A dictionary containing the result of the update operation:
          - If validation fails: {'userError': <error_message>}
          - If update is successful: {
                'userConfirmation': True,
                'user': <updated_user_object>,
                'token': <new_jwt_token>
            }
    """
    email, firstName, lastName, userId = \
        input['email'], nh3.clean(input['firstName'].strip().capitalize()), \
        nh3.clean(input['lastName'].strip().capitalize()), info.context['user_detail']['userId']
    if not validate_email(email):
        return { 'userError': 'noEmail'}
    if not validate_name(firstName):
        return { 'userError': 'firstNameValidation' }
    if not validate_name(lastName):
        return { 'userError': 'lastNameValidation' }
    res = update_user(email, firstName, lastName, userId)
    if res['userConfirmation']:
        res['user'] = get_user(userId)
        res['token'] = jwt.encode(res['user'], getenv('SECRET'), algorithm="HS256")
    return res


@mutation.field("updatePatientUser")
@requires_authentication('userError')
@requires_patient('userError')
def resolve_update_patient_user(_, info, patient, input):
    """
    Update the patient user's information.

    This function updates the patient user's date of birth and gender. It requires
    authentication and patient access.

    Parameters:
    _ (any): Placeholder parameter (unused).
    info (GraphQLResolveInfo): Resolver info object containing context information.
    patient (dict): A dictionary containing patient information, including 'patientId'.
    input (dict): A dictionary containing the updated user information, including 'dateOfBirth' and 'gender'.

    Returns:
    dict: A dictionary containing the result of the operation.
        If successful:
            - 'userConfirmation': True
            - 'user': The updated user information
        If unsuccessful:
            - 'userError': An error message describing the failure
    """
    dateOfBirth = datetime.fromisoformat(input['dateOfBirth']).strftime("%Y-%m-%d")
    res = update_patient_user(dateOfBirth, input['gender'], patient['patientId'])
    if res['userConfirmation']:
        res['user'] = get_user(info.context['user_detail']['userId'])
    return res


@mutation.field("updateDoctorUser")
@requires_authentication('userError')
@requires_doctor('userError')
def resolve_update_doctor_user(_, info, doctor, input):
    """
    Update the information of a doctor user.

    This function updates the specialty and license number of a doctor user.
    It requires authentication and doctor access rights.

    Parameters:
    _ (Any): Placeholder parameter (unused).
    info (GraphQLResolveInfo): Resolver info object containing the context.
    doctor (dict): A dictionary containing the doctor's information.
    input (dict): A dictionary containing the updated information:
                  - 'specialty': The doctor's new specialty.
                  - 'licenseNumber': The doctor's new license number.

    Returns:
    dict: A dictionary containing the result of the update operation:
          - If successful, includes 'userConfirmation' (True) and 'user' (updated user info).
          - If unsuccessful, includes 'userError' with an error message.
    """
    res = update_doctor_user(nh3.clean(input['specialty'].strip().capitalize()), nh3.clean(input['licenseNumber'].strip()), doctor['doctorId'])
    if res['userConfirmation']:
        res['user'] = get_user(info.context['user_detail']['userId'])
    return res


@mutation.field("login")
def resolve_login(*_, email, password):
    """
    Authenticate a user and generate a JWT token upon successful login.

    This function attempts to authenticate a user with the provided email and password.
    If successful, it generates a JWT token for the user.

    Parameters:
    *_ : Variable length argument list (unused).
    email (str): The email address of the user attempting to log in.
    password (str): The password of the user attempting to log in.

    Returns:
    dict: A dictionary containing the result of the login attempt.
        If successful:
            {
                'user': User object containing user details,
                'token': JWT token string for authenticated session
            }
        If unsuccessful:
            {'error': 'Invalid email or password'}
    """
    user = get_user_by_email_password(email, password)
    if user:
        token = jwt.encode(user, getenv('SECRET'), algorithm="HS256")
        return { 'user': user, 'token': token }
    return { 'error': 'invalidLogin' }


@query.field("medicalRecords")
@requires_authentication(return_none=True)
@requires_patient_or_doctor_access(return_none=True)
def resolve_medical_records(*_, limit, offset, patient_id, doctor_id):
    """
    Resolves and returns a paginated list of medical records for a patient.

    This function fetches a list of medical records for a given patient, applying pagination.
    It requires authentication and patient or doctor access.

    Parameters:
    _ (any): Placeholder parameter (unused).
    limit (int): The maximum number of items to return.
    offset (int): The number of items to skip before starting to collect the result set.
    patient_id (str): The ID of the patient whose medical records are to be fetched.
    doctor_id (str): The ID of the doctor involved in the operation (for access control).

    Returns:
    dict or None: A dictionary containing the total count of medical records and the paginated items.
                  Returns None if there are no medical records for the patient.
    """
    items = get_medical_records_by_pacient(patient_id, limit, offset)
    total_medical_records = count_medical_records(patient_id)
    if not total_medical_records:
        return None
    total_medical_records['items'] = items
    return total_medical_records


@query.field("patientRecordsbyDoctor")
@requires_authentication(return_none=True)
@requires_doctor(return_none=True)
def resolve_patient_records_by_doctor(*_, limit, offset, patientId, doctor):
    """
    Resolves and returns a paginated list of medical records for a patient.

    This function fetches a list of medical records for a given patient, applying pagination.
    It requires authentication and patient or doctor access.

    Parameters:
    _ (any): Placeholder parameter (unused).
    limit (int): The maximum number of items to return.
    offset (int): The number of items to skip before starting to collect the result set.
    patient_id (str): The ID of the patient whose medical records are to be fetched.
    doctor_id (str): The ID of the doctor involved in the operation (for access control).

    Returns:
    dict or None: A dictionary containing the total count of medical records and the paginated items.
                  Returns None if there are no medical records for the patient.
    """
    items = get_patient_records_by_doctor(patientId, doctor['doctorId'], limit, offset)
    total_medical_records = count_patient_records_by_doctor(patientId, doctor['doctorId'])
    if not total_medical_records:
        return None
    total_medical_records['items'] = items
    return total_medical_records


@query.field("medicalRecord")
@requires_authentication(return_none=True)
@requires_patient_or_doctor_access(return_none=True)
def resolve_get_medical_record(*_, recordId, patient_id, doctor_id):
    """
    Resolve and retrieve a specific medical record.

    This function fetches a single medical record based on the provided record ID and patient ID.
    It requires authentication and appropriate access rights (patient or doctor).

    Parameters:
    *_ : Variable length argument list for any additional parameters (unused).
    recordId (str): The unique identifier of the medical record to retrieve.
    patient_id (str): The ID of the patient associated with the medical record.
    doctor_id (str): The ID of the doctor requesting access (for access control, unused in the function body).

    Returns:
    dict: A dictionary containing the medical record information if found.
          Returns None if the record is not found or if access is denied.
    """
    return get_medical_record(recordId, patient_id)


@medical_records.field("recordType")
def resolve_medical_records_type(medicalRecords, *_):
    """
    Resolve the record type for a medical record.

    This function retrieves the type of a medical record based on its record type ID.

    Parameters:
    medicalRecords (dict): A dictionary containing medical record information,
                           including 'recordTypeId'.
    *_ : Variable length argument list for any additional parameters (unused).

    Returns:
    dict: A dictionary containing information about the medical record type.
    """
    return get_medical_records_type(medicalRecords['recordTypeId'])


@medical_records.field("files")
@requires_authentication(return_none=True)
def resolve_medical_records_files(medicalRecords, *_):
    """
    Resolves the 'files' field for the 'medicalRecords' GraphQL object.

    This function retrieves the files associated with a specific medical record.
    It requires authentication to perform this operation.

    Parameters:
    medicalRecords (dict): A dictionary containing medical record information,
                           including 'recordId'.
    *_ : Variable length argument list for additional parameters (unused).

    Returns:
    list: A list of file information associated with the medical record.
          Returns None if authentication is not provided.
    """
    return get_medical_records_files(medicalRecords['recordId'])


@medical_records.field("doctor")
@requires_authentication(return_none=True)
def resolve_medical_records_doctor(medicalRecords, *_):
    """
    Resolve the doctor field for a medical record.

    This function retrieves the doctor associated with a medical record.
    It requires authentication and returns None if the doctor ID is not present.

    Parameters:
    medicalRecords (dict): A dictionary containing medical record information,
                           including 'doctorId'.
    *_ : Variable length argument list for additional parameters (unused).

    Returns:
    dict or None: A dictionary containing the doctor's information if the doctorId
                  exists and the doctor is found, otherwise None.
    """
    return None if not medicalRecords['doctorId'] else get_doctor(medicalRecords['doctorId'])


@mutation.field("createMedicalRecord")
@requires_authentication('medicalRecordError')
@requires_patient_or_doctor_access('medicalRecordError')
def resolve_create_medical_record(*_, recordTypeId, recordData, patient_id, doctor_id):
    """
    Create a new medical record and index it in Elasticsearch.

    This function creates a new medical record for a patient, optionally associated with a doctor.
    If the creation is successful, it indexes the record in Elasticsearch for efficient searching.

    Parameters:
    *_ : Variable length argument list (unused).
    recordTypeId (str): The ID of the record type for this medical record.
    recordData (str): The data content of the medical record.
    patient_id (str): The ID of the patient for whom the record is being created.
    doctor_id (str): The ID of the doctor creating the record, if applicable.

    Returns:
    dict: A dictionary containing the result of the operation.
        If successful, includes:
            - 'medicalRecordConfirmation': A confirmation message
            - 'medicalRecord': The created medical record object
        If unsuccessful, includes:
            - 'medicalRecordError': An error message describing the failure
    """
    res = create_medical_record(patient_id, doctor_id, recordTypeId, recordData)
    if res['medicalRecordConfirmation']:
        medical_record = get_medical_record(res['medicalRecordId'], patient_id)
        es.index(
            index="medical_records",
            id=medical_record['recordId'],
            document={
                "recordId": medical_record['recordId'],
                "recordData": strip_html_tags(medical_record['recordData'] or ''),
                "dateCreated": medical_record['dateCreated'],
                "doctorFullName": None if not doctor_id else get_doctor_full_name(doctor_id),
                "recordTypeName": get_record_type_name(medical_record['recordTypeId']),
                "patientId": patient_id
            }
        )
        res['medicalRecord'] = medical_record
    return res


@query.field("recordTypes")
def resolve_record_types(*_):
    """
    Retrieve a list of available medical record types.

    This function retrieves a list of all available medical record types from the database.

    Parameters:
    None

    Returns:
    list: A list of strings representing the available medical record types.
    """
    return get_record_types()


@record_types.field("translation")
def resolver_record_types_translation(record_types, *_):
    """
    Resolves the 'translation' field for the 'record_types' GraphQL object.

    This function retrieves the translation associated with a specific medical record type.
    It requires the record type ID to perform this operation.

    Parameters:
    record_types (dict): A dictionary containing medical record type information,
                           including 'recordTypeId'.
    *_ : Variable length argument list for additional parameters (unused).

    Returns:
    dict or None: A dictionary containing the translation information if the recordTypeId
                  exists and the translation is found, otherwise None.
    """
    return None if not record_types['recordTypeId'] else get_record_type_translation(record_types['recordTypeId'])


@mutation.field("createRecordType")
@requires_authentication('recordTypeError')
def resolve_create_record_type(*_, recordName):
    """
    Create a new medical record type with translations.

    This function creates a new medical record type by cleaning and translating the provided record name.
    It requires authentication to perform this operation.

    Parameters:
    *_ : Variable length argument list (unused).
    recordName (str): The name of the record type to be created.

    Returns:
    dict: A dictionary containing the result of the operation.
        If the record name is invalid or translation fails:
            {'recordTypeError': 'langNotDetected'}
        If the record type is successfully created:
            {
                'recordTypeConfirmation': 'categoryCreated',
                'recordType': <created_record_type_object>
            }
        Otherwise:
            The result returned by the create_record_type function.
    """
    recordName = ' '.join(nh3.clean(recordName).split())
    if not recordName:
        return {'recordTypeError': 'langNotDetected'}

    translations = check_translate_word(recordName)
    if translations['error'] or translations['confidence'] < 0.5:
        return {'recordTypeError': 'langNotDetected'}

    res = create_record_type(translations['translations']['en'], translations['translations']['pt'])
    if res['recordTypeConfirmation']:
        res['recordType'] = get_medical_records_type(res['recordTypeId'])
    return res


@query.field("activePatientTokens")
@requires_authentication(return_none=True)
@requires_patient(return_none=True)
def resolve_patients_active_tokens(*_, patient):
    """
    Retrieve the active tokens for a given patient.

    This function fetches all active tokens associated with a specific patient.
    It requires authentication and patient access to perform the operation.

    Parameters:
    *_ : Variable length argument list (unused).
    patient (dict): A dictionary containing patient information, including 'patientId'.

    Returns:
    list: A list of active token information associated with the given patient.
          If the patient ID is not present or the patient is not found, returns None.
    """
    return get_active_tokens_by_patient(patient['patientId'])


@query.field("activeDoctorTokens")
@requires_authentication(return_none=True)
@requires_doctor(return_none=True)
def resolve_doctors_active_tokens(*_, doctor):
    """
    Retrieve the active tokens associated with a specific doctor.

    This function retrieves the active tokens for a given doctor. It requires
    authentication and doctor access to perform the operation.

    Parameters:
    _ (any): Placeholder parameter (unused).
    doctor (dict): A dictionary containing doctor information, including 'doctorId'.

    Returns:
    list: A list of active token information associated with the given doctor.
          If the doctor ID is not present or the doctor is not found, returns None.
    """
    return get_active_tokens_by_doctor(doctor['doctorId'])


@query.field("inactiveTokens")
@requires_authentication(return_none=True)
@requires_patient(return_none=True)
def resolve_inactive_tokens(*_, patient, limit, offset):
    """
    Resolve and return a paginated list of inactive tokens for a patient.

    This function fetches inactive tokens for a given patient, applying pagination.
    It requires authentication and patient access.

    Parameters:
    *_ : Variable length argument list (unused).
    patient (dict): A dictionary containing patient information, including 'patientId'.
    limit (int): The maximum number of items to return.
    offset (int): The number of items to skip before starting to collect the result set.

    Returns:
    dict or None: A dictionary containing the total count of inactive tokens and the paginated items.
                  Returns None if there are no inactive tokens for the patient.
    """
    items = get_inactive_tokens(patient['patientId'], limit, offset)
    total_inactive_tokens = count_inactive_tokens(patient['patientId'])
    if not total_inactive_tokens:
        return None
    total_inactive_tokens['items'] = items
    return total_inactive_tokens


@query.field("doctorPatients")
@requires_authentication(return_none=True)
@requires_doctor(return_none=True)
def resolve_doctor_patients(*_, doctor):
    """
    Retrieve the patients associated with a specific doctor.

    This function retrieves the patients for a given doctor. It requires
    authentication and doctor access to perform the operation.

    Parameters:
    _ (any): Placeholder parameter (unused).
    doctor (dict): A dictionary containing doctor information, including 'doctorId'.

    Returns:
    list: A list of patients associated with the given doctor.
          If the doctor ID is not present or the doctor is not found, returns None.
    """
    return get_doctor_patients(doctor['doctorId'])


@query.field("aiConversation")
@requires_authentication(return_none=True)
@requires_patient_or_doctor_access(return_none=True)
@fetch_conversation
def resolve_ai_conversation(*_, conversation, key, patient_id, doctor_id):
    """
    Resolve and return an AI conversation for a patient or doctor.

    This function retrieves an AI conversation based on the provided key. It requires
    authentication and appropriate access rights (patient or doctor).

    Parameters:
    *_ : Variable length argument list for any additional parameters (unused).
    conversation (list): The fetched conversation history.
    key (str): The unique identifier for the conversation.
    patient_id (str): The ID of the patient involved in the conversation.
    doctor_id (str): The ID of the doctor involved in the conversation (for access control).

    Returns:
    list: The conversation history, which is a list of message objects.
    """
    return conversation


@mutation.field("createConversation")
@requires_authentication("conversationError")
@requires_patient_or_doctor_access("conversationError")
@fetch_conversation
async def resolve_create_conversation(_, info, content, allRecords, conversation, key, patient_id, doctor_id):
    """
    Resolves the 'createConversation' mutation.

    This function handles the creation of a conversation between a user and an AI assistant.
    It checks for the presence of health data, validates the content of the conversation,
    and processes the conversation using OpenAI's GPT-4o-mini model.

    Parameters:
    _ (Any): Placeholder parameter (unused).
    info (GraphQLResolveInfo): Resolver info object containing the context.
    content (str): The content of the conversation message.
    allRecords (str): The health records associated with the conversation.
    conversation (list): The current conversation history.
    key (str): The Redis key for the conversation.
    patient_id (str): The ID of the patient involved in the conversation.
    doctor_id (str): The ID of the doctor involved in the conversation.

    Returns:
    dict: A dictionary containing the result of the conversation creation.
        If there are errors:
            {'conversationError': <error message>}
        If successful:
            {'conversationConfirmation': 'Conversation Added!', 'conversation': <conversation>}
    """
    if not allRecords:
        await pubsub.publish(channel=key, message=json.dumps({'content': 'Error: There is no health data to analyze'}))
        return {'conversationError': 'There is no health data to analyze'}

    if not content:
        await pubsub.publish(channel=key, message=json.dumps({'content': 'Error: There is no message to send'}))
        return {'conversationError': 'There is no message to send'}

    clean_content = nh3.clean(content)
    if not clean_content:
        await pubsub.publish(channel=key, message=json.dumps({'content': 'Error: There is no message to send'}))
        return {'conversationError': 'There is no message to send'}

    conversation_copy = conversation.copy()
    new_msg = {"role": "user", "content": clean_content}
    conversation.append(new_msg)

    redis_client.set(key, json.dumps(conversation))
    if info.context['user_detail']['userType'] == 'Patient':
        redis_client.expire(key, 60 * 60)
    else:
        redis_client.expireat(key, info.context['medical_access']['exp'])

    await pubsub.publish(channel=key, message=json.dumps(new_msg))

    prompt = rf'''{clean_content}
    You are provided with the following medical records: {allRecords}.
    Only use these records to provide your insights and answer the user's questions. Do not use any external sources or assumptions.
    '''

    msg_to_ai = {"role": "user", "content": prompt}
    conversation_copy.append(msg_to_ai)

    await openai_chat_stream(conversation_copy, key)

    return {
        'conversationConfirmation': 'Conversation Added!',
        'conversation': conversation
    }


@subscription.source("message")
@requires_authentication(return_none=True)
@requires_patient_or_doctor_access(return_none=True)
async def source_message(_, info, patient_id, doctor_id):
    """
    Source function for the 'message' subscription.

    This asynchronous function sets up a subscription to a Redis channel for real-time messaging.
    It requires authentication and appropriate access rights (patient or doctor).

    Parameters:
    _ (Any): Placeholder parameter (unused).
    info (GraphQLResolveInfo): Resolver info object containing the context.
    patient_id (str): The ID of the patient involved in the conversation.
    doctor_id (str): The ID of the doctor involved in the conversation (for access control).

    Yields:
    dict: A dictionary representing each message received from the Redis channel,
          parsed from JSON to a Python object.
    """
    user_id = info.context['user_detail']['userId']
    key = rf"conversation:{user_id}:{patient_id}"
    async with pubsub.subscribe(channel=key) as subscriber:
        async for event in subscriber:
            yield json.loads(event.message)


@subscription.field("message")
def resolve_message(event, *_):
    """
    Resolve the 'message' field for the subscription.

    This function is used to resolve the 'message' field in a GraphQL subscription.
    It simply returns the event object received from the subscription source.

    Parameters:
    event (dict): The event object containing the message data from the subscription source.
    *_ : Variable length argument list for any additional parameters (unused).

    Returns:
    dict: The original event object, representing the message data for the subscription.
    """
    return event


@mutation.field("generateToken")
@requires_authentication('tokenError')
@requires_patient('tokenError')
def resolve_generate_token(*_, patient, expirationDate):
    """
    Generate a token for a patient with a specified expiration date.

    This function reserves a token ID, generates a JWT token, and creates a token entry in the database.
    It requires authentication and patient access.

    Parameters:
    _ (any): Placeholder parameter (unused).
    patient (dict): A dictionary containing patient information, including 'patientId'.
    expirationDate (str): The expiration date of the token in ISO 8601 format.

    Returns:
    dict: A dictionary containing the result of the operation.
        If token reservation fails:
            {'tokenError': <error message>}
        If token creation fails:
            {'tokenError': <error message>}
        If token creation is successful:
            {
                'tokenConfirmation': True,
                'token': <token information>
            }
    """
    exp = datetime.fromisoformat(expirationDate).strftime("%Y-%m-%d %H:%M:%S")
    unix_timestamp = int(datetime.fromisoformat(expirationDate.replace("Z", "+00:00")).timestamp())
    reserve_tokenId = reserve_token_id(patient['patientId'], exp)
    if reserve_tokenId['tokenError']:
        return {'tokenError': reserve_tokenId['tokenError']}
    token = generate_token(
        unix_timestamp,
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
@requires_authentication('accessError')
@requires_doctor('accessError')
def resolve_save_token_access(_, info, doctor, token):
    """
    Save token access for a doctor.

    This function attempts to save token access for a doctor. It first verifies the provided token,
    checks for medical access authorization, and then creates a token access entry.

    Parameters:
    _ (any): Placeholder parameter (unused).
    info (any): GraphQL resolver info object containing context information.
    doctor (dict): A dictionary containing doctor information, including 'doctorId'.
    token (str): JWT token to be verified.

    Returns:
    dict: A dictionary containing the result of the operation.
        If token verification fails:
            {'accessError': <error message>}
        If medical access is missing:
            {'accessError': 'Missing authorization'}
        If token access is successfully created:
            {
                'accessConfirmation': True,
                'tokenAccess': <token access information>
            }
        Otherwise:
            The result returned by the create_token_access function.
    """
    try:
        jwt.decode(token, getenv('SECRET'), algorithms=["HS256"])
    except jwt.exceptions.PyJWTError as exc:
        return {'accessError': 'invalidExpiredToken'}
    if not info.context['medical_access']:
        return {'accessError': 'missAuthorization'}
    res = create_token_access(info.context['medical_access']['tokenId'], doctor['doctorId'])
    if res['accessConfirmation']:
        res['tokenAccess'] = get_token_access(res['tokenAccessId'])
    return res


@tokens.field("patient")
@requires_authentication(return_none=True)
def resolve_tokens_patient(tokens, *_):
    """
    Resolves the patient field for a token object.

    This function retrieves the patient associated with a token. It requires
    authentication and returns None if the patient ID is not present.

    Parameters:
    tokens (dict): A dictionary containing token information, including 'patientId'.
    *_ : Variable length argument list for additional parameters (unused).

    Returns:
    dict or None: A dictionary containing the patient's information if the patientId
                  exists and the patient is found, otherwise None.
    """
    return None if not tokens['patientId'] else get_patient(tokens['patientId'])


@tokens.field("tokenAccess")
@requires_authentication(return_none=True)
def resolve_tokens_token_access(tokens, *_):
    """
    Resolves the tokenAccess field for a token object.

    This function retrieves the token access information associated with a token.
    It requires authentication and returns None if the token ID is not present.

    Parameters:
    tokens (dict): A dictionary containing token information, including 'tokenId'.
    *_ : Variable length argument list for additional parameters (unused).

    Returns:
    dict or None: A dictionary containing the token access information if the tokenId
                  exists and the access information is found, otherwise None.
    """
    return None if not tokens['tokenId'] else get_tokens_token_access(tokens['tokenId'])


@token_access.field("token")
@requires_authentication(return_none=True)
def resolve_token_access_token(tokenAccess, *_):
    """
    Resolves the token field for a token access object.

    This function retrieves the token associated with a token access. It requires
    authentication and returns None if the token ID is not present.

    Parameters:
    tokenAccess (dict): A dictionary containing token access information,
                        including 'tokenId'.
    *_ : Variable length argument list for additional parameters (unused).

    Returns:
    dict or None: A dictionary containing the token's information if the tokenId
                  exists and the token is found, otherwise None.
    """
    return None if not tokenAccess['tokenId'] else get_token(tokenAccess['tokenId'])


@token_access.field("doctor")
@requires_authentication(return_none=True)
def resolve_token_access_doctor(tokenAccess, *_):
    """
    Resolves the doctor field for a token access object.

    This function retrieves the doctor associated with a token access. It requires
    authentication and returns None if the token ID is not present.

    Parameters:
    tokenAccess (dict): A dictionary containing token access information,
                        including 'tokenId' and 'doctorId'.
    *_ : Variable length argument list for additional parameters (unused).

    Returns:
    dict or None: A dictionary containing the doctor's information if the tokenId
                  exists and the doctor is found, otherwise None.
    """
    return None if not tokenAccess['tokenId'] else get_doctor(tokenAccess['doctorId'])


@mutation.field("deactivateToken")
@requires_authentication('deactivateTokenError')
@requires_patient('deactivateTokenError')
def resolve_deactivate_token(*_, patient, tokenId):
    """
    Deactivate a specific token for a patient.

    This function checks if the given token exists for the patient and deactivates it if found.
    It requires authentication and patient access to perform the operation.

    Parameters:
    *_ : Variable length argument list (unused).
    patient (dict): A dictionary containing patient information, including 'patientId'.
    tokenId (str): The ID of the token to be deactivated.

    Returns:
    dict: A dictionary containing the result of the deactivation attempt.
        If the token is not found:
            {'deactivateTokenError': 'Token not found'}
        If deactivation is successful:
            {
                'deactivateTokenConfirmation': True,
                'token': [deactivated token information]
            }
        If deactivation fails:
            The error message returned by the deactivate_token function.
    """
    tokens = get_active_tokens_by_patient(patient['patientId'])
    token_exists = any(token['tokenId'] == int(tokenId) for token in tokens)
    if not token_exists:
        return {'deactivateTokenError': 'tokenNotFound'}
    res = deactivate_token(tokenId)
    if res['deactivateTokenConfirmation']:
        res['token'] = get_token(tokenId)
    return res


@mutation.field("multipleUpload")
@requires_authentication(error_field="fileError", return_list=True)
@requires_patient_or_doctor_access(error_field="fileError", return_list=True)
async def resolve_multiple_upload(*_, recordId, files, patient_id, doctor_id):
    """
    Resolves the multiple file upload mutation.

    This asynchronous function handles the upload of multiple files for a specific medical record.
    It performs various validations, processes each file, extracts text content, and stores the information
    in both the file system and Elasticsearch.

    Parameters:
        recordId (int): The ID of the medical record to which the files are being uploaded.
        files (list): A list of file objects to be uploaded.
        patient_id (int): The ID of the patient associated with the medical record.
        doctor_id (int): The ID of the doctor performing the upload (used for access control).

    Returns:
        dict: A dictionary containing the result of the upload operation.
            If there are errors:
                {
                    'fileError': list of error messages,
                    'files': list of successfully processed file information
                }
            If successful:
                {
                    'fileConfirmation': success message,
                    'files': list of all processed file information
                }
    """
    if not validate_files_length(files):
        return {'fileError': ["maxFiles"]}
    if not validate_files_size(files):
        return {'fileError': ["totalSize"]}

    file_infos = []
    file_errors = []

    for file in files:
        content_type = file.content_type
        if not validate_file_format(content_type):
            file_errors.append(rf"{file.filename}: fileFormat")
            continue
        if not validate_file_size(file.size):
            file_errors.append(rf"{file.filename}: maxFiles")
            continue

        filename = rf'{uuid.uuid4()}{Path(file.filename).suffix}'
        file_path = os.path.join(UPLOAD_DIR, filename)
        file_url = f"/uploads/{filename}"

        res = add_file_info(recordId, filename, content_type, file_url)
        if res['fileError']:
            file_errors.append(rf"{file.filename}: {res['fileError']}")
            continue

        try:
            async with aiofiles.open(file_path, 'wb') as out_file:
                content = await file.read()
                await out_file.write(content)

            if content_type == "application/pdf":
                text = extract_text_from_pdf(file_path)
                if not text:
                    text = extract_text_with_ocr(file_path)
            else:
                text = extract_text_with_ocr(file_path, content_type)

            save_text = update_file_text_content(res['fileId'], text)
            if save_text.get('fileError', True):
                text = None

            es.index(
                index="files",
                id=res['fileId'],
                document={
                    "fileId": res['fileId'],
                    "recordId": recordId,
                    "fileName": filename,
                    "mimeType": content_type,
                    "url": file_url,
                    "textContent": text,
                    "patientId": patient_id
                }
            )

            file_infos.append({
                "fileId": res['fileId'],
                "fileName": filename,
                "mimeType": content_type,
                "url": file_url,
                "textContent": text
            })

        except Exception as e:
            file_errors.append(rf"{file.filename}: Failed to process file - {str(e)}")

    if file_errors:
        return { 'fileError': file_errors, 'files': file_infos }
    return { 'fileConfirmation': 'filesSaved', 'files': file_infos }


@query.field("searchMedicalRecords")
@requires_authentication(return_none=True)
@requires_patient_or_doctor_access(return_none=True)
async def resolve_search_medical_records(*_, term, patient_id, doctor_id):
    """
    Search for medical records based on a given term.

    This function performs a search on medical records using Elasticsearch. It requires
    authentication and appropriate access rights (patient or doctor). If a search term
    is provided, it searches across multiple fields in the medical records.

    Parameters:
    *_ : Variable positional arguments (ignored).
    term (str): The search term to query medical records.
    patient_id (int): The ID of the patient associated with the medical records.
    doctor_id (int): The ID of the doctor performing the search (for access control).

    Returns:
    list: A list of medical records that match the search term, with highlighted results.
          If no term is provided or no matches are found, returns an empty list.
    """
    if term:
        return await search_with_highlights(
            index="medical_records",
            term=term,
            search_fields=["recordData", "doctorFullName", "recordTypeName"],
            patient_id=patient_id
        )
    return []


@query.field("searchFiles")
@requires_authentication(return_none=True)
@requires_patient_or_doctor_access(return_none=True)
async def resolve_search_files(*_, term, patient_id, doctor_id):
    """
    This function is used to search for files based on a given search term.
    It uses Elasticsearch to perform a full-text search on the 'textContent' field.

    Parameters:
    term (str): The search term provided by the user.
    patient_id (int): The ID of the patient for whom the search is being performed.
    doctor_id (int): The ID of the doctor for whom the search is being performed.

    Returns:
    list: A list of files that match the search term. Each file is represented as a dictionary.
          If no files match the search term, an empty list is returned.
    """
    if term:
        return await search_with_highlights(
            index="files",
            term=term,
            search_fields=["textContent"],
            patient_id=patient_id
        )
    return []
