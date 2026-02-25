import { SUPPORTED_LIBRARY_NAMES } from '../constants/library-registry'

export function LibraryBadgeList() {
  return (
    <div className="flex items-center gap-1 border-t border-zinc-800 bg-zinc-950 px-4 py-2">
      <span className="mr-1 text-xs text-zinc-500">Supports:</span>
      {SUPPORTED_LIBRARY_NAMES.map((name) => (
        <span
          key={name}
          className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-400"
        >
          {name}
        </span>
      ))}
    </div>
  )
}
