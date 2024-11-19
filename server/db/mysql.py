from os import getenv
from typing import Optional, Literal, List, Dict, Any, cast
import mysql.connector as connector
from mysql.connector import errorcode


def get_connection() -> connector.MySQLConnection:
    """
    Establish and return a MySQL database connection.

    Returns:
        connector.MySQLConnection: A MySQL connection object.

    Raises:
        ValueError: If any required environment variable is missing.
        RuntimeError: For errors related to MySQL connection.
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
    Execute a MySQL query or stored procedure and return the results.

    This function establishes a database connection, executes the given query
    or stored procedure, and returns the results as a list of dictionaries.

    Args:
        query (str): The SQL query to execute or the name of the stored procedure to call.
        type (Literal['query', 'procedure'], optional): The type of operation to perform. Can be 'query' for regular
                              SQL queries or 'procedure' for stored procedures. Defaults to 'query'.
        args (Optional[List[Any]], optional): A list of arguments to pass to the stored procedure.
                                              Only used when type is 'procedure'. Defaults to None.

    Returns:
        List[Dict[str, Any]]: A list of dictionaries, where each dictionary represents a row
                              in the result set. The keys are column names and the values are
                              the corresponding data.

    Raises:
        RuntimeError: If there is an error executing the query or stored procedure.

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
