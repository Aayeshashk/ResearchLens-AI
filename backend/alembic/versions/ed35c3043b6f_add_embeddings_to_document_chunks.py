"""add embeddings to document chunks

Revision ID: ed35c3043b6f
Revises: 565cc3828f61
Create Date: 2026-09-26 00:56:24.123927

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "ed35c3043b6f"
down_revision: Union[str, Sequence[str], None] = "565cc3828f61"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "document_chunks",
        sa.Column(
            "embedding",
            sa.JSON(),
            nullable=True,
        ),
    )


def downgrade() -> None:
    op.drop_column(
        "document_chunks",
        "embedding",
    )