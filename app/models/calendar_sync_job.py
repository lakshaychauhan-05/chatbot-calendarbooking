"""
CalendarSyncJob model - tracks queued calendar sync actions.
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class CalendarSyncJob(Base):
    """Queue item for calendar sync operations."""
    __tablename__ = "calendar_sync_jobs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    appointment_id = Column(UUID(as_uuid=True), ForeignKey("appointments.id", ondelete="CASCADE"), nullable=False, index=True)
    action = Column(String(20), nullable=False)  # CREATE, UPDATE, DELETE
    status = Column(String(20), nullable=False, default="PENDING")  # PENDING, IN_PROGRESS, COMPLETED, FAILED
    attempts = Column(Integer, nullable=False, default=0)
    next_attempt_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    last_error = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    appointment = relationship("Appointment", backref="calendar_sync_jobs")

    __table_args__ = (
        Index("idx_calendar_sync_job_status_next", "status", "next_attempt_at"),
        Index("idx_calendar_sync_job_appointment_action", "appointment_id", "action"),
    )

    def __repr__(self):
        return f"<CalendarSyncJob(id={self.id}, appointment_id={self.appointment_id}, action={self.action}, status={self.status})>"
