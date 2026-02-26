import { useCallback, useEffect, useMemo } from 'react'
import { ErrorPanel } from '../components/error-panel'
import { PreviewFrame } from '../components/preview-frame'
import { useSandbox } from '../hooks/use-sandbox'
import { useUrlHash } from '../hooks/use-url-hash'
import { isHtmlDocument } from '../lib/html-detector'
import { cleanCode } from '../lib/code-cleaner'
import { findComponentName } from '../lib/component-finder'
import { rewriteImports } from '../lib/import-rewriter'

export function ViewerPage() {
  const { codeFromHash, isLoading } = useUrlHash()
  const {
    iframeRef,
    isReady,
    hasContent,
    error,
    errorType,
    sendRender,
    sendHtml,
  } = useSandbox()

  const isHtml = useMemo(
    () => (codeFromHash ? isHtmlDocument(codeFromHash) : false),
    [codeFromHash],
  )

  const transformedResult = useMemo(() => {
    if (!codeFromHash || isHtml) return null

    const cleaned = cleanCode(codeFromHash)
    const { rewrittenCode } = rewriteImports(cleaned)
    const componentName = findComponentName(rewrittenCode)

    return { code: rewrittenCode, componentName }
  }, [codeFromHash, isHtml])

  useEffect(() => {
    if (!codeFromHash) return

    if (isHtml) {
      sendHtml(codeFromHash)
      return
    }

    if (transformedResult) {
      sendRender(transformedResult.code, transformedResult.componentName)
    }
  }, [codeFromHash, isHtml, transformedResult, sendRender, sendHtml])

  const handleRemix = useCallback(() => {
    if (codeFromHash) {
      sessionStorage.setItem('artifast-remix', codeFromHash)
      window.location.hash = ''
    }
  }, [codeFromHash])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950 text-zinc-400">
        Loading artifact...
      </div>
    )
  }

  if (!codeFromHash) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950 text-zinc-400">
        Invalid or expired artifact link.
      </div>
    )
  }

  return (
    <div className="relative h-screen">
      <PreviewFrame
        iframeRef={iframeRef}
        isReady={isReady}
        hasContent={hasContent}
        hasError={error !== null}
      />
      <ErrorPanel error={error} errorType={errorType} />
      <button
        type="button"
        onClick={handleRemix}
        className="fixed bottom-3 left-3 z-50 rounded-md bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-200 opacity-60 transition-all hover:bg-zinc-700 hover:opacity-100"
      >
        Remix
      </button>
    </div>
  )
}
