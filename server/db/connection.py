from os import getenv
import mysql.connector as connector
from mysql.connector import errorcode


def get_connection() -> connector.connection_cext.CMySQLConnection:
    try:
        connection = connector.connect(
            user=getenv('USER'),
            password=getenv('PASSWORD'),
            database=getenv('DATABASE'),
            host=getenv('HOST'),
            port=getenv('PORT')
            )
        return connection
    except connector.Error as e:
        if e.errno == errorcode.ER_ACCESS_DENIED_ERROR:
            print("connection user or password are incorrect")
        elif e.errno == errorcode.ER_BAD_DB_ERROR:
            print("database does not exist")
        else:
            print("Error code: ", e.errno)
            print("Error message: ", e.msg)


if __name__ == '__main__':
    get_connection()