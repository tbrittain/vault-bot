from os import getenv
from .. import vb_utils

import psycopg2
import psycopg2.errors

environment = getenv("ENVIRONMENT")


logger = vb_utils.get_logger(__name__)
access_secret_version = vb_utils.access_secret_version
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


def update_database():
    """
    Updates the database with the latest data.
    """
    pass
