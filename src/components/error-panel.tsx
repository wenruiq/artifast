import { Button } from "./ui/button";

interface ErrorPanelProps {
  readonly error: string | null;
  readonly errorType: "render-error" | "transpile-error" | null;
  readonly onDismiss?: () => void;
}

export function ErrorPanel({ error, errorType, onDismiss }: ErrorPanelProps) {
  if (!error) {
    return null;
  }

  const label =
    errorType === "transpile-error" ? "Transpile Error" : "Runtime Error";

  return (
    <div className="dark-scroll border-red-900/30 border-t bg-red-950/50 px-4 py-2">
      <div className="mb-1 flex items-center justify-between">
        <span className="inline-block rounded bg-red-900/40 px-2 py-0.5 font-mono text-red-300 text-xs">
          {label}
        </span>
        {onDismiss && (
          <Button
            className="text-red-400 hover:bg-red-900/30 hover:text-red-300"
            onClick={onDismiss}
            size="xs"
            variant="ghost"
          >
            Dismiss
          </Button>
        )}
      </div>
      <pre className="max-h-32 overflow-y-auto whitespace-pre-wrap font-mono text-red-400 text-xs">
        {error}
      </pre>
    </div>
  );
}
