import { useEffect, useMemo } from 'react'
import { ErrorPanel } from '../components/error-panel'
import { PreviewFrame } from '../components/preview-frame'
import { useSandbox } from '../hooks/use-sandbox'
import { useUrlHash } from '../hooks/use-url-hash'
import { isHtmlDocument } from '../lib/html-detector'
import { cleanCode } from '../lib/code-cleaner'
import { findComponentName } from '../lib/component-finder'
import { rewriteImports } from '../lib/import-rewriter'

export function ViewerPage() {
  const { codeFromHash } = useUrlHash()
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

  if (!codeFromHash) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950 text-zinc-400">
        Invalid or empty artifact link.
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
    </div>
  )
}
