import requests
import os
import config
from dotenv import load_dotenv
from db import DatabaseConnection, access_secret_version

base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if config.environment == "dev":
    load_dotenv(f'{base_dir}/dev.env')
    webhook_url = os.getenv('UPDATES_WEBHOOK')
elif config.environment == "prod" or config.environment == 'prod_local':
    project_id = os.getenv("PROJECT_ID")
    webhook_url = access_secret_version(secret_id='vb-updates-webhook',
                                        project_id=project_id)

