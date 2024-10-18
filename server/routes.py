import openai
import redis
import json
import asyncio
from starlette.requests import Request
from starlette.responses import FileResponse, JSONResponse, StreamingResponse
from os import getenv, path
from db.queries import get_filename_by_user, get_users_patient
from utils.utils import UPLOAD_DIR, openai_chat_stream
from utils.decorators import requires_authenticated_request


openai.api_key = getenv('OPENAI_API_KEY')


redis_host = getenv('REDIS_HOST')
redis_port = getenv('REDIS_PORT')
redis_client = redis.Redis(host=redis_host, port=redis_port, decode_responses=True)


@requires_authenticated_request
async def serve_file(request: Request) -> JSONResponse | FileResponse:
    filename = request.path_params["filename"]
    file_path = path.join(UPLOAD_DIR, filename)

    if not path.exists(file_path):
        return JSONResponse({"error": "File not found"})

    if request.user.user_detail['userType'] == 'Patient':
        res = get_filename_by_user(filename, request.user.user_detail['userId'])
        if len(res) == 0:
            return JSONResponse({"error": "Unauthorized access"})

    if request.user.user_detail['userType'] == 'Doctor':
        if not request.user.medical_access:
            return JSONResponse({"error": "Unauthorized access"})
        res = get_filename_by_user(filename, request.user.medical_access['userId'])
        if len(res) == 0:
            return JSONResponse({"error": "Unauthorized access"})

    return FileResponse(file_path)


@requires_authenticated_request
async def get_chatgpt_insights(request: Request) -> JSONResponse:
    data = await request.json()
    user_id = request.user.user_detail['userId']

    if request.user.user_detail['userType'] == 'Doctor':
        if not request.user.medical_access:
            return JSONResponse({"error": "Unauthorized access"})
        patient_id = request.user.medical_access['patientId']
        key = rf"conversation:{user_id}:{patient_id}"
    else:
        key = rf"conversation:{user_id}"

    conversation_history = redis_client.get(key)
    print(conversation_history)
    if conversation_history:
        conversation = json.loads(conversation_history)
    else:
        conversation = [{"role": "system", "content": "You are an assistant providing insights on medical records."}]

    # Append user's message to conversation
    conversation.append({"role": "user", "content": 'hello world'})

    redis_client.set(key, json.dumps(conversation))


    # response = openai.chat.completions.create(
    #     messages=[
    #         {"role": "system", "content": "You are an assistant providing insights on medical records."},
    #         {"role": "user", "content": f"Provide insights on these medical records: {medical_records}"}
    #     ],
    #     model="gpt-4",
    #     max_tokens=2000,
    #     temperature=0.7
    # )
    # print(response)

    # insights = response.choices[0].message.content.strip()
    return JSONResponse({"insights": 'hello'})


# @requires_authenticated_request
async def stream_conversation(request: Request):
    user_detail = request.user.user_detail
    user_type = user_detail.get('userType')

    if user_type == 'Doctor':
        medical_access = request.user.medical_access
        if not medical_access:
            return JSONResponse({"error": "Unauthorized access"})
        patient_id = medical_access['patientId']
    elif user_type == 'Patient':
        patient = get_users_patient(user_detail['userId'])
        if not patient:
            return JSONResponse({"error": 'Missing patient credential'})
        patient_id = patient['patientId']

    conversation = redis_client.get(f"convervation:{user_detail['userId']}:{patient_id}")
    all_records = redis_client.get(f"allRecords:{user_detail['userId']}:{patient_id}")

    print('[conversation]:', conversation)
    print('[allRecords]:', all_records)

    async def event_stream():
        try:
            for chunk in openai_chat_stream(conversation):
                yield f"data: {chunk}\n\n"
                await asyncio.sleep(0.1)
        except Exception as e:
            yield f"event: error\ndata: {str(e)}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")