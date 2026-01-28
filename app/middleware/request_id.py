"""
Request ID middleware for correlation across logs.
"""
import uuid
import contextvars
from fastapi import Request

_request_id_ctx = contextvars.ContextVar("request_id", default="-")


def get_request_id() -> str:
    return _request_id_ctx.get()


async def request_id_middleware(request: Request, call_next):
    request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
    token = _request_id_ctx.set(request_id)
    try:
        response = await call_next(request)
    finally:
        _request_id_ctx.reset(token)
    response.headers["X-Request-ID"] = request_id
    return response
