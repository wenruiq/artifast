import { useCallback, useEffect, useRef, useState } from 'react'
import { compressCode, decompressCode } from '../lib/url-codec'
import { createPaste, fetchPaste, PasteSizeExceededError } from '../lib/paste-api'

const PASTE_PREFIX = 'p:'

export interface ShareResult {
  readonly url: string
  readonly existing: boolean
}

interface UrlHashState {
  readonly isViewerMode: boolean
  readonly codeFromHash: string | null
  readonly isLoading: boolean
  readonly getShareUrl: (code: string) => Promise<ShareResult>
  readonly getCachedShareUrl: (code: string) => ShareResult | null
}

function readHash(): string {
  return window.location.hash.slice(1)
}

function isPasteHash(hash: string): boolean {
  return hash.startsWith(PASTE_PREFIX)
}

function extractPasteId(hash: string): string {
  return hash.slice(PASTE_PREFIX.length)
}

export function useUrlHash(): UrlHashState {
  const [hash, setHashRaw] = useState(readHash)
  const [codeFromHash, setCodeFromHash] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [prevHash, setPrevHash] = useState('')
  const shareCacheRef = useRef(new Map<string, ShareResult>())
  const inflightRef = useRef(new Map<string, Promise<ShareResult>>())

  useEffect(() => {
    function onHashChange() {
      setHashRaw(readHash())
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const isViewerMode = hash.length > 0

  if (hash !== prevHash) {
    setPrevHash(hash)
    if (!hash) {
      setCodeFromHash(null)
    }
  }

  useEffect(() => {
    if (!hash) return

    let cancelled = false
    const isPaste = isPasteHash(hash)

    if (isPaste) {
      setIsLoading(true)
    }

    async function resolve() {
      let code: string | null = null

      if (isPaste) {
        code = await fetchPaste(extractPasteId(hash))
      } else {
        code = await decompressCode(hash)
      }

      if (!cancelled) {
        setCodeFromHash(code)
        setIsLoading(false)
      }
    }

    resolve()
    return () => {
      cancelled = true
    }
  }, [hash])

  const getShareUrl = useCallback((code: string): Promise<ShareResult> => {
    const cached = shareCacheRef.current.get(code)
    if (cached) return Promise.resolve(cached)

    const inflight = inflightRef.current.get(code)
    if (inflight) return inflight

    const promise = (async (): Promise<ShareResult> => {
      try {
        const result = await createPaste(code)
        const url = `${window.location.origin}${window.location.pathname}#${PASTE_PREFIX}${result.id}`
        const shareResult: ShareResult = { url, existing: result.existing }
        shareCacheRef.current.set(code, shareResult)
        return shareResult
      } catch (error) {
        if (error instanceof PasteSizeExceededError) throw error
        const compressed = await compressCode(code)
        return { url: `${window.location.origin}${window.location.pathname}#${compressed}`, existing: false }
      } finally {
        inflightRef.current.delete(code)
      }
    })()

    inflightRef.current.set(code, promise)
    return promise
  }, [])

  const getCachedShareUrl = useCallback((code: string): ShareResult | null => {
    return shareCacheRef.current.get(code) ?? null
  }, [])

  return { isViewerMode, codeFromHash, isLoading, getShareUrl, getCachedShareUrl }
}
