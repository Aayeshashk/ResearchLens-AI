const API_BASE_URL = "https://researchlens-api.vercel.app"


export async function registerUser(
  email: string,
  username: string,
  password: string
) {
  const response = await fetch(
    `${API_BASE_URL}/auth/register`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        username,
        password,
      }),
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.detail || "Registration failed"
    )
  }

  return data
}


export async function loginUser(
  email: string,
  password: string
) {
  const response = await fetch(
    `${API_BASE_URL}/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.detail || "Login failed"
    )
  }

  return data
}


export async function uploadDocument(
  file: File,
  token: string
) {
  const formData = new FormData()

  formData.append(
    "file",
    file
  )

  const response = await fetch(
    `${API_BASE_URL}/documents/upload`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.detail || "Upload failed"
    )
  }

  return data
}


export async function getDocuments(
  token: string
) {
  const response = await fetch(
    `${API_BASE_URL}/documents/`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.detail || "Failed to fetch documents"
    )
  }

  return data
}


export async function askQuestion(
  query: string,
  token: string,
  topK = 5,
  chatId?: number,
  documentId?: number
) {
  const response = await fetch(
    `${API_BASE_URL}/chat/ask`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query,
        top_k: topK,
        chat_id: chatId ?? null,
        document_id: documentId ?? null,
      }),
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.detail || "Question failed"
    )
  }

  return data
}


export async function getChatHistory(
  token: string
) {
  const response = await fetch(
    `${API_BASE_URL}/chat/`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.detail || "Failed to fetch chat history"
    )
  }

  return data
}


export async function getChat(
  chatId: number,
  token: string
) {
  const response = await fetch(
    `${API_BASE_URL}/chat/${chatId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.detail || "Failed to fetch chat"
    )
  }

  return data
}
export async function getDocument(
  documentId: number,
  token: string
) {
  const response = await fetch(
    `${API_BASE_URL}/documents/${documentId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.detail || "Failed to fetch document"
    )
  }

  return data
}