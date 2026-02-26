import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Redis } from '@upstash/redis'
import { nanoid } from 'nanoid'

const TTL_SECONDS = 90 * 24 * 60 * 60

const MAX_CODE_SIZE = 500_000

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const redis = Redis.fromEnv()
    const { code } = req.body as { code?: string }

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid "code" field' })
    }

    if (code.length > MAX_CODE_SIZE) {
      return res.status(413).json({ error: 'Code exceeds maximum size' })
    }

    const id = nanoid(12)
    await redis.set(`paste:${id}`, code, { ex: TTL_SECONDS })

    return res.status(201).json({ id })
  } catch (error) {
    console.error('Failed to store paste:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
