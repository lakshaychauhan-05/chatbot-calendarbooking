"""create clinics table from current head

Revision ID: a1b2c3d4e5f6
Revises: 2b1a4c8c7c1a
Create Date: 2026-01-30

Creates clinics table and backfills from existing doctors. Safe to run
if clinics already exists (uses IF NOT EXISTS / ON CONFLICT DO NOTHING).
"""
from alembic import op
import sqlalchemy as sa
from datetime import datetime


revision = "a1b2c3d4e5f6"
down_revision = "2b1a4c8c7c1a"
branch_labels = None
depends_on = None


def upgrade() -> None:
    conn = op.get_bind()

    # Create clinics table if not exists (raw SQL for IF NOT EXISTS)
    conn.execute(
        sa.text("""
            CREATE TABLE IF NOT EXISTS clinics (
                id UUID PRIMARY KEY,
                name VARCHAR(255) NOT NULL UNIQUE,
                timezone VARCHAR(64) NOT NULL DEFAULT 'UTC',
                address VARCHAR(512),
                is_active BOOLEAN NOT NULL DEFAULT true,
                created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
            )
        """)
    )

    # Create index if not exists
    conn.execute(
        sa.text("""
            CREATE INDEX IF NOT EXISTS ix_clinics_is_active ON clinics (is_active)
        """)
    )

    # Backfill clinics from existing doctors
    rows = conn.execute(
        sa.text("SELECT DISTINCT clinic_id FROM doctors WHERE clinic_id IS NOT NULL")
    ).fetchall()
    for idx, row in enumerate(rows):
        clinic_id = row[0]
        if not clinic_id:
            continue
        name = f"Legacy Clinic {idx + 1}"
        conn.execute(
            sa.text("""
                INSERT INTO clinics (id, name, timezone, is_active, created_at, updated_at)
                VALUES (:id, :name, 'UTC', true, :now, :now)
                ON CONFLICT (id) DO NOTHING
            """),
            {"id": clinic_id, "name": name, "now": datetime.utcnow()},
        )

    # Add FK from doctors to clinics if not exists
    r = conn.execute(
        sa.text("""
            SELECT 1 FROM information_schema.table_constraints
            WHERE constraint_name = 'fk_doctors_clinic_id' AND table_name = 'doctors'
        """)
    ).fetchone()
    if not r:
        op.create_foreign_key(
            "fk_doctors_clinic_id",
            source_table="doctors",
            referent_table="clinics",
            local_cols=["clinic_id"],
            remote_cols=["id"],
            ondelete="CASCADE",
        )


def downgrade() -> None:
    op.drop_constraint("fk_doctors_clinic_id", "doctors", type_="foreignkey")
    op.drop_index(op.f("ix_clinics_is_active"), table_name="clinics")
    op.drop_table("clinics")
