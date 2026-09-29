from app.services.llm_service import generate_answer


def generate_document_key_points(document_text: str) -> str:
    if not document_text or not document_text.strip():
        raise ValueError("Document text cannot be empty.")

    prompt = """
You are an AI research assistant.

Extract the most important key points from the research document provided
below.

Structure the response using exactly these sections:

1. Main Topic
2. Key Concepts
3. Main Contributions
4. Important Findings
5. Important Details

Rules:
- Base the answer on the actual content of the document.
- Extract useful information when it is explicitly stated or clearly
  identifiable from the document's title, introduction, overview, objectives,
  methodology, requirements, findings, or other sections.
- Do not invent facts or add information that is not supported by the document.
- The Main Topic may be identified from the document title or clearly stated
  project/system description.
- Main Contributions should summarize concrete work, features, methods,
  designs, or outputs described in the document.
- Important Findings should include stated results, observations, estimates,
  requirements, or conclusions when available.
- Important Details should preserve relevant names, values, dates, metrics,
  technical terms, or other concrete details.
- Use concise bullet points under each section.
- Only write "Not clearly stated in the document." when the document genuinely
  does not provide enough information for that section.
- Do not add sections outside the six sections.

Research document:
"""

    return generate_answer(prompt, document_text)


def generate_research_insights(document_text: str) -> str:
    if not document_text or not document_text.strip():
        raise ValueError("Document text cannot be empty.")

    prompt = """
You are an AI research assistant.

Analyze the research document provided below and extract its most important
research-oriented insights.

Structure the response using exactly these sections:

1. Research Problem
2. Objective
3. Methodology
4. Dataset / Materials
5. Results
6. Conclusion

Rules:
- Use ONLY information present in the document.
- Do not invent facts, datasets, methods, results, objectives, or conclusions.
- Use concise bullet points under each section.
- Preserve important names, values, metrics, and technical terms from the document.
- If a section is not clearly supported by the document, say:
  "Not clearly stated in the document."
- Do not add a separate section outside the six sections.

Research document:
"""

    return generate_answer(prompt, document_text)


def generate_limitations_future_work(document_text: str) -> str:
    if not document_text or not document_text.strip():
        raise ValueError("Document text cannot be empty.")

    prompt = """
You are an AI research assistant.

Analyze the research document provided below specifically for limitations
and future work.

Structure the response using exactly these sections:

1. Limitations
2. Future Work / Recommendations

Rules:
- Use ONLY information explicitly supported by the document.
- Do not invent limitations, weaknesses, future work, recommendations, or
  improvements.
- Use concise bullet points.
- Preserve important technical terms and specific details from the document.
- If limitations are not clearly stated, say:
  "Not clearly stated in the document."
- If future work or recommendations are not clearly stated, say:
  "Not clearly stated in the document."

Research document:
"""

    return generate_answer(prompt, document_text)
