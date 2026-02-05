"""Fix overlap constraint range type from [] to [)

Revision ID: b3d4e5f6a7b8
Revises: a4cbace34f5a
Create Date: 2026-02-05 12:00:00.000000

The previous constraint used "[]" (inclusive on both ends) which incorrectly
flagged back-to-back appointments as overlapping. This migration changes it
to "[)" (inclusive start, exclusive end) which is the standard convention
for time ranges and allows back-to-back appointments like [10:00, 10:30)
and [10:30, 11:00) to coexist.
"""
from alembic import op


# revision identifiers, used by Alembic.
revision = "b3d4e5f6a7b8"
down_revision = "a4cbace34f5a"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Drop the old constraint with [] range (using raw SQL as Alembic doesn't support exclude type)
    op.execute("ALTER TABLE appointments DROP CONSTRAINT IF EXISTS exclude_overlapping_appointments")

    # Recreate with [) range (inclusive start, exclusive end)
    op.execute("""
        ALTER TABLE appointments
        ADD CONSTRAINT exclude_overlapping_appointments
        EXCLUDE USING gist (
            doctor_email WITH =,
            tstzrange(start_at_utc, end_at_utc, '[)') WITH &&
        )
        WHERE (status IN ('BOOKED', 'RESCHEDULED'))
    """)


def downgrade() -> None:
    # Drop the [) constraint (using raw SQL as Alembic doesn't support exclude type)
    op.execute("ALTER TABLE appointments DROP CONSTRAINT IF EXISTS exclude_overlapping_appointments")

    # Recreate with [] range (original)
    op.execute("""
        ALTER TABLE appointments
        ADD CONSTRAINT exclude_overlapping_appointments
        EXCLUDE USING gist (
            doctor_email WITH =,
            tstzrange(start_at_utc, end_at_utc, '[]') WITH &&
        )
        WHERE (status IN ('BOOKED', 'RESCHEDULED'))
    """)
