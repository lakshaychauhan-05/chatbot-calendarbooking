"""
Settings for the admin portal service.
Loads .env from project root so CORE_API_BASE and SERVICE_API_KEY match the core API.
"""
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
from typing import Optional, List

# Project root = parent of admin_portal package (same .env as run.py / core API)
_PROJECT_ROOT = Path(__file__).resolve().parent.parent
_ROOT_ENV = _PROJECT_ROOT / ".env"


class AdminSettings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(_ROOT_ENV) if _ROOT_ENV.exists() else ".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    ADMIN_PORTAL_PORT: int = 5050
    ADMIN_PORTAL_DEBUG: bool = False
    ADMIN_PORTAL_JWT_SECRET: str
    ADMIN_PORTAL_JWT_ALGORITHM: str = "HS256"
    ADMIN_PORTAL_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    ADMIN_PORTAL_CORS_ORIGINS: Optional[str] = None  # comma-separated list

    # Single-admin credentials
    ADMIN_EMAIL: str
    ADMIN_PASSWORD_HASH: Optional[str] = None
    ADMIN_PASSWORD: Optional[str] = None  # convenience for local dev; hash preferred

    # Downstream services (must match core API .env)
    CORE_API_BASE: str = "http://localhost:8000"
    PORTAL_API_BASE: str = "http://localhost:5000/portal"
    SERVICE_API_KEY: str  # shared X-API-Key for protected routes

    @field_validator("CORE_API_BASE")
    @classmethod
    def strip_core_base_trailing_slash(cls, v: str) -> str:
        return v.rstrip("/") if v else v

    @field_validator("PORTAL_API_BASE")
    @classmethod
    def strip_portal_base_trailing_slash(cls, v: str) -> str:
        return v.rstrip("/") if v else v

    @field_validator("ADMIN_PORTAL_CORS_ORIGINS")
    @classmethod
    def normalize_origins(cls, value: Optional[str]) -> Optional[str]:
        if not value:
            return None
        return ",".join([item.strip() for item in value.split(",") if item.strip()])

    def cors_origins(self) -> List[str]:
        if self.ADMIN_PORTAL_CORS_ORIGINS:
            return [item.strip() for item in self.ADMIN_PORTAL_CORS_ORIGINS.split(",") if item.strip()]
        # defaults: backend 5050, frontend 5500
        return ["http://localhost:5050", "http://127.0.0.1:5050", "http://localhost:5500", "http://127.0.0.1:5500"]


admin_settings = AdminSettings()
