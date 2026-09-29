from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.api.dependencies import get_database
from app.models import Document, DocumentChunk, User
from app.services.comparison_service import compare_documents

router = APIRouter(prefix="/documents", tags=["Comparison"])


class DocumentComparisonRequest(BaseModel):
    document_a_id: int
    document_b_id: int


@router.post("/compare")
def compare_document_pair(
    data: DocumentComparisonRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_database),
):
    if data.document_a_id == data.document_b_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please select two different documents.",
        )

    document_a = (
        db.query(Document)
        .filter(
            Document.id == data.document_a_id,
            Document.user_id == current_user.id,
        )
        .first()
    )

    if document_a is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document A not found.",
        )

    document_b = (
        db.query(Document)
        .filter(
            Document.id == data.document_b_id,
            Document.user_id == current_user.id,
        )
        .first()
    )

    if document_b is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document B not found.",
        )

    chunks_a = (
        db.query(DocumentChunk)
        .filter(DocumentChunk.document_id == document_a.id)
        .order_by(DocumentChunk.chunk_index.asc())
        .all()
    )

    chunks_b = (
        db.query(DocumentChunk)
        .filter(DocumentChunk.document_id == document_b.id)
        .order_by(DocumentChunk.chunk_index.asc())
        .all()
    )

    text_a = "\n\n".join(
        chunk.content for chunk in chunks_a if chunk.content
    ).strip()

    text_b = "\n\n".join(
        chunk.content for chunk in chunks_b if chunk.content
    ).strip()

    if not text_a:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Document A has no readable extracted text.",
        )

    if not text_b:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Document B has no readable extracted text.",
        )

    try:
        comparison = compare_documents(
            document_a_filename=document_a.filename,
            document_a_text=text_a,
            document_b_filename=document_b.filename,
            document_b_text=text_b,
        )
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unable to compare documents: {str(error)}",
        )

    return {
        "document_a": {
            "id": document_a.id,
            "filename": document_a.filename,
        },
        "document_b": {
            "id": document_b.id,
            "filename": document_b.filename,
        },
        "comparison": comparison,
    }
