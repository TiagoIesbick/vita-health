from os import getenv
from typing import Optional, Literal, List, Dict, Any, cast
import mysql.connector as connector
from mysql.connector import errorcode


def get_connection() -> connector.MySQLConnection:
    """
    Establishes and returns a connection to the MySQL database.

    This function retrieves database connection parameters from environment variables,
    creates a connection to the MySQL database, and handles potential connection errors.

    Returns:
        connector.MySQLConnection: A connection object to the MySQL database.

    Raises:
        ValueError: If one or more required environment variables are not set.
        RuntimeError: If there's an error in connecting to the database, such as:
            - Incorrect MySQL user or password
            - Non-existent specified database
            - Other MySQL connection errors

    Environment Variables:
        MYSQL_USER: The username for the MySQL database.
        MYSQL_PASSWORD: The password for the MySQL database.
        MYSQL_DATABASE: The name of the database to connect to.
        HOST: The host address of the MySQL server.
        PORT: The port number for the MySQL server connection.
    """
    try:
        user = cast(str, getenv('MYSQL_USER'))
        password = cast(str, getenv('MYSQL_PASSWORD'))
        database = cast(str, getenv('MYSQL_DATABASE'))
        host = cast(str, getenv('HOST'))
        port = int(cast(str, getenv('PORT')))

        if not all([user, password, database, host, port]):
            raise ValueError("One or more required environment variables are not set.")

        connection = connector.connect(
            user=user,
            password=password,
            database=database,
            host=host,
            port=port
        )
        return connection
    except connector.Error as e:
        if e.errno == errorcode.ER_ACCESS_DENIED_ERROR:
            raise RuntimeError("MySQL user or password are incorrect.") from e
        elif e.errno == errorcode.ER_BAD_DB_ERROR:
            raise RuntimeError("The specified database does not exist.") from e
        else:
            raise RuntimeError(f"MySQL connection error ({e.errno}): {e.msg}") from e


def mysql_client(query: str, type: Literal['query', 'procedure'] = 'query', args: Optional[List[Any]] = None) -> List[Dict[str, Any]]:
    """
    Executes a MySQL query or procedure and returns the result as a list of dictionaries.

    Parameters:
    - query (str): The SQL query or procedure name to be executed.
    - type (Literal['query', 'procedure'], optional): The type of operation to be performed. Defaults to 'query'.
    - args (Optional[List[Any]], optional): A list of arguments to be passed to the procedure. Defaults to None.

    Returns:
    - List[Dict[str, Any]]: A list of dictionaries representing the result of the query or procedure.

    Raises:
    - RuntimeError: If there is an error executing the query or procedure.
    """
    connection = get_connection()
    if args is None:
        args = []
    try:
        with connection.cursor(dictionary=True) as cursor:
            if type == 'procedure':
                cursor.callproc(query, args)
                res = next(cursor.stored_results()).fetchall()
            else:
                cursor.execute(query)
                res = cursor.fetchall()
            connection.commit()
    except connector.Error as e:
        raise RuntimeError(f"Error executing query: {e}") from e
    finally:
        connection.close()
    print('[db] calls:', query)
    return res
