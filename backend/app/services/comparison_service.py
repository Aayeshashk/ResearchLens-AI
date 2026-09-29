from app.services.llm_service import generate_answer


def compare_documents(
    document_a_filename: str,
    document_a_text: str,
    document_b_filename: str,
    document_b_text: str,
) -> str:
    """
    Generate a structured comparison of two research documents.

    The comparison is based only on the extracted text supplied to the LLM.
    """
    if not document_a_text or not document_a_text.strip():
        raise ValueError("Document A has no readable text.")
    if not document_b_text or not document_b_text.strip():
        raise ValueError("Document B has no readable text.")

    prompt = f"""
You are an AI research assistant helping a user compare two research documents.

Compare the two documents using ONLY the content provided below.

DOCUMENT A: {document_a_filename}
--------------------------------
{document_a_text}

DOCUMENT B: {document_b_filename}
--------------------------------
{document_b_text}

Structure the comparison using exactly these sections:

1. Overview
2. Similarities
3. Differences
4. Methodology Comparison
5. Findings Comparison
6. Conclusion

Rules:
- Use only information present in the two documents.
- Do not invent facts, methods, findings, datasets, results, or conclusions.
- Clearly distinguish which document a point belongs to when necessary.
- If a section cannot be supported by the provided text, say:
  "Not clearly stated in the documents."
- Keep the comparison concise but informative.
- Use clear academic language.
"""

    return generate_answer(prompt, "")
