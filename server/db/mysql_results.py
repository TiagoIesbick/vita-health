from .connection import get_connection

def mysql_results(query: str, type='query', args=[]) -> list[dict]:
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
