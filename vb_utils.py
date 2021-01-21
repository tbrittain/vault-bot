import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

fh = logging.FileHandler('recent_run.log')
fh.setLevel(logging.DEBUG)

ch = logging.StreamHandler()
ch.setLevel(logging.DEBUG)

formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
ch.setFormatter(formatter)
logger.addHandler(fh)
logger.addHandler(ch)


class TerminalColors(object):
    MAGENTA = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    FAIL = '\033[91m'
    DEFAULT = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'


def color_text(message: str, color: str):
    return f"{color}{message}{TerminalColors.DEFAULT}"


if __name__ == "__main__":
    print(color_text(f"Hello there!", color=TerminalColors.CYAN))
    print("Making sure this line is default color")
