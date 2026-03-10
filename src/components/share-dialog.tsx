import { Check, ClipboardCopy } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { useShare } from "../hooks/use-share";
import { PasteSizeExceededError } from "../lib/paste-api";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

function Spinner({ className = "h-4 w-4" }: { readonly className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={`${className} animate-spin`}
      fill="none"
      viewBox="0 0 16 16"
    >
      <circle
        cx="8"
        cy="8"
        r="6.5"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="3"
      />
      <path
        d="M8 1.5A6.5 6.5 0 0 1 14.5 8"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="3"
      />
    </svg>
  );
}

function CopyButton({ url }: { readonly url: string }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  // Auto-copy on mount (entering published state)
  useEffect(() => {
    navigator.clipboard.writeText(url).then(
      () => {
        setCopied(true);
        timerRef.current = setTimeout(() => setCopied(false), 2000);
      },
      () => {
        // clipboard write rejected — ignore
      }
    );
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [url]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(url).then(
      () => {
        setCopied(true);
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
        timerRef.current = setTimeout(() => setCopied(false), 2000);
      },
      () => {
        // clipboard write rejected — ignore
      }
    );
  }, [url]);

  return (
    <Button
      className={
        copied
          ? "bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30"
          : undefined
      }
      onClick={handleCopy}
      size="xs"
      variant="secondary"
    >
      {copied ? (
        <Check className="size-3.5" />
      ) : (
        <ClipboardCopy className="size-3.5" />
      )}
      {copied ? "Link copied" : "Copy link"}
    </Button>
  );
}

interface ShareDialogProps {
  readonly code: string;
  readonly data: ReturnType<typeof useShare>["data"];
  readonly error: ReturnType<typeof useShare>["error"];
  readonly getCachedUrl: ReturnType<typeof useShare>["getCachedUrl"];
  readonly isError: boolean;
  readonly isPending: boolean;
  readonly isSuccess: boolean;
  readonly prefetch: ReturnType<typeof useShare>["prefetch"];
  readonly reset: ReturnType<typeof useShare>["reset"];
  readonly share: ReturnType<typeof useShare>["share"];
}

export function ShareDialog({
  code,
  share,
  prefetch,
  getCachedUrl,
  isPending,
  isSuccess,
  isError,
  data,
  error,
  reset,
}: ShareDialogProps) {
  const [open, setOpen] = useState(false);

  const handlePrefetch = useCallback(() => {
    if (!code.trim()) {
      return;
    }
    prefetch(code);
  }, [code, prefetch]);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      setOpen(nextOpen);
      if (!nextOpen) {
        reset();
        return;
      }
      if (getCachedUrl(code) || isPending) {
        return;
      }
      share(code).catch(() => {
        // error handled by mutation state
      });
    },
    [code, getCachedUrl, share, reset, isPending]
  );

  const handleRetry = useCallback(() => {
    share(code).catch(() => {
      // error handled by mutation state
    });
  }, [code, share]);

  const showLoading = isPending && open;
  const url = data?.url ?? getCachedUrl(code)?.url;
  const isExisting = data?.existing ?? getCachedUrl(code)?.existing ?? false;
  const showPublished =
    (isSuccess || getCachedUrl(code) !== null) && open && url;
  const showError = isError && open;

  const errorMessage =
    error instanceof PasteSizeExceededError
      ? "Code is too large to share (max 500 KB)"
      : "Failed to create share link.";

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogTrigger asChild>
        <Button
          disabled={!code.trim()}
          onMouseEnter={handlePrefetch}
          size="xs"
          variant="secondary"
        >
          Share
        </Button>
      </DialogTrigger>

      <DialogContent
        className="border-zinc-800 bg-zinc-900 sm:max-w-md"
        showCloseButton={!showLoading}
      >
        {showLoading && (
          <>
            <DialogHeader>
              <DialogTitle>Share Artifact</DialogTitle>
              <DialogDescription>Preparing share link…</DialogDescription>
            </DialogHeader>
            <div className="flex items-center justify-center py-6">
              <Spinner className="h-6 w-6" />
            </div>
          </>
        )}

        {showPublished && !showLoading && (
          <>
            <DialogHeader>
              <DialogTitle>Share Artifact</DialogTitle>
              {isExisting ? (
                <div className="mt-1 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-emerald-400 text-xs">
                  Artifact already exists — link copied to clipboard.
                </div>
              ) : (
                <DialogDescription>
                  Anyone with this link can view your artifact.
                </DialogDescription>
              )}
            </DialogHeader>
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="min-w-0 flex-1 rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2">
                <code className="block truncate text-xs text-zinc-300">
                  {url}
                </code>
              </div>
              <CopyButton url={url} />
            </div>
            <DialogFooter>
              <Button
                className="bg-blue-600 text-white hover:bg-blue-500"
                onClick={() => window.open(url, "_blank")}
              >
                Open in New Tab
              </Button>
            </DialogFooter>
          </>
        )}

        {showError && !showLoading && (
          <>
            <DialogHeader>
              <DialogTitle>Share Artifact</DialogTitle>
              <DialogDescription className="text-red-400">
                {errorMessage}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                className="bg-blue-600 text-white hover:bg-blue-500"
                onClick={handleRetry}
              >
                Try Again
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
