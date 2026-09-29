from pathlib import Path
from uuid import uuid4

from sqlalchemy.orm import Session

from app.models import Document, DocumentChunk
from app.services.embedding_service import generate_embedding
from pypdf import PdfReader


UPLOAD_DIR = Path("uploads")

ALLOWED_EXTENSIONS = {".pdf"}

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


def validate_pdf(filename: str, file_size: int) -> None:
    extension = Path(filename).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise ValueError("Only PDF files are allowed.")

    if file_size > MAX_FILE_SIZE:
        raise ValueError("File size exceeds the 10 MB limit.")


def generate_storage_filename(original_filename: str) -> str:
    extension = Path(original_filename).suffix.lower()

    return f"{uuid4().hex}{extension}"


def get_upload_path(filename: str) -> Path:
    return UPLOAD_DIR / filename


def extract_text_from_pdf(file_path: Path) -> str:
    reader = PdfReader(file_path)

    extracted_text = []

    for page in reader.pages:
        text = page.extract_text()

        if text:
            extracted_text.append(text)

    return "\n".join(extracted_text)


def chunk_text(
    text: str,
    chunk_size: int = 500,
    chunk_overlap: int = 100,
) -> list[str]:
    if not text.strip():
        return []

    chunks = []

    start = 0
    text_length = len(text)

    while start < text_length:
        end = start + chunk_size

        chunk = text[start:end].strip()

        if chunk:
            chunks.append(chunk)

        if end >= text_length:
            break

        start = end - chunk_overlap

    return chunks


def create_document_chunks(
    db: Session,
    document: Document,
    text: str,
) -> list[DocumentChunk]:
    chunks = chunk_text(text)

    document_chunks = []

    for index, chunk in enumerate(chunks):
        embedding = generate_embedding(chunk)

        document_chunk = DocumentChunk(
            document_id=document.id,
            chunk_index=index,
            content=chunk,
            embedding=embedding,
        )

        db.add(document_chunk)
        document_chunks.append(document_chunk)

    db.commit()

    return document_chunks