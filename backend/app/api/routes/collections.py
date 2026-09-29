from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.api.dependencies import get_database
from app.models import Collection, CollectionDocument, Document, User


router = APIRouter(prefix="/collections", tags=["Collections"])


class CollectionCreate(BaseModel):
    name: str


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_collection(
    data: CollectionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_database),
):
    name = data.name.strip()

    if not name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Collection name cannot be empty.",
        )

    collection = Collection(
        user_id=current_user.id,
        name=name,
    )

    db.add(collection)
    db.commit()
    db.refresh(collection)

    return {
        "id": collection.id,
        "name": collection.name,
        "created_at": collection.created_at,
    }


@router.get("/")
def get_collections(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_database),
):
    collections = (
        db.query(Collection)
        .filter(Collection.user_id == current_user.id)
        .order_by(Collection.created_at.desc())
        .all()
    )

    return [
        {
            "id": collection.id,
            "name": collection.name,
            "created_at": collection.created_at,
        }
        for collection in collections
    ]


@router.get("/{collection_id}")
def get_collection(
    collection_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_database),
):
    collection = (
        db.query(Collection)
        .filter(
            Collection.id == collection_id,
            Collection.user_id == current_user.id,
        )
        .first()
    )

    if collection is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Collection not found.",
        )

    return {
        "id": collection.id,
        "name": collection.name,
        "created_at": collection.created_at,
        "documents": [
            {
                "id": item.document.id,
                "filename": item.document.filename,
            }
            for item in collection.documents
        ],
    }


@router.post("/{collection_id}/documents/{document_id}")
def add_document_to_collection(
    collection_id: int,
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_database),
):
    # Check that the collection belongs to the current user
    collection = (
        db.query(Collection)
        .filter(
            Collection.id == collection_id,
            Collection.user_id == current_user.id,
        )
        .first()
    )

    if collection is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Collection not found.",
        )

    # Check that the document belongs to the current user
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
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found.",
        )

    # Prevent duplicate documents in the same collection
    existing = (
        db.query(CollectionDocument)
        .filter(
            CollectionDocument.collection_id == collection_id,
            CollectionDocument.document_id == document_id,
        )
        .first()
    )

    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Document is already in this collection.",
        )

    collection_document = CollectionDocument(
        collection_id=collection_id,
        document_id=document_id,
    )

    db.add(collection_document)
    db.commit()

    return {
        "message": "Document added to collection successfully.",
        "collection_id": collection_id,
        "document_id": document_id,
    }


@router.delete("/{collection_id}/documents/{document_id}")
def remove_document_from_collection(
    collection_id: int,
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_database),
):
    # Check that the collection belongs to the current user
    collection = (
        db.query(Collection)
        .filter(
            Collection.id == collection_id,
            Collection.user_id == current_user.id,
        )
        .first()
    )

    if collection is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Collection not found.",
        )

    # Find the document inside the collection
    collection_document = (
        db.query(CollectionDocument)
        .filter(
            CollectionDocument.collection_id == collection_id,
            CollectionDocument.document_id == document_id,
        )
        .first()
    )

    if collection_document is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document is not in this collection.",
        )

    db.delete(collection_document)
    db.commit()

    return {
        "message": "Document removed from collection successfully.",
        "collection_id": collection_id,
        "document_id": document_id,
    }