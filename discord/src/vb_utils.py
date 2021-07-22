import logging
from .config import environment

# TODO: implement the below line in each file rather than declaring it here
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

if environment == 'dev':
    fh = logging.FileHandler('recent_run.log')
    fh.setLevel(logging.DEBUG)
    logger.addHandler(fh)

ch = logging.StreamHandler()
ch.setLevel(logging.DEBUG)

formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
ch.setFormatter(formatter)

logger.addHandler(ch)


if __name__ == "__main__":
    pass
