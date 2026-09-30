# ResearchLens AI

> AI-powered research and document intelligence workspace for reading, searching, comparing, and analyzing research papers.

[![Live Demo](https://img.shields.io/badge/Live-Demo-blue)](https://research-lens-ai-taupe.vercel.app/)
[![Backend](https://img.shields.io/badge/API-FastAPI-green)](https://researchlens-api.vercel.app/)

## 🚀 Live Demo

**Web App:** https://research-lens-ai-taupe.vercel.app/

**API:** https://researchlens-api.vercel.app/

ResearchLens AI is a full-stack AI research workspace that allows users to upload research papers, search their content semantically, ask grounded questions, compare papers, extract research insights, and organize documents into collections.

---

## ✨ Features

### 📄 Document Intelligence

- PDF upload and text extraction
- Automatic document chunking
- Embedding generation
- Semantic document search
- AI-generated document summaries
- Key-point extraction
- Research problem and objective extraction
- Methodology and results extraction
- Limitations and future-work extraction

### 🤖 AI Research Assistant

- Document-specific AI Q&A
- Collection-level AI Q&A
- Retrieval-Augmented Generation (RAG)
- Google Gemini integration
- Context-grounded responses
- Supporting document references
- Persistent chat history

### 🔎 Research Discovery

- Related research based on semantic similarity
- Document comparison
- Similarities and differences
- Methodology comparison
- Findings and conclusion comparison

### 📚 Collections

- Create research collections
- Add and remove documents
- Ask questions across multiple papers
- Collection-level source references

### 🔐 Security

- JWT-based authentication
- User-scoped document access
- User-scoped collections
- Protected API endpoints
- Ownership checks for document operations
- Secure environment-variable based secrets

### 🎨 Research Workspace

- Responsive dashboard
- Document management
- Rename and delete documents
- Research library organization
- AI workspace for research workflows

---

## 🧠 AI / RAG Pipeline

```text
                 Research Paper
                       │
                       ▼
                  PDF Upload
                       │
                       ▼
                Text Extraction
                       │
                       ▼
               Document Chunking
                       │
                       ▼
              Embedding Generation
                       │
                       ▼
              Semantic Retrieval
                       │
                       ▼
              Relevant Context
                       │
                       ▼
                Google Gemini
                       │
                       ▼
             Grounded AI Response
                       │
                       ▼
             Supporting Sources

The system retrieves relevant document content before sending context to the language model, helping keep responses grounded in the user's research material.

🏗️ Architecture
┌──────────────────────────────┐
│        React Frontend        │
│     TypeScript + Vite        │
│       Tailwind CSS           │
└──────────────┬───────────────┘
               │
               │ HTTP / JSON
               ▼
┌──────────────────────────────┐
│       FastAPI Backend        │
│      Python + Uvicorn        │
├──────────────────────────────┤
│ Authentication               │
│ Document Processing          │
│ Semantic Search              │
│ RAG / AI                     │
│ Collections                  │
│ Research Intelligence        │
└───────┬──────────┬───────────┘
        │          │
        │          ├──────────────────┐
        │          │                  │
        ▼          ▼                  ▼
┌────────────┐ ┌──────────────┐ ┌───────────────┐
│ PostgreSQL │ │   Supabase   │ │ Google Gemini │
│  Database  │ │    Storage   │ │      AI       │
└────────────┘ └──────────────┘ └───────────────┘
        │
        ▼
 Documents / Chunks /
 Chats / Collections
🛠️ Tech Stack
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
Pydantic
JWT authentication
AI / Machine Learning
Sentence Transformers
all-MiniLM-L6-v2
Semantic embeddings
Cosine similarity
Retrieval-Augmented Generation (RAG)
Google Gemini
Database & Storage
PostgreSQL
SQLAlchemy ORM
Supabase Storage
Deployment
Vercel — Frontend
Vercel — FastAPI Backend
Supabase — PostgreSQL and persistent file storage
📚 Main Research Workflows
1. Semantic Search

Users can search across their research library using semantic similarity rather than relying only on exact keyword matches.

2. Document Q&A

A user can select a research paper and ask questions specifically grounded in that document.

3. Collection Q&A

Multiple research papers can be grouped into a collection. ResearchLens AI can answer questions using the documents contained within that collection.

4. Document Comparison

Two research papers can be compared across areas such as:

Overview
Similarities
Differences
Methodology
Findings
Conclusions
5. Research Intelligence

ResearchLens AI can extract structured research information including:

Key Points
Research Problem
Objective
Methodology
Dataset / Materials
Results
Conclusion
Limitations
Future Work
6. Related Research

Documents can be discovered through semantic similarity to identify papers with related content.

🔐 Security & Data Isolation

ResearchLens AI uses authenticated, user-scoped operations.

Protected operations include:

Document retrieval
Document search
Document rename
Document deletion
Collection retrieval
Collection document management
Collection AI queries

JWT authentication is required for protected API endpoints.

Documents and collections are filtered using the authenticated user's identity to prevent cross-user access.

☁️ Production Architecture

The deployed application uses separate frontend and backend services:

Vercel
│
├── React Frontend
│
└── FastAPI Backend
        │
        ├── Supabase PostgreSQL
        │
        ├── Supabase Storage
        │
        └── Google Gemini

Research papers are stored in a private Supabase Storage bucket rather than relying on the serverless function's local filesystem.

This allows uploaded documents to persist across serverless deployments.

⚙️ Local Development
Prerequisites
Python 3.12+
Node.js
npm
PostgreSQL or a PostgreSQL-compatible database
Google Gemini API key
Supabase project
Backend
cd backend

python -m venv venv

Windows:

venv\Scripts\activate

Install dependencies:

pip install -r requirements.txt

Create a .env file based on:

backend/.env.example

Start the API:

uvicorn main:app --reload

Backend:

http://127.0.0.1:8000

Swagger documentation:

http://127.0.0.1:8000/docs
Frontend
cd frontend
npm install
npm run dev

Frontend:

http://localhost:5173
🔑 Environment Variables

Create the required backend environment variables locally.

DATABASE_URL=
JWT_SECRET_KEY=
GEMINI_API_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

Never commit real credentials or .env files to GitHub.

Production secrets are configured through the hosting provider's environment-variable system.

📁 Project Structure
ResearchLens-AI/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── db/
│   │   ├── models/
│   │   └── services/
│   │
│   ├── main.py
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   └── src/
│
├── tests/
│
├── docs/
│
├── .gitignore
└── README.md
🎯 Portfolio Highlights

ResearchLens AI demonstrates practical experience in:

Full-stack application development
React and TypeScript
FastAPI REST API development
PostgreSQL database design
Authentication and authorization
PDF/document processing
Semantic embeddings
Semantic search
Retrieval-Augmented Generation
LLM integration
Research document intelligence
Multi-document reasoning
Cloud deployment
Persistent cloud storage
Secure multi-user data isolation
🔮 Future Scope

Potential future improvements include:

pgvector-backed retrieval at larger scale
Citation-level source highlighting
OCR for scanned research papers
Automated research-paper metadata extraction
Advanced paper recommendation
Exportable research reports
Team collaboration
Production observability and analytics
👩‍💻 Author

Aayesha Shaikh

Computer Engineering Student
Pillai College of Engineering