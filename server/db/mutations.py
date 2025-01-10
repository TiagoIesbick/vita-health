from .mysql import mysql_client


def create_user(email: str, firstName: str, lastName: str, password: bytes, userType: str, acceptTerms: bool) -> None | dict:
    """
    Create a new user in the database.

    Args:
        email (str): The email address of the user.
        firstName (str): The first name of the user.
        lastName (str): The last name of the user.
        password (bytes): The hashed password of the user.
        userType (str): The type of user (e.g., 'patient', 'doctor').
        acceptTerms (bool): Whether the user has accepted the terms and conditions.

    Returns:
        None | dict: None if the user creation failed, or a dictionary containing user information if successful.
    """
    args = [email, firstName, lastName, password, userType, acceptTerms]
    query = 'AddUser'
    confirmation = mysql_client(query, type='procedure', args=args)
    return None if not confirmation else confirmation[0]


def create_patient_or_doctor_user(userId: int, userType: str) -> None | dict:
    """
    Creates a new patient or doctor user in the database.

    Parameters:
    - userId (int): The unique identifier of the user.
    - userType (str): The type of user to be created ('patient' or 'doctor').

    Returns:
    - None: If the user creation failed.
    - dict: A dictionary containing user information if successful.
    """
    args = [userId, userType]
    query = 'AddPatientOrDoctorUser'
    confirmation = mysql_client(query, type='procedure', args=args)
    return None if not confirmation else confirmation[0]


def update_user(email: str, firstName: str, lastName: str, userId: int) -> None | dict:
    """
    Update an existing user's information in the database.

    Args:
        email (str): The updated email address of the user.
        firstName (str): The updated first name of the user.
        lastName (str): The updated last name of the user.
        userId (int): The unique identifier of the user to be updated.

    Returns:
        None | dict: None if the user update failed, or a dictionary containing the updated user information if successful.
    """
    args = [email, firstName, lastName, userId]
    query = 'UpdateUser'
    confirmation = mysql_client(query, type='procedure', args=args)
    return None if not confirmation else confirmation[0]


def update_patient_user(dateOfBirth: str, gender: str, patientId: int) -> None | dict:
    """
    Update an existing patient user's information in the database.

    Args:
        dateOfBirth (str): The updated date of birth of the patient.
        gender (str): The updated gender of the patient.
        patientId (int): The unique identifier of the patient to be updated.

    Returns:
        None | dict: None if the patient update failed, or a dictionary containing the updated patient information if successful.
    """
    args = [dateOfBirth, gender, patientId]
    query = 'UpdatePatientUser'
    confirmation = mysql_client(query, type='procedure', args=args)
    return None if not confirmation else confirmation[0]


def update_doctor_user(specialty: str, licenseNumber: str, doctorId: int) -> None | dict:
    """
    Updates an existing doctor user's information in the database.

    Parameters:
    - specialty (str): The updated specialty of the doctor.
    - licenseNumber (str): The updated license number of the doctor.
    - doctorId (int): The unique identifier of the doctor to be updated.

    Returns:
    - None: If the doctor update failed.
    - dict: A dictionary containing the updated doctor information if successful.
    """
    args = [specialty, licenseNumber, doctorId]
    query = 'UpdateDoctorUser'
    confirmation = mysql_client(query, type='procedure', args=args)
    return None if not confirmation else confirmation[0]


def reserve_token_id(patientId: int, expirationDate: str, token: str = 'reserve') -> None | dict:
    """
    Reserves a token ID for a patient in the database.

    This function creates a reservation for a token ID associated with a specific patient.
    It can be used to pre-allocate a token before it's fully created or activated.

    Args:
        patientId (int): The unique identifier of the patient for whom the token is being reserved.
        expirationDate (str): The date when the token reservation expires, typically in a format like 'YYYY-MM-DD'.
        token (str, optional): The token string to be reserved. Defaults to 'reserve' if not provided.

    Returns:
        None | dict: None if the token ID reservation failed, or a dictionary containing
                     information about the reserved token if successful.
    """
    args = [token, patientId, expirationDate]
    query = 'ReserveTokenId'
    confirmation = mysql_client(query, type='procedure', args=args)
    return None if not confirmation else confirmation[0]


def create_token(tokenId: int, token: str) -> None | dict:
    """
    Creates a new token in the database.

    This function adds a new token to the database using the provided token ID and token string.

    Args:
        tokenId (int): The unique identifier for the token.
        token (str): The token string to be added.

    Returns:
        None | dict: None if the token creation failed, or a dictionary containing
                     information about the created token if successful.
    """
    args = [tokenId, token]
    query = 'AddToken'
    confirmation = mysql_client(query, type='procedure', args=args)
    return None if not confirmation else confirmation[0]


def create_token_access(tokenId: int, doctorId: int) -> None | dict:
    """
    Adds a new token access record to the database.

    This function creates a new association between a token and a doctor in the database.
    It is used to grant access to a specific doctor for a particular token.

    Parameters:
    - tokenId (int): The unique identifier of the token for which access is being granted.
    - doctorId (int): The unique identifier of the doctor who will have access to the token.

    Returns:
    - None: If the token access creation failed.
    - dict: A dictionary containing information about the created token access if successful.
    """
    args = [tokenId, doctorId]
    query = 'AddTokenAccess'
    confirmation = mysql_client(query, 'procedure', args)
    return None if not confirmation else confirmation[0]


def create_record_type(recordName: str, ptTranslation: str) -> None | dict:
    """
    Creates a new record type in the database.

    This function adds a new record type with its name and Portuguese translation
    to the database.

    Args:
        recordName (str): The name of the record type in English.
        ptTranslation (str): The Portuguese translation of the record type name.

    Returns:
        None | dict: None if the record type creation failed, or a dictionary
                     containing information about the created record type if successful.
    """
    args = [recordName, ptTranslation]
    query = 'AddRecordType'
    confirmation = mysql_client(query, 'procedure', args)
    return None if not confirmation else confirmation[0]


def create_medical_record(patientId: int, doctor_id: int | None, recordTypeId: int, recordData: str) -> None | dict:
    """
    Creates a new medical record in the database.

    This function adds a new medical record to the database for a specific patient,
    optionally associated with a doctor, and of a particular record type.

    Args:
        patientId (int): The unique identifier of the patient for whom the record is being created.
        doctor_id (int | None): The unique identifier of the doctor creating the record, or None if not applicable.
        recordTypeId (int): The identifier of the type of medical record being created.
        recordData (str): The actual content or data of the medical record.

    Returns:
        None | dict: None if the medical record creation failed, or a dictionary containing
                     information about the created medical record if successful.
    """
    args = [patientId, doctor_id, recordTypeId, recordData]
    query = 'AddMedicalRecord'
    confirmation = mysql_client(query, 'procedure', args)
    return None if not confirmation else confirmation[0]


def deactivate_token(tokenId: int) -> None | dict:
    """
    Deactivates a token in the database.

    This function updates the expiration date of a token in the database to now.
    Once a token is deactivated, it cannot be used for any further operations.

    Parameters:
    - tokenId (int): The unique identifier of the token to be deactivated.

    Returns:
    - None: If the token deactivation failed.
    - dict: A dictionary containing information about the deactivated token if successful.
    """
    args = [tokenId]
    query = 'DeactivateToken'
    confirmation = mysql_client(query, 'procedure', args)
    return None if not confirmation else confirmation[0]


def add_file_info(recordId: int, fileName: str, mimeType: str, url: str) -> None | dict:
    """
    Adds file information to the database for a specific medical record.

    This function stores metadata about a file associated with a medical record,
    including its name, MIME type, and URL.

    Args:
        recordId (int): The unique identifier of the medical record to which the file is attached.
        fileName (str): The name of the file, including its extension.
        mimeType (str): The MIME type of the file, indicating its format (e.g., 'image/jpeg', 'application/pdf').
        url (str): The URL where the file is stored or can be accessed.

    Returns:
        None | dict: None if the file information addition failed, or a dictionary containing
                     information about the added file if successful.
    """
    args = [recordId, fileName, mimeType, url]
    query = 'AddFiles'
    confirmation = mysql_client(query, 'procedure', args)
    return None if not confirmation else confirmation[0]


def update_file_text_content(fileId: int, textContent: str) -> None | dict:
    """
    Updates the text content of a file in the database.

    This function modifies the text content associated with a specific file
    identified by its file ID.

    Args:
        fileId (int): The unique identifier of the file to be updated.
        textContent (str): The new text content to be associated with the file.

    Returns:
        None | dict: None if the update operation failed, or a dictionary
                     containing information about the updated file if successful.
    """
    args = [fileId, textContent]
    query = 'UpdateFileTextContent'
    confirmation = mysql_client(query, 'procedure', args)
    return None if not confirmation else confirmation[0]
