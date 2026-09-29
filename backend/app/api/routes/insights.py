from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.api.dependencies import get_database
from app.models import Document, DocumentChunk, User
from app.services.insights_service import (
    generate_document_key_points,
    generate_limitations_future_work,
    generate_research_insights,
)

router = APIRouter(prefix="/documents", tags=["Research Insights"])


def _get_document_text(document_id: int, current_user: User, db: Session):
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

    return document, document_text


@router.post("/{document_id}/key-points")
def generate_key_points(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_database),
):
    document, document_text = _get_document_text(document_id, current_user, db)

    try:
        key_points = generate_document_key_points(document_text)
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unable to generate key points: {str(error)}",
        )

    return {
        "document_id": document.id,
        "filename": document.filename,
        "key_points": key_points,
    }


@router.post("/{document_id}/research-insights")
def generate_research_insights_for_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_database),
):
    document, document_text = _get_document_text(document_id, current_user, db)

    try:
        insights = generate_research_insights(document_text)
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unable to generate research insights: {str(error)}",
        )

    return {
        "document_id": document.id,
        "filename": document.filename,
        "research_insights": insights,
    }


@router.post("/{document_id}/limitations-future-work")
def generate_limitations_future_work_for_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_database),
):
    document, document_text = _get_document_text(document_id, current_user, db)

    try:
        result = generate_limitations_future_work(document_text)
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unable to generate limitations and future work: {str(error)}",
        )

    return {
        "document_id": document.id,
        "filename": document.filename,
        "limitations_future_work": result,
    }
