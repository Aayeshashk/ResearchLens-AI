from app.services.search_service import search_similar_chunks
from app.services.llm_service import generate_answer


def build_rag_context(
    db,
    query: str,
    user_id: int,
    top_k: int = 5,
    document_id: int | None = None
) -> dict:

    results = search_similar_chunks(
        db=db,
        query=query,
        user_id=user_id,
        top_k=top_k,
        document_id=document_id
    )

    context_parts = []

    for index, result in enumerate(results, start=1):
        context_parts.append(
            f"[Source {index}]\n"
            f"{result['content']}"
        )

    context = "\n\n".join(context_parts)

    sources = []

    for index, result in enumerate(results, start=1):
        sources.append({
            "source_number": index,
            "document_id": result["document_id"],
            "chunk_id": result["chunk_id"],
            "chunk_index": result["chunk_index"],
            "similarity": round(result["similarity"], 4),
            "content": result["content"],
        })

    return {
        "query": query,
        "context": context,
        "sources": sources,
    }


def answer_question(
    db,
    query: str,
    user_id: int,
    top_k: int = 5,
    document_id: int | None = None
) -> dict:

    rag_result = build_rag_context(
        db=db,
        query=query,
        user_id=user_id,
        top_k=top_k,
        document_id=document_id
    )

    answer = generate_answer(
        question=query,
        context=rag_result["context"]
    )

    return {
        "query": query,
        "answer": answer,
        "sources": rag_result["sources"],
    }