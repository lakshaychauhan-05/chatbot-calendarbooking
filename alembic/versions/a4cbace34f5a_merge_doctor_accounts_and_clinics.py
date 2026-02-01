"""merge_doctor_accounts_and_clinics

Revision ID: a4cbace34f5a
Revises: 2f3b6a4d1c90, a1b2c3d4e5f6
Create Date: 2026-01-31 19:11:39.205827

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a4cbace34f5a'
down_revision = ('2f3b6a4d1c90', 'a1b2c3d4e5f6')
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
