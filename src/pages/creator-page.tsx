import { useCallback, useEffect, useMemo, useState } from 'react'
import { CodeEditor } from '../components/code-editor'
import { ErrorPanel } from '../components/error-panel'
import { ImportWarnings } from '../components/import-warnings'
import { LibraryBadgeList } from '../components/library-badge-list'
import { PreviewFrame } from '../components/preview-frame'
import { Toolbar } from '../components/toolbar'
import { useDebouncedCode } from '../hooks/use-debounced-code'
import { usePanelResize } from '../hooks/use-panel-resize'
import { useSandbox } from '../hooks/use-sandbox'
import { useUrlHash } from '../hooks/use-url-hash'
import { cleanCode } from '../lib/code-cleaner'
import { findComponentName } from '../lib/component-finder'
import { isHtmlDocument } from '../lib/html-detector'
import { rewriteImports } from '../lib/import-rewriter'

export function CreatorPage() {
  const [rawCode, setRawCode] = useState('')
  const [errorDismissed, setErrorDismissed] = useState(false)
  const [prevError, setPrevError] = useState<string | null>(null)
  const debouncedCode = useDebouncedCode(rawCode)
  const {
    iframeRef,
    isReady,
    error,
    errorType,
    hasContent,
    sendRender,
    sendHtml,
    sendClear,
  } = useSandbox()
  const { getShareUrl } = useUrlHash()
  const {
    widthPercent,
    isCollapsed,
    isDragging,
    containerRef,
    handleMouseDown,
    handleDoubleClick,
    restore,
    collapse,
  } = usePanelResize()

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

  return (
    <div className="flex h-screen flex-col bg-zinc-950">
      <Toolbar
        code={rawCode}
        getShareUrl={getShareUrl}
        editorCollapsed={isCollapsed}
        onRestoreEditor={restore}
        onCollapseEditor={collapse}
      />
      {isHtml ? null : <ImportWarnings warnings={warnings} />}
      <div
        ref={containerRef}
        className={`flex min-h-0 flex-1${isDragging ? ' cursor-col-resize select-none' : ''}`}
      >
        <div
          className={isCollapsed ? 'w-0 overflow-hidden' : 'border-r border-zinc-800'}
          style={isCollapsed ? undefined : { width: `${widthPercent}%` }}
        >
          <CodeEditor code={rawCode} onChange={handleCodeChange} />
        </div>
        <div
          role="separator"
          onMouseDown={handleMouseDown}
          onDoubleClick={handleDoubleClick}
          className={`shrink-0 cursor-col-resize bg-zinc-900 transition-colors hover:bg-blue-500/40 active:bg-blue-500/60${
            isCollapsed ? ' hidden' : ' w-1.5'
          }${isDragging ? ' bg-blue-500/60' : ''}`}
        />
        <div className="relative min-w-0 flex-1">
          {isDragging && <div className="absolute inset-0 z-10" />}
          <PreviewFrame
            iframeRef={iframeRef}
            isReady={isReady}
            hasContent={hasContent}
            hasError={error !== null}
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
