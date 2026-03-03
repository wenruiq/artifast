interface ShareResponse {
  readonly id: string
}

interface PasteResponse {
  readonly code: string
}

export class PasteSizeExceededError extends Error {
  constructor() {
    super('Code is too large to share (max 500 KB)')
    this.name = 'PasteSizeExceededError'
  }
}

export async function createPaste(code: string): Promise<string> {
  const response = await fetch('/api/share', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  })

  if (response.status === 413) {
    throw new PasteSizeExceededError()
  }

  if (!response.ok) {
    throw new Error(`Share failed: ${response.status}`)
  }

  const data = (await response.json()) as ShareResponse
  return data.id
}

export async function fetchPaste(id: string): Promise<string | null> {
  try {
    const response = await fetch(
      `/api/paste/${encodeURIComponent(id)}`,
    )

    if (response.status === 404) {
      return null
    }

    if (!response.ok) {
      throw new Error(`Fetch failed: ${response.status}`)
    }

    const data = (await response.json()) as PasteResponse
    return data.code
  } catch {
    return null
  }
}
