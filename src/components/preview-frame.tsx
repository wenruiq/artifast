import type { RefObject } from 'react'

interface PreviewFrameProps {
  readonly iframeRef: RefObject<HTMLIFrameElement | null>
  readonly isReady: boolean
  readonly isHtmlMode?: boolean
}

export function PreviewFrame({
  iframeRef,
  isReady,
  isHtmlMode = false,
}: PreviewFrameProps) {
  const showLoading = !isReady && !isHtmlMode

  return (
    <div className="relative h-full w-full bg-zinc-900">
      {showLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="flex items-center gap-2.5">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-400" />
            <span className="text-sm text-zinc-500">Loading sandbox...</span>
          </div>
        </div>
      )}
      <iframe
        ref={iframeRef}
        src="/sandbox.html"
        sandbox="allow-scripts allow-same-origin"
        title="Artifact Preview"
        className={`h-full w-full border-0 transition-opacity duration-300 ${
          isReady || isHtmlMode ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  )
}
