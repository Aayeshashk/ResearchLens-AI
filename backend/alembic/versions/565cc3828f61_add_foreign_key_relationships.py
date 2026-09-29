"""add foreign key relationships

Revision ID: 565cc3828f61
Revises:
Create Date: 2026-09-25 20:42:49.844438

"""

from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "565cc3828f61"

down_revision: Union[str, Sequence[str], None] = None

branch_labels: Union[str, Sequence[str], None] = None

depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add foreign key relationships."""

    op.create_foreign_key(
        "fk_chats_user_id",
        "chats",
        "users",
        ["user_id"],
        ["id"],
    )

    op.create_foreign_key(
        "fk_document_chunks_document_id",
        "document_chunks",
        "documents",
        ["document_id"],
        ["id"],
    )

    op.create_foreign_key(
        "fk_documents_user_id",
        "documents",
        "users",
        ["user_id"],
        ["id"],
    )

    op.create_foreign_key(
        "fk_messages_chat_id",
        "messages",
        "chats",
        ["chat_id"],
        ["id"],
    )


def downgrade() -> None:
    """Remove foreign key relationships."""

    op.drop_constraint(
        "fk_messages_chat_id",
        "messages",
        type_="foreignkey",
    )

    op.drop_constraint(
        "fk_documents_user_id",
        "documents",
        type_="foreignkey",
    )

    op.drop_constraint(
        "fk_document_chunks_document_id",
        "document_chunks",
        type_="foreignkey",
    )

    op.drop_constraint(
        "fk_chats_user_id",
        "chats",
        type_="foreignkey",
    )