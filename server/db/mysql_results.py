from .connection import get_connection
from typing import List, Dict, Any


def mysql_results(query: str, type: str = 'query', args: List[Any] = []) -> List[Dict[str, Any]]:
    """
    Execute a MySQL query or stored procedure and return the results.

    This function establishes a database connection, executes the given query
    or stored procedure, and returns the results as a list of dictionaries.

    Args:
        query (str): The SQL query to execute or the name of the stored procedure to call.
        type (str, optional): The type of operation to perform. Can be 'query' for regular
                              SQL queries or 'procedure' for stored procedures. Defaults to 'query'.
        args (list, optional): A list of arguments to pass to the stored procedure.
                               Only used when type is 'procedure'. Defaults to an empty list.

    Returns:
        list[dict]: A list of dictionaries, where each dictionary represents a row
                    in the result set. The keys are column names and the values are
                    the corresponding data.

    """
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)
    if type == 'procedure':
        cursor.callproc(query, args)
        res = next(cursor.stored_results()).fetchall()
    else:
        cursor.execute(query)
        res = cursor.fetchall()
    connection.commit()
    cursor.close()
    connection.close()
    print('[db] calls:', query)
    return res
