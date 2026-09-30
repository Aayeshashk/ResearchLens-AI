from pathlib import Path
import tempfile

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile,
)
from pydantic import BaseModel
from sqlalchemy.orm import Session
from supabase import create_client

from app.api.auth import get_current_user
from app.api.dependencies import get_database
from app.core.config import (
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
)
from app.models import (
    CollectionDocument,
    Document,
    DocumentChunk,
    User,
)
from app.schemas.document import DocumentResponse
from app.services.document_service import (
    create_document_chunks,
    extract_text_from_pdf,
    generate_storage_filename,
    validate_pdf,
)
from app.services.search_service import search_similar_chunks
from app.services.related_documents_service import find_related_documents


router = APIRouter(
    prefix="/documents",
    tags=["Documents"],
)


SUPABASE_BUCKET = "research-papers"

supabase = create_client(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
)


class SearchRequest(BaseModel):
    query: str
    top_k: int = 5


class RenameDocumentRequest(BaseModel):
    filename: str


@router.post(
    "/upload",
    response_model=DocumentResponse,
)
async def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_database),
):
    file_content = await file.read()
    file_size = len(file_content)

    try:
        validate_pdf(
            file.filename or "",
            file_size,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    storage_filename = generate_storage_filename(
        file.filename or "document.pdf"
    )

    # Store files inside a user-specific folder.
    storage_path = (
        f"user_{current_user.id}/{storage_filename}"
    )

    temp_path = None
    document = None
    uploaded_to_storage = False

    try:
        # -------------------------------------------------
        # 1. Upload PDF to Supabase Storage
        # -------------------------------------------------
        supabase.storage.from_(SUPABASE_BUCKET).upload(
            path=storage_path,
            file=file_content,
            file_options={
                "content-type": "application/pdf",
                "upsert": "false",
            },
        )

        uploaded_to_storage = True

        # -------------------------------------------------
        # 2. Temporarily save PDF for text extraction
        # -------------------------------------------------
        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=".pdf",
        ) as temp_file:
            temp_file.write(file_content)
            temp_path = Path(temp_file.name)

        extracted_text = extract_text_from_pdf(
            temp_path
        )

        if not extracted_text.strip():
            raise HTTPException(
                status_code=400,
                detail="Could not extract text from the PDF.",
            )

        # -------------------------------------------------
        # 3. Save document metadata in PostgreSQL
        # -------------------------------------------------
        document = Document(
            user_id=current_user.id,
            filename=file.filename or "document.pdf",
            file_path=storage_path,
        )

        db.add(document)
        db.commit()
        db.refresh(document)

        # -------------------------------------------------
        # 4. Create chunks + embeddings
        # -------------------------------------------------
        create_document_chunks(
            db=db,
            document=document,
            text=extracted_text,
        )

        return document

    except HTTPException:
        # Remove database record if it was created.
        if document is not None:
            try:
                db.delete(document)
                db.commit()
            except Exception:
                db.rollback()

        # Remove Supabase file if upload succeeded.
        if uploaded_to_storage:
            try:
                supabase.storage.from_(
                    SUPABASE_BUCKET
                ).remove([storage_path])
            except Exception as storage_error:
                print(
                    "SUPABASE CLEANUP ERROR:",
                    repr(storage_error),
                )

        raise

    except Exception as error:
        print(
            "PDF PROCESSING ERROR:",
            repr(error),
        )

        if document is not None:
            try:
                db.delete(document)
                db.commit()
            except Exception:
                db.rollback()
        else:
            db.rollback()

        # Clean up Supabase Storage object.
        if uploaded_to_storage:
            try:
                supabase.storage.from_(
                    SUPABASE_BUCKET
                ).remove([storage_path])
            except Exception as storage_error:
                print(
                    "SUPABASE CLEANUP ERROR:",
                    repr(storage_error),
                )

        raise HTTPException(
            status_code=500,
            detail="Failed to process the PDF.",
        )

    finally:
        # Remove temporary /tmp PDF.
        if temp_path is not None:
            try:
                temp_path.unlink(missing_ok=True)
            except Exception:
                pass


@router.get(
    "/",
    response_model=list[DocumentResponse],
)
def get_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_database),
):
    return (
        db.query(Document)
        .filter(
            Document.user_id == current_user.id
        )
        .order_by(
            Document.uploaded_at.desc()
        )
        .all()
    )


@router.post("/search")
def search_documents(
    request: SearchRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_database),
):
    results = search_similar_chunks(
        db=db,
        query=request.query,
        user_id=current_user.id,
        top_k=request.top_k,
    )

    return {
        "query": request.query,
        "results": results,
    }


@router.get("/{document_id}")
def get_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_database),
):
    document = (
        db.query(Document)
        .filter(
            Document.id == document_id,
            Document.user_id == current_user.id,
        )
        .first()
    )

    if document is None:
        raise HTTPException(
            status_code=404,
            detail="Document not found.",
        )

    chunks = (
        db.query(DocumentChunk)
        .filter(
            DocumentChunk.document_id == document.id
        )
        .order_by(
            DocumentChunk.chunk_index.asc()
        )
        .all()
    )

    return {
        "id": document.id,
        "filename": document.filename,
        "uploaded_at": document.uploaded_at,
        "file_path": document.file_path,
        "chunk_count": len(chunks),
        "chunks": [
            {
                "id": chunk.id,
                "chunk_index": chunk.chunk_index,
                "content": chunk.content,
            }
            for chunk in chunks
        ],
    }


@router.get("/{document_id}/related")
def get_related_documents(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_database),
):
    selected_document = (
        db.query(Document)
        .filter(
            Document.id == document_id,
            Document.user_id == current_user.id,
        )
        .first()
    )

    if selected_document is None:
        raise HTTPException(
            status_code=404,
            detail="Document not found.",
        )

    documents = (
        db.query(Document)
        .filter(
            Document.user_id == current_user.id
        )
        .all()
    )

    document_ids = [
        document.id
        for document in documents
    ]

    chunks = (
        db.query(DocumentChunk)
        .filter(
            DocumentChunk.document_id.in_(document_ids)
        )
        .all()
    )

    try:
        related_documents = find_related_documents(
            selected_document_id=document_id,
            documents=documents,
            chunks=chunks,
            limit=5,
        )
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to find related documents: "
                f"{str(error)}"
            ),
        )

    return {
        "document_id": selected_document.id,
        "filename": selected_document.filename,
        "related_documents": related_documents,
    }


@router.patch("/{document_id}")
def rename_document(
    document_id: int,
    request: RenameDocumentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_database),
):
    new_filename = request.filename.strip()

    if not new_filename:
        raise HTTPException(
            status_code=400,
            detail="Filename cannot be empty.",
        )

    if not new_filename.lower().endswith(".pdf"):
        new_filename += ".pdf"

    document = (
        db.query(Document)
        .filter(
            Document.id == document_id,
            Document.user_id == current_user.id,
        )
        .first()
    )

    if document is None:
        raise HTTPException(
            status_code=404,
            detail="Document not found.",
        )

    document.filename = new_filename

    db.commit()
    db.refresh(document)

    return {
        "message": "Document renamed successfully.",
        "id": document.id,
        "filename": document.filename,
    }


@router.delete("/{document_id}")
def delete_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_database),
):
    document = (
        db.query(Document)
        .filter(
            Document.id == document_id,
            Document.user_id == current_user.id,
        )
        .first()
    )

    if document is None:
        raise HTTPException(
            status_code=404,
            detail="Document not found.",
        )

    # Remove collection links and chunks first.
    db.query(CollectionDocument).filter(
        CollectionDocument.document_id == document.id
    ).delete(
        synchronize_session=False
    )

    db.query(DocumentChunk).filter(
        DocumentChunk.document_id == document.id
    ).delete(
        synchronize_session=False
    )

    storage_path = document.file_path

    db.delete(document)
    db.commit()

    # Delete the PDF from Supabase Storage.
    try:
        supabase.storage.from_(
            SUPABASE_BUCKET
        ).remove([storage_path])
    except Exception as error:
        print(
            "SUPABASE DELETE ERROR:",
            repr(error),
        )

    return {
        "message": "Document deleted successfully.",
        "document_id": document_id,
    }