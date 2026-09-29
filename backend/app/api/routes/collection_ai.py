from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.api.dependencies import get_database
from app.models import Collection, CollectionDocument, DocumentChunk, User
from app.services.llm_service import generate_answer

router = APIRouter(prefix="/collections", tags=["Collection AI"])


class CollectionAskRequest(BaseModel):
    query: str


@router.post("/{collection_id}/ask")
def ask_collection(
    collection_id: int,
    request: CollectionAskRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_database),
):
    query = request.query.strip()

    if not query:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question cannot be empty.",
        )

    collection = (
        db.query(Collection)
        .filter(
            Collection.id == collection_id,
            Collection.user_id == current_user.id,
        )
        .first()
    )

    if collection is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Collection not found.",
        )

    document_ids = [
        item.document_id
        for item in db.query(CollectionDocument)
        .filter(CollectionDocument.collection_id == collection_id)
        .all()
    ]

    if not document_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This collection has no documents.",
        )

    chunks = (
        db.query(DocumentChunk)
        .filter(DocumentChunk.document_id.in_(document_ids))
        .order_by(
            DocumentChunk.document_id.asc(),
            DocumentChunk.chunk_index.asc(),
        )
        .all()
    )

    if not chunks:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No extracted content was found in this collection.",
        )

    context_parts = []

    for chunk in chunks:
        document = chunk.document
        context_parts.append(
            f"DOCUMENT: {document.filename}\n"
            f"CHUNK {chunk.chunk_index}:\n"
            f"{chunk.content}"
        )

    context = "\n\n---\n\n".join(context_parts)

    prompt = f"""
You are ResearchLens AI, an academic research assistant.

Answer the user's question using ONLY the documents contained in this
collection.

Collection: {collection.name}

User question:
{query}

Rules:
- Use only the supplied collection content.
- Do not invent facts.
- If the answer is not supported by the collection, say:
  "The answer is not clearly stated in this collection."
- When possible, identify the document filename that supports an important
  statement.
- Synthesize information across documents when appropriate.
- Keep the answer concise but useful.
"""

    try:
        answer = generate_answer(prompt, context)
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unable to answer the collection question: {str(error)}",
        )

    sources = [
        {
            "document_id": chunk.document_id,
            "filename": chunk.document.filename,
            "chunk_id": chunk.id,
            "chunk_index": chunk.chunk_index,
        }
        for chunk in chunks
    ]

    return {
        "collection_id": collection.id,
        "collection_name": collection.name,
        "query": query,
        "answer": answer,
        "sources": sources,
    }
