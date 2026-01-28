"""
Security utilities for API authentication and rate limiting.
"""
from fastapi import Security, HTTPException, status, Request
from fastapi.security import APIKeyHeader
from app.config import settings
import secrets
import threading
import time
from typing import Optional, Set, Tuple

# API Key header
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

_rate_lock = threading.Lock()
_rate_counters: dict[str, Tuple[int, int]] = {}


def _get_api_keys() -> Set[str]:
    keys = set()
    if settings.SERVICE_API_KEY:
        keys.add(settings.SERVICE_API_KEY)
    if settings.SERVICE_API_KEYS:
        for key in settings.SERVICE_API_KEYS.split(","):
            cleaned = key.strip()
            if cleaned:
                keys.add(cleaned)
    return keys


def _rate_limit_hit(key: str, per_minute: int, burst: int) -> Tuple[bool, int]:
    """
    Simple fixed-window rate limiter.
    Returns (allowed, retry_after_seconds).
    """
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


def rate_limiter(request: Request, api_key: Optional[str] = Security(api_key_header)) -> None:
    """
    Enforce per-key+IP rate limits.
    """
    if request.url.path in {"/", "/health"}:
        return
    if request.url.path.startswith("/api/v1/webhooks"):
        return
    key = api_key or "anonymous"
    client_host = request.client.host if request.client else "unknown"
    limiter_key = f"{key}:{client_host}"
    allowed, retry_after = _rate_limit_hit(
        limiter_key,
        settings.API_KEY_RATE_LIMIT_PER_MINUTE,
        settings.API_KEY_RATE_LIMIT_BURST
    )
    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded",
            headers={"Retry-After": str(retry_after)}
        )


def verify_api_key(api_key: str = Security(api_key_header)) -> str:
    """
    Verify API key from request header.
    
    Args:
        api_key: API key from X-API-Key header
        
    Returns:
        The verified API key
        
    Raises:
        HTTPException: If API key is missing or invalid
    """
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API key is missing"
        )
    
    keys = _get_api_keys()
    if not keys:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="API keys are not configured"
        )

    if not any(secrets.compare_digest(api_key, candidate) for candidate in keys):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key"
        )
    
    return api_key
