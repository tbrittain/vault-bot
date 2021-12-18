import logging
from os import getenv

import google.cloud.logging
from google.cloud import secretmanager
from google.cloud.logging.handlers import CloudLoggingHandler

environment = getenv("ENVIRONMENT")
global logger
if environment == "dev":
    logger = logging.getLogger(__name__)
    logger.setLevel(logging.DEBUG)

    ch = logging.StreamHandler()
    ch.setLevel(logging.DEBUG)

    formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
    ch.setFormatter(formatter)

    logger.addHandler(ch)
elif environment == "prod":
    logging_client = google.cloud.logging.Client()
    handler = CloudLoggingHandler(logging_client, name="VaultBot")
    logger = logging.getLogger('cloudLogger')
    logger.setLevel(logging.INFO)
    logger.addHandler(handler)


def access_secret_version(secret_id, project_id, version_id="1") -> str:
    """
    Pull a secret stored in Google Cloud Secret Manager
    @param secret_id: ID of the secret
    @param project_id: ID of the project
    @param version_id: Secret version
    @return: Secret in string format
    """
    secret_client = secretmanager.SecretManagerServiceClient()
    name = f"projects/{project_id}/secrets/{secret_id}/versions/{version_id}"
    response = secret_client.access_secret_version(name=name)
    return response.payload.data.decode('UTF-8')


if __name__ == "__main__":
    pass
