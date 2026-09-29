from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.api.dependencies import get_database
from app.models import Chat, Message, User
from app.services.rag_service import answer_question


router = APIRouter(
    prefix="/chat",
    tags=["Chat"],
)


class ChatRequest(BaseModel):
    query: str
    top_k: int = 5
    chat_id: int | None = None
    document_id: int | None = None


# =========================
# GET CHAT HISTORY
# =========================

@router.get("/")
def get_chat_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_database),
):
    chats = (
        db.query(Chat)
        .filter(
            Chat.user_id == current_user.id
        )
        .order_by(
            Chat.created_at.desc()
        )
        .all()
    )

    return [
        {
            "id": chat.id,
            "title": chat.title,
            "created_at": chat.created_at,
        }
        for chat in chats
    ]


# =========================
# GET SINGLE CHAT
# =========================

@router.get("/{chat_id}")
def get_chat(
    chat_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_database),
):
    chat = (
        db.query(Chat)
        .filter(
            Chat.id == chat_id,
            Chat.user_id == current_user.id,
        )
        .first()
    )

    if chat is None:
        raise HTTPException(
            status_code=404,
            detail="Chat not found.",
        )

    messages = (
        db.query(Message)
        .filter(
            Message.chat_id == chat.id
        )
        .order_by(
            Message.created_at.asc()
        )
        .all()
    )

    return {
        "id": chat.id,
        "title": chat.title,
        "created_at": chat.created_at,
        "messages": [
            {
                "id": message.id,
                "role": message.role,
                "content": message.content,
            }
            for message in messages
        ],
    }


# =========================
# ASK QUESTION
# =========================

@router.post("/ask")
def ask_question(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_database),
):
    query = request.query.strip()

    if not query:
        raise HTTPException(
            status_code=400,
            detail="Question cannot be empty.",
        )

    # Create a new chat if this is the first question
    if request.chat_id is None:
        chat = Chat(
            user_id=current_user.id,
            title=query[:100],
        )

        db.add(chat)
        db.commit()
        db.refresh(chat)

    else:
        # Make sure the chat belongs to the current user
        chat = (
            db.query(Chat)
            .filter(
                Chat.id == request.chat_id,
                Chat.user_id == current_user.id,
            )
            .first()
        )

        if chat is None:
            raise HTTPException(
                status_code=404,
                detail="Chat not found.",
            )

    # If a document was selected, make sure it belongs
    # to the current user before using it.
    if request.document_id is not None:
        from app.models import Document

        document = (
            db.query(Document)
            .filter(
                Document.id == request.document_id,
                Document.user_id == current_user.id,
            )
            .first()
        )

        if document is None:
            raise HTTPException(
                status_code=404,
                detail="Document not found.",
            )

    # Save user's question
    user_message = Message(
        chat_id=chat.id,
        role="user",
        content=query,
    )

    db.add(user_message)
    db.commit()

    try:
        # Generate RAG answer
        result = answer_question(
            db=db,
            query=query,
            user_id=current_user.id,
            top_k=request.top_k,
            document_id=request.document_id,
        )

        # Save AI response
        assistant_message = Message(
            chat_id=chat.id,
            role="assistant",
            content=result["answer"],
        )

        db.add(assistant_message)
        db.commit()

        return {
            "chat_id": chat.id,
            "query": result["query"],
            "answer": result["answer"],
            "sources": result["sources"],
        }

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Failed to generate an answer.",
        )