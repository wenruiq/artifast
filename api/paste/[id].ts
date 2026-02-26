import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Redis } from '@upstash/redis'

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { id } = req.query

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Missing paste ID' })
    }

    if (!/^[A-Za-z0-9_-]{12}$/.test(id)) {
      return res.status(400).json({ error: 'Invalid paste ID format' })
    }

    const redis = Redis.fromEnv()
    const code = await redis.get<string>(`paste:${id}`)

    if (code === null) {
      return res.status(404).json({ error: 'Paste not found or expired' })
    }

    res.setHeader(
      'Cache-Control',
      's-maxage=3600, stale-while-revalidate=86400',
    )

    return res.status(200).json({ code })
  } catch (error) {
    console.error('Failed to retrieve paste:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
