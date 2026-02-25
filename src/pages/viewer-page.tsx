import { useEffect, useMemo } from 'react'
import { ErrorPanel } from '../components/error-panel'
import { PreviewFrame } from '../components/preview-frame'
import { useSandbox } from '../hooks/use-sandbox'
import { useUrlHash } from '../hooks/use-url-hash'
import { cleanCode } from '../lib/code-cleaner'
import { findComponentName } from '../lib/component-finder'
import { rewriteImports } from '../lib/import-rewriter'

export function ViewerPage() {
  const { codeFromHash } = useUrlHash()
  const { iframeRef, isReady, error, errorType, sendRender } = useSandbox()

  const transformedResult = useMemo(() => {
    if (!codeFromHash) return null

    const cleaned = cleanCode(codeFromHash)
    const { rewrittenCode } = rewriteImports(cleaned)
    const componentName = findComponentName(rewrittenCode)

    return { code: rewrittenCode, componentName }
  }, [codeFromHash])

  useEffect(() => {
    if (!transformedResult) return
    sendRender(transformedResult.code, transformedResult.componentName)
  }, [transformedResult, sendRender])

  if (!codeFromHash) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950 text-zinc-400">
        Invalid or empty artifact link.
      </div>
    )
  }

  return (
    <div className="relative h-screen">
      <PreviewFrame iframeRef={iframeRef} isReady={isReady} />
      <ErrorPanel error={error} errorType={errorType} />
    </div>
  )
}
