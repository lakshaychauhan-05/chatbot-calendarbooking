"""
Datetime utilities for timezone-aware conversions.
"""
from datetime import datetime, date, time, timezone
from zoneinfo import ZoneInfo
from typing import Optional


def to_utc(date_value: date, time_value: time, tz_name: Optional[str]) -> datetime:
    """Convert local date/time in tz_name to UTC datetime."""
    try:
        tz = ZoneInfo(tz_name) if tz_name else timezone.utc
    except Exception:
        tz = timezone.utc
    local_dt = datetime.combine(date_value, time_value).replace(tzinfo=tz)
    return local_dt.astimezone(timezone.utc)


def to_local(utc_dt: datetime, tz_name: Optional[str]) -> datetime:
    """Convert UTC datetime to local timezone."""
    try:
        tz = ZoneInfo(tz_name) if tz_name else timezone.utc
    except Exception:
        tz = timezone.utc
    if utc_dt.tzinfo is None:
        utc_dt = utc_dt.replace(tzinfo=timezone.utc)
    return utc_dt.astimezone(tz)
