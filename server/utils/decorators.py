from functools import wraps
from db.queries import get_users_patient, get_users_doctor
from typing import Callable, Any, Dict, Union, Optional


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
