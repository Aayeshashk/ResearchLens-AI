import math

from sqlalchemy.orm import Session

from app.models import Document, DocumentChunk

from app.services.embedding_service import generate_embedding


def cosine_similarity(
    vector_a: list[float],
    vector_b: list[float]
) -> float:

    if len(vector_a) != len(vector_b):
        raise ValueError("Vectors must have the same dimensions.")

    dot_product = sum(
        a * b for a, b in zip(vector_a, vector_b)
    )

    magnitude_a = math.sqrt(
        sum(a * a for a in vector_a)
    )

    magnitude_b = math.sqrt(
        sum(b * b for b in vector_b)
    )

    if magnitude_a == 0 or magnitude_b == 0:
        return 0.0

    return dot_product / (magnitude_a * magnitude_b)


def search_similar_chunks(
    db: Session,
    query: str,
    user_id: int,
    top_k: int = 5,
    document_id: int | None = None
) -> list[dict]:

    query_embedding = generate_embedding(query)

    chunks_query = (
        db.query(DocumentChunk)
        .join(
            Document,
            DocumentChunk.document_id == Document.id
        )
        .filter(
            Document.user_id == user_id,
            DocumentChunk.embedding.isnot(None)
        )
    )

    # If a specific document is selected,
    # search only inside that document.
    if document_id is not None:
        chunks_query = chunks_query.filter(
            Document.id == document_id
        )

    chunks = chunks_query.all()

    results = []

    for chunk in chunks:
        similarity = cosine_similarity(
            query_embedding,
            chunk.embedding
        )

        results.append({
            "chunk_id": chunk.id,
            "document_id": chunk.document_id,
            "chunk_index": chunk.chunk_index,
            "content": chunk.content,
            "similarity": similarity,
        })

    results.sort(
        key=lambda result: result["similarity"],
        reverse=True
    )

    return results[:top_k]