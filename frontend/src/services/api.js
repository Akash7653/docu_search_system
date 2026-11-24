const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8001'

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    let message = 'The backend could not complete the request.'
    try {
      const body = await response.json()
      if (typeof body.detail === 'string') {
        message = body.detail
      }
    } catch {
      // Keep the friendly fallback when the server does not return JSON.
    }
    throw new Error(message)
  }

  return response.json()
}

export function searchByKeyword(query) {
  return request(`/documents/search?q=${encodeURIComponent(query)}`)
}

export function searchByQuestion(query) {
  return request('/documents/query', {
    method: 'POST',
    body: JSON.stringify({ query }),
  })
}

export function listDocuments() {
  return request('/documents?limit=100')
}

export function getDocument(id) {
  return request(`/documents/${encodeURIComponent(id)}`)
}

export function createDocument(document) {
  return request('/documents', {
    method: 'POST',
    body: JSON.stringify(document),
  })
}

export function updateDocument(id, document) {
  return request(`/documents/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(document),
  })
}

export function deleteDocument(id) {
  return request(`/documents/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}
