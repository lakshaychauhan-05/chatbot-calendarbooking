"""
Health check routes for the Chatbot Service.
"""
from fastapi import APIRouter
from app.core.config import settings
import httpx
import redis
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/")
async def health_check():
    """Basic health check."""
    return {"status": "healthy", "service": settings.APP_NAME}


@router.get("/detailed")
async def detailed_health_check():
    """Detailed health check with component status."""
    health_status = {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "components": {
            "openai_api": "available" if settings.OPENAI_API_KEY else "not_configured",
            "calendar_service": "configured" if settings.CALENDAR_SERVICE_URL else "not_configured",
            "redis": "not_configured" if not settings.REDIS_URL else "unknown"
        }
    }

    if settings.REDIS_URL:
        try:
            redis_client = redis.Redis.from_url(settings.REDIS_URL, decode_responses=True)
            redis_client.ping()
            health_status["components"]["redis"] = "healthy"
        except Exception as e:
            logger.error(f"Redis health check failed: {e}")
            health_status["components"]["redis"] = "unhealthy"

    if settings.CALENDAR_SERVICE_URL:
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{settings.CALENDAR_SERVICE_URL.rstrip('/')}/health")
                health_status["components"]["calendar_service"] = "healthy" if response.status_code == 200 else "unhealthy"
        except Exception as e:
            logger.error(f"Calendar service health check failed: {e}")
            health_status["components"]["calendar_service"] = "unhealthy"

    # Check if all components are healthy
    components_healthy = all(
        status in ["available", "configured", "healthy"]
        for status in health_status["components"].values()
    )

    if not components_healthy:
        health_status["status"] = "degraded"

    return health_status