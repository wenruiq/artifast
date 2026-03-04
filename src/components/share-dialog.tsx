import { Check, ClipboardCopy } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { PasteSizeExceededError } from "../lib/paste-api";
import type { ShareResult } from "../hooks/use-url-hash";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

type DialogState =
  | { status: "checking" }
  | { status: "idle" }
  | { status: "publishing" }
  | { status: "published"; url: string; isExisting: boolean }
  | { status: "error"; message: string };

function Spinner({ className = "h-4 w-4" }: { readonly className?: string }) {
  return (
    <svg
      className={`${className} animate-spin`}
      viewBox="0 0 16 16"
      fill="none"
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
        strokeWidth="3"
        strokeLinecap="round"
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
      () => {},
    );
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [url]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(url).then(
      () => {
        setCopied(true);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setCopied(false), 2000);
      },
      () => {},
    );
  }, [url]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
        copied
          ? "bg-emerald-600/20 text-emerald-400"
          : "bg-zinc-700 text-zinc-200 hover:bg-zinc-600"
      }`}
    >
      {copied ? (
        <Check className="size-3.5" />
      ) : (
        <ClipboardCopy className="size-3.5" />
      )}
      {copied ? "Link copied" : "Copy link"}
    </button>
  );
}

interface ShareDialogProps {
  readonly code: string;
  readonly getShareUrl: (code: string) => Promise<ShareResult>;
  readonly getCachedShareUrl: (code: string) => ShareResult | null;
}

export function ShareDialog({
  code,
  getShareUrl,
  getCachedShareUrl,
}: ShareDialogProps) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<DialogState>({ status: "idle" });

  // Prefetch on hover — warm the cache before click
  const handlePrefetch = useCallback(() => {
    if (!code.trim() || getCachedShareUrl(code)) return;
    getShareUrl(code).catch(() => {});
  }, [code, getCachedShareUrl, getShareUrl]);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      setOpen(nextOpen);
      if (nextOpen) {
        const cached = getCachedShareUrl(code);
        if (cached) {
          setState({ status: "published", url: cached.url, isExisting: cached.existing });
        } else {
          setState({ status: "checking" });
        }
      } else {
        setState({ status: "idle" });
      }
    },
    [code, getCachedShareUrl],
  );

  // Async fetch when entering "checking" state
  useEffect(() => {
    if (state.status !== "checking") return;

    let cancelled = false;

    getShareUrl(code).then(
      (result) => {
        if (!cancelled)
          setState({
            status: "published",
            url: result.url,
            isExisting: result.existing,
          });
      },
      (error) => {
        if (!cancelled) {
          setState({
            status: "error",
            message:
              error instanceof PasteSizeExceededError
                ? "Code is too large to share (max 500 KB)"
                : "Failed to create share link.",
          });
        }
      },
    );

    return () => {
      cancelled = true;
    };
  }, [state.status, code, getShareUrl]);

  const handleRetry = useCallback(async () => {
    setState({ status: "publishing" });
    try {
      const result = await getShareUrl(code);
      setState({ status: "published", url: result.url, isExisting: result.existing });
    } catch (error) {
      setState({
        status: "error",
        message:
          error instanceof PasteSizeExceededError
            ? "Code is too large to share (max 500 KB)"
            : "Failed to create share link.",
      });
    }
  }, [code, getShareUrl]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          disabled={!code.trim()}
          onMouseEnter={handlePrefetch}
          className="flex items-center gap-1.5 rounded-md bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-200 transition-colors hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Share
        </button>
      </DialogTrigger>

      <DialogContent
        showCloseButton={
          state.status !== "checking" && state.status !== "publishing"
        }
        className="sm:max-w-md border-zinc-800 bg-zinc-900"
      >
        {(state.status === "checking" || state.status === "publishing") && (
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

        {state.status === "published" && (
          <>
            <DialogHeader>
              <DialogTitle>Share Artifact</DialogTitle>
              {state.isExisting ? (
                <div className="mt-1 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-400">
                  Artifact already exists — link copied to clipboard.
                </div>
              ) : (
                <DialogDescription>
                  Anyone with this link can view your artifact.
                </DialogDescription>
              )}
            </DialogHeader>
            <div className="flex items-center gap-2">
              <div className="min-w-0 flex-1 rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2">
                <code className="block truncate text-xs text-zinc-300">
                  {state.url}
                </code>
              </div>
              <CopyButton url={state.url} />
            </div>
            <DialogFooter>
              <button
                type="button"
                onClick={() => window.open(state.url, "_blank")}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500"
              >
                Open in New Tab
              </button>
            </DialogFooter>
          </>
        )}

        {state.status === "error" && (
          <>
            <DialogHeader>
              <DialogTitle>Share Artifact</DialogTitle>
              <DialogDescription className="text-red-400">
                {state.message}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <button
                type="button"
                onClick={handleRetry}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500"
              >
                Try Again
              </button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
