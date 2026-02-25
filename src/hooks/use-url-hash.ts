import { useCallback, useEffect, useState } from 'react'
import { compressCode, decompressCode } from '../lib/url-codec'

interface UrlHashState {
  readonly isViewerMode: boolean
  readonly codeFromHash: string | null
  readonly getShareUrl: (code: string) => Promise<string>
}

function readHash(): string {
  return window.location.hash.slice(1)
}

export function useUrlHash(): UrlHashState {
  const [hash, setHashRaw] = useState(readHash)
  const [codeFromHash, setCodeFromHash] = useState<string | null>(null)
  const [prevHash, setPrevHash] = useState('')

  useEffect(() => {
    function onHashChange() {
      setHashRaw(readHash())
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const isViewerMode = hash.length > 0

  // Clear synchronously during render when hash becomes empty
  if (hash !== prevHash) {
    setPrevHash(hash)
    if (!hash) {
      setCodeFromHash(null)
    }
  }

  // Async decompress when hash changes to a non-empty value
  useEffect(() => {
    if (!hash) return
    decompressCode(hash).then(setCodeFromHash)
  }, [hash])

  const getShareUrl = useCallback(async (code: string) => {
    const compressed = await compressCode(code)
    return `${window.location.origin}${window.location.pathname}#${compressed}`
  }, [])

  return { isViewerMode, codeFromHash, getShareUrl }
}
