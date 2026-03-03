import { useCallback, useEffect, useState } from 'react'
import { compressCode, decompressCode } from '../lib/url-codec'
import { createPaste, fetchPaste, PasteSizeExceededError } from '../lib/paste-api'

const PASTE_PREFIX = 'p:'

interface UrlHashState {
  readonly isViewerMode: boolean
  readonly codeFromHash: string | null
  readonly isLoading: boolean
  readonly getShareUrl: (code: string) => Promise<string>
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

  const getShareUrl = useCallback(async (code: string) => {
    try {
      const id = await createPaste(code)
      return `${window.location.origin}${window.location.pathname}#${PASTE_PREFIX}${id}`
    } catch (error) {
      if (error instanceof PasteSizeExceededError) throw error
      const compressed = await compressCode(code)
      return `${window.location.origin}${window.location.pathname}#${compressed}`
    }
  }, [])

  return { isViewerMode, codeFromHash, isLoading, getShareUrl }
}
