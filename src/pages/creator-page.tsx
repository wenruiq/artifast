import { useCallback, useEffect, useMemo, useState } from "react";
import { CodeEditor } from "../components/code-editor";
import { ErrorPanel } from "../components/error-panel";
import { ImportWarnings } from "../components/import-warnings";
import { LibraryBadgeList } from "../components/library-badge-list";
import { PreviewFrame } from "../components/preview-frame";
import { Toolbar } from "../components/toolbar";
import { EXAMPLE_CODE } from "../constants/example-code";
import { useDebouncedCode } from "../hooks/use-debounced-code";
import { usePanelResize } from "../hooks/use-panel-resize";
import { useSandbox } from "../hooks/use-sandbox";
import { useShare } from "../hooks/use-share";
import { cleanCode } from "../lib/code-cleaner";
import { findComponentName } from "../lib/component-finder";
import { isHtmlDocument } from "../lib/html-detector";
import { rewriteImports } from "../lib/import-rewriter";
import { cn } from "../lib/utils";

export function CreatorPage() {
  const [rawCode, setRawCode] = useState(() => {
    const remix = sessionStorage.getItem("artifast-remix");
    if (remix) {
      sessionStorage.removeItem("artifast-remix");
      return remix;
    }
    return "";
  });
  const [errorDismissed, setErrorDismissed] = useState(false);
  const [vimMode, setVimMode] = useState(false);
  const [prevError, setPrevError] = useState<string | null>(null);
  const debouncedCode = useDebouncedCode(rawCode);
  const {
    iframeRef,
    isReady,
    error,
    errorType,
    hasContent,
    sendRender,
    sendHtml,
    sendClear,
  } = useSandbox();
  const shareHook = useShare();
  const {
    widthPercent,
    isCollapsed,
    isDragging,
    containerRef,
    handleMouseDown,
    handleDoubleClick,
    restore,
    collapse,
  } = usePanelResize();

  // Auto-reopen when a new error arrives (computed during render, not in effect)
  if (error !== prevError) {
    setPrevError(error);
    if (error) {
      setErrorDismissed(false);
    }
  }

  const isHtml = useMemo(() => isHtmlDocument(debouncedCode), [debouncedCode]);

  const transformedResult = useMemo(() => {
    if (!debouncedCode.trim() || isHtml) {
      return null;
    }

    const cleaned = cleanCode(debouncedCode);
    const { rewrittenCode, warnings: importWarnings } = rewriteImports(cleaned);
    let componentName = findComponentName(rewrittenCode);
    let finalCode = rewrittenCode;

    // If no component was detected, wrap the code in one.
    // Handles bare JSX like `<div>Hello</div>` or expressions.
    if (!componentName) {
      finalCode = `function App() {\n  return (\n${rewrittenCode}\n  );\n}`;
      componentName = "App";
    }

    return {
      code: finalCode,
      componentName,
      warnings: importWarnings,
    };
  }, [debouncedCode, isHtml]);

  // Derive warnings from transformedResult instead of storing in state
  const warnings = useMemo(
    () => transformedResult?.warnings ?? [],
    [transformedResult]
  );

  // Side effect: communicate with sandbox iframe
  useEffect(() => {
    const trimmed = debouncedCode.trim();

    if (!trimmed) {
      sendClear();
      return;
    }

    if (isHtml) {
      sendHtml(trimmed);
      return;
    }

    if (transformedResult) {
      sendRender(transformedResult.code, transformedResult.componentName);
    }
  }, [
    debouncedCode,
    isHtml,
    transformedResult,
    sendRender,
    sendHtml,
    sendClear,
  ]);

  const handleDismissError = useCallback(() => {
    setErrorDismissed(true);
  }, []);

  const handleLoadExample = useCallback(() => {
    setRawCode(EXAMPLE_CODE);
  }, []);

  return (
    <div className="flex h-screen flex-col bg-zinc-950">
      <Toolbar
        code={rawCode}
        editorCollapsed={isCollapsed}
        onCollapseEditor={collapse}
        onRestoreEditor={restore}
        shareHook={shareHook}
      />
      {isHtml ? null : <ImportWarnings warnings={warnings} />}
      <div
        className={cn(
          "flex min-h-0 flex-1",
          isDragging && "cursor-col-resize select-none"
        )}
        ref={containerRef}
      >
        <div
          className={
            isCollapsed ? "w-0 overflow-hidden" : "border-zinc-800 border-r"
          }
          style={isCollapsed ? undefined : { width: `${widthPercent}%` }}
        >
          <CodeEditor code={rawCode} onChange={setRawCode} vimMode={vimMode} />
        </div>
        <hr
          aria-valuenow={Math.round(widthPercent)}
          className={cn(
            "z-20 shrink-0 cursor-col-resize border-none bg-zinc-900 px-1 transition-colors hover:bg-blue-500/40 active:bg-blue-500/60",
            isCollapsed ? "hidden" : "box-content w-1.5",
            isDragging && "bg-blue-500/60"
          )}
          onDoubleClick={handleDoubleClick}
          onMouseDown={handleMouseDown}
          style={{ marginLeft: "-4px", marginRight: "-4px" }}
          tabIndex={0}
        />
        <div className="relative min-w-0 flex-1">
          {isDragging && <div className="absolute inset-0 z-10" />}
          <PreviewFrame
            hasContent={hasContent}
            hasError={error !== null}
            iframeRef={iframeRef}
            isReady={isReady}
            onLoadExample={handleLoadExample}
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
      <LibraryBadgeList
        onToggleVim={() => setVimMode((v) => !v)}
        vimMode={vimMode}
      />
    </div>
  );
}
