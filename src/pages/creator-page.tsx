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
import { isHtmlDocument } from '../lib/html-detector'
import { rewriteImports } from '../lib/import-rewriter'

export function CreatorPage() {
  const [rawCode, setRawCode] = useState('')
  const [editorCollapsed, setEditorCollapsed] = useState(false)
  const [errorDismissed, setErrorDismissed] = useState(false)
  const [prevError, setPrevError] = useState<string | null>(null)
  const debouncedCode = useDebouncedCode(rawCode)
  const {
    iframeRef,
    isReady,
    error,
    errorType,
    sendRender,
    sendHtml,
    sendClear,
  } = useSandbox()
  const { getShareUrl } = useUrlHash()

  // Auto-reopen when a new error arrives (computed during render, not in effect)
  if (error !== prevError) {
    setPrevError(error)
    if (error) {
      setErrorDismissed(false)
    }
  }

  const isHtml = useMemo(
    () => isHtmlDocument(debouncedCode),
    [debouncedCode],
  )

  const transformedResult = useMemo(() => {
    if (!debouncedCode.trim() || isHtml) return null

    const cleaned = cleanCode(debouncedCode)
    const { rewrittenCode, warnings: importWarnings } =
      rewriteImports(cleaned)
    const componentName = findComponentName(rewrittenCode)

    return {
      code: rewrittenCode,
      componentName,
      warnings: importWarnings,
    }
  }, [debouncedCode, isHtml])

  // Derive warnings from transformedResult instead of storing in state
  const warnings = useMemo(
    () => transformedResult?.warnings ?? [],
    [transformedResult],
  )

  // Side effect: communicate with sandbox iframe
  useEffect(() => {
    const trimmed = debouncedCode.trim()

    if (!trimmed) {
      sendClear()
      return
    }

    if (isHtml) {
      sendHtml(trimmed)
      return
    }

    if (transformedResult) {
      sendRender(transformedResult.code, transformedResult.componentName)
    }
  }, [debouncedCode, isHtml, transformedResult, sendRender, sendHtml, sendClear])

  const handleCodeChange = useCallback((code: string) => {
    setRawCode(code)
  }, [])

  const handleDismissError = useCallback(() => {
    setErrorDismissed(true)
  }, [])

  const handleToggleEditor = useCallback(() => {
    setEditorCollapsed((prev) => !prev)
  }, [])

  return (
    <div className="flex h-screen flex-col bg-zinc-950">
      <Toolbar
        code={rawCode}
        getShareUrl={getShareUrl}
        editorCollapsed={editorCollapsed}
        onToggleEditor={handleToggleEditor}
      />
      {!isHtml && <ImportWarnings warnings={warnings} />}
      <div className="flex min-h-0 flex-1">
        <div
          className={`border-r border-zinc-800 transition-all duration-300 ${
            editorCollapsed ? 'w-0 overflow-hidden' : 'w-1/2'
          }`}
        >
          <CodeEditor code={rawCode} onChange={handleCodeChange} />
        </div>
        <div className={`transition-all duration-300 ${editorCollapsed ? 'w-full' : 'w-1/2'}`}>
          <PreviewFrame
            iframeRef={iframeRef}
            isReady={isReady}
            isHtmlMode={isHtml}
          />
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
