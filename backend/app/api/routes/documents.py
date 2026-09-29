from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile,
)
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.api.dependencies import get_database
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
    get_upload_path,
    validate_pdf,
)

from app.services.search_service import search_similar_chunks
from app.services.related_documents_service import find_related_documents


router = APIRouter(
    prefix="/documents",
    tags=["Documents"],
)


class SearchRequest(BaseModel):
    query: str
    top_k: int = 5


class RenameDocumentRequest(BaseModel):
    filename: str


@router.post(
    "/upload",
    response_model=DocumentResponse
)
async def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_database),
):
    file_content = await file.read()
    file_size = len(file_content)

    try:
        validate_pdf(file.filename or "", file_size)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))

    storage_filename = generate_storage_filename(
        file.filename or "document.pdf"
    )
    upload_path = get_upload_path(storage_filename)
    upload_path.parent.mkdir(parents=True, exist_ok=True)

    try:
        upload_path.write_bytes(file_content)

        extracted_text = extract_text_from_pdf(upload_path)

        if not extracted_text.strip():
            upload_path.unlink(missing_ok=True)
            raise HTTPException(
                status_code=400,
                detail="Could not extract text from the PDF.",
            )

        document = Document(
            user_id=current_user.id,
            filename=file.filename or "document.pdf",
            file_path=str(upload_path),
        )

        db.add(document)
        db.commit()
        db.refresh(document)

        create_document_chunks(
            db=db,
            document=document,
            text=extracted_text,
        )

        return document

    except HTTPException:
        raise

    except Exception as error:
        print("PDF PROCESSING ERROR:", repr(error))
        upload_path.unlink(missing_ok=True)

        if "document" in locals() and document.id is not None:
            try:
                db.delete(document)
                db.commit()
            except Exception:
                db.rollback()
        else:
            db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Failed to process the PDF.",
        )


@router.get(
    "/",
    response_model=list[DocumentResponse]
)
def get_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_database),
):
    return (
        db.query(Document)
        .filter(Document.user_id == current_user.id)
        .order_by(Document.uploaded_at.desc())
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
        raise HTTPException(status_code=404, detail="Document not found.")

    chunks = (
        db.query(DocumentChunk)
        .filter(DocumentChunk.document_id == document.id)
        .order_by(DocumentChunk.chunk_index.asc())
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
        raise HTTPException(status_code=404, detail="Document not found.")

    documents = (
        db.query(Document)
        .filter(Document.user_id == current_user.id)
        .all()
    )

    document_ids = [document.id for document in documents]

    chunks = (
        db.query(DocumentChunk)
        .filter(DocumentChunk.document_id.in_(document_ids))
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
            detail=f"Unable to find related documents: {str(error)}",
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

    # Remove collection links and chunks first because the current
    # relationships do not rely on database-level cascade deletes.
    db.query(CollectionDocument).filter(
        CollectionDocument.document_id == document.id
    ).delete(synchronize_session=False)

    db.query(DocumentChunk).filter(
        DocumentChunk.document_id == document.id
    ).delete(synchronize_session=False)

    file_path = document.file_path

    db.delete(document)
    db.commit()

    # Delete the stored PDF after the database transaction succeeds.
    try:
        from pathlib import Path
        Path(file_path).unlink(missing_ok=True)
    except Exception:
        pass

    return {
        "message": "Document deleted successfully.",
        "document_id": document_id,
    }
