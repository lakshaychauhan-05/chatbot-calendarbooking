"""
Main FastAPI application entry point for the Chatbot Service.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routes import chat, health
from app.utils.rate_limit import rate_limiter
from fastapi import Depends
from app.middleware.request_id import request_id_middleware, RequestIdFilter
import logging

# Setup logging
logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s - %(levelname)s - %(name)s - %(request_id)s - %(message)s"
)
root_logger = logging.getLogger()
for handler in root_logger.handlers:
    handler.addFilter(RequestIdFilter())
root_logger.addFilter(RequestIdFilter())
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-powered appointment booking chatbot",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Request ID middleware
app.middleware("http")(request_id_middleware)

# CORS middleware
cors_origins = []
if settings.CORS_ALLOW_ORIGINS:
    cors_origins = [origin.strip() for origin in settings.CORS_ALLOW_ORIGINS.split(",") if origin.strip()]
elif settings.DEBUG:
    cors_origins = ["http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, prefix="/api/v1/health", tags=["Health"])
app.include_router(chat.router, prefix="/api/v1/chat", tags=["Chat"], dependencies=[Depends(rate_limiter)])


@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "healthy"
    }


@app.on_event("startup")
async def startup_event():
    """Application startup event."""
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")

    # Validate critical configuration
    if not settings.OPENAI_API_KEY:
        logger.warning("=" * 60)
        logger.warning("OPENAI_API_KEY is NOT configured!")
        logger.warning("The chatbot will NOT be able to process messages.")
        logger.warning("Please set OPENAI_API_KEY in your .env file or environment.")
        logger.warning("=" * 60)
    else:
        logger.info("OpenAI API key configured successfully")

    if not settings.CALENDAR_SERVICE_API_KEY or settings.CALENDAR_SERVICE_API_KEY == "dev-api-key":
        logger.warning("CALENDAR_SERVICE_API_KEY is using default/dev value - ensure it matches core API")


@app.on_event("shutdown")
async def shutdown_event():
    """Application shutdown event."""
    logger.info(f"Shutting down {settings.APP_NAME}")