#!/usr/bin/env python3
"""
Simple script to run the Chatbot Service FastAPI application.
"""
import os
import socket
import uvicorn
from app.core.config import settings


def _port_available(port: int, host: str = "0.0.0.0") -> bool:
    """Check if a port is available for binding."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        try:
            sock.bind((host, port))
            return True
        except OSError:
            return False


def _select_port() -> int:
    """Pick a usable port, preferring CHATBOT_PORT or settings.PORT."""
    preferred_port = int(os.getenv("CHATBOT_PORT", settings.PORT))

    # Always try to use the configured port first (8003)
    if _port_available(preferred_port, settings.HOST):
        return preferred_port

    # Fallback only if preferred port is unavailable
    fallback_ports = [8002, 8004, 8005]
    for port in fallback_ports:
        if _port_available(port, settings.HOST):
            print(f"Warning: Port {preferred_port} unavailable, using {port}")
            return port

    return preferred_port


if __name__ == "__main__":
    port = _select_port()
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=port,
        reload=settings.DEBUG,
        log_level="info" if not settings.DEBUG else "debug"
    )