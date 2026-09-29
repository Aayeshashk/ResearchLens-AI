from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.api.dependencies import get_database
from app.models import Document, DocumentChunk, User
from app.services.summary_service import generate_document_summary


router = APIRouter(prefix="/documents", tags=["Summaries"])


@router.post("/{document_id}/summary")
def summarize_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_database),
):
    # Make sure the document belongs to the logged-in user
    document = (
        db.query(Document)
        .filter(
            Document.id == document_id,
            Document.user_id == current_user.id,
        )
        .first()
    )

    if document is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found.",
        )

    # Get document chunks in their original order
    chunks = (
        db.query(DocumentChunk)
        .filter(DocumentChunk.document_id == document_id)
        .order_by(DocumentChunk.chunk_index.asc())
        .all()
    )

    if not chunks:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This document has no extracted text.",
        )

    document_text = "\n\n".join(
        chunk.content for chunk in chunks if chunk.content
    ).strip()

    if not document_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No readable text was found in this document.",
        )

    try:
        summary = generate_document_summary(document_text)
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unable to generate summary: {str(error)}",
        )

    return {
        "document_id": document.id,
        "filename": document.filename,
        "summary": summary,
    }