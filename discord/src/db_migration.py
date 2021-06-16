from db import DatabaseConnection
import psycopg2
import os
import config
from dotenv import load_dotenv
import pandas as pd
import numpy as np
# TODO: use this file to transfer data from the original database to the normalized database

base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if config.environment == "dev":
    load_dotenv(f'{base_dir}/dev.env')
elif config.environment == "prod":
    test_db_user = os.getenv("DB_USER")
    test_db_pass = os.getenv("DB_PASS")
    test_db_host = os.getenv("DB_HOST")
    test_db_port = os.getenv("DB_PORT")
    test_db_name = os.getenv("DB_NAME")
    if None in [test_db_user, test_db_pass, test_db_host, test_db_port, test_db_name]:
        print("Invalid environment setting in docker-compose.yml, exiting")
        exit()
elif config.environment == "prod_local":
    load_dotenv(f'{base_dir}/prod_local.env')
else:
    print("Invalid environment setting, exiting")
    exit()
db_user = os.getenv("DB_USER")
db_pass = os.getenv("DB_PASS")
db_port = os.getenv("DB_PORT")
new_db_name = os.getenv("DB_NAME")
db_host = os.getenv("DB_HOST")
old_db_name = os.getenv("SECONDARY_DB_NAME")


def load_csv_to_df(file_path: str) -> pd.DataFrame:
    return pd.read_csv(file_path, na_values=np.NaN)


def main():
    pass


if __name__ == '__main__':
    print(base_dir)
