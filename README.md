ResearchLens AI

AI-powered research and document intelligence workspace built with React, TypeScript, FastAPI, semantic embeddings, RAG, and Google Gemini.

Overview

ResearchLens AI helps users organize research papers, search their content semantically, ask grounded questions, compare documents, generate research insights, and work with groups of papers through collections.

Core Features

Secure user authentication with JWT

PDF upload and text extraction

Automatic document chunking

Embedding-based semantic search

Retrieval-Augmented Generation (RAG)

Document-specific AI Q&A

Persistent chat history

AI document summaries

Key-point extraction

Research insights extraction

Limitations and future-work extraction

Document comparison

Related Research / semantic similarity

Collections for grouping research papers

Collection-level AI Q&A

Collection source references

Document rename and deletion

User-scoped document and collection access

Responsive research workspace dashboard

AI / RAG Pipeline

PDF Upload
    ↓
Text Extraction
    ↓
Document Chunking
    ↓
Embedding Generation
    ↓
Vector Storage
    ↓
Semantic Retrieval
    ↓
Relevant Context
    ↓
Google Gemini
    ↓
Grounded Answer + Sources

Architecture

React + TypeScript + Tailwind
            │
            │ HTTP / JSON
            ▼
       FastAPI Backend
            │
     ┌──────┼───────────┐
     ▼      ▼           ▼
 PostgreSQL  RAG/Search  Auth
     │      │           │
     │      ▼           ▼
     │   Embeddings    JWT
     │
     ▼
Documents / Chunks / Chats / Collections
            │
            ▼
      Google Gemini

Tech Stack

Frontend

React

TypeScript

Vite

Tailwind CSS

Backend

Python

FastAPI

Uvicorn

SQLAlchemy

JWT authentication

Pydantic

AI

Sentence-transformer embeddings

Semantic similarity / cosine similarity

Retrieval-Augmented Generation

Google Gemini

Database

PostgreSQL

SQLAlchemy ORM

Main Research Workflows

1. Semantic Search

Users can search across their uploaded research library using semantic similarity rather than exact keyword matching.

2. Document Q&A

A selected document can be used as the grounding scope for AI questions.

3. Collection Q&A

A collection can contain multiple papers. ResearchLens can answer questions using the documents within that collection and return supporting document references.

4. Document Comparison

Two uploaded documents can be compared across:

Overview

Similarities

Differences

Methodology

Findings

Conclusion

5. Research Intelligence

For a selected document, ResearchLens can extract:

Key Points

Research Problem

Objective

Methodology

Dataset / Materials

Results

Conclusion

Limitations

Future Work

Security

All document and collection operations are scoped to the authenticated user.

Protected operations include:

Document retrieval

Document search

Document rename

Document deletion

Collection retrieval

Collection document management

Collection AI queries

JWT authentication is required for protected API endpoints.

Local Setup

Backend

cd backend

python -m venv venv

# Windows
venv\Scripts\activate

pip install -r requirements.txt

# Create .env from .env.example and add your credentials.

uvicorn main:app --reload

Backend:

http://127.0.0.1:8000

Swagger:

http://127.0.0.1:8000/docs

Frontend

cd frontend

npm install
npm run dev

Frontend:

http://localhost:5173

Environment Variables

Do not commit real credentials.

Required backend variables:

DATABASE_URL=
JWT_SECRET_KEY=
GEMINI_API_KEY=

See backend/.env.example.

Deployment Notes

For production:

Use a managed PostgreSQL database.

Store secrets in the hosting provider's environment-variable system.

Never commit .env.

Replace localhost CORS origins with the deployed frontend origin.

Use HTTPS.

Run FastAPI with a production server configuration.

Configure persistent storage for uploaded documents if required by the deployment platform.

Keep database migrations/versioning under source control.

Portfolio Highlights

ResearchLens AI demonstrates practical experience with:

Full-stack development

REST API design

Authentication and authorization

Semantic search

Embeddings

RAG

LLM integration

Document processing

Database modeling

AI-powered research workflows

Frontend state management

Security-aware multi-user data isolation

Future Scope

pgvector-backed retrieval at scale

Citation-level source highlighting

OCR for scanned research papers

Research-paper metadata extraction

Advanced paper recommendation

Exportable research reports

Team collaboration

Production observability and analytics