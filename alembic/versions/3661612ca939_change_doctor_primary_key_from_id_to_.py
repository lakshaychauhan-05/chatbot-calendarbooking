"""Change doctor primary key from id to email

Revision ID: 3661612ca939
Revises: 44de2caf3983
Create Date: 2026-01-20 17:25:55.180522

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '3661612ca939'
down_revision = '44de2caf3983'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # This migration changes the Doctor table primary key from id (UUID) to email (string)
    # and updates all related foreign key relationships

    # For existing databases, this is a destructive change that requires data migration
    # In a production environment, you would need to carefully migrate existing data

    # Step 1: Drop existing foreign key constraints (if they exist)
    op.execute("ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_doctor_id_fkey")
    op.execute("ALTER TABLE doctor_leaves DROP CONSTRAINT IF EXISTS doctor_leaves_doctor_id_fkey")
    op.execute("ALTER TABLE calendar_watches DROP CONSTRAINT IF EXISTS calendar_watches_doctor_id_fkey")
    op.execute("ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_doctor_email_fkey")
    op.execute("ALTER TABLE doctor_leaves DROP CONSTRAINT IF EXISTS doctor_leaves_doctor_email_fkey")
    op.execute("ALTER TABLE calendar_watches DROP CONSTRAINT IF EXISTS calendar_watches_doctor_email_fkey")

    # Step 2: Drop existing primary key constraint
    op.execute("ALTER TABLE doctors DROP CONSTRAINT IF EXISTS doctors_pkey")

    # Step 3: Add new columns to handle the transition (if missing)
    op.execute("ALTER TABLE appointments ADD COLUMN IF NOT EXISTS doctor_email_new VARCHAR(255)")
    op.execute("ALTER TABLE doctor_leaves ADD COLUMN IF NOT EXISTS doctor_email_new VARCHAR(255)")
    op.execute("ALTER TABLE calendar_watches ADD COLUMN IF NOT EXISTS doctor_email_new VARCHAR(255)")

    # Step 4: For this migration, we'll assume the database is being rebuilt
    # In production, you would need to map existing UUIDs to email addresses
    # For now, we'll clean up and recreate the schema

    # Step 5: Drop old columns (if they exist)
    op.execute("ALTER TABLE appointments DROP COLUMN IF EXISTS doctor_id")
    op.execute("ALTER TABLE doctor_leaves DROP COLUMN IF EXISTS doctor_id")
    op.execute("ALTER TABLE calendar_watches DROP COLUMN IF EXISTS doctor_id")
    op.execute("ALTER TABLE doctors DROP COLUMN IF EXISTS id")

    # Step 6: Rename new columns to final names when needed
    op.execute(
        """
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'appointments' AND column_name = 'doctor_email_new'
            ) AND NOT EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'appointments' AND column_name = 'doctor_email'
            ) THEN
                ALTER TABLE appointments RENAME COLUMN doctor_email_new TO doctor_email;
            ELSIF EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'appointments' AND column_name = 'doctor_email_new'
            ) AND EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'appointments' AND column_name = 'doctor_email'
            ) THEN
                ALTER TABLE appointments DROP COLUMN doctor_email_new;
            END IF;
        END $$;
        """
    )
    op.execute(
        """
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'doctor_leaves' AND column_name = 'doctor_email_new'
            ) AND NOT EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'doctor_leaves' AND column_name = 'doctor_email'
            ) THEN
                ALTER TABLE doctor_leaves RENAME COLUMN doctor_email_new TO doctor_email;
            ELSIF EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'doctor_leaves' AND column_name = 'doctor_email_new'
            ) AND EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'doctor_leaves' AND column_name = 'doctor_email'
            ) THEN
                ALTER TABLE doctor_leaves DROP COLUMN doctor_email_new;
            END IF;
        END $$;
        """
    )
    op.execute(
        """
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'calendar_watches' AND column_name = 'doctor_email_new'
            ) AND NOT EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'calendar_watches' AND column_name = 'doctor_email'
            ) THEN
                ALTER TABLE calendar_watches RENAME COLUMN doctor_email_new TO doctor_email;
            ELSIF EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'calendar_watches' AND column_name = 'doctor_email_new'
            ) AND EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'calendar_watches' AND column_name = 'doctor_email'
            ) THEN
                ALTER TABLE calendar_watches DROP COLUMN doctor_email_new;
            END IF;
        END $$;
        """
    )

    # Step 7: Make email the primary key for doctors
    op.create_primary_key('doctors_pkey', 'doctors', ['email'])

    # Step 8: Recreate foreign key constraints
    op.create_foreign_key('appointments_doctor_email_fkey', 'appointments', 'doctors', ['doctor_email'], ['email'])
    op.create_foreign_key('doctor_leaves_doctor_email_fkey', 'doctor_leaves', 'doctors', ['doctor_email'], ['email'])
    op.create_foreign_key('calendar_watches_doctor_email_fkey', 'calendar_watches', 'doctors', ['doctor_email'], ['email'])

    # Step 9: Make foreign key columns not null
    op.alter_column('appointments', 'doctor_email', nullable=False)
    op.alter_column('doctor_leaves', 'doctor_email', nullable=False)
    op.alter_column('calendar_watches', 'doctor_email', nullable=False)


def downgrade() -> None:
    # This is a complex downgrade that would need to recreate UUIDs
    # For this migration, we'll leave it as a no-op since it's a major schema change
    pass
