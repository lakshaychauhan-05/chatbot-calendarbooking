"""
IdempotencyKey model - stores idempotent request responses.
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Integer, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.database import Base


class IdempotencyKey(Base):
    """Idempotency key storage."""
    __tablename__ = "idempotency_keys"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    key = Column(String(255), nullable=False)
    endpoint = Column(String(255), nullable=False)
    request_hash = Column(String(64), nullable=False)
    response_body = Column(JSONB, nullable=True)
    response_status = Column(Integer, nullable=True)
    status = Column(String(20), nullable=False, default="IN_PROGRESS")  # IN_PROGRESS, COMPLETED, FAILED
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)

    __table_args__ = (
        UniqueConstraint("key", "endpoint", name="uq_idempotency_key_endpoint"),
    )

    def __repr__(self):
        return f"<IdempotencyKey(key={self.key}, endpoint={self.endpoint}, status={self.status})>"
