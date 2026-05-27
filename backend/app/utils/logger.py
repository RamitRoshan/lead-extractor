import logging
import sys
from pathlib import Path

# Configure logger
logger = logging.getLogger("lead_extractor")
logger.setLevel(logging.INFO)

formatter = logging.Formatter(
    "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)

# Console handler
console_handler = logging.StreamHandler(sys.stdout)
console_handler.setFormatter(formatter)
logger.addHandler(console_handler)

# Create logs directory if it doesn't exist
logs_dir = Path(__file__).resolve().parents[2] / "logs"
logs_dir.mkdir(exist_ok=True)

# File handler
file_handler = logging.FileHandler(logs_dir / "app.log", encoding="utf-8")
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)
