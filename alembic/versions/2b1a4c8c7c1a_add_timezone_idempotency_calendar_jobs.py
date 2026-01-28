"""Add timezone handling, idempotency, and calendar sync jobs

Revision ID: 2b1a4c8c7c1a
Revises: 9c2f0f1b5c2a
Create Date: 2026-01-28 10:15:00.000000
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "2b1a4c8c7c1a"
down_revision = "9c2f0f1b5c2a"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS btree_gist")

    # Doctors: timezone
    op.add_column("doctors", sa.Column("timezone", sa.String(length=64), nullable=False, server_default="UTC"))

    # Appointments: timezone-aware fields and sync metadata
    op.add_column("appointments", sa.Column("timezone", sa.String(length=64), nullable=False, server_default="UTC"))
    op.add_column("appointments", sa.Column("start_at_utc", sa.DateTime(timezone=True), nullable=True))
    op.add_column("appointments", sa.Column("end_at_utc", sa.DateTime(timezone=True), nullable=True))
    op.add_column("appointments", sa.Column("calendar_sync_attempts", sa.Integer(), nullable=False, server_default="0"))
    op.add_column("appointments", sa.Column("calendar_sync_next_attempt_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("appointments", sa.Column("calendar_sync_last_error", sa.String(length=500), nullable=True))
    op.create_index("ix_appointments_start_at_utc", "appointments", ["start_at_utc"], unique=False)
    op.create_index("ix_appointments_end_at_utc", "appointments", ["end_at_utc"], unique=False)
    op.create_index("idx_appointment_doctor_date_start", "appointments", ["doctor_email", "date", "start_time"], unique=False)

    # Backfill start/end UTC timestamps for existing rows
    op.execute(
        """
        UPDATE appointments
        SET start_at_utc = (appointments.date + appointments.start_time) AT TIME ZONE 'UTC',
            end_at_utc = (appointments.date + appointments.end_time) AT TIME ZONE 'UTC'
        WHERE start_at_utc IS NULL OR end_at_utc IS NULL
        """
    )
    op.alter_column("appointments", "start_at_utc", nullable=False)
    op.alter_column("appointments", "end_at_utc", nullable=False)

    # Calendar watches: token and timezone-aware expiration
    op.add_column("calendar_watches", sa.Column("token", sa.String(length=255), nullable=False, server_default=""))
    op.alter_column("calendar_watches", "expiration", type_=sa.DateTime(timezone=True))

    # Use timezone-aware created_at columns where relevant
    op.alter_column("appointments", "created_at", type_=sa.DateTime(timezone=True))
    op.alter_column("doctors", "created_at", type_=sa.DateTime(timezone=True))
    op.alter_column("doctors", "updated_at", type_=sa.DateTime(timezone=True))
    op.alter_column("patients", "created_at", type_=sa.DateTime(timezone=True))
    op.alter_column("patient_history", "created_at", type_=sa.DateTime(timezone=True))
    op.alter_column("calendar_watches", "created_at", type_=sa.DateTime(timezone=True))

    # Exclusion constraint to prevent overlapping appointments per doctor
    op.execute(
        """
        ALTER TABLE appointments
        ADD CONSTRAINT exclude_overlapping_appointments
        EXCLUDE USING gist (
            doctor_email WITH =,
            tstzrange(start_at_utc, end_at_utc, '[]') WITH &&
        )
        WHERE (status IN ('BOOKED', 'RESCHEDULED'))
        """
    )

    # Calendar sync jobs table
    op.create_table(
        "calendar_sync_jobs",
        sa.Column("id", sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("appointment_id", sa.dialects.postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("action", sa.String(length=20), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="PENDING"),
        sa.Column("attempts", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("next_attempt_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("last_error", sa.String(length=500), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["appointment_id"], ["appointments.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_calendar_sync_jobs_id", "calendar_sync_jobs", ["id"], unique=False)
    op.create_index("ix_calendar_sync_jobs_appointment_id", "calendar_sync_jobs", ["appointment_id"], unique=False)
    op.create_index("idx_calendar_sync_job_status_next", "calendar_sync_jobs", ["status", "next_attempt_at"], unique=False)
    op.create_index("idx_calendar_sync_job_appointment_action", "calendar_sync_jobs", ["appointment_id", "action"], unique=False)

    # Idempotency keys table
    op.create_table(
        "idempotency_keys",
        sa.Column("id", sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("key", sa.String(length=255), nullable=False),
        sa.Column("endpoint", sa.String(length=255), nullable=False),
        sa.Column("request_hash", sa.String(length=64), nullable=False),
        sa.Column("response_body", sa.dialects.postgresql.JSONB, nullable=True),
        sa.Column("response_status", sa.Integer(), nullable=True),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="IN_PROGRESS"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("key", "endpoint", name="uq_idempotency_key_endpoint"),
    )
    op.create_index("ix_idempotency_keys_id", "idempotency_keys", ["id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_idempotency_keys_id", table_name="idempotency_keys")
    op.drop_table("idempotency_keys")

    op.drop_index("idx_calendar_sync_job_appointment_action", table_name="calendar_sync_jobs")
    op.drop_index("idx_calendar_sync_job_status_next", table_name="calendar_sync_jobs")
    op.drop_index("ix_calendar_sync_jobs_appointment_id", table_name="calendar_sync_jobs")
    op.drop_index("ix_calendar_sync_jobs_id", table_name="calendar_sync_jobs")
    op.drop_table("calendar_sync_jobs")

    op.execute("ALTER TABLE appointments DROP CONSTRAINT IF EXISTS exclude_overlapping_appointments")

    op.alter_column("calendar_watches", "created_at", type_=sa.DateTime())
    op.alter_column("patient_history", "created_at", type_=sa.DateTime())
    op.alter_column("patients", "created_at", type_=sa.DateTime())
    op.alter_column("doctors", "updated_at", type_=sa.DateTime())
    op.alter_column("doctors", "created_at", type_=sa.DateTime())
    op.alter_column("appointments", "created_at", type_=sa.DateTime())
    op.alter_column("calendar_watches", "expiration", type_=sa.DateTime())

    op.drop_column("calendar_watches", "token")

    op.drop_index("idx_appointment_doctor_date_start", table_name="appointments")
    op.drop_index("ix_appointments_end_at_utc", table_name="appointments")
    op.drop_index("ix_appointments_start_at_utc", table_name="appointments")
    op.drop_column("appointments", "calendar_sync_last_error")
    op.drop_column("appointments", "calendar_sync_next_attempt_at")
    op.drop_column("appointments", "calendar_sync_attempts")
    op.drop_column("appointments", "end_at_utc")
    op.drop_column("appointments", "start_at_utc")
    op.drop_column("appointments", "timezone")

    op.drop_column("doctors", "timezone")
