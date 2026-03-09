import type { RefObject } from "react";

interface PreviewFrameProps {
  readonly hasContent: boolean;
  readonly hasError: boolean;
  readonly iframeRef: RefObject<HTMLIFrameElement | null>;
  readonly isReady: boolean;
}

export function PreviewFrame({
  iframeRef,
  isReady,
  hasContent,
  hasError,
}: PreviewFrameProps) {
  const showLoading = !(isReady || hasContent);
  const showPlaceholder = !(showLoading || hasContent);

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
      {showPlaceholder && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <p className="text-sm text-zinc-600">
            {hasError
              ? "Fix the error to see the preview"
              : "Paste code on the left to preview"}
          </p>
        </div>
      )}
      <iframe
        className={`h-full w-full border-0 bg-white transition-opacity duration-300 ${
          hasContent ? "opacity-100" : "opacity-0"
        }`}
        ref={iframeRef}
        sandbox="allow-scripts allow-same-origin"
        src="/sandbox.html"
        title="Artifact Preview"
      />
    </div>
  );
}
