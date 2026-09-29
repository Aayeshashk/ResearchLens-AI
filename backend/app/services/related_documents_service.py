from collections import defaultdict

from app.services.search_service import cosine_similarity


def _average_embedding(embeddings: list[list[float]]) -> list[float]:
    """
    Create one document-level embedding by averaging
    the embeddings of all its chunks.
    """
    if not embeddings:
        return []

    dimensions = len(embeddings[0])

    valid_embeddings = [
        embedding
        for embedding in embeddings
        if embedding and len(embedding) == dimensions
    ]

    if not valid_embeddings:
        return []

    return [
        sum(embedding[index] for embedding in valid_embeddings)
        / len(valid_embeddings)
        for index in range(dimensions)
    ]


def find_related_documents(
    selected_document_id: int,
    documents,
    chunks,
    limit: int = 5,
):
    """
    Find documents semantically related to the selected document.

    Only documents belonging to the same user should be passed in.
    The selected document itself is excluded from the results.
    """

    chunks_by_document = defaultdict(list)

    for chunk in chunks:
        if chunk.embedding:
            chunks_by_document[chunk.document_id].append(chunk.embedding)

    selected_embeddings = chunks_by_document.get(selected_document_id, [])

    if not selected_embeddings:
        return []

    selected_vector = _average_embedding(selected_embeddings)

    if not selected_vector:
        return []

    related_documents = []

    for document in documents:
        if document.id == selected_document_id:
            continue

        document_embeddings = chunks_by_document.get(document.id, [])

        if not document_embeddings:
            continue

        document_vector = _average_embedding(document_embeddings)

        if not document_vector:
            continue

        similarity = cosine_similarity(
            selected_vector,
            document_vector,
        )

        related_documents.append(
            {
                "id": document.id,
                "filename": document.filename,
                "uploaded_at": document.uploaded_at,
                "similarity": round(float(similarity), 4),
            }
        )

    related_documents.sort(
        key=lambda item: item["similarity"],
        reverse=True,
    )

    return related_documents[:limit]