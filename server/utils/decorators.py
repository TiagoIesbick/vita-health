from functools import wraps
from db.queries import get_users_patient, get_users_doctor
from typing import Callable, Any, Dict, Union, Optional, List
from starlette.requests import Request
from starlette.responses import JSONResponse
from utils.utils import redis_client
import json


def requires_authentication(error_field: Optional[str] = None, return_none: bool = False) -> Callable:
    def decorator(resolver_function: Callable) -> Callable:
        @wraps(resolver_function)
        def wrapper(*args: Any, **kwargs: Any) -> Union[Dict[str, str], None, Any]:
            info = args[1]  # info is the second argument passed to a resolver
            if not info.context.get('authenticated'):
                return None if return_none else {error_field: 'Missing authentication'}
            return resolver_function(*args, **kwargs)
        return wrapper
    return decorator


def requires_patient(error_field: Optional[str] = None, return_none: bool = False) -> Callable:
    def decorator(resolver_function: Callable) -> Callable:
        @wraps(resolver_function)
        def wrapper(*args: Any, **kwargs: Any) -> Union[Dict[str, str], None, Any]:
            info = args[1]
            user_type = info.context['user_detail'].get('userType')
            if user_type != 'Patient':
                return None if return_none else {error_field: 'User is not a Patient'}
            patient = get_users_patient(info.context['user_detail']['userId'])
            if not patient:
                return None if return_none else {error_field: 'Missing patient credential'}
            return resolver_function(*args, patient=patient, **kwargs)
        return wrapper
    return decorator


def requires_doctor(error_field: Optional[str] = None, return_none: bool = False):
    def decorator(resolver_function: Callable) -> Callable:
        @wraps(resolver_function)
        def wrapper(*args: Any, **kwargs: Any) -> Union[Dict[str, str], None, Any]:
            info = args[1]
            user_type = info.context['user_detail'].get('userType')
            if user_type != 'Doctor':
                return None if return_none else {error_field: 'User is not a Doctor'}
            doctor = get_users_doctor(info.context['user_detail']['userId'])
            if not doctor:
                return None if return_none else {error_field: 'Missing doctor credential'}
            return resolver_function(*args, doctor=doctor, **kwargs)
        return wrapper
    return decorator


def requires_patient_or_doctor_access(error_field: Optional[str] = None, return_none: bool = False) -> Callable:
    def decorator(resolver_function: Callable) -> Callable:
        @wraps(resolver_function)
        def wrapper(*args: Any, **kwargs: Any) -> Union[Dict[str, str], None, Any]:
            info = args[1]
            user_detail = info.context['user_detail']
            user_type = user_detail.get('userType')
            if user_type == 'Patient':
                patient = get_users_patient(user_detail['userId'])
                if not patient:
                    return None if return_none else {error_field: 'Missing patient credential'}
                patient_id = patient['patientId']
            elif user_type == 'Doctor':
                medical_access = info.context.get('medical_access')
                if not medical_access:
                    return None if return_none else {error_field: 'Missing authorization'}
                patient_id = medical_access['patientId']
            else:
                return None if return_none else {error_field: 'User is neither a Patient nor a Doctor'}
            return resolver_function(*args, patient_id=patient_id, **kwargs)
        return wrapper
    return decorator


def requires_authenticated_request(func: Callable[..., Any]) -> Callable[..., Any]:
    @wraps(func)
    async def wrapper(request: Request, *args: Any, **kwargs: Any) -> Any:
        if not request.user.is_authenticated:
            return JSONResponse({"error": "Unauthorized access"}, status_code=401)
        return await func(request, *args, **kwargs)
    return wrapper


def fetch_conversation(resolver_function: Callable[..., Union[Dict[str, Any], None]]) -> Callable[..., Union[Dict[str, Any], None]]:
    @wraps(resolver_function)
    def wrapper(*args: Any, **kwargs: Any) -> Union[Dict[str, Any], None]:
        info = args[1]
        user_id = info.context['user_detail']['userId']
        patient_id = kwargs.get('patient_id')
        key = rf"conversation:{user_id}:{patient_id}"
        conversation_history = redis_client.get(key)
        if conversation_history:
            conversation: List[Dict[str, str]] = json.loads(conversation_history)
        else:
            conversation = [{"role": "system", "content": "You are an assistant providing insights on medical records. You must only use the records provided in the user’s prompt and never reference external sources or assumptions."}]
        kwargs['conversation'] = conversation
        kwargs['key'] = key
        return resolver_function(*args, **kwargs)
    return wrapper
