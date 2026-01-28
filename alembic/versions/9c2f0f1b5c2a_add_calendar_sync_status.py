"""Add calendar_sync_status to appointments

Revision ID: 9c2f0f1b5c2a
Revises: 73b7b9aba08b
Create Date: 2026-01-28 05:20:00.000000
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "9c2f0f1b5c2a"
down_revision = "73b7b9aba08b"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "appointments",
        sa.Column("calendar_sync_status", sa.String(length=20), nullable=False, server_default="PENDING")
    )
    op.create_index(
        "ix_appointments_calendar_sync_status",
        "appointments",
        ["calendar_sync_status"],
        unique=False
    )


def downgrade() -> None:
    op.drop_index("ix_appointments_calendar_sync_status", table_name="appointments")
    op.drop_column("appointments", "calendar_sync_status")
