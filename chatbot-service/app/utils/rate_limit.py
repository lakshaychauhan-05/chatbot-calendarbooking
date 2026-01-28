"""
Simple in-memory rate limiter for chatbot endpoints.
"""
from fastapi import HTTPException, Request, status
from app.core.config import settings
import threading
import time
from typing import Tuple

_rate_lock = threading.Lock()
_rate_counters: dict[str, Tuple[int, int]] = {}


def _rate_limit_hit(key: str, per_minute: int, burst: int) -> Tuple[bool, int]:
    now = int(time.time())
    window = now // 60
    with _rate_lock:
        stored = _rate_counters.get(key)
        if not stored or stored[0] != window:
            _rate_counters[key] = (window, 1)
            return True, 0
        count = stored[1]
        max_allowed = per_minute + max(burst, 0)
        if count >= max_allowed:
            retry_after = 60 - (now % 60)
            return False, retry_after
        _rate_counters[key] = (window, count + 1)
    return True, 0


def rate_limiter(request: Request) -> None:
    if request.url.path in {"/", "/api/v1/health/"}:
        return
    client_host = request.client.host if request.client else "unknown"
    allowed, retry_after = _rate_limit_hit(
        client_host,
        settings.RATE_LIMIT_REQUESTS_PER_MINUTE,
        settings.RATE_LIMIT_BURST
    )
    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded",
            headers={"Retry-After": str(retry_after)}
        )
