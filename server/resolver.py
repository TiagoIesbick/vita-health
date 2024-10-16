import nh3
import jwt
import aiofiles
import uuid
import os
import json
from os import getenv
from ariadne import QueryType, ObjectType, MutationType
from datetime import datetime
from db.queries import *
from db.mutations import *
from utils.decorators import *
from pathlib import Path
from utils.utils import *


query = QueryType()
users = ObjectType("Users")
patients = ObjectType("Patients")
doctors = ObjectType("Doctors")
mutation = MutationType()
medical_records = ObjectType("MedicalRecords")
tokens = ObjectType("Tokens")
token_access = ObjectType("TokenAccess")


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


@patients.field("user")
def resolve_patients_user(patients, *_):
    if not patients['userId']:
        return None
    return get_user(patients['userId'])


@patients.field("tokens")
@requires_authentication(return_none=True)
def resolve_patients_tokens(patients, *_):
    if not patients['patientId']:
        return None
    return get_patients_tokens(patients['patientId'])


@doctors.field("user")
def resolve_doctors_user(doctors, *_):
    if not doctors['userId']:
        return None
    return get_user(doctors['userId'])


@doctors.field("tokensAccess")
@requires_authentication(return_none=True)
def resolve_doctors_user(doctors, *_):
    if not doctors['doctorId']:
        return None
    return get_doctors_tokens_access(doctors['userId'])


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
def resolve_medical_records(*_, limit, offset, patient_id):
    items = get_medical_records_by_pacient(patient_id, limit, offset)
    total_medical_records = count_medical_records(patient_id)
    if not total_medical_records:
        return None
    total_medical_records['items'] = items
    return total_medical_records


@query.field("medicalRecord")
@requires_authentication(return_none=True)
@requires_patient_or_doctor_access(return_none=True)
def resolve_get_medical_record(*_, recordId, patient_id):
    return get_medical_record(recordId, patient_id)


@medical_records.field("recordType")
def resolve_medical_records_type(medicalRecords, *_):
    return get_medical_records_type(medicalRecords['recordTypeId'])


@medical_records.field("files")
def resolve_medical_records_files(medicalRecords, *_):
    return get_medical_records_files(medicalRecords['recordId'])


@mutation.field("createMedicalRecord")
@requires_authentication('medicalRecordError')
@requires_patient_or_doctor_access('medicalRecordError')
def resolve_create_medical_record(*_, recordTypeId, recordData, patient_id):
    res = create_medical_record(patient_id, recordTypeId, recordData)
    if res['medicalRecordConfirmation']:
        res['medicalRecord'] = get_medical_record(res['medicalRecordId'], patient_id)
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
def resolve_ai_conversation(*_, conversation, patient_id):
    return conversation


@mutation.field("createConversation")
@requires_authentication("conversationError")
@requires_patient_or_doctor_access("conversationError")
def resolve_create_conversation(_, info, content, patient_id):
    user_id = info.context['user_detail']['userId']
    key = rf"conversation:{user_id}:{patient_id}"
    conversation_history = redis_req.get(key)
    if conversation_history:
        conversation = json.loads(conversation_history)
    else:
        conversation = [{"role": "system", "content": "You are an assistant providing insights on medical records."}]
    conversation.append({"role": "user", "content": content})
    assistant_message = openai_chat(conversation)
    print('[assistant_message]:', assistant_message)
    if assistant_message.get('conversationError', False):
        return assistant_message
    conversation.append(assistant_message)
    redis_req.set(key, json.dumps(conversation))
    return {
        'conversationConfirmation': 'Conversation Added!',
        'conversation': conversation
    }


@mutation.field("generateToken")
@requires_authentication('tokenError')
@requires_patient('tokenError')
def resolve_generate_token(*_, patient, expirationDate):
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
    if not tokens['patientId']:
        return None
    return get_patient(tokens['patientId'])


@tokens.field("tokenAccess")
@requires_authentication(return_none=True)
def resolve_tokens_token_access(tokens, *_):
    if not tokens['tokenId']:
        return None
    return get_tokens_token_access(tokens['tokenId'])


@token_access.field("token")
@requires_authentication(return_none=True)
def resolve_token_access_token(tokenAccess, *_):
    if not tokenAccess['tokenId']:
        return None
    return get_token(tokenAccess['tokenId'])


@token_access.field("doctor")
@requires_authentication(return_none=True)
def resolve_token_access_doctor(tokenAccess, *_):
    if not tokenAccess['tokenId']:
        return None
    return get_doctor(tokenAccess['doctorId'])


@mutation.field("deactivateToken")
@requires_authentication('deactivateTokenError')
@requires_patient('deactivateTokenError')
def resolve_deactivate_token(*_, patient, tokenId):
    tokens = get_active_tokens_by_patient(patient['patientId'])
    token_exists = any(token['tokenId'] == int(tokenId) for token in tokens)
    if not token_exists:
        return {'deactivateTokenError': 'Token not found'}
    res = deactivate_token(tokenId)
    if res['deactivateTokenConfirmation']:
        res['token'] = get_token(tokenId)
    return res


@mutation.field("multipleUpload")
async def resolve_multiple_upload(_, info, recordId, files):
    if not info.context['authenticated']:
        return {'fileError': ['Missing authentication']}
    if info.context['user_detail']['userType'] == 'Doctor' and not info.context['medical_access']:
        return {'fileError': ['Missing authorization']}
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
            file_errors.append(rf"{file.filename}: Uploaded file is too big (max 2 MB)")
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
            print('[text file]:', text)
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
