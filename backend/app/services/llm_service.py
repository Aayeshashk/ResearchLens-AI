import os

from dotenv import load_dotenv
from google import genai

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY is not set")

client = genai.Client(api_key=GEMINI_API_KEY)


def generate_answer(
    question: str,
    context: str,
) -> str:
    """
    Generate an answer using the provided RAG context.
    """

    prompt = f"""
You are ResearchLens AI, an AI research assistant.

Answer the user's question using ONLY the provided context.

If the context does not contain enough information to answer,
say that the available documents do not provide enough information.

Do not invent facts.

Context:
{context}

Question:
{question}

Answer:
"""

    response = client.models.generate_content(
        model="gemini-3.5-flash-lite",
        contents=prompt,
    )

    return response.text