from pathlib import Path

from app.db import SessionLocal
from app.models import Document
from app.services.document_service import (
    create_document_chunks,
    extract_text_from_pdf,
)


db = SessionLocal()

try:
    document = (
        db.query(Document)
        .order_by(Document.id.desc())
        .first()
    )

    if document is None:
        print("No documents found in the database.")

    else:
        pdf_path = Path(document.file_path)

        print("PDF:", document.filename)
        print("Path:", pdf_path)
        print()

        text = extract_text_from_pdf(pdf_path)

        print("Text extraction successful!")
        print("Characters extracted:", len(text))
        print()

        document_chunks = create_document_chunks(
            db=db,
            document=document,
            text=text,
        )

        print("Document chunks created:", len(document_chunks))

        for chunk in document_chunks:
            print()
            print(f"Chunk index: {chunk.chunk_index}")
            print(f"Characters: {len(chunk.content)}")
            print(f"Embedding dimensions: {len(chunk.embedding)}")

        print()
        print("Chunks and embeddings saved successfully!")

finally:
    db.close()