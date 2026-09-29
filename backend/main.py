from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.auth import router as auth_router
from app.api.routes.chat import router as chat_router
from app.api.routes.collections import router as collections_router
from app.api.routes.collection_ai import router as collection_ai_router
from app.api.routes.compare import router as compare_router
from app.api.routes.documents import router as documents_router
from app.api.routes.health import router as health_router
from app.api.routes.insights import router as insights_router
from app.api.routes.summary import router as summary_router
from app.api.routes.users import router as users_router

app = FastAPI(
    title="ResearchLens AI",
    description="AI-powered research and document intelligence platform",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(documents_router)
app.include_router(chat_router)
app.include_router(collections_router)
app.include_router(collection_ai_router)
app.include_router(summary_router)
app.include_router(compare_router)
app.include_router(insights_router)


@app.get("/")
def root():
    return {
        "message": "ResearchLens AI API is running!",
        "status": "success",
        "version": "0.1.0",
    }
