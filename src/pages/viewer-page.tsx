import { useCallback, useEffect, useMemo, useState } from "react";
import { ErrorPanel } from "../components/error-panel";
import { PreviewFrame } from "../components/preview-frame";
import { Button } from "../components/ui/button";
import { useHashState } from "../hooks/use-hash-state";
import { useResolveHash } from "../hooks/use-resolve-hash";
import { useSandbox } from "../hooks/use-sandbox";
import { cleanCode } from "../lib/code-cleaner";
import { findComponentName, isLowercaseName } from "../lib/component-finder";
import { isHtmlDocument } from "../lib/html-detector";
import { rewriteImports } from "../lib/import-rewriter";

export function ViewerPage() {
  const { isViewerMode } = useHashState();
  const { code: codeFromHash, isLoading } = useResolveHash();
  const {
    iframeRef,
    isReady,
    hasContent,
    error,
    errorType,
    sendRender,
    sendHtml,
  } = useSandbox();
  const [errorDismissed, setErrorDismissed] = useState(false);
  const [prevError, setPrevError] = useState<string | null>(null);

  // Auto-reopen when a new error arrives
  if (error !== prevError) {
    setPrevError(error);
    if (error) {
      setErrorDismissed(false);
    }
  }

  const isHtml = useMemo(
    () => (codeFromHash ? isHtmlDocument(codeFromHash) : false),
    [codeFromHash]
  );

  const transformedResult = useMemo(() => {
    if (!codeFromHash || isHtml) {
      return null;
    }

    const cleaned = cleanCode(codeFromHash);
    const { rewrittenCode, libraries } = rewriteImports(cleaned);
    let componentName = findComponentName(rewrittenCode);
    let finalCode = rewrittenCode;

    if (!componentName) {
      finalCode = `function App() {\n  return (\n${rewrittenCode}\n  );\n}`;
      componentName = "App";
    } else if (isLowercaseName(componentName)) {
      finalCode = `${rewrittenCode}\nconst _AliasedComponent = ${componentName};`;
      componentName = "_AliasedComponent";
    }

    return { code: finalCode, componentName, libraries };
  }, [codeFromHash, isHtml]);

  useEffect(() => {
    if (!codeFromHash) {
      return;
    }

    if (isHtml) {
      sendHtml(codeFromHash);
      return;
    }

    if (transformedResult) {
      sendRender(
        transformedResult.code,
        transformedResult.componentName,
        transformedResult.libraries
      );
    }
  }, [codeFromHash, isHtml, transformedResult, sendRender, sendHtml]);

  const handleRemix = useCallback(() => {
    if (codeFromHash) {
      sessionStorage.setItem("artifast-remix", codeFromHash);
      window.location.hash = "";
    }
  }, [codeFromHash]);

  const handleDismissError = useCallback(() => {
    setErrorDismissed(true);
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950 text-zinc-400">
        Loading artifact...
      </div>
    );
  }

  if (!codeFromHash && isViewerMode) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950 text-zinc-400">
        Invalid or expired artifact link.
      </div>
    );
  }

  return (
    <div className="relative h-screen">
      <PreviewFrame
        hasContent={hasContent}
        hasError={error !== null}
        iframeRef={iframeRef}
        isReady={isReady}
      />
      {!errorDismissed && (
        <ErrorPanel
          error={error}
          errorType={errorType}
          onDismiss={handleDismissError}
        />
      )}
      <Button
        className="fixed bottom-3 left-3 z-50 opacity-60 hover:opacity-100"
        onClick={handleRemix}
        size="xs"
        variant="ghost"
      >
        Remix
      </Button>
    </div>
  );
}
