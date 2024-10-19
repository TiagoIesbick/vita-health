from starlette.requests import Request
from starlette.responses import FileResponse, JSONResponse
from os import path
from db.queries import get_filename_by_user
from utils.utils import UPLOAD_DIR
from utils.decorators import requires_authenticated_request


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
