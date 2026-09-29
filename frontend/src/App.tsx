import { useEffect, useState } from "react"

import {
  askQuestion,
  getChat,
  getChatHistory,
  getDocument,
  getDocuments,
  loginUser,
  registerUser,
  uploadDocument,
} from "./api"

type DocumentItem = {
  id: number
  filename: string
  uploaded_at: string
}

type SourceItem = {
  source_number: number
  document_id: number
  chunk_id: number
  chunk_index: number
  similarity: number
  content: string
}

type ChatHistoryItem = {
  id: number
  title: string
  created_at: string
}

type ChatMessage = {
  id: number
  role: "user" | "assistant"
  content: string
  sources?: SourceItem[]
}

type RelatedDocumentItem = {
  id: number
  filename: string
  uploaded_at: string
  similarity: number
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [uploading, setUploading] = useState(false)
  const [uploadMessage, setUploadMessage] = useState("")

  const [documents, setDocuments] = useState<DocumentItem[]>([])
  const [documentsLoading, setDocumentsLoading] = useState(true)
  const [documentsError, setDocumentsError] = useState("")
  const [documentActionLoading, setDocumentActionLoading] = useState<number | null>(null)
  const [editingDocumentId, setEditingDocumentId] = useState<number | null>(null)
  const [editingFilename, setEditingFilename] = useState("")
  const [selectedDocument, setSelectedDocument] = useState<any | null>(null)
  const [documentDetailsLoading, setDocumentDetailsLoading] = useState(false)
  const [documentSearch, setDocumentSearch] = useState("")

  const [activePage, setActivePage] = useState<
    "dashboard" | "documents" | "chat" | "search" | "collections" | "compare"
  >("dashboard")

  /* Global Semantic Search */
  const [globalSearchQuery, setGlobalSearchQuery] = useState("")
  const [globalSearchResults, setGlobalSearchResults] = useState<any[]>([])
  const [globalSearchLoading, setGlobalSearchLoading] = useState(false)
  const [globalSearchError, setGlobalSearchError] = useState("")

  /* Dashboard Ask AI */
  const [query, setQuery] = useState("")
  const [asking, setAsking] = useState(false)
  const [answer, setAnswer] = useState("")
  const [sources, setSources] = useState<SourceItem[]>([])

  /* Chat */
  const [chatQuery, setChatQuery] = useState("")
  const [chatAsking, setChatAsking] = useState(false)

  const [chatId, setChatId] = useState<number | null>(null)
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null)

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([])
  const [chatHistoryLoading, setChatHistoryLoading] = useState(false)
  const [chatHistoryError, setChatHistoryError] = useState("")

  /* Collections */
  const [collections, setCollections] = useState<any[]>([])
  const [collectionsLoading, setCollectionsLoading] = useState(false)
  const [collectionsError, setCollectionsError] = useState("")
  const [newCollectionName, setNewCollectionName] = useState("")
  const [collectionCreating, setCollectionCreating] = useState(false)
  const [selectedCollection, setSelectedCollection] = useState<any | null>(null)
  const [collectionLoading, setCollectionLoading] = useState(false)
  const [collectionActionLoading, setCollectionActionLoading] = useState<number | null>(null)
  const [collectionQuery, setCollectionQuery] = useState("")
  const [collectionAnswer, setCollectionAnswer] = useState("")
  const [collectionSources, setCollectionSources] = useState<any[]>([])
  const [collectionAiLoading, setCollectionAiLoading] = useState(false)
  const [collectionAiError, setCollectionAiError] = useState("")

  /* AI Summary */
  const [documentSummary, setDocumentSummary] = useState("")
  const [documentSummaryLoading, setDocumentSummaryLoading] = useState(false)
  const [documentSummaryError, setDocumentSummaryError] = useState("")

  /* Document Comparison */
  const [comparisonDocumentA, setComparisonDocumentA] = useState<number | null>(null)
  const [comparisonDocumentB, setComparisonDocumentB] = useState<number | null>(null)
  const [comparisonLoading, setComparisonLoading] = useState(false)
  const [comparisonError, setComparisonError] = useState("")
  const [comparisonResult, setComparisonResult] = useState("")
  const [comparisonNames, setComparisonNames] = useState<{
    document_a: { id: number; filename: string }
    document_b: { id: number; filename: string }
  } | null>(null)

  /* Research Insights */
  const [keyPoints, setKeyPoints] = useState("")
  const [keyPointsLoading, setKeyPointsLoading] = useState(false)
  const [keyPointsError, setKeyPointsError] = useState("")
  const [researchInsights, setResearchInsights] = useState("")
  const [researchInsightsLoading, setResearchInsightsLoading] = useState(false)
  const [researchInsightsError, setResearchInsightsError] = useState("")
  const [limitationsFutureWork, setLimitationsFutureWork] = useState("")
  const [limitationsFutureWorkLoading, setLimitationsFutureWorkLoading] = useState(false)
  const [limitationsFutureWorkError, setLimitationsFutureWorkError] = useState("")

  /* Related Research */
  const [relatedDocuments, setRelatedDocuments] = useState<RelatedDocumentItem[]>([])
  const [relatedDocumentsLoading, setRelatedDocumentsLoading] = useState(false)
  const [relatedDocumentsError, setRelatedDocumentsError] = useState("")

  useEffect(() => {
    async function loadDocuments() {
      const token = localStorage.getItem(
        "researchlens_token"
      )

      if (!token) {
        setDocumentsError("Please log in again.")
        setDocumentsLoading(false)
        return
      }

      try {
        const data = await getDocuments(token)
        setDocuments(data)
      } catch (error) {
        if (error instanceof Error) {
          setDocumentsError(error.message)
        } else {
          setDocumentsError(
            "Failed to load documents."
          )
        }
      } finally {
        setDocumentsLoading(false)
      }
    }

    loadDocuments()
  }, [])

  useEffect(() => {
    if (activePage !== "collections") {
      return
    }

    loadCollections()
  }, [activePage])

  useEffect(() => {
    if (activePage !== "chat") {
      return
    }

    async function loadChatHistory() {
      const token = localStorage.getItem(
        "researchlens_token"
      )

      if (!token) {
        setChatHistoryError("Please log in again.")
        return
      }

      setChatHistoryLoading(true)
      setChatHistoryError("")

      try {
        const data = await getChatHistory(token)

        setChatHistory(data)
      } catch (error) {
        if (error instanceof Error) {
          setChatHistoryError(error.message)
        } else {
          setChatHistoryError(
            "Failed to load chat history."
          )
        }
      } finally {
        setChatHistoryLoading(false)
      }
    }

    loadChatHistory()
  }, [activePage])

  async function loadCollections() {
    const token = localStorage.getItem("researchlens_token")

    if (!token) {
      setCollectionsError("Please log in again.")
      return
    }

    setCollectionsLoading(true)
    setCollectionsError("")

    try {
      const response = await fetch("https://researchlens-api.vercel.app/collections/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || "Failed to load collections.")
      }

      setCollections(Array.isArray(data) ? data : [])
    } catch (error) {
      setCollectionsError(
        error instanceof Error
          ? error.message
          : "Failed to load collections."
      )
    } finally {
      setCollectionsLoading(false)
    }
  }

  async function handleOpenCollection(collectionId: number) {
    const token = localStorage.getItem("researchlens_token")

    if (!token) {
      setCollectionsError("Please log in again.")
      return
    }

    setCollectionLoading(true)
    setCollectionsError("")

    try {
      const response = await fetch(
        `https://researchlens-api.vercel.app/collections/${collectionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || "Failed to load collection.")
      }

      setSelectedCollection(data)
      setCollectionQuery("")
      setCollectionAnswer("")
      setCollectionSources([])
      setCollectionAiError("")
    } catch (error) {
      setCollectionsError(
        error instanceof Error
          ? error.message
          : "Failed to load collection."
      )
    } finally {
      setCollectionLoading(false)
    }
  }

  async function handleCreateCollection() {
    const name = newCollectionName.trim()

    if (!name || collectionCreating) {
      return
    }

    const token = localStorage.getItem("researchlens_token")

    if (!token) {
      setCollectionsError("Please log in again.")
      return
    }

    setCollectionCreating(true)
    setCollectionsError("")

    try {
      const response = await fetch("https://researchlens-api.vercel.app/collections/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || "Failed to create collection.")
      }

      setCollections((current) => [data, ...current])
      setNewCollectionName("")
      setSelectedCollection({ ...data, documents: [] })
    } catch (error) {
      setCollectionsError(
        error instanceof Error
          ? error.message
          : "Failed to create collection."
      )
    } finally {
      setCollectionCreating(false)
    }
  }

  async function handleAddDocumentToCollection(documentId: number) {
    if (!selectedCollection) return

    const token = localStorage.getItem("researchlens_token")

    if (!token) {
      setCollectionsError("Please log in again.")
      return
    }

    setCollectionActionLoading(documentId)
    setCollectionsError("")

    try {
      const response = await fetch(
        `https://researchlens-api.vercel.app/collections/${selectedCollection.id}/documents/${documentId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || "Failed to add document.")
      }

      await handleOpenCollection(selectedCollection.id)
    } catch (error) {
      setCollectionsError(
        error instanceof Error
          ? error.message
          : "Failed to add document to collection."
      )
    } finally {
      setCollectionActionLoading(null)
    }
  }

  async function handleRemoveDocumentFromCollection(documentId: number) {
    if (!selectedCollection) return

    const token = localStorage.getItem("researchlens_token")

    if (!token) {
      setCollectionsError("Please log in again.")
      return
    }

    setCollectionActionLoading(documentId)
    setCollectionsError("")

    try {
      const response = await fetch(
        `https://researchlens-api.vercel.app/collections/${selectedCollection.id}/documents/${documentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || "Failed to remove document.")
      }

      await handleOpenCollection(selectedCollection.id)
    } catch (error) {
      setCollectionsError(
        error instanceof Error
          ? error.message
          : "Failed to remove document from collection."
      )
    } finally {
      setCollectionActionLoading(null)
    }
  }

  async function handleAskCollection() {
    const trimmedQuery = collectionQuery.trim()

    if (!selectedCollection || !trimmedQuery || collectionAiLoading) {
      return
    }

    const token = localStorage.getItem("researchlens_token")

    if (!token) {
      setCollectionAiError("Please log in again.")
      return
    }

    setCollectionAiLoading(true)
    setCollectionAiError("")
    setCollectionAnswer("")
    setCollectionSources([])

    try {
      const response = await fetch(
        `https://researchlens-api.vercel.app/collections/${selectedCollection.id}/ask`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            query: trimmedQuery,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to ask the collection."
        )
      }

      setCollectionAnswer(
        data.answer || "No answer was returned."
      )
      setCollectionSources(
        Array.isArray(data.sources) ? data.sources : []
      )
      setCollectionQuery("")
    } catch (error) {
      setCollectionAiError(
        error instanceof Error
          ? error.message
          : "Unable to answer the collection question."
      )
    } finally {
      setCollectionAiLoading(false)
    }
  }

  async function handleRenameDocument(documentId: number) {
    const token = localStorage.getItem("researchlens_token")
    const filename = editingFilename.trim()

    if (!token || !filename || documentActionLoading !== null) return

    setDocumentActionLoading(documentId)

    try {
      const response = await fetch(
        `https://researchlens-api.vercel.app/documents/${documentId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ filename }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || "Failed to rename document.")
      }

      setDocuments((current) =>
        current.map((document) =>
          document.id === documentId
            ? { ...document, filename: data.filename }
            : document
        )
      )

      if (selectedDocument?.id === documentId) {
        setSelectedDocument((current: any) =>
          current ? { ...current, filename: data.filename } : current
        )
      }

      setEditingDocumentId(null)
      setEditingFilename("")
    } catch (error) {
      setDocumentsError(
        error instanceof Error ? error.message : "Unable to rename document."
      )
    } finally {
      setDocumentActionLoading(null)
    }
  }

  async function handleDeleteDocument(documentId: number) {
    const token = localStorage.getItem("researchlens_token")

    if (!token || documentActionLoading !== null) return

    const document = documents.find((item) => item.id === documentId)

    if (!window.confirm(`Delete "${document?.filename || "this document"}"?`)) {
      return
    }

    setDocumentActionLoading(documentId)

    try {
      const response = await fetch(
        `https://researchlens-api.vercel.app/documents/${documentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || "Failed to delete document.")
      }

      setDocuments((current) =>
        current.filter((item) => item.id !== documentId)
      )

      if (selectedDocument?.id === documentId) {
        setSelectedDocument(null)
      }

      setEditingDocumentId(null)
      setEditingFilename("")
    } catch (error) {
      setDocumentsError(
        error instanceof Error ? error.message : "Unable to delete document."
      )
    } finally {
      setDocumentActionLoading(null)
    }
  }

  async function handleOpenDocument(documentId: number) {
  const token = localStorage.getItem(
    "researchlens_token"
  )

  if (!token) {
    setDocumentsError("Please log in again.")
    return
  }

  setDocumentDetailsLoading(true)
  setDocumentsError("")
  setDocumentSearch("")
  setDocumentSummary("")
  setDocumentSummaryError("")
  setKeyPoints("")
  setKeyPointsError("")
  setResearchInsights("")
  setResearchInsightsError("")
  setLimitationsFutureWork("")
  setLimitationsFutureWorkError("")
  setRelatedDocuments([])
  setRelatedDocumentsError("")

  try {
    const data = await getDocument(
      documentId,
      token
    )

    setSelectedDocument(data)
  } catch (error) {
    if (error instanceof Error) {
      setDocumentsError(error.message)
    } else {
      setDocumentsError(
        "Failed to load document."
      )
    }
  } finally {
    setDocumentDetailsLoading(false)
  }
}

  async function handleLoadRelatedDocuments() {
    if (!selectedDocument || relatedDocumentsLoading) return

    const token = localStorage.getItem("researchlens_token")

    if (!token) {
      setRelatedDocumentsError("Please log in again.")
      return
    }

    setRelatedDocumentsLoading(true)
    setRelatedDocumentsError("")
    setRelatedDocuments([])

    try {
      const response = await fetch(
        `https://researchlens-api.vercel.app/documents/${selectedDocument.id}/related`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to find related research."
        )
      }

      setRelatedDocuments(
        Array.isArray(data.related_documents)
          ? data.related_documents
          : []
      )
    } catch (error) {
      setRelatedDocumentsError(
        error instanceof Error
          ? error.message
          : "Unable to find related research."
      )
    } finally {
      setRelatedDocumentsLoading(false)
    }
  }

  async function handleGenerateSummary() {
    if (!selectedDocument || documentSummaryLoading) return

    const token = localStorage.getItem("researchlens_token")

    if (!token) {
      setDocumentSummaryError("Please log in again.")
      return
    }

    setDocumentSummaryLoading(true)
    setDocumentSummaryError("")
    setDocumentSummary("")

    try {
      const response = await fetch(
        `https://researchlens-api.vercel.app/documents/${selectedDocument.id}/summary`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || "Failed to generate summary.")
      }

      setDocumentSummary(data.summary || "No summary was returned.")
    } catch (error) {
      setDocumentSummaryError(
        error instanceof Error
          ? error.message
          : "Unable to generate document summary."
      )
    } finally {
      setDocumentSummaryLoading(false)
    }
  }


  async function handleGenerateKeyPoints() {
    if (!selectedDocument || keyPointsLoading) return

    const token = localStorage.getItem("researchlens_token")

    if (!token) {
      setKeyPointsError("Please log in again.")
      return
    }

    setKeyPointsLoading(true)
    setKeyPointsError("")
    setKeyPoints("")

    try {
      const response = await fetch(
        `https://researchlens-api.vercel.app/documents/${selectedDocument.id}/key-points`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || "Failed to generate key points.")
      }

      setKeyPoints(data.key_points || "No key points were returned.")
    } catch (error) {
      setKeyPointsError(
        error instanceof Error
          ? error.message
          : "Unable to generate key points."
      )
    } finally {
      setKeyPointsLoading(false)
    }
  }

  async function handleGenerateResearchInsights() {
    if (!selectedDocument || researchInsightsLoading) return

    const token = localStorage.getItem("researchlens_token")

    if (!token) {
      setResearchInsightsError("Please log in again.")
      return
    }

    setResearchInsightsLoading(true)
    setResearchInsightsError("")
    setResearchInsights("")

    try {
      const response = await fetch(
        `https://researchlens-api.vercel.app/documents/${selectedDocument.id}/research-insights`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || "Failed to generate research insights.")
      }

      setResearchInsights(
        data.research_insights || "No research insights were returned."
      )
    } catch (error) {
      setResearchInsightsError(
        error instanceof Error
          ? error.message
          : "Unable to generate research insights."
      )
    } finally {
      setResearchInsightsLoading(false)
    }
  }

  async function handleGenerateLimitationsFutureWork() {
    if (!selectedDocument || limitationsFutureWorkLoading) return

    const token = localStorage.getItem("researchlens_token")

    if (!token) {
      setLimitationsFutureWorkError("Please log in again.")
      return
    }

    setLimitationsFutureWorkLoading(true)
    setLimitationsFutureWorkError("")
    setLimitationsFutureWork("")

    try {
      const response = await fetch(
        `https://researchlens-api.vercel.app/documents/${selectedDocument.id}/limitations-future-work`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to analyze limitations and future work."
        )
      }

      setLimitationsFutureWork(
        data.limitations_future_work ||
          "No limitations or future work were returned."
      )
    } catch (error) {
      setLimitationsFutureWorkError(
        error instanceof Error
          ? error.message
          : "Unable to analyze limitations and future work."
      )
    } finally {
      setLimitationsFutureWorkLoading(false)
    }
  }

  async function handleCompareDocuments() {
    if (
      comparisonDocumentA === null ||
      comparisonDocumentB === null ||
      comparisonLoading
    ) {
      return
    }

    if (comparisonDocumentA === comparisonDocumentB) {
      setComparisonError("Please select two different documents.")
      return
    }

    const token = localStorage.getItem("researchlens_token")

    if (!token) {
      setComparisonError("Please log in again.")
      return
    }

    setComparisonLoading(true)
    setComparisonError("")
    setComparisonResult("")
    setComparisonNames(null)

    try {
      const response = await fetch(
        "https://researchlens-api.vercel.app/documents/compare",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            document_a_id: comparisonDocumentA,
            document_b_id: comparisonDocumentB,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || "Failed to compare documents.")
      }

      setComparisonResult(
        data.comparison || "No comparison was returned."
      )
      setComparisonNames({
        document_a: data.document_a,
        document_b: data.document_b,
      })
    } catch (error) {
      setComparisonError(
        error instanceof Error
          ? error.message
          : "Unable to compare documents."
      )
    } finally {
      setComparisonLoading(false)
    }
  }

  function handleAskAboutDocument() {
    if (!selectedDocument) {
      return
    }

    setSelectedDocumentId(selectedDocument.id)
    setActivePage("chat")
  }

  async function handleGlobalSearch() {
    const trimmedQuery = globalSearchQuery.trim()

    if (!trimmedQuery || globalSearchLoading) {
      return
    }

    const token = localStorage.getItem(
      "researchlens_token"
    )

    if (!token) {
      setGlobalSearchError("Please log in again.")
      return
    }

    setGlobalSearchLoading(true)
    setGlobalSearchError("")
    setGlobalSearchResults([])

    try {
      const response = await fetch(
        "https://researchlens-api.vercel.app/documents/search",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            query: trimmedQuery,
            top_k: 10,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail || "Global search failed."
        )
      }

      const results = Array.isArray(data)
        ? data
        : Array.isArray(data.results)
          ? data.results
          : Array.isArray(data.data)
            ? data.data
            : []

      setGlobalSearchResults(results)
    } catch (error) {
      if (error instanceof Error) {
        setGlobalSearchError(error.message)
      } else {
        setGlobalSearchError(
          "Unable to search your documents."
        )
      }
    } finally {
      setGlobalSearchLoading(false)
    }
  }

  async function handleFileUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    if (file.type !== "application/pdf") {
      setUploadMessage("Please select a PDF file.")
      event.target.value = ""
      return
    }

    const token = localStorage.getItem(
      "researchlens_token"
    )

    if (!token) {
      setUploadMessage("Please log in again.")
      event.target.value = ""
      return
    }

    setUploading(true)
    setUploadMessage(
      "Uploading and processing PDF..."
    )

    try {
      const data = await uploadDocument(
        file,
        token
      )

      setUploadMessage(
        `Successfully uploaded: ${data.filename}`
      )

      setDocuments((currentDocuments) => [
        {
          id: data.id,
          filename: data.filename,
          uploaded_at: data.uploaded_at,
        },
        ...currentDocuments,
      ])
    } catch (error) {
      if (error instanceof Error) {
        setUploadMessage(error.message)
      } else {
        setUploadMessage("Upload failed.")
      }
    } finally {
      setUploading(false)
      event.target.value = ""
    }
  }

  async function handleAskQuestion() {
    if (!query.trim()) {
      return
    }

    const token = localStorage.getItem(
      "researchlens_token"
    )

    if (!token) {
      setAnswer("Please log in again.")
      return
    }

    setAsking(true)
    setAnswer("")
    setSources([])

    try {
      const data = await askQuestion(
        query,
        token
      )

      setAnswer(data.answer)
      setSources(data.sources || [])
    } catch (error) {
      if (error instanceof Error) {
        setAnswer(error.message)
      } else {
        setAnswer(
          "Unable to answer the question."
        )
      }
    } finally {
      setAsking(false)
    }
  }

  async function handleChatQuestion() {
    const trimmedQuery = chatQuery.trim()

    if (!trimmedQuery || chatAsking) {
      return
    }

    const token = localStorage.getItem(
      "researchlens_token"
    )

    if (!token) {
      setChatMessages((currentMessages) => [
        ...currentMessages,
        {
          id: Date.now(),
          role: "assistant",
          content: "Please log in again.",
        },
      ])
      return
    }

    /* Add user message immediately */
    setChatMessages((currentMessages) => [
      ...currentMessages,
      {
        id: Date.now(),
        role: "user",
        content: trimmedQuery,
      },
    ])

    setChatQuery("")
    setChatAsking(true)

    try {
      /*
       * Send the existing chat ID if we have one.
       *
       * If chatId is null, the backend creates
       * a new Chat record.
       */
      const data = await askQuestion(
        trimmedQuery,
        token,
        5,
        chatId ?? undefined,
        selectedDocumentId ?? undefined
      )

      /*
       * Save the database chat ID returned
       * by the backend.
       */
      if (data.chat_id) {
        setChatId(data.chat_id)

        /* Refresh chat history so newly created chats appear immediately */
        const history = await getChatHistory(token)
        setChatHistory(history)
      }

      /* Add AI response */
      setChatMessages((currentMessages) => [
        ...currentMessages,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: data.answer,
          sources: data.sources || [],
        },
      ])
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unable to answer the question."

      setChatMessages((currentMessages) => [
        ...currentMessages,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: errorMessage,
        },
      ])
    } finally {
      setChatAsking(false)
    }
  }

  async function handleOpenChat(
    selectedChatId: number
  ) {
    const token = localStorage.getItem(
      "researchlens_token"
    )

    if (!token) {
      setChatHistoryError("Please log in again.")
      return
    }

    try {
      setChatHistoryError("")

      const data = await getChat(
        selectedChatId,
        token
      )

      setChatId(data.id)

      setChatMessages(
        data.messages.map(
          (message: ChatMessage) => ({
            id: message.id,
            role: message.role,
            content: message.content,
          })
        )
      )
    } catch (error) {
      if (error instanceof Error) {
        setChatHistoryError(error.message)
      } else {
        setChatHistoryError(
          "Failed to open chat."
        )
      }
    }
  }

  function handleClearChat() {
    setChatMessages([])
    setChatQuery("")
    setChatId(null)
    setSelectedDocumentId(null)
  }

  const filteredDocumentChunks =
    selectedDocument?.chunks?.filter((chunk: any) =>
      chunk.content
        .toLowerCase()
        .includes(documentSearch.toLowerCase())
    ) ?? []

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">

      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900 p-6">

        <div className="mb-10">
          <h1 className="text-xl font-bold">
            ResearchLens AI
          </h1>

          <p className="text-xs text-slate-400 mt-1">
            Research & Knowledge Workspace
          </p>
        </div>

        <nav className="space-y-2">

          <button
            onClick={() =>
              setActivePage("dashboard")
            }
            className={`w-full text-left rounded-lg px-4 py-3 text-sm ${
              activePage === "dashboard"
                ? "bg-slate-800 text-white"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            Dashboard
          </button>

          <button
            onClick={() =>
              setActivePage("search")
            }
            className={`w-full text-left rounded-lg px-4 py-3 text-sm ${
              activePage === "search"
                ? "bg-slate-800 text-white"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            Search
          </button>

          <button
            onClick={() =>
              setActivePage("documents")
            }
            className={`w-full text-left rounded-lg px-4 py-3 text-sm ${
              activePage === "documents"
                ? "bg-slate-800 text-white"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            Documents
          </button>

          <button
            onClick={() =>
              setActivePage("chat")
            }
            className={`w-full text-left rounded-lg px-4 py-3 text-sm ${
              activePage === "chat"
                ? "bg-slate-800 text-white"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            Chat
          </button>

          <button
            onClick={() => setActivePage("compare")}
            className={`w-full text-left rounded-lg px-4 py-3 text-sm ${
              activePage === "compare"
                ? "bg-slate-800 text-white"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            Compare
          </button>

          <button
            onClick={() => {
              setSelectedCollection(null)
              setCollectionsError("")
              setActivePage("collections")
            }}
            className={`w-full text-left rounded-lg px-4 py-3 text-sm ${
              activePage === "collections"
                ? "bg-slate-800 text-white"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            Collections
          </button>

        </nav>

        <button
          onClick={onLogout}
          className="mt-10 w-full rounded-lg border border-slate-700 px-4 py-3 text-sm text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          Logout
        </button>

      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10">

        <div className="max-w-5xl mx-auto">

          {/* ================= DASHBOARD ================= */}
          {activePage === "dashboard" && (
            <>
              <div className="mb-10">

                <p className="text-sm text-blue-400 mb-2">
                  AI Research Workspace
                </p>

                <h2 className="text-4xl font-bold">
                  Your research, organized and understood.
                </h2>

                <p className="text-slate-400 mt-3 max-w-2xl">
                  Upload research papers, search their content
                  semantically, and ask questions using AI-powered
                  document intelligence.
                </p>

              </div>

              {/* Workspace Stats */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                  <p className="text-sm text-slate-500">Research Papers</p>
                  <p className="mt-2 text-3xl font-bold text-slate-100">
                    {documents.length}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Indexed documents
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                  <p className="text-sm text-slate-500">Collections</p>
                  <p className="mt-2 text-3xl font-bold text-slate-100">
                    {collections.length}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Research groups
                  </p>
                </div>

                <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-6">
                  <p className="text-sm text-blue-400">AI Workspace</p>
                  <p className="mt-2 text-lg font-semibold text-slate-100">
                    Ready to research
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Search, compare, summarize & ask AI
                  </p>
                </div>
              </div>

              <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <button
                  onClick={() => setActivePage("documents")}
                  className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-left text-sm text-slate-300 hover:border-blue-500 hover:text-white"
                >
                  <span className="font-medium">Browse Documents</span>
                  <span className="mt-1 block text-xs text-slate-500">Open your research library</span>
                </button>

                <button
                  onClick={() => setActivePage("search")}
                  className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-left text-sm text-slate-300 hover:border-blue-500 hover:text-white"
                >
                  <span className="font-medium">Semantic Search</span>
                  <span className="mt-1 block text-xs text-slate-500">Find relevant research</span>
                </button>

                <button
                  onClick={() => setActivePage("collections")}
                  className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-left text-sm text-slate-300 hover:border-blue-500 hover:text-white"
                >
                  <span className="font-medium">Collections</span>
                  <span className="mt-1 block text-xs text-slate-500">Ask AI across papers</span>
                </button>
              </div>

              <div className="border border-slate-800 bg-slate-900 rounded-2xl p-8 mb-6">

                <h3 className="text-xl font-semibold mb-2">
                  Add a research paper
                </h3>

                <p className="text-sm text-slate-400 mb-6">
                  Upload a PDF to extract, index, and search its content.
                </p>

                <label className="inline-block">

                  <span
                    className={`inline-block rounded-lg px-5 py-3 text-sm font-medium ${
                      uploading
                        ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-500 cursor-pointer"
                    }`}
                  >
                    {uploading
                      ? "Processing..."
                      : "Upload PDF"}
                  </span>

                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="hidden"
                  />

                </label>

                {uploadMessage && (
                  <div className="mt-4 rounded-lg bg-slate-800 px-4 py-3 text-sm text-slate-300">
                    {uploadMessage}
                  </div>
                )}

              </div>

              <div className="border border-slate-800 bg-slate-900 rounded-2xl p-8">

                <h3 className="text-xl font-semibold mb-2">
                  Ask your research
                </h3>

                <p className="text-sm text-slate-400 mb-5">
                  Ask a question and ResearchLens will retrieve
                  relevant information from your documents.
                </p>

                <div className="flex gap-3">

                  <input
                    type="text"
                    value={query}
                    onChange={(event) =>
                      setQuery(event.target.value)
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        handleAskQuestion()
                      }
                    }}
                    placeholder="What does this research paper conclude?"
                    className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  />

                  <button
                    onClick={handleAskQuestion}
                    disabled={
                      asking || !query.trim()
                    }
                    className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium hover:bg-blue-500 disabled:opacity-50"
                  >
                    {asking
                      ? "Thinking..."
                      : "Ask AI"}
                  </button>

                </div>

                {answer && (
                  <div className="mt-6">

                    <h4 className="text-sm font-semibold text-blue-400 mb-2">
                      Answer
                    </h4>

                    <div className="rounded-lg border border-slate-800 bg-slate-950 p-5 text-sm leading-6 text-slate-300">
                      {answer}
                    </div>

                  </div>
                )}

                {sources.length > 0 && (
                  <div className="mt-6">

                    <h4 className="text-sm font-semibold text-blue-400 mb-3">
                      Sources
                    </h4>

                    <div className="space-y-3">

                      {sources.map((source) => (
                        <div
                          key={source.chunk_id}
                          className="rounded-lg border border-slate-800 bg-slate-950 p-4"
                        >

                          <div className="flex justify-between mb-2">

                            <span className="text-xs font-medium text-slate-400">
                              Source {source.source_number}
                            </span>

                            <span className="text-xs text-slate-500">
                              Similarity: {source.similarity}
                            </span>

                          </div>

                          <p className="text-sm text-slate-400">
                            {source.content}
                          </p>

                        </div>
                      ))}

                    </div>

                  </div>
                )}

              </div>
            </>
          )}

          {/* ================= GLOBAL SEARCH ================= */}
          {activePage === "search" && (
            <>
              <div className="mb-10">
                <p className="text-sm text-blue-400 mb-2">
                  Semantic Search
                </p>

                <h2 className="text-4xl font-bold">
                  Search your research.
                </h2>

                <p className="text-slate-400 mt-3 max-w-2xl">
                  Search across all uploaded research papers using
                  semantic similarity.
                </p>
              </div>

              <div className="border border-slate-800 bg-slate-900 rounded-2xl p-8">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={globalSearchQuery}
                    onChange={(event) =>
                      setGlobalSearchQuery(event.target.value)
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        handleGlobalSearch()
                      }
                    }}
                    placeholder="Search for a concept, method, finding..."
                    className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  />

                  <button
                    onClick={handleGlobalSearch}
                    disabled={
                      globalSearchLoading ||
                      !globalSearchQuery.trim()
                    }
                    className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium hover:bg-blue-500 disabled:opacity-50"
                  >
                    {globalSearchLoading
                      ? "Searching..."
                      : "Search"}
                  </button>
                </div>

                {globalSearchError && (
                  <div className="mt-4 rounded-lg bg-slate-800 px-4 py-3 text-sm text-red-400">
                    {globalSearchError}
                  </div>
                )}

                {globalSearchResults.length > 0 && (
                  <div className="mt-8">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-lg font-semibold">
                        Search Results
                      </h3>

                      <span className="text-xs text-slate-500">
                        {globalSearchResults.length} results
                      </span>
                    </div>

                    <div className="space-y-4">
                      {globalSearchResults.map(
                        (result: any, index: number) => {
                          const documentId =
                            result.document_id ??
                            result.document?.id

                          const documentName =
                            result.filename ??
                            result.document?.filename ??
                            documents.find(
                              (document) =>
                                document.id === documentId
                            )?.filename ??
                            `Document ${documentId ?? ""}`

                          const similarity =
                            typeof result.similarity === "number"
                              ? result.similarity
                              : null

                          return (
                            <button
                              key={
                                result.chunk_id ??
                                `${documentId}-${result.chunk_index}-${index}`
                              }
                              onClick={() => {
                                if (documentId) {
                                  handleOpenDocument(documentId)
                                  setActivePage("documents")
                                }
                              }}
                              className="w-full text-left rounded-xl border border-slate-800 bg-slate-950 p-5 transition hover:border-blue-500 hover:bg-slate-900"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <p className="text-sm font-medium text-blue-400">
                                    {documentName}
                                  </p>

                                  <p className="mt-2 text-xs text-slate-500">
                                    Chunk{" "}
                                    {typeof result.chunk_index ===
                                    "number"
                                      ? result.chunk_index + 1
                                      : "—"}
                                  </p>
                                </div>

                                {similarity !== null && (
                                  <span className="shrink-0 rounded-md bg-blue-500/10 px-3 py-1 text-xs text-blue-400">
                                    Similarity:{" "}
                                    {similarity.toFixed(4)}
                                  </span>
                                )}
                              </div>

                              <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-300">
                                {result.content ??
                                  result.text ??
                                  "No content preview available."}
                              </p>
                            </button>
                          )
                        }
                      )}
                    </div>
                  </div>
                )}

                {!globalSearchLoading &&
                  !globalSearchError &&
                  globalSearchQuery.trim() &&
                  globalSearchResults.length === 0 && (
                    <div className="mt-8 rounded-lg border border-dashed border-slate-700 px-5 py-10 text-center">
                      <p className="text-sm text-slate-500">
                        No matching research content found.
                      </p>
                    </div>
                  )}

                {!globalSearchQuery.trim() && (
                  <div className="mt-8 rounded-lg border border-dashed border-slate-700 px-5 py-10 text-center">
                    <p className="text-sm text-slate-500">
                      Enter a research concept to search across your
                      documents.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ================= DOCUMENTS ================= */}
          {activePage === "documents" && (
            <>
              <div className="mb-10">

                <p className="text-sm text-blue-400 mb-2">
                  Research Library
                </p>

                <h2 className="text-4xl font-bold">
                  Your Documents
                </h2>

                <p className="text-slate-400 mt-3 max-w-2xl">
                  View all research papers uploaded to your
                  ResearchLens workspace.
                </p>

              </div>

              <div className="border border-slate-800 bg-slate-900 rounded-2xl p-8">

                <div className="flex items-center justify-between mb-6">

                  <h3 className="text-xl font-semibold">
                    Research Papers
                  </h3>

                  <span className="text-sm text-slate-500">
                    {documents.length}{" "}
                    {documents.length === 1
                      ? "document"
                      : "documents"}
                  </span>

                </div>

                {documentsLoading ? (
                  <div className="text-sm text-slate-400">
                    Loading documents...
                  </div>
                ) : documentsError ? (
                  <div className="rounded-lg bg-slate-800 px-4 py-3 text-sm text-red-400">
                    {documentsError}
                  </div>
                ) : documents.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-slate-700 px-5 py-10 text-center">

                    <p className="text-sm text-slate-400">
                      No documents uploaded yet.
                    </p>

                    <button
                      onClick={() =>
                        setActivePage("dashboard")
                      }
                      className="mt-4 rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium hover:bg-blue-500"
                    >
                      Upload your first PDF
                    </button>

                  </div>
                ) : (
                  <div className="space-y-3">

{documents.map((document) => (
                      <div
                        key={document.id}
                        className="rounded-lg border border-slate-800 bg-slate-950 px-5 py-4 transition hover:border-blue-500"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <button
                            onClick={() => handleOpenDocument(document.id)}
                            className="flex min-w-0 flex-1 items-center gap-4 text-left"
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-400 text-xs font-semibold">
                              PDF
                            </div>

                            <div className="min-w-0">
                              {editingDocumentId === document.id ? (
                                <input
                                  autoFocus
                                  value={editingFilename}
                                  onChange={(event) =>
                                    setEditingFilename(event.target.value)
                                  }
                                  onKeyDown={(event) => {
                                    if (event.key === "Enter") {
                                      handleRenameDocument(document.id)
                                    }
                                    if (event.key === "Escape") {
                                      setEditingDocumentId(null)
                                      setEditingFilename("")
                                    }
                                  }}
                                  onClick={(event) => event.stopPropagation()}
                                  className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-slate-200 outline-none focus:border-blue-500"
                                />
                              ) : (
                                <p className="truncate text-sm font-medium text-slate-200">
                                  {document.filename}
                                </p>
                              )}

                              <p className="text-xs text-slate-500 mt-1">
                                Uploaded{" "}
                                {new Date(
                                  document.uploaded_at
                                ).toLocaleString()}
                              </p>
                            </div>
                          </button>

                          <div className="flex shrink-0 items-center gap-2">
                            {editingDocumentId === document.id ? (
                              <>
                                <button
                                  onClick={() =>
                                    handleRenameDocument(document.id)
                                  }
                                  disabled={documentActionLoading === document.id}
                                  className="rounded-md bg-blue-600 px-3 py-2 text-xs font-medium hover:bg-blue-500 disabled:opacity-50"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingDocumentId(null)
                                    setEditingFilename("")
                                  }}
                                  className="rounded-md border border-slate-700 px-3 py-2 text-xs text-slate-400 hover:text-white"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => {
                                    setEditingDocumentId(document.id)
                                    setEditingFilename(document.filename)
                                  }}
                                  className="rounded-md border border-slate-700 px-3 py-2 text-xs text-slate-400 hover:text-white"
                                >
                                  Rename
                                </button>

                                <button
                                  onClick={() =>
                                    handleDeleteDocument(document.id)
                                  }
                                  disabled={documentActionLoading === document.id}
                                  className="rounded-md border border-red-500/30 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                                >
                                  {documentActionLoading === document.id
                                    ? "..."
                                    : "Delete"}
                                </button>
                              </>
                            )}

                            <span className="text-xs text-green-400">
                              Indexed
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}

                    {documentDetailsLoading && (
                      <div className="mt-6 rounded-lg border border-slate-800 bg-slate-950 p-6">
                        <p className="text-sm text-slate-400">
                          Loading document details...
                        </p>
                      </div>
                    )}

                    {selectedDocument && !documentDetailsLoading && (
                      <div className="mt-6 rounded-lg border border-slate-800 bg-slate-950 p-6">
                        <div className="mb-6 flex items-center justify-between">
                          <button
                            onClick={() => {
                              setSelectedDocument(null)
                              setDocumentSearch("")
                              setRelatedDocuments([])
                              setRelatedDocumentsError("")
                            }}
                            className="text-sm text-slate-400 hover:text-white"
                          >
                            ← Back to Documents
                          </button>

                          <button
                            onClick={handleAskAboutDocument}
                            className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium hover:bg-blue-500"
                          >
                            Ask AI about this document
                          </button>
                        </div>

                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-lg font-semibold text-slate-100">
                              {selectedDocument.filename}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              Uploaded{" "}
                              {new Date(
                                selectedDocument.uploaded_at
                              ).toLocaleString()}
                            </p>
                          </div>

                          <span className="rounded-md bg-blue-500/10 px-3 py-1 text-xs text-blue-400">
                            {selectedDocument.chunk_count} chunks
                          </span>
                        </div>

                        <div className="mt-6 rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <h3 className="text-sm font-semibold text-slate-100">
                                AI Summary
                              </h3>
                              <p className="mt-1 text-xs text-slate-500">
                                Generate a structured summary of this document with Gemini.
                              </p>
                            </div>

                            <button
                              onClick={handleGenerateSummary}
                              disabled={documentSummaryLoading}
                              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {documentSummaryLoading ? "Generating..." : "Generate AI Summary"}
                            </button>
                          </div>

                          {documentSummaryError && (
                            <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                              {documentSummaryError}
                            </div>
                          )}

                          {documentSummary && (
                            <div className="mt-5 rounded-lg border border-slate-800 bg-slate-950 p-5">
                              <h4 className="mb-3 text-sm font-semibold text-slate-200">
                                Generated Summary
                              </h4>
                              <div className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
                                {documentSummary}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="mt-6 rounded-xl border border-purple-500/20 bg-purple-500/5 p-5">
                          <div>
                            <h3 className="text-sm font-semibold text-slate-100">
                              Research Insights
                            </h3>
                            <p className="mt-1 text-xs text-slate-500">
                              Extract research-focused information from this document.
                            </p>
                          </div>

                          <div className="mt-4 grid gap-3 md:grid-cols-3">
                            <button
                              onClick={handleGenerateKeyPoints}
                              disabled={keyPointsLoading}
                              className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-medium text-slate-200 hover:border-blue-500 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {keyPointsLoading
                                ? "Generating..."
                                : "Generate Key Points"}
                            </button>

                            <button
                              onClick={handleGenerateResearchInsights}
                              disabled={researchInsightsLoading}
                              className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-medium text-slate-200 hover:border-blue-500 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {researchInsightsLoading
                                ? "Generating..."
                                : "Research Insights"}
                            </button>

                            <button
                              onClick={handleGenerateLimitationsFutureWork}
                              disabled={limitationsFutureWorkLoading}
                              className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-medium text-slate-200 hover:border-blue-500 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {limitationsFutureWorkLoading
                                ? "Analyzing..."
                                : "Limitations & Future Work"}
                            </button>
                          </div>

                          {keyPointsError && (
                            <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                              {keyPointsError}
                            </div>
                          )}

                          {keyPoints && (
                            <div className="mt-5 rounded-lg border border-slate-800 bg-slate-950 p-5">
                              <h4 className="mb-3 text-sm font-semibold text-blue-400">
                                Key Points
                              </h4>
                              <div className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
                                {keyPoints}
                              </div>
                            </div>
                          )}

                          {researchInsightsError && (
                            <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                              {researchInsightsError}
                            </div>
                          )}

                          {researchInsights && (
                            <div className="mt-5 rounded-lg border border-slate-800 bg-slate-950 p-5">
                              <h4 className="mb-3 text-sm font-semibold text-blue-400">
                                Research Insights
                              </h4>
                              <div className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
                                {researchInsights}
                              </div>
                            </div>
                          )}

                          {limitationsFutureWorkError && (
                            <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                              {limitationsFutureWorkError}
                            </div>
                          )}

                          {limitationsFutureWork && (
                            <div className="mt-5 rounded-lg border border-slate-800 bg-slate-950 p-5">
                              <h4 className="mb-3 text-sm font-semibold text-blue-400">
                                Limitations & Future Work
                              </h4>
                              <div className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
                                {limitationsFutureWork}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <h3 className="text-sm font-semibold text-slate-100">
                                Related Research
                              </h3>
                              <p className="mt-1 text-xs text-slate-500">
                                Find other documents in your library that are semantically similar to this document.
                              </p>
                            </div>

                            <button
                              onClick={handleLoadRelatedDocuments}
                              disabled={relatedDocumentsLoading}
                              className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {relatedDocumentsLoading
                                ? "Finding..."
                                : "Find Related Research"}
                            </button>
                          </div>

                          {relatedDocumentsError && (
                            <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                              {relatedDocumentsError}
                            </div>
                          )}

                          {!relatedDocumentsLoading &&
                            !relatedDocumentsError &&
                            relatedDocuments.length === 0 && (
                              <p className="mt-4 text-sm text-slate-500">
                                Click "Find Related Research" to discover similar documents.
                              </p>
                            )}

                          {relatedDocuments.length > 0 && (
                            <div className="mt-5 space-y-3">
                              {relatedDocuments.map((relatedDocument) => (
                                <button
                                  key={relatedDocument.id}
                                  onClick={() =>
                                    handleOpenDocument(relatedDocument.id)
                                  }
                                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-4 text-left transition hover:border-emerald-500/50 hover:bg-slate-900"
                                >
                                  <div className="flex items-center justify-between gap-4">
                                    <div className="min-w-0">
                                      <p className="truncate text-sm font-medium text-slate-200">
                                        {relatedDocument.filename}
                                      </p>
                                      <p className="mt-1 text-xs text-slate-500">
                                        Uploaded{" "}
                                        {new Date(
                                          relatedDocument.uploaded_at
                                        ).toLocaleString()}
                                      </p>
                                    </div>

                                    <span className="shrink-0 rounded-md bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                                      {(relatedDocument.similarity * 100).toFixed(1)}% similar
                                    </span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="mt-6">
                          <h3 className="text-sm font-semibold text-slate-200">
                            Extracted Content
                          </h3>

                          <input
                            type="text"
                            value={documentSearch}
                            onChange={(event) =>
                              setDocumentSearch(event.target.value)
                            }
                            placeholder="Search within this document..."
                            className="mt-3 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-300 outline-none focus:border-blue-500"
                          />

                          <p className="mt-2 text-xs text-slate-500">
                            {documentSearch.trim()
                              ? `${filteredDocumentChunks.length} matching ${
                                  filteredDocumentChunks.length === 1
                                    ? "chunk"
                                    : "chunks"
                                }`
                              : `${selectedDocument.chunks.length} chunks`}
                          </p>

                          <div className="mt-3 space-y-3">
                            {filteredDocumentChunks.map((chunk: any) => (
                              <div
                                key={chunk.id}
                                className="rounded-lg border border-slate-800 bg-slate-900 p-4"
                              >
                                <p className="mb-2 text-xs text-slate-500">
                                  Chunk {chunk.chunk_index + 1}
                                </p>

                                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-300">
                                  {chunk.content}
                                </p>
                              </div>
                            ))}

                            {documentSearch.trim() &&
                              filteredDocumentChunks.length === 0 && (
                                <div className="rounded-lg border border-dashed border-slate-700 px-5 py-8 text-center">
                                  <p className="text-sm text-slate-500">
                                    No matching content found.
                                  </p>
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                    )}


                  </div>
                )}

              </div>
            </>
          )}

          {/* ================= DOCUMENT COMPARISON ================= */}
          {activePage === "compare" && (
            <>
              <div className="mb-10">
                <p className="text-sm text-blue-400 mb-2">
                  AI Document Analysis
                </p>

                <h2 className="text-4xl font-bold">
                  Compare Research Documents
                </h2>

                <p className="text-slate-400 mt-3 max-w-2xl">
                  Select two uploaded documents and let ResearchLens identify
                  their similarities, differences, methodologies, findings,
                  and conclusions.
                </p>
              </div>

              <div className="border border-slate-800 bg-slate-900 rounded-2xl p-8">
                {documents.length < 2 ? (
                  <div className="rounded-lg border border-dashed border-slate-700 px-5 py-10 text-center">
                    <p className="text-sm text-slate-400">
                      Upload at least two documents to compare them.
                    </p>
                    <button
                      onClick={() => setActivePage("dashboard")}
                      className="mt-4 rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium hover:bg-blue-500"
                    >
                      Upload a PDF
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Document A
                        </label>
                        <select
                          value={comparisonDocumentA ?? ""}
                          onChange={(event) =>
                            setComparisonDocumentA(
                              event.target.value
                                ? Number(event.target.value)
                                : null
                            )
                          }
                          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-300 outline-none focus:border-blue-500"
                        >
                          <option value="">Select Document A</option>
                          {documents.map((document) => (
                            <option key={document.id} value={document.id}>
                              {document.filename}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Document B
                        </label>
                        <select
                          value={comparisonDocumentB ?? ""}
                          onChange={(event) =>
                            setComparisonDocumentB(
                              event.target.value
                                ? Number(event.target.value)
                                : null
                            )
                          }
                          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-300 outline-none focus:border-blue-500"
                        >
                          <option value="">Select Document B</option>
                          {documents.map((document) => (
                            <option key={document.id} value={document.id}>
                              {document.filename}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {comparisonDocumentA !== null &&
                      comparisonDocumentA === comparisonDocumentB && (
                        <div className="mt-4 rounded-lg border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-400">
                          Please select two different documents.
                        </div>
                      )}

                    <button
                      onClick={handleCompareDocuments}
                      disabled={
                        comparisonLoading ||
                        comparisonDocumentA === null ||
                        comparisonDocumentB === null ||
                        comparisonDocumentA === comparisonDocumentB
                      }
                      className="mt-6 rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {comparisonLoading
                        ? "Comparing..."
                        : "Compare Documents"}
                    </button>

                    {comparisonError && (
                      <div className="mt-5 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                        {comparisonError}
                      </div>
                    )}

                    {comparisonResult && (
                      <div className="mt-8">
                        <div className="mb-4">
                          <h3 className="text-xl font-semibold">
                            AI Comparison
                          </h3>
                          {comparisonNames && (
                            <p className="mt-1 text-sm text-slate-500">
                              {comparisonNames.document_a.filename} vs{" "}
                              {comparisonNames.document_b.filename}
                            </p>
                          )}
                        </div>

                        <div className="rounded-xl border border-slate-800 bg-slate-950 p-6">
                          <div className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
                            {comparisonResult}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}

          {/* ================= COLLECTIONS ================= */}
          {activePage === "collections" && (
            <>
              <div className="mb-10">
                <p className="text-sm text-blue-400 mb-2">
                  Research Organization
                </p>

                <h2 className="text-4xl font-bold">
                  Your Collections
                </h2>

                <p className="text-slate-400 mt-3 max-w-2xl">
                  Group your research papers into collections for easier organization.
                </p>
              </div>

              <div className="border border-slate-800 bg-slate-900 rounded-2xl p-6 mb-6">
                <h3 className="text-lg font-semibold mb-3">
                  Create a collection
                </h3>

                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newCollectionName}
                    onChange={(event) => setNewCollectionName(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        handleCreateCollection()
                      }
                    }}
                    placeholder="e.g. AI Research Papers"
                    className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  />

                  <button
                    onClick={handleCreateCollection}
                    disabled={collectionCreating || !newCollectionName.trim()}
                    className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium hover:bg-blue-500 disabled:opacity-50"
                  >
                    {collectionCreating ? "Creating..." : "Create"}
                  </button>
                </div>
              </div>

              {collectionsError && (
                <div className="mb-6 rounded-lg bg-slate-800 px-4 py-3 text-sm text-red-400">
                  {collectionsError}
                </div>
              )}

              {collectionLoading && (
                <div className="mb-6 rounded-lg border border-slate-800 bg-slate-900 p-6 text-sm text-slate-400">
                  Loading collection...
                </div>
              )}

              {!selectedCollection && !collectionLoading && (
                <div className="border border-slate-800 bg-slate-900 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-semibold">
                      Collections
                    </h3>
                    <span className="text-xs text-slate-500">
                      {collections.length} {collections.length === 1 ? "collection" : "collections"}
                    </span>
                  </div>

                  {collectionsLoading ? (
                    <p className="text-sm text-slate-400">Loading collections...</p>
                  ) : collections.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-slate-700 px-5 py-10 text-center">
                      <p className="text-sm text-slate-500">
                        No collections yet. Create your first one above.
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {collections.map((collection) => (
                        <button
                          key={collection.id}
                          onClick={() => handleOpenCollection(collection.id)}
                          className="w-full rounded-xl border border-slate-800 bg-slate-950 p-5 text-left transition hover:border-blue-500 hover:bg-slate-900"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <p className="font-medium text-slate-200">
                                {collection.name}
                              </p>
                              <p className="mt-2 text-xs text-slate-500">
                                Created {new Date(collection.created_at).toLocaleString()}
                              </p>
                            </div>
                            <span className="text-blue-400">→</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {selectedCollection && !collectionLoading && (
                <div className="border border-slate-800 bg-slate-900 rounded-2xl p-6">
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div>
                      <button
                        onClick={() => {
                          setSelectedCollection(null)
                          setCollectionsError("")
                        }}
                        className="text-sm text-slate-400 hover:text-white mb-4"
                      >
                        ← Back to Collections
                      </button>
                      <h3 className="text-2xl font-semibold">
                        {selectedCollection.name}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">
                        {selectedCollection.documents.length} {selectedCollection.documents.length === 1 ? "document" : "documents"}
                      </p>
                    </div>
                  </div>

                  <div className="mb-8 rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">
                    <div className="mb-4">
                      <h4 className="text-lg font-semibold text-slate-100">
                        Ask AI about this collection
                      </h4>
                      <p className="mt-1 text-sm text-slate-500">
                        Ask questions across all documents in this collection.
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={collectionQuery}
                        onChange={(event) =>
                          setCollectionQuery(event.target.value)
                        }
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            handleAskCollection()
                          }
                        }}
                        placeholder="What are the common findings across these papers?"
                        className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
                      />

                      <button
                        onClick={handleAskCollection}
                        disabled={
                          collectionAiLoading || !collectionQuery.trim()
                        }
                        className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium hover:bg-blue-500 disabled:opacity-50"
                      >
                        {collectionAiLoading ? "Thinking..." : "Ask AI"}
                      </button>
                    </div>

                    {collectionAiError && (
                      <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                        {collectionAiError}
                      </div>
                    )}

                    {collectionAnswer && (
                      <div className="mt-5">
                        <h5 className="mb-2 text-sm font-semibold text-blue-400">
                          Answer
                        </h5>
                        <div className="rounded-lg border border-slate-800 bg-slate-950 p-5 text-sm leading-7 text-slate-300 whitespace-pre-wrap">
                          {collectionAnswer}
                        </div>
                      </div>
                    )}

                    {collectionSources.length > 0 && (
                      <div className="mt-5">
                        <h5 className="mb-3 text-sm font-semibold text-blue-400">
                          Collection Sources
                        </h5>
                        <div className="space-y-2">
                          {collectionSources.slice(0, 5).map((source, index) => (
                            <div
                              key={`${source.chunk_id}-${index}`}
                              className="rounded-lg border border-slate-800 bg-slate-950 px-4 py-3"
                            >
                              <p className="text-xs font-medium text-slate-400">
                                Source {index + 1}
                              </p>
                              <p className="mt-1 text-sm text-slate-300">
                                {source.filename}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                Chunk {source.chunk_index}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mb-8">
                    <h4 className="text-sm font-semibold text-slate-200 mb-3">
                      Documents in this collection
                    </h4>

                    {selectedCollection.documents.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-slate-700 px-5 py-8 text-center">
                        <p className="text-sm text-slate-500">
                          No documents in this collection yet.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {selectedCollection.documents.map((document: DocumentItem) => (
                          <div
                            key={document.id}
                            className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950 px-4 py-3"
                          >
                            <button
                              onClick={() => {
                                handleOpenDocument(document.id)
                                setActivePage("documents")
                              }}
                              className="flex items-center gap-3 text-left min-w-0"
                            >
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-xs font-semibold text-red-400">
                                PDF
                              </span>
                              <span className="truncate text-sm text-slate-200">
                                {document.filename}
                              </span>
                            </button>

                            <button
                              onClick={() => handleRemoveDocumentFromCollection(document.id)}
                              disabled={collectionActionLoading === document.id}
                              className="ml-4 shrink-0 rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-50"
                            >
                              {collectionActionLoading === document.id ? "Removing..." : "Remove"}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-slate-200 mb-3">
                      Add a document
                    </h4>

                    {documents.filter(
                      (document) =>
                        !selectedCollection.documents.some(
                          (item: DocumentItem) => item.id === document.id
                        )
                    ).length === 0 ? (
                      <p className="text-sm text-slate-500">
                        All your uploaded documents are already in this collection.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {documents
                          .filter(
                            (document) =>
                              !selectedCollection.documents.some(
                                (item: DocumentItem) => item.id === document.id
                              )
                          )
                          .map((document) => (
                            <div
                              key={document.id}
                              className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950 px-4 py-3"
                            >
                              <span className="truncate text-sm text-slate-300">
                                {document.filename}
                              </span>

                              <button
                                onClick={() => handleAddDocumentToCollection(document.id)}
                                disabled={collectionActionLoading === document.id}
                                className="ml-4 shrink-0 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium hover:bg-blue-500 disabled:opacity-50"
                              >
                                {collectionActionLoading === document.id ? "Adding..." : "Add"}
                              </button>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ================= CHAT ================= */}
          {activePage === "chat" && (
            <>
              <div className="mb-8 flex items-start justify-between">

                <div>

                  <p className="text-sm text-blue-400 mb-2">
                    AI Research Assistant
                  </p>

                  <h2 className="text-4xl font-bold">
                    Chat with your research.
                  </h2>

                  <p className="text-slate-400 mt-3 max-w-2xl">
                    Ask questions about your uploaded research papers
                    and continue the conversation naturally.
                  </p>

                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleClearChat}
                    className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-white"
                  >
                    + New Chat
                  </button>

                  {chatMessages.length > 0 && (
                    <button
                      onClick={handleClearChat}
                      className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-white"
                    >
                      Clear chat
                    </button>
                  )}
                </div>

              </div>

              {/* ================= CHAT HISTORY ================= */}
              <div className="mb-6 border border-slate-800 bg-slate-900 rounded-2xl p-6">

                <div className="flex items-center justify-between mb-4">

                  <div>
                    <h3 className="text-lg font-semibold">
                      Chat History
                    </h3>

                    <p className="text-xs text-slate-500 mt-1">
                      Your previous research conversations.
                    </p>
                  </div>

                  {chatHistory.length > 0 && (
                    <span className="text-xs text-slate-500">
                      {chatHistory.length}{" "}
                      {chatHistory.length === 1
                        ? "conversation"
                        : "conversations"}
                    </span>
                  )}

                </div>

                {chatHistoryLoading && (
                  <div className="text-sm text-slate-400">
                    Loading chat history...
                  </div>
                )}

                {chatHistoryError && (
                  <div className="rounded-lg bg-slate-800 px-4 py-3 text-sm text-red-400">
                    {chatHistoryError}
                  </div>
                )}

                {!chatHistoryLoading &&
                  !chatHistoryError &&
                  chatHistory.length === 0 && (
                    <div className="rounded-lg border border-dashed border-slate-700 px-5 py-8 text-center">
                      <p className="text-sm text-slate-500">
                        No previous chats yet.
                      </p>
                    </div>
                  )}

                {!chatHistoryLoading &&
                  !chatHistoryError &&
                  chatHistory.length > 0 && (
                    <div className="space-y-2">

                      {chatHistory.map((chat) => (
                        <button
                          key={chat.id}
                          onClick={() =>
                            handleOpenChat(chat.id)
                          }
                          className={`w-full text-left rounded-lg border px-4 py-3 transition ${
                            chat.id === chatId
                              ? "border-blue-500 bg-blue-500/10"
                              : "border-slate-800 bg-slate-950 hover:bg-slate-800"
                          }`}
                        >

                          <p className="text-sm font-medium text-slate-200">
                            {chat.title}
                          </p>

                          <p className="text-xs text-slate-500 mt-1">
                            {new Date(
                              chat.created_at
                            ).toLocaleString()}
                          </p>

                        </button>
                      ))}

                    </div>
                  )}

              </div>

              {/* ================= CURRENT CHAT ================= */}
              <div className="border border-slate-800 bg-slate-900 rounded-2xl p-6">

                {chatMessages.length === 0 && (
                  <div className="py-16 text-center">

                    <div className="text-4xl mb-4">
                      💬
                    </div>

                    <h3 className="text-lg font-semibold">
                      Start a research conversation
                    </h3>

                    <p className="text-sm text-slate-500 mt-2">
                      Ask a question about any of your uploaded documents.
                    </p>

                  </div>
                )}

                {chatMessages.length > 0 && (
                  <div className="space-y-6 mb-8">

                    {chatMessages.map((message) => (

                      <div
                        key={message.id}
                        className={
                          message.role === "user"
                            ? "flex justify-end"
                            : "flex justify-start"
                        }
                      >

                        <div
                          className={
                            message.role === "user"
                              ? "max-w-3xl rounded-2xl bg-blue-600 px-5 py-4"
                              : "max-w-3xl rounded-2xl border border-slate-800 bg-slate-950 px-5 py-4"
                          }
                        >

                          <div className="mb-2">

                            <span
                              className={
                                message.role === "user"
                                  ? "text-xs font-medium text-blue-100"
                                  : "text-xs font-medium text-blue-400"
                              }
                            >
                              {message.role === "user"
                                ? "You"
                                : "ResearchLens AI"}
                            </span>

                          </div>

                          <p
                            className={
                              message.role === "user"
                                ? "text-sm leading-6 text-white whitespace-pre-wrap"
                                : "text-sm leading-7 text-slate-300 whitespace-pre-wrap"
                            }
                          >
                            {message.content}
                          </p>

                          {message.role === "assistant" &&
                            message.sources &&
                            message.sources.length > 0 && (
                              <div className="mt-5 pt-4 border-t border-slate-800">

                                <p className="text-xs font-semibold text-blue-400 mb-3">
                                  Supporting Sources
                                </p>

                                <div className="space-y-3">

                                  {message.sources.map(
                                    (source) => (
                                      <div
                                        key={source.chunk_id}
                                        className="rounded-lg border border-slate-800 bg-slate-900 p-4"
                                      >

                                        <div className="flex items-center justify-between mb-2">

                                          <span className="text-xs font-medium text-slate-300">
                                            Source{" "}
                                            {source.source_number}
                                          </span>

                                          <span className="text-xs text-slate-500">
                                            Similarity:{" "}
                                            {source.similarity}
                                          </span>

                                        </div>

                                        <p className="text-xs leading-5 text-slate-400">
                                          {source.content}
                                        </p>

                                      </div>
                                    )
                                  )}

                                </div>

                              </div>
                            )}

                        </div>

                      </div>

                    ))}

                  </div>
                )}

                {chatAsking && (
                  <div className="flex justify-start mb-6">

                    <div className="max-w-3xl rounded-2xl border border-slate-800 bg-slate-950 px-5 py-4">

                      <div className="flex items-center gap-3">

                        <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />

                        <p className="text-sm text-slate-400">
                          ResearchLens is searching your documents...
                        </p>

                      </div>

                    </div>

                  </div>
                )}

                <div className="border-t border-slate-800 pt-6">

                  <div className="mb-4">
                    <label className="block text-xs font-medium text-slate-400 mb-2">
                      Ask about a specific document
                    </label>
                    <select
                      value={selectedDocumentId ?? ""}
                      onChange={(event) =>
                        setSelectedDocumentId(
                          event.target.value
                            ? Number(event.target.value)
                            : null
                        )
                      }
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-300 outline-none focus:border-blue-500"
                    >
                      <option value="">All documents</option>
                      {documents.map((document) => (
                        <option key={document.id} value={document.id}>
                          {document.filename}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-3">

                    <input
                      type="text"
                      value={chatQuery}
                      onChange={(event) =>
                        setChatQuery(event.target.value)
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          handleChatQuestion()
                        }
                      }}
                      placeholder="Ask something about your research..."
                      disabled={chatAsking}
                      className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500 disabled:opacity-50"
                    />

                    <button
                      onClick={handleChatQuestion}
                      disabled={
                        chatAsking ||
                        !chatQuery.trim()
                      }
                      className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium hover:bg-blue-500 disabled:opacity-50"
                    >
                      {chatAsking
                        ? "Thinking..."
                        : "Ask AI"}
                    </button>

                  </div>

                  <p className="text-xs text-slate-600 mt-3">
                    Press Enter to send your question.
                  </p>

                </div>

              </div>
            </>
          )}

        </div>

      </main>

    </div>
  )
}

function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true)

  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault()

    setMessage("")
    setLoading(true)

    try {
      if (isLogin) {
        const data = await loginUser(
          email,
          password
        )

        localStorage.setItem(
          "researchlens_token",
          data.access_token
        )

        setMessage("Login successful!")

        window.location.reload()
      } else {
        const data = await registerUser(
          email,
          username,
          password
        )

        setMessage(
          data.message ||
          "Registration successful!"
        )

        setIsLogin(true)
        setUsername("")
      }
    } catch (error) {
      if (error instanceof Error) {
        setMessage(error.message)
      } else {
        setMessage(
          "Something went wrong."
        )
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">

      <div className="w-full max-w-md">

        <div className="text-center mb-8">

          <h1 className="text-3xl font-bold">
            ResearchLens AI
          </h1>

          <p className="text-slate-400 mt-2">
            Research & Knowledge Workspace
          </p>

        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">

          <h2 className="text-2xl font-semibold mb-2">
            {isLogin
              ? "Welcome back"
              : "Create your account"}
          </h2>

          <p className="text-sm text-slate-400 mb-6">
            {isLogin
              ? "Sign in to access your research workspace."
              : "Create an account to start organizing your research."}
          </p>

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >

            {!isLogin && (
              <div>

                <label className="block text-sm text-slate-300 mb-2">
                  Username
                </label>

                <input
                  type="text"
                  value={username}
                  onChange={(event) =>
                    setUsername(event.target.value)
                  }
                  required
                  minLength={3}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
                  placeholder="Your username"
                />

              </div>
            )}

            <div>

              <label className="block text-sm text-slate-300 mb-2">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
                placeholder="you@example.com"
              />

            </div>

            <div>

              <label className="block text-sm text-slate-300 mb-2">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                required
                minLength={8}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
                placeholder="••••••••"
              />

            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-5 py-3 font-medium hover:bg-blue-500 disabled:opacity-50"
            >
              {loading
                ? "Please wait..."
                : isLogin
                  ? "Sign In"
                  : "Create Account"}
            </button>

          </form>

          {message && (
            <div className="mt-4 rounded-lg bg-slate-800 px-4 py-3 text-sm text-slate-300">
              {message}
            </div>
          )}

          <div className="mt-6 text-center text-sm text-slate-400">

            {isLogin
              ? "Don't have an account?"
              : "Already have an account?"}

            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin)
                setMessage("")
              }}
              className="ml-2 text-blue-400 hover:text-blue-300"
            >
              {isLogin
                ? "Create one"
                : "Sign in"}
            </button>

          </div>

        </div>

      </div>

    </div>
  )
}

function App() {
  const [isAuthenticated, setIsAuthenticated] =
    useState(
      Boolean(
        localStorage.getItem(
          "researchlens_token"
        )
      )
    )

  function handleLogout() {
    localStorage.removeItem(
      "researchlens_token"
    )

    setIsAuthenticated(false)
  }

  if (isAuthenticated) {
    return (
      <Dashboard
        onLogout={handleLogout}
      />
    )
  }

  return <AuthScreen />
}

export default App