import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { shortenUrl } from '../lib/url-shortener'

interface ToolbarProps {
  readonly code: string
  readonly getShareUrl: (code: string) => Promise<string>
}

export function Toolbar({ code, getShareUrl }: ToolbarProps) {
  const [isSharing, setIsSharing] = useState(false)

  const handleShare = useCallback(async () => {
    if (!code.trim() || isSharing) return

    setIsSharing(true)
    try {
      const longUrl = await getShareUrl(code)
      const shortUrl = await shortenUrl(longUrl)
      await navigator.clipboard.writeText(shortUrl)
      toast.success('Link copied to clipboard')
    } catch {
      try {
        const longUrl = await getShareUrl(code)
        await navigator.clipboard.writeText(longUrl)
        toast.success('Link copied to clipboard')
      } catch {
        toast.error('Failed to copy link')
      }
    } finally {
      setIsSharing(false)
    }
  }, [code, getShareUrl, isSharing])

  const handleOpenNewTab = useCallback(async () => {
    if (!code.trim()) return
    const url = await getShareUrl(code)
    window.open(url, '_blank')
  }, [code, getShareUrl])

  return (
    <header className="flex h-12 items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4">
      <h1 className="text-base font-semibold text-zinc-100 tracking-tight">
        Artifast
      </h1>
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
