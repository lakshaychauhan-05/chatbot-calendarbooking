"""
Logging configuration for the application.
"""
import logging
import sys
from app.config import settings
from app.middleware.request_id import get_request_id


class RequestIdFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        record.request_id = get_request_id()
        return True

def setup_logging():
    """
    Configure application logging.
    """
    log_level = logging.DEBUG if settings.DEBUG else logging.INFO
    
    logging.basicConfig(
        level=log_level,
        format='%(asctime)s - %(levelname)s - %(name)s - %(request_id)s - %(message)s',
        handlers=[
            logging.StreamHandler(sys.stdout)
        ]
    )

    root_logger = logging.getLogger()
    for handler in root_logger.handlers:
        handler.addFilter(RequestIdFilter())
    root_logger.addFilter(RequestIdFilter())
    
    # Set specific loggers
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    logging.getLogger("googleapiclient").setLevel(logging.WARNING)
