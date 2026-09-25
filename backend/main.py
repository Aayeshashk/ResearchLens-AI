from fastapi import FastAPI
from app.api.routes.health import router as health_router

app = FastAPI(
    title="ResearchLens AI",
    description="AI-powered research and document intelligence platform",
    version="0.1.0",
)

app.include_router(health_router)


@app.get("/")
def root():
    return {
        "message": "ResearchLens AI API is running!",
        "status": "success",
        "version": "0.1.0",
    }