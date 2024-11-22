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
from pathlib import Path
from utils.utils import *


query = QueryType()
mutation = MutationType()
subscription = SubscriptionType()
users = ObjectType("Users")
patients = ObjectType("Patients")
doctors = ObjectType("Doctors")
medical_records = ObjectType("MedicalRecords")
tokens = ObjectType("Tokens")
token_access = ObjectType("TokenAccess")


@query.field("user")
def resolve_user(*_, userId):
    return get_user(userId)


@users.field("patient")
def resolve_users_patient(users, *_):
    return None if not users['userId'] else get_users_patient(users['userId'])


@users.field("doctor")
def resolve_users_patient(users, *_):
    return None if not users['userId'] else get_users_doctor(users['userId'])


@patients.field("user")
def resolve_patients_user(patients, *_):
    return None if not patients['userId'] else get_user(patients['userId'])


@patients.field("tokens")
@requires_authentication(return_none=True)
def resolve_patients_tokens(patients, *_):
    return None if not patients['patientId'] else get_patients_tokens(patients['patientId'])


@doctors.field("user")
def resolve_doctors_user(doctors, *_):
    return None if not doctors['userId'] else get_user(doctors['userId'])


@doctors.field("tokensAccess")
@requires_authentication(return_none=True)
def resolve_doctors_user(doctors, *_):
    return None if not doctors['doctorId'] else get_doctors_tokens_access(doctors['userId'])


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
@requires_authentication('userError')
def resolve_update_user(_, info, input):
    email, firstName, lastName, userId = \
        input['email'], input['firstName'].strip().capitalize(), \
        input['lastName'].strip().capitalize(), info.context['user_detail']['userId']
    if not validate_email(email):
        return { 'userError': 'Invalid e-mail'}
    if not validate_name(firstName):
        return { 'userError': 'First name must start with at least 2 word characters' }
    if not validate_name(lastName):
        return { 'userError': 'Last name must start with at least 2 word characters' }
    res = update_user(email, nh3.clean(firstName), nh3.clean(lastName), userId)
    if res['userConfirmation']:
        res['user'] = get_user(userId)
        res['token'] = jwt.encode(res['user'], getenv('SECRET'), algorithm="HS256")
    return res


@mutation.field("updatePatientUser")
@requires_authentication('userError')
@requires_patient('userError')
def resolve_update_patient_user(_, info, patient, input):
    dateOfBirth = datetime.fromisoformat(input['dateOfBirth']).strftime("%Y-%m-%d")
    res = update_patient_user(dateOfBirth, input['gender'], patient['patientId'])
    if res['userConfirmation']:
        res['user'] = get_user(info.context['user_detail']['userId'])
    return res


@mutation.field("updateDoctorUser")
@requires_authentication('userError')
@requires_doctor('userError')
def resolve_update_doctor_user(_, info, doctor, input):
    res = update_doctor_user(nh3.clean(input['specialty'].strip().capitalize()), nh3.clean(input['licenseNumber'].strip()), doctor['doctorId'])
    if res['userConfirmation']:
        res['user'] = get_user(info.context['user_detail']['userId'])
    return res


@mutation.field("login")
def resolve_login(*_, email, password):
    user = get_user_by_email_password(email, password)
    if user:
        token = jwt.encode(user, getenv('SECRET'), algorithm="HS256")
        return { 'user': user, 'token': token }
    return { 'error': 'Invalid email or password' }


@query.field("medicalRecords")
@requires_authentication(return_none=True)
@requires_patient_or_doctor_access(return_none=True)
def resolve_medical_records(*_, limit, offset, patient_id, doctor_id):
    items = get_medical_records_by_pacient(patient_id, limit, offset)
    total_medical_records = count_medical_records(patient_id)
    if not total_medical_records:
        return None
    total_medical_records['items'] = items
    return total_medical_records


@query.field("medicalRecord")
@requires_authentication(return_none=True)
@requires_patient_or_doctor_access(return_none=True)
def resolve_get_medical_record(*_, recordId, patient_id, doctor_id):
    return get_medical_record(recordId, patient_id)


@medical_records.field("recordType")
def resolve_medical_records_type(medicalRecords, *_):
    return get_medical_records_type(medicalRecords['recordTypeId'])


@medical_records.field("files")
@requires_authentication(return_none=True)
def resolve_medical_records_files(medicalRecords, *_):
    return get_medical_records_files(medicalRecords['recordId'])


@medical_records.field("doctor")
@requires_authentication(return_none=True)
def resolve_medical_records_doctor(medicalRecords, *_):
    return None if not medicalRecords['doctorId'] else get_doctor(medicalRecords['doctorId'])


@mutation.field("createMedicalRecord")
@requires_authentication('medicalRecordError')
@requires_patient_or_doctor_access('medicalRecordError')
def resolve_create_medical_record(*_, recordTypeId, recordData, patient_id, doctor_id):
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
    return get_record_types()


@mutation.field("createRecordType")
@requires_authentication('recordTypeError')
def resolve_create_record_type(*_, recordName):
    recordName = ' '.join(nh3.clean(recordName).split()).title()
    return create_record_type(recordName)


@query.field("activePatientTokens")
@requires_authentication(return_none=True)
@requires_patient(return_none=True)
def resolve_patients_active_tokens(*_, patient):
    return get_active_tokens_by_patient(patient['patientId'])


@query.field("activeDoctorTokens")
@requires_authentication(return_none=True)
@requires_doctor(return_none=True)
def resolve_doctors_active_tokens(*_, doctor):
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
        return {'accessError': str(exc)}
    if not info.context['medical_access']:
        return {'accessError': 'Missing authorization'}
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
        return {'deactivateTokenError': 'Token not found'}
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
        return {'fileError': ['You can only upload a maximum of 10 files']}
    if not validate_files_size(files):
        return {'fileError': ['Total size of uploaded files must not exceed 10 MB']}

    file_infos = []
    file_errors = []

    for file in files:
        content_type = file.content_type
        if not validate_file_format(content_type):
            file_errors.append(rf"{file.filename}: Uploaded file has unsupported format")
            continue
        if not validate_file_size(file.size):
            file_errors.append(rf"{file.filename}: Uploaded file is too big (max 5 MB)")
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
    return { 'fileConfirmation': 'Saved files!', 'files': file_infos }


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
