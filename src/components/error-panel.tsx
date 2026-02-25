interface ErrorPanelProps {
  readonly error: string | null
  readonly errorType: 'render-error' | 'transpile-error' | null
  readonly onDismiss?: () => void
}

export function ErrorPanel({ error, errorType, onDismiss }: ErrorPanelProps) {
  if (!error) return null

  const label =
    errorType === 'transpile-error' ? 'Transpile Error' : 'Runtime Error'

  return (
    <div className="dark-scroll border-t border-red-900/30 bg-red-950/50 px-4 py-2">
      <div className="mb-1 flex items-center justify-between">
        <span className="inline-block rounded bg-red-900/40 px-2 py-0.5 font-mono text-xs text-red-300">
          {label}
        </span>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="rounded px-1.5 py-0.5 text-xs text-red-400 transition-colors hover:bg-red-900/30 hover:text-red-300"
          >
            Dismiss
          </button>
        )}
      </div>
      <pre className="max-h-32 overflow-y-auto font-mono text-xs text-red-400 whitespace-pre-wrap">
        {error}
      </pre>
    </div>
  )
}
