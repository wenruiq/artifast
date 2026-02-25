import { useCallback, useEffect, useMemo, useState } from 'react'
import { CodeEditor } from '../components/code-editor'
import { ErrorPanel } from '../components/error-panel'
import { ImportWarnings } from '../components/import-warnings'
import { LibraryBadgeList } from '../components/library-badge-list'
import { PreviewFrame } from '../components/preview-frame'
import { Toolbar } from '../components/toolbar'
import { useDebouncedCode } from '../hooks/use-debounced-code'
import { useSandbox } from '../hooks/use-sandbox'
import { useUrlHash } from '../hooks/use-url-hash'
import { cleanCode } from '../lib/code-cleaner'
import { findComponentName } from '../lib/component-finder'
import { rewriteImports } from '../lib/import-rewriter'

export function CreatorPage() {
  const [rawCode, setRawCode] = useState('')
  const [errorDismissed, setErrorDismissed] = useState(false)
  const [prevError, setPrevError] = useState<string | null>(null)
  const debouncedCode = useDebouncedCode(rawCode)
  const { iframeRef, isReady, error, errorType, sendRender, sendClear } =
    useSandbox()
  const { getShareUrl } = useUrlHash()

  // Auto-reopen when a new error arrives (computed during render, not in effect)
  if (error !== prevError) {
    setPrevError(error)
    if (error) {
      setErrorDismissed(false)
    }
  }

  const transformedResult = useMemo(() => {
    if (!debouncedCode.trim()) return null

    const cleaned = cleanCode(debouncedCode)
    const { rewrittenCode, warnings: importWarnings } =
      rewriteImports(cleaned)
    const componentName = findComponentName(rewrittenCode)

    return {
      code: rewrittenCode,
      componentName,
      warnings: importWarnings,
    }
  }, [debouncedCode])

  // Derive warnings from transformedResult instead of storing in state
  const warnings = useMemo(
    () => transformedResult?.warnings ?? [],
    [transformedResult],
  )

  // Side effect only: communicate with sandbox iframe
  useEffect(() => {
    if (!transformedResult) {
      sendClear()
      return
    }

    sendRender(transformedResult.code, transformedResult.componentName)
  }, [transformedResult, sendRender, sendClear])

  const handleCodeChange = useCallback((code: string) => {
    setRawCode(code)
  }, [])

  const handleDismissError = useCallback(() => {
    setErrorDismissed(true)
  }, [])

  return (
    <div className="flex h-screen flex-col bg-zinc-950">
      <Toolbar code={rawCode} getShareUrl={getShareUrl} />
      <ImportWarnings warnings={warnings} />
      <div className="flex min-h-0 flex-1">
        <div className="w-1/2 border-r border-zinc-800">
          <CodeEditor code={rawCode} onChange={handleCodeChange} />
        </div>
        <div className="w-1/2">
          <PreviewFrame iframeRef={iframeRef} isReady={isReady} />
        </div>
      </div>
      {!errorDismissed && (
        <ErrorPanel
          error={error}
          errorType={errorType}
          onDismiss={handleDismissError}
        />
      )}
      <LibraryBadgeList />
    </div>
  )
}
