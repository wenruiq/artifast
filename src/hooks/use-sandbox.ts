import { useCallback, useEffect, useRef, useState } from "react";
import type { ParentMessage, SandboxMessage } from "../types";

interface SandboxState {
  readonly error: string | null;
  readonly errorType: "render-error" | "transpile-error" | null;
  readonly hasContent: boolean;
  readonly iframeRef: React.RefObject<HTMLIFrameElement | null>;
  readonly isReady: boolean;
  readonly sendClear: () => void;
  readonly sendHtml: (html: string) => void;
  readonly sendRender: (code: string, componentName: string) => void;
}

export function useSandbox(): SandboxState {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [hasContent, setHasContent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<
    "render-error" | "transpile-error" | null
  >(null);
  const pendingRef = useRef<ParentMessage | null>(null);
  const htmlModeRef = useRef(false);
  const blobUrlRef = useRef<string | null>(null);
  // rerender-defer-reads: use ref so callbacks don't depend on isReady state
  const isReadyRef = useRef(false);

  useEffect(() => {
    function onMessage(event: MessageEvent<SandboxMessage>) {
      const { data } = event;
      if (!data || typeof data.type !== "string") {
        return;
      }

      switch (data.type) {
        case "ready":
          isReadyRef.current = true;
          setIsReady(true);
          if (pendingRef.current && iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage(
              pendingRef.current,
              "*"
            );
            pendingRef.current = null;
          }
          break;
        case "render-success":
          setHasContent(true);
          setError(null);
          setErrorType(null);
          break;
        case "render-error":
          setHasContent(false);
          setError(data.error);
          setErrorType("render-error");
          break;
        case "transpile-error":
          setHasContent(false);
          setError(data.error);
          setErrorType("transpile-error");
          break;
      }
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const revokeBlobUrl = useCallback(() => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
  }, []);

  const restoreSandbox = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) {
      return;
    }

    revokeBlobUrl();
    htmlModeRef.current = false;
    isReadyRef.current = false;
    iframe.src = "/sandbox.html";
    setIsReady(false);
  }, [revokeBlobUrl]);

  const sendRender = useCallback(
    (code: string, componentName: string) => {
      if (htmlModeRef.current) {
        const message: ParentMessage = { type: "render", code, componentName };
        pendingRef.current = message;
        restoreSandbox();
        return;
      }

      const message: ParentMessage = { type: "render", code, componentName };

      if (isReadyRef.current && iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(message, "*");
      } else {
        pendingRef.current = message;
      }
    },
    [restoreSandbox]
  );

  const sendHtml = useCallback(
    (html: string) => {
      const iframe = iframeRef.current;
      if (!iframe) {
        return;
      }

      revokeBlobUrl();
      htmlModeRef.current = true;
      pendingRef.current = null;

      // Use blob: URL instead of srcdoc so the iframe gets its own opaque
      // origin.  With srcdoc + allow-same-origin the iframe shares the
      // parent origin, so <a href="#"> clicks wipe the parent hash.
      const blob = new Blob([html], { type: "text/html" });
      blobUrlRef.current = URL.createObjectURL(blob);
      iframe.src = blobUrlRef.current;

      setHasContent(true);
      setError(null);
      setErrorType(null);
    },
    [revokeBlobUrl]
  );

  const sendClear = useCallback(() => {
    if (htmlModeRef.current) {
      restoreSandbox();
    } else if (isReadyRef.current && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: "clear" }, "*");
    }
    pendingRef.current = null;
    setHasContent(false);
    setError(null);
    setErrorType(null);
  }, [restoreSandbox]);

  return {
    iframeRef,
    isReady,
    hasContent,
    error,
    errorType,
    sendRender,
    sendHtml,
    sendClear,
  };
}
