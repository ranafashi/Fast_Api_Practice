# log/logs.py
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(filename)s | %(message)s",
    handlers=[
        logging.FileHandler("log/Data.log", encoding="utf-8"),
        logging.StreamHandler(),
    ],
)

logger = logging.getLogger()
