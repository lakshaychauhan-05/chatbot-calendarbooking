"""
Appointment Pydantic schemas for request/response validation.
"""
from pydantic import BaseModel, Field, EmailStr, field_validator, model_validator
from typing import Optional
from datetime import datetime, date, time
import re
from uuid import UUID
from app.models.appointment import AppointmentStatus, AppointmentSource


class AppointmentBase(BaseModel):
    """Base appointment schema with common fields."""
    doctor_id: UUID
    patient_id: UUID
    date: date
    start_time: time
    end_time: time
    source: AppointmentSource


class AppointmentCreate(BaseModel):
    """Schema for creating a new appointment."""
    doctor_email: EmailStr  # Changed to email (unique identifier)
    doctor_name: Optional[str] = None
    patient_mobile_number: str = Field(..., min_length=7, max_length=20)
    patient_name: str = Field(..., min_length=1, max_length=255)
    patient_email: Optional[EmailStr] = None
    patient_gender: Optional[str] = None
    patient_date_of_birth: Optional[date] = None
    date: date
    start_time: time
    source: AppointmentSource = AppointmentSource.AI_CALLING_AGENT
    # Patient history
    symptoms: Optional[str] = None
    medical_conditions: Optional[list[str]] = Field(default_factory=list)
    allergies: Optional[list[str]] = Field(default_factory=list)
    notes: Optional[str] = None

    @field_validator("patient_mobile_number")
    @classmethod
    def normalize_phone(cls, value: str) -> str:
        if not value:
            return value
        cleaned = re.sub(r"[^\d+]", "", value)
        if cleaned.startswith("++"):
            cleaned = cleaned[1:]
        has_plus = cleaned.startswith("+")
        digits = re.sub(r"\D", "", cleaned)
        if has_plus:
            if len(digits) != 12 or not digits.startswith("91"):
                raise ValueError("patient_mobile_number must be 10 digits, with optional +91 prefix")
            return f"+{digits}"
        if len(digits) != 10:
            raise ValueError("patient_mobile_number must be 10 digits, with optional +91 prefix")
        return digits


class AppointmentReschedule(BaseModel):
    """Schema for rescheduling an appointment."""
    new_date: date
    new_start_time: time
    new_end_time: time

    @model_validator(mode="after")
    def validate_time_range(self):
        if self.new_end_time <= self.new_start_time:
            raise ValueError("new_end_time must be after new_start_time")
        return self


class AppointmentResponse(BaseModel):
    """Schema for appointment response."""
    id: UUID
    doctor_email: str  # Changed from doctor_id: UUID to doctor_email: str
    patient_id: UUID
    date: date
    start_time: time
    end_time: time
    timezone: str
    status: AppointmentStatus
    google_calendar_event_id: Optional[str] = None
    calendar_sync_status: Optional[str] = None
    source: AppointmentSource
    created_at: datetime
    
    class Config:
        from_attributes = True


class AvailabilitySlot(BaseModel):
    """Schema for available time slot."""
    start_time: time
    end_time: time


class AvailabilityResponse(BaseModel):
    """Schema for availability response."""
    doctor_id: str  # Changed from UUID to str (email identifier)
    date: date
    available_slots: list[AvailabilitySlot]
    total_slots: int
