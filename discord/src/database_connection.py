from datetime import datetime
from io import StringIO
from os import getenv

import pandas as pd
import psycopg2
import psycopg2.errors

from .vb_utils import access_secret_version, get_logger
from .db.create_schema import create_schema, create_migration_table, get_existing_tables

logger = get_logger(__name__)

environment = getenv("ENVIRONMENT")
if environment == "dev":
    db_user = getenv("DB_USER")
    db_pass = getenv("DB_PASS")
    db_port = getenv("DB_PORT")
    db_name = getenv("DB_NAME")
    db_host = getenv("DB_HOST")

    if None in [db_user, db_pass, db_port, db_name, db_host]:
        logger.error("Missing database credentials")
        exit(1)
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
        logger.error("No Google Cloud project ID found. Please set the GOOGLE_CLOUD_PROJECT_ID environment "
                     "variable.")
        exit(1)
else:
    logger.error("No environment variable set. Please set the ENVIRONMENT environment variable.")
    exit(1)


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

        if len(rows) == 0:
            return datetime(1970, 1, 1)
        return rows[0][0]

    def get_most_recent_historical_data(self) -> list:
        most_recent_timestamp = self.get_most_recent_historical_update()
        cur = self.conn.cursor()

        cur.execute(f"""SELECT * FROM historical_tracking WHERE updated_at = '{most_recent_timestamp}'""")
        tracking = cur.fetchall()

        cur.close()

        if len(tracking) == 0:
            return []

        return tracking[0]

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


def update_database():
    """
    Runs create scripts and migration scripts on the database.
    """
    logger.info("Checking if any database updates required...")

    if environment == "prod":
        conn = psycopg2.connect(
            dbname=db_name,
            user=db_user,
            password=db_pass,
            host=db_host
        )
    else:
        conn = psycopg2.connect(
            user=db_user,
            password=db_pass,
            host=db_host,
            port=db_port,
            database=db_name
        )

    INITIAL_TABLES = {
        "songs",
        "artists",
        "historical_tracking",
        "dynamic",
        "archive",
        "artists_genres",
        "historical_genres"
    }

    cur = conn.cursor()
    existing_tables = get_existing_tables(cur)
    schema_exists = INITIAL_TABLES.issubset(existing_tables)
    if not schema_exists:
        logger.info("Schema does not exist, creating...")
        create_schema(cur)
        logger.info("Schema created successfully.")
    else:
        logger.debug("Schema exists, skipping...")

    logger.debug("Ensuring migration table exists before additional checks...")
    if "migration" not in existing_tables:
        logger.info("Migration table does not exist, creating...")
        create_migration_table(cur)
        logger.info("Migration table created successfully.")
    else:
        logger.debug("Migration table exists, skipping...")

    cur.close()
    conn.commit()
    conn.close()


if __name__ == "__main__":
    update_database()
