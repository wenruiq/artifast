import { useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'
import { shortenUrl } from '../lib/url-shortener'

const MAX_SHAREABLE_URL_LENGTH = 8000

interface ToolbarProps {
  readonly code: string
  readonly getShareUrl: (code: string) => Promise<string>
  readonly editorCollapsed: boolean
  readonly onRestoreEditor: () => void
  readonly onCollapseEditor: () => void
}

export function Toolbar({ code, getShareUrl, editorCollapsed, onRestoreEditor, onCollapseEditor }: ToolbarProps) {
  const [isSharing, setIsSharing] = useState(false)
  const isSharingRef = useRef(false)

  const handleShare = useCallback(async () => {
    if (!code.trim() || isSharingRef.current) return

    isSharingRef.current = true
    setIsSharing(true)
    try {
      const longUrl = await getShareUrl(code)

      if (longUrl.length > MAX_SHAREABLE_URL_LENGTH) {
        toast.warning('Code is too large to share as a link')
        return
      }

      try {
        const shortUrl = await shortenUrl(longUrl)
        await navigator.clipboard.writeText(shortUrl)
        toast.success('Link copied to clipboard')
      } catch {
        await navigator.clipboard.writeText(longUrl)
        toast.success('Long link copied to clipboard')
      }
    } catch {
      toast.error('Failed to generate share link')
    } finally {
      isSharingRef.current = false
      setIsSharing(false)
    }
  }, [code, getShareUrl])

  const handleOpenNewTab = useCallback(async () => {
    if (!code.trim()) return
    const url = await getShareUrl(code)
    window.open(url, '_blank')
  }, [code, getShareUrl])

  return (
    <header className="flex h-12 items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={editorCollapsed ? onRestoreEditor : onCollapseEditor}
          className="rounded-md bg-zinc-800 px-2 py-1 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
          title={editorCollapsed ? 'Show editor' : 'Hide editor'}
        >
          {editorCollapsed ? '\u00BB' : '\u00AB'}
        </button>
        <h1 className="text-base font-semibold text-zinc-100 tracking-tight">
          Artifast
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleShare}
          disabled={!code.trim() || isSharing}
          className="rounded-md bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-200 transition-colors hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSharing ? 'Shortening...' : 'Share'}
        </button>
        <button
          type="button"
          onClick={handleOpenNewTab}
          disabled={!code.trim()}
          className="rounded-md bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-200 transition-colors hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed"
          title="Open in new tab"
        >
          ↗
        </button>
      </div>
    </header>
  )
}
