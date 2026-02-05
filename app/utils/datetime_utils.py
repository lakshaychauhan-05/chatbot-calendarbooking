"""
Datetime utilities for timezone-aware conversions.
All times default to IST (Asia/Kolkata).
"""
from datetime import datetime, date, time, timezone
from zoneinfo import ZoneInfo
from typing import Optional

# Default timezone is IST
DEFAULT_TZ = ZoneInfo("Asia/Kolkata")


def to_utc(date_value: date, time_value: time, tz_name: Optional[str] = None) -> datetime:
    """Convert local date/time to UTC datetime. Defaults to IST if no timezone provided."""
    try:
        tz = ZoneInfo(tz_name) if tz_name else DEFAULT_TZ
    except Exception:
        tz = DEFAULT_TZ
    local_dt = datetime.combine(date_value, time_value).replace(tzinfo=tz)
    return local_dt.astimezone(timezone.utc)


def to_local(utc_dt: datetime, tz_name: Optional[str] = None) -> datetime:
    """Convert UTC datetime to local timezone. Defaults to IST."""
    try:
        tz = ZoneInfo(tz_name) if tz_name else DEFAULT_TZ
    except Exception:
        tz = DEFAULT_TZ
    if utc_dt.tzinfo is None:
        utc_dt = utc_dt.replace(tzinfo=timezone.utc)
    return utc_dt.astimezone(tz)


def now_ist() -> datetime:
    """Get current datetime in IST."""
    return datetime.now(DEFAULT_TZ)
