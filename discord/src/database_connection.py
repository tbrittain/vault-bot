from datetime import datetime
from io import StringIO
from os import getenv, path

import pandas as pd
import psycopg2
import psycopg2.errors

from .vb_utils import access_secret_version, get_logger

logger = get_logger(__name__)
base_dir = path.dirname(path.dirname(path.abspath(__file__)))
environment = getenv("ENVIRONMENT")
if environment == "dev":
    db_user = getenv("DB_USER").replace('"', "")
    db_pass = getenv("DB_PASS").replace('"', "")
    db_port = getenv("DB_PORT").replace('"', "")
    db_name = getenv("DB_NAME").replace('"', "")
    db_host = getenv("DB_HOST").replace('"', "")
elif environment == "prod":
    project_id = getenv("GOOGLE_CLOUD_PROJECT_ID")
    db_user = access_secret_version(secret_id="vb-postgres-user",
                                    project_id=project_id)
    db_pass = access_secret_version(secret_id="vb-postgres-pass",
                                    project_id=project_id)
    db_host = access_secret_version(secret_id="vb-postgres-db-host",
                                    project_id=project_id,
                                    version_id="3")
    db_port = access_secret_version(secret_id="vb-postgres-db-port",
                                    project_id=project_id)
    db_name = access_secret_version(secret_id="vb-postgres-db-name",
                                    project_id=project_id)
    if project_id is None:
        raise ValueError("Invalid environment variable, exiting")
else:
    raise ValueError("Invalid environment variable, exiting")


class DatabaseConnection:
    def __init__(self):
        self.conn = psycopg2.connect(dbname=db_name,
                                     user=db_user,
                                     password=db_pass,
                                     host=db_host)

    def terminate(self):
        self.conn.close()

    def commit(self):
        self.conn.commit()

    def rollback(self):
        self.conn.rollback()

    def get_most_recent_historical_update(self) -> datetime:
        """Pulls the most recent match timestamp from the database"""
        cur = self.conn.cursor()

        cur.execute("""SELECT updated_at FROM historical_tracking ORDER BY updated_at DESC LIMIT 1;""")
        rows = cur.fetchall()
        cur.close()
        return rows[0][0]

    def get_most_recent_historical_data(self) -> tuple:
        most_recent_timestamp = self.get_most_recent_historical_update()
        cur = self.conn.cursor()

        cur.execute(f"""SELECT * FROM historical_genres WHERE updated_at = '{most_recent_timestamp}'""")
        genres = cur.fetchall()

        cur.execute(f"""SELECT * FROM historical_tracking WHERE updated_at = '{most_recent_timestamp}'""")
        tracking = cur.fetchall()

        cur.close()

        return genres, tracking[0]

    def select_query_raw(self, sql: str):
        cur = self.conn.cursor()
        try:
            cur.execute(sql)
            rows = cur.fetchall()
        except Exception as e:
            error_code = psycopg2.errors.lookup(e.pgcode)
            raise error_code
        finally:
            cur.close()
        return rows

    def select_query(self, query_literal: str, table: str) -> list:
        """Executing literals not recommended as query parameterization is better,
        but this method will not be exposed to any end users"""
        if len(query_literal) == 0:
            raise ValueError('Query must not be empty')
        elif len(table) == 0:
            raise ValueError('Table must not be empty')

        cur = self.conn.cursor()
        try:
            cur.execute(f"""SELECT {query_literal} FROM {table}""")
            rows = cur.fetchall()
        except Exception as e:
            error_code = psycopg2.errors.lookup(e.pgcode)
            raise error_code
        finally:
            cur.close()

        return rows

    def select_query_with_condition(self, query_literal: str, table: str, column_to_match: str, condition: str) -> list:
        cur = self.conn.cursor()
        try:
            cur.execute(f"""SELECT {query_literal} FROM {table} WHERE {column_to_match} = '{condition}'""")
            rows = cur.fetchall()
        except Exception as e:
            error_code = psycopg2.errors.lookup(e.pgcode)
            raise error_code
        finally:
            cur.close()

        return rows

    def select_query_with_join(self, query_literal: str, table: str, join_type: str,
                               join_table: str, join_condition: str) -> list:
        cur = self.conn.cursor()
        try:
            cur.execute(f"""SELECT {query_literal} FROM {table} {join_type} 
            JOIN {join_table} ON {join_condition}""")
            rows = cur.fetchall()
        except Exception as e:
            error_code = psycopg2.errors.lookup(e.pgcode)
            raise error_code
        finally:
            cur.close()

        return rows

    def update_query(self, column_to_change: str, column_to_match: str, value: str, condition: str, table: str) -> bool:
        cur = self.conn.cursor()
        try:
            cur.execute(
                f"""UPDATE {table} SET {column_to_change} = '{value}' WHERE {column_to_match} = '{condition}'""")
        except Exception as e:
            error_code = psycopg2.errors.lookup(e.pgcode)
            raise error_code
        finally:
            cur.close()
        return True

    def update_query_raw(self, sql: str) -> bool:
        cur = self.conn.cursor()
        try:
            cur.execute(sql)
        except Exception as e:
            error_code = psycopg2.errors.lookup(e.pgcode)
            raise error_code
        finally:
            cur.close()
        return True

    def delete_query(self, table: str, column_to_match: str, condition: str) -> bool:
        cur = self.conn.cursor()
        try:
            cur.execute(f"""DELETE FROM {table} WHERE {column_to_match} = '{condition}'""")
        except Exception as e:
            error_code = psycopg2.errors.lookup(e.pgcode)
            raise error_code
        finally:
            cur.close()

        return True

    def insert_copy_bulk_data(self, table: str, df: pd.DataFrame) -> int:
        cur = self.conn.cursor()

        buffer = StringIO()
        df.to_csv(path_or_buf=buffer, header=False, index=False)
        buffer.seek(0)

        try:
            cur.copy_expert(f"""COPY {table} FROM STDIN WITH (FORMAT CSV)""", buffer)
        except Exception as e:
            error_code = psycopg2.errors.lookup(e.pgcode)
            raise error_code
        finally:
            cur.close()
        return df.count()[0]

    def insert_single_row(self, table: str, columns: tuple, row: tuple) -> bool:
        cur = self.conn.cursor()

        num_params = len(row)
        params = ""
        if num_params == 1:
            params += ""
        elif num_params == 2:
            params += "(%s,%s)"
        else:
            params += "(%s," + ((num_params - 2) * "%s,") + "%s)"

        formatted_columns = str(columns).replace("'", "").replace('"', '')

        try:
            cur.execute(f"""INSERT INTO {table} {formatted_columns} VALUES {params}""", row)
        except Exception as e:
            error_code = psycopg2.errors.lookup(e.pgcode)
            raise error_code
        finally:
            cur.close()
        return True


if __name__ == "__main__":
    pass
