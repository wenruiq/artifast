import type { ImportWarning } from '../types'

interface ImportWarningsProps {
  readonly warnings: readonly ImportWarning[]
}

export function ImportWarnings({ warnings }: ImportWarningsProps) {
  if (warnings.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1.5 border-b border-amber-900/30 bg-amber-950/30 px-4 py-2">
      {warnings.map((warning) => (
        <span
          key={warning.packageName}
          className="inline-flex items-center rounded-full bg-amber-900/40 px-2.5 py-0.5 text-xs text-amber-300"
        >
          ⚠ {warning.message}
        </span>
      ))}
    </div>
  )
}
