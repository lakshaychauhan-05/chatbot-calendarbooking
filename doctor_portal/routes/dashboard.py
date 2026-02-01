"""
Dashboard and data access routes for the doctor portal.
"""
from datetime import date, datetime, timezone
from uuid import UUID
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from doctor_portal.dependencies import get_current_doctor_account, get_portal_db
from doctor_portal.schemas import (
    DoctorProfile,
    AppointmentItem,
    AppointmentsResponse,
    PatientSummary,
    PatientsResponse,
    PatientDetail,
    PatientHistoryItem,
    OverviewResponse,
    # New schemas for CRUD operations
    RescheduleRequest,
    CancelRequest,
    CompleteRequest,
    AddPatientHistoryRequest,
    UpdatePatientHistoryRequest,
    UpdatePatientRequest,
    UpdateProfileRequest,
    MessageResponse,
)
from app.models.appointment import Appointment, AppointmentStatus
from app.models.patient import Patient
from app.models.patient_history import PatientHistory
from app.models.doctor import Doctor

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/me", response_model=DoctorProfile)
def get_me(account=Depends(get_current_doctor_account)) -> DoctorProfile:
    doctor = account.doctor
    return DoctorProfile.model_validate(doctor)


def _appointment_to_item(appt: Appointment, patient: Patient) -> AppointmentItem:
    return AppointmentItem(
        id=str(appt.id),
        date=appt.date,
        start_time=appt.start_time,
        end_time=appt.end_time,
        status=appt.status,
        timezone=appt.timezone,
        patient=PatientSummary(
            id=str(patient.id),
            name=patient.name,
            mobile_number=patient.mobile_number,
            email=patient.email,
        ),
    )


@router.get("/appointments", response_model=AppointmentsResponse)
def list_appointments(
    start_date: date | None = None,
    end_date: date | None = None,
    status_filter: AppointmentStatus | None = None,
    db: Session = Depends(get_portal_db),
    account=Depends(get_current_doctor_account),
) -> AppointmentsResponse:
    query = (
        db.query(Appointment, Patient)
        .join(Patient, Appointment.patient_id == Patient.id)
        .filter(Appointment.doctor_email == account.doctor_email)
    )

    if start_date:
        query = query.filter(Appointment.date >= start_date)
    if end_date:
        query = query.filter(Appointment.date <= end_date)
    if status_filter:
        query = query.filter(Appointment.status == status_filter)

    rows = query.order_by(Appointment.date, Appointment.start_time).all()
    items = [_appointment_to_item(appt, patient) for appt, patient in rows]
    return AppointmentsResponse(appointments=items)


@router.get("/patients", response_model=PatientsResponse)
def list_patients(
    db: Session = Depends(get_portal_db),
    account=Depends(get_current_doctor_account),
) -> PatientsResponse:
    patients = (
        db.query(Patient)
        .join(Appointment, Appointment.patient_id == Patient.id)
        .filter(Appointment.doctor_email == account.doctor_email)
        .distinct(Patient.id)
        .all()
    )
    summaries = [
        PatientSummary(
            id=str(p.id),
            name=p.name,
            mobile_number=p.mobile_number,
            email=p.email,
        )
        for p in patients
    ]
    return PatientsResponse(patients=summaries)


@router.get("/patients/{patient_id}", response_model=PatientDetail)
def get_patient_detail(
    patient_id: UUID,
    db: Session = Depends(get_portal_db),
    account=Depends(get_current_doctor_account),
) -> PatientDetail:
    # Ensure the doctor has at least one appointment with this patient
    has_access = (
        db.query(Appointment.id)
        .filter(Appointment.doctor_email == account.doctor_email, Appointment.patient_id == patient_id)
        .first()
    )
    if not has_access:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found for this doctor",
        )

    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found",
        )

    history = (
        db.query(PatientHistory)
        .filter(PatientHistory.patient_id == patient_id)
        .order_by(PatientHistory.created_at.desc())
        .all()
    )

    history_items = [
        PatientHistoryItem.model_validate(item) for item in history
    ]

    return PatientDetail(
        id=str(patient.id),
        name=patient.name,
        mobile_number=patient.mobile_number,
        email=patient.email,
        gender=patient.gender,
        date_of_birth=patient.date_of_birth,
        history=history_items,
    )


@router.get("/overview", response_model=OverviewResponse)
def get_overview(
    db: Session = Depends(get_portal_db),
    account=Depends(get_current_doctor_account),
) -> OverviewResponse:
    today = datetime.now(timezone.utc).date()
    upcoming_query = (
        db.query(Appointment, Patient)
        .join(Patient, Appointment.patient_id == Patient.id)
        .filter(
            Appointment.doctor_email == account.doctor_email,
            Appointment.date >= today,
            Appointment.status.in_([AppointmentStatus.BOOKED, AppointmentStatus.RESCHEDULED]),
        )
        .order_by(Appointment.date, Appointment.start_time)
        .limit(20)
    )
    rows = upcoming_query.all()
    upcoming = [_appointment_to_item(appt, patient) for appt, patient in rows]

    doctor_profile = DoctorProfile.model_validate(account.doctor)
    return OverviewResponse(doctor=doctor_profile, upcoming_appointments=upcoming)


# ============== APPOINTMENT MANAGEMENT ==============

def _get_appointment_for_doctor(
    appointment_id: UUID,
    db: Session,
    doctor_email: str,
) -> Appointment:
    """Helper to get appointment and verify doctor access."""
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found",
        )
    if appointment.doctor_email != doctor_email:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this appointment",
        )
    return appointment


@router.post("/appointments/{appointment_id}/cancel", response_model=MessageResponse)
def cancel_appointment(
    appointment_id: UUID,
    payload: CancelRequest,
    db: Session = Depends(get_portal_db),
    account=Depends(get_current_doctor_account),
) -> MessageResponse:
    """Cancel an appointment."""
    appointment = _get_appointment_for_doctor(appointment_id, db, account.doctor_email)

    if appointment.status == AppointmentStatus.CANCELLED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Appointment is already cancelled",
        )
    if appointment.status == AppointmentStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot cancel a completed appointment",
        )

    appointment.status = AppointmentStatus.CANCELLED
    appointment.updated_at = datetime.now(timezone.utc)
    if payload.reason:
        appointment.notes = f"Cancelled by doctor: {payload.reason}"

    db.commit()
    return MessageResponse(message="Appointment cancelled successfully")


@router.post("/appointments/{appointment_id}/complete", response_model=MessageResponse)
def complete_appointment(
    appointment_id: UUID,
    payload: CompleteRequest,
    db: Session = Depends(get_portal_db),
    account=Depends(get_current_doctor_account),
) -> MessageResponse:
    """Mark an appointment as completed."""
    appointment = _get_appointment_for_doctor(appointment_id, db, account.doctor_email)

    if appointment.status == AppointmentStatus.CANCELLED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot complete a cancelled appointment",
        )
    if appointment.status == AppointmentStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Appointment is already completed",
        )

    appointment.status = AppointmentStatus.COMPLETED
    appointment.updated_at = datetime.now(timezone.utc)
    if payload.notes:
        appointment.notes = payload.notes

    db.commit()
    return MessageResponse(message="Appointment marked as completed")


@router.put("/appointments/{appointment_id}/reschedule", response_model=MessageResponse)
def reschedule_appointment(
    appointment_id: UUID,
    payload: RescheduleRequest,
    db: Session = Depends(get_portal_db),
    account=Depends(get_current_doctor_account),
) -> MessageResponse:
    """Reschedule an appointment to a new date/time."""
    appointment = _get_appointment_for_doctor(appointment_id, db, account.doctor_email)

    if appointment.status == AppointmentStatus.CANCELLED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot reschedule a cancelled appointment",
        )
    if appointment.status == AppointmentStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot reschedule a completed appointment",
        )

    # Check for conflicts with existing appointments
    conflict = (
        db.query(Appointment)
        .filter(
            Appointment.doctor_email == account.doctor_email,
            Appointment.date == payload.new_date,
            Appointment.id != appointment_id,
            Appointment.status.in_([AppointmentStatus.BOOKED, AppointmentStatus.RESCHEDULED]),
            # Check for time overlap
            Appointment.start_time < payload.new_end_time,
            Appointment.end_time > payload.new_start_time,
        )
        .first()
    )

    if conflict:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Time slot conflicts with another appointment",
        )

    appointment.date = payload.new_date
    appointment.start_time = payload.new_start_time
    appointment.end_time = payload.new_end_time
    appointment.status = AppointmentStatus.RESCHEDULED
    appointment.updated_at = datetime.now(timezone.utc)
    if payload.reason:
        appointment.notes = f"Rescheduled: {payload.reason}"

    db.commit()
    return MessageResponse(message="Appointment rescheduled successfully")


# ============== PATIENT MANAGEMENT ==============

def _get_patient_for_doctor(
    patient_id: UUID,
    db: Session,
    doctor_email: str,
) -> Patient:
    """Helper to get patient and verify doctor access."""
    has_access = (
        db.query(Appointment.id)
        .filter(Appointment.doctor_email == doctor_email, Appointment.patient_id == patient_id)
        .first()
    )
    if not has_access:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found for this doctor",
        )

    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found",
        )
    return patient


@router.post("/patients/{patient_id}/history", response_model=PatientHistoryItem)
def add_patient_history(
    patient_id: UUID,
    payload: AddPatientHistoryRequest,
    db: Session = Depends(get_portal_db),
    account=Depends(get_current_doctor_account),
) -> PatientHistoryItem:
    """Add a new medical history entry for a patient."""
    patient = _get_patient_for_doctor(patient_id, db, account.doctor_email)

    history_entry = PatientHistory(
        id=uuid.uuid4(),
        patient_id=patient.id,
        symptoms=payload.symptoms,
        medical_conditions=payload.medical_conditions or [],
        allergies=payload.allergies or [],
        notes=payload.notes,
        created_at=datetime.now(timezone.utc),
    )

    db.add(history_entry)
    db.commit()
    db.refresh(history_entry)

    return PatientHistoryItem.model_validate(history_entry)


@router.put("/patients/{patient_id}/history/{history_id}", response_model=PatientHistoryItem)
def update_patient_history(
    patient_id: UUID,
    history_id: UUID,
    payload: UpdatePatientHistoryRequest,
    db: Session = Depends(get_portal_db),
    account=Depends(get_current_doctor_account),
) -> PatientHistoryItem:
    """Update an existing medical history entry."""
    _get_patient_for_doctor(patient_id, db, account.doctor_email)

    history_entry = (
        db.query(PatientHistory)
        .filter(PatientHistory.id == history_id, PatientHistory.patient_id == patient_id)
        .first()
    )
    if not history_entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="History entry not found",
        )

    if payload.symptoms is not None:
        history_entry.symptoms = payload.symptoms
    if payload.medical_conditions is not None:
        history_entry.medical_conditions = payload.medical_conditions
    if payload.allergies is not None:
        history_entry.allergies = payload.allergies
    if payload.notes is not None:
        history_entry.notes = payload.notes

    db.commit()
    db.refresh(history_entry)

    return PatientHistoryItem.model_validate(history_entry)


@router.put("/patients/{patient_id}", response_model=PatientSummary)
def update_patient(
    patient_id: UUID,
    payload: UpdatePatientRequest,
    db: Session = Depends(get_portal_db),
    account=Depends(get_current_doctor_account),
) -> PatientSummary:
    """Update patient information."""
    patient = _get_patient_for_doctor(patient_id, db, account.doctor_email)

    if payload.name is not None:
        patient.name = payload.name
    if payload.mobile_number is not None:
        patient.mobile_number = payload.mobile_number
    if payload.email is not None:
        patient.email = payload.email
    if payload.gender is not None:
        patient.gender = payload.gender
    if payload.date_of_birth is not None:
        patient.date_of_birth = payload.date_of_birth

    patient.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(patient)

    return PatientSummary(
        id=str(patient.id),
        name=patient.name,
        mobile_number=patient.mobile_number,
        email=patient.email,
    )


# ============== PROFILE MANAGEMENT ==============

@router.put("/me", response_model=DoctorProfile)
def update_profile(
    payload: UpdateProfileRequest,
    db: Session = Depends(get_portal_db),
    account=Depends(get_current_doctor_account),
) -> DoctorProfile:
    """Update doctor profile."""
    doctor = db.query(Doctor).filter(Doctor.email == account.doctor_email).first()
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found",
        )

    if payload.name is not None:
        doctor.name = payload.name
    if payload.specialization is not None:
        doctor.specialization = payload.specialization
    if payload.experience_years is not None:
        doctor.experience_years = payload.experience_years
    if payload.languages is not None:
        doctor.languages = payload.languages
    if payload.consultation_type is not None:
        doctor.consultation_type = payload.consultation_type
    if payload.timezone is not None:
        doctor.timezone = payload.timezone

    doctor.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(doctor)

    return DoctorProfile.model_validate(doctor)
