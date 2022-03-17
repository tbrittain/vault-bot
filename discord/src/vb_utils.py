import logging
from os import getenv

import google.cloud.logging
from google.cloud import secretmanager
from google.cloud.logging.handlers import CloudLoggingHandler

environment = getenv("ENVIRONMENT")


def get_logger(name) -> logging.Logger:
    """
    Get a logger for the bot
    @param name: Name of the logger
    @return: Logger object
    """
    logger = logging.getLogger(name)

    if environment == "production":
        # Log to Google Cloud Logging
        client = google.cloud.logging.Client()
        handler = CloudLoggingHandler(client, name=name)
        logger.setLevel(logging.INFO)
        logger.addHandler(handler)
    else:
        # Log to console
        handler = logging.StreamHandler()
        handler.setLevel(logging.DEBUG)
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        handler.setFormatter(formatter)

        logger.setLevel(logging.DEBUG)
        logger.addHandler(handler)
    return logger


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
