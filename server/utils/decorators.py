from functools import wraps
from db.queries import get_users_patient, get_users_doctor
from typing import Callable, Any, Dict, Union, Optional, List
from starlette.requests import Request
from starlette.responses import JSONResponse
from db.redis import redis_client
import json


def requires_authentication(error_field: Optional[str] = None, return_none: bool = False, return_list: bool = False) -> Callable:
    """
    A decorator that checks if the user is authenticated before executing the resolver function.

    This decorator wraps a GraphQL resolver function and checks the 'authenticated' flag in the context.
    If the user is not authenticated, it returns an error message or None based on the parameters.

    Args:
        error_field (Optional[str]): The field name to use for the error message in the returned dictionary.
        return_none (bool): If True, returns None instead of an error dictionary when authentication fails.
        return_list (bool): If True, returns the error message as a list instead of a string.

    Returns:
        Callable: A decorator function that wraps the original resolver function.

    The wrapped function will return:
        - The result of the original resolver function if the user is authenticated.
        - None if return_none is True and the user is not authenticated.
        - A dictionary with the error message if the user is not authenticated and return_none is False.
    """
    def decorator(resolver_function: Callable) -> Callable:
        @wraps(resolver_function)
        def wrapper(*args: Any, **kwargs: Any) -> Union[Dict[str, str], None, Any]:
            info = args[1]  # info is the second argument passed to a resolver
            if not info.context.get('authenticated'):
                return None if return_none else (
                    {error_field: "missAuth"} if not return_list else {error_field: ["missAuth"]}
                )
            return resolver_function(*args, **kwargs)
        return wrapper
    return decorator


def requires_patient(error_field: Optional[str] = None, return_none: bool = False) -> Callable:
    """
    A decorator that checks if the user is a patient before executing the resolver function.

    This decorator wraps a GraphQL resolver function and checks the 'userType' in the context.
    If the user is not a patient, it returns an error message or None based on the parameters.

    Args:
        error_field (Optional[str]): The field name to use for the error message in the returned dictionary.
        return_none (bool): If True, returns None instead of an error dictionary when the user is not a patient.

    Returns:
        Callable: A decorator function that wraps the original resolver function.

    The wrapped function will return:
        - The result of the original resolver function if the user is a patient.
        - None if return_none is True and the user is not a patient.
        - A dictionary with the error message if the user is not a patient and return_none is False.
    """
    def decorator(resolver_function: Callable) -> Callable:
        @wraps(resolver_function)
        def wrapper(*args: Any, **kwargs: Any) -> Union[Dict[str, str], None, Any]:
            info = args[1]
            user_type = info.context['user_detail'].get('userType')
            if user_type != 'Patient':
                return None if return_none else {error_field: "notPatient"}
            patient = get_users_patient(info.context['user_detail']['userId'])
            if not patient:
                return None if return_none else {error_field: "missPatientCredential"}
            return resolver_function(*args, patient=patient, **kwargs)
        return wrapper
    return decorator


def requires_doctor(error_field: Optional[str] = None, return_none: bool = False):
    """
    A decorator that checks if the user is a doctor before executing the resolver function.

    This decorator wraps a GraphQL resolver function and checks the 'userType' in the context.
    If the user is not a doctor, it returns an error message or None based on the parameters.

    Args:
        error_field (Optional[str]): The field name to use for the error message in the returned dictionary.
        return_none (bool): If True, returns None instead of an error dictionary when the user is not a doctor.

    Returns:
        Callable: A decorator function that wraps the original resolver function.

    The wrapped function will return:
        - The result of the original resolver function if the user is a doctor.
        - None if return_none is True and the user is not a doctor.
        - A dictionary with the error message if the user is not a doctor and return_none is False.
    """
    def decorator(resolver_function: Callable) -> Callable:
        @wraps(resolver_function)
        def wrapper(*args: Any, **kwargs: Any) -> Union[Dict[str, str], None, Any]:
            info = args[1]
            user_type = info.context['user_detail'].get('userType')
            if user_type != 'Doctor':
                return None if return_none else {error_field: "notDoctor"}
            doctor = get_users_doctor(info.context['user_detail']['userId'])
            if not doctor:
                return None if return_none else {error_field: "missDoctorCredential"}
            return resolver_function(*args, doctor=doctor, **kwargs)
        return wrapper
    return decorator


def requires_patient_or_doctor_access(error_field: Optional[str] = None, return_none: bool = False, return_list: bool = False) -> Callable:
    """
    A decorator that checks if the user is either a patient or a doctor with access before executing the resolver function.

    This decorator wraps a GraphQL resolver function and verifies the user's type and access rights.
    If the user is not a patient or a doctor with proper access, it returns an error message or None based on the parameters.

    Args:
        error_field (Optional[str]): The field name to use for the error message in the returned dictionary.
        return_none (bool): If True, returns None instead of an error dictionary when the access check fails.
        return_list (bool): If True, returns the error message as a list instead of a string.

    Returns:
        Callable: A decorator function that wraps the original resolver function.

    The wrapped function will return:
        - The result of the original resolver function if the user is a patient or a doctor with proper access.
        - None if return_none is True and the access check fails.
        - A dictionary with the error message if the access check fails and return_none is False.
    """
    def decorator(resolver_function: Callable) -> Callable:
        @wraps(resolver_function)
        def wrapper(*args: Any, **kwargs: Any) -> Union[Dict[str, str], None, Any]:
            info = args[1]
            user_detail = info.context['user_detail']
            user_type = user_detail.get('userType')
            doctor_id = None
            if user_type == 'Patient':
                patient = get_users_patient(user_detail['userId'])
                if not patient:
                    return None if return_none else (
                        {error_field: "missPatientCredential"} if not return_list else {error_field: ["missPatientCredential"]}
                    )
                patient_id = patient['patientId']
            elif user_type == 'Doctor':
                medical_access = info.context.get('medical_access')
                if not medical_access:
                    return None if return_none else (
                        {error_field: "missAuthorization"} if not return_list else {error_field: ["missAuthorization"]}
                    )
                patient_id = medical_access['patientId']
                doctor = get_users_doctor(user_detail['userId'])
                if not doctor:
                    return None if return_none else (
                        {error_field: "missDoctorCredential"} if not return_list else {error_field: ["missDoctorCredential"]}
                    )
                doctor_id = doctor['doctorId']
            else:
                return None if return_none else (
                    {error_field: "notPatientOrDoctor"} if not return_list else {error_field: ["notPatientOrDoctor"]}
                )
            return resolver_function(*args, patient_id=patient_id, doctor_id=doctor_id, **kwargs)
        return wrapper
    return decorator


def requires_authenticated_request(func: Callable[..., Any]) -> Callable[..., Any]:
    """
    A decorator function that checks if a request is authenticated before executing the view function.

    Args:
        func (Callable[..., Any]): The view function to be decorated.

    Returns:
        Callable[..., Any]: The decorated view function.

    The decorated function will:
        - Check if the user is authenticated using the `is_authenticated` attribute of the `request.user` object.
        - If the user is not authenticated, it will return a JSON response with an "Unauthorized access" error message and a 401 status code.
        - If the user is authenticated, it will execute the original view function and return its result.
    """
    @wraps(func)
    async def wrapper(request: Request, *args: Any, **kwargs: Any) -> Any:
        if not request.user.is_authenticated:
            return JSONResponse({"error": "Unauthorized access"}, status_code=401)
        return await func(request, *args, **kwargs)
    return wrapper


def fetch_conversation(resolver_function: Callable[..., Union[Dict[str, Any], None]]) -> Callable[..., Union[Dict[str, Any], None]]:
    """
    A decorator that retrieves the conversation history between a user and an AI assistant from Redis using user_id and patient_id as identifiers.

    If the conversation history is not found in Redis, it initializes a new conversation with a system message.

    Args:
        resolver_function (Callable[..., Union[Dict[str, Any], None]]): The resolver function to be decorated.
            This function should accept keyword arguments 'patient_id' and return a dictionary or None.

    Returns:
        Callable[..., Union[Dict[str, Any], None]]: The decorated resolver function.
            The decorated function will add 'conversation' and 'key' keyword arguments to the original function's arguments.
            The 'conversation' argument contains the conversation history between the user and AI assistant.
            The 'key' argument is the Redis key used to store the conversation history.

    The decorated function will execute the original resolver function with the added 'conversation' and 'key' arguments.
    """
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
