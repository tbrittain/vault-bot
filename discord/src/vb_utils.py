import logging
import google.cloud.logging
from google.cloud.logging.handlers import CloudLoggingHandler
import os

environment = os.getenv("ENVIRONMENT")
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
    client = google.cloud.logging.Client()
    handler = CloudLoggingHandler(client, name="VaultBot")
    logger = logging.getLogger('cloudLogger')
    logger.setLevel(logging.INFO)
    logger.addHandler(handler)

if __name__ == "__main__":
    pass
