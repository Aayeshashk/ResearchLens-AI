from app.services.llm_service import generate_answer


def generate_document_summary(document_text: str) -> str:
    """
    Generate a concise research-paper summary from extracted document text.
    """

    if not document_text or not document_text.strip():
        raise ValueError("Document text cannot be empty.")

    prompt = """
You are an AI research assistant.

Summarize the research document provided below.

Structure the summary using these sections:

1. Overview
2. Research Problem
3. Methodology
4. Key Findings
5. Conclusion

Rules:
- Use only information present in the document.
- Do not invent facts.
- Keep the explanation concise but informative.
- Use clear academic language.
- If a section is not clearly available in the document, say "Not clearly stated in the document."
"""

    return generate_answer(
        prompt,
        document_text,
    )