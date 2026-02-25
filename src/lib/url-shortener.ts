export async function shortenUrl(longUrl: string): Promise<string> {
  try {
    const endpoint = `https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`
    const response = await fetch(endpoint)

    if (!response.ok) {
      return longUrl
    }

    const shortUrl = await response.text()

    if (!shortUrl.startsWith('http')) {
      return longUrl
    }

    return shortUrl
  } catch {
    return longUrl
  }
}
