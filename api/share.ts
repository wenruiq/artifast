import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'
import { nanoid } from 'nanoid'

const MAX_CODE_SIZE = 500_000

const redis = Redis.fromEnv()

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, '1 h'),
  prefix: 'ratelimit:share',
})

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const ip =
      req.headers['x-forwarded-for']?.toString().split(',')[0]?.trim() ??
      'anonymous'

    const { success, remaining, reset } = await ratelimit.limit(ip)

    res.setHeader('X-RateLimit-Remaining', remaining)
    res.setHeader('X-RateLimit-Reset', reset)

    if (!success) {
      return res.status(429).json({ error: 'Too many requests' })
    }

    const { code } = req.body as { code?: string }

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid "code" field' })
    }

    if (code.length > MAX_CODE_SIZE) {
      return res.status(413).json({ error: 'Code exceeds maximum size' })
    }

    const id = nanoid(12)
    await redis.set(`paste:${id}`, code)

    return res.status(201).json({ id })
  } catch (error) {
    console.error('Failed to store paste:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
