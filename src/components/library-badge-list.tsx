import { memo, useCallback } from 'react'
import { toast } from 'sonner'
import { SUPPORTED_LIBRARY_NAMES } from '../constants/library-registry'

function CopyIcon({ className }: { readonly className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  )
}

const PREFIX_PROMPT = `Write a single-file React component (default export) for a sandbox with these pre-installed libraries:

React 18, Tailwind CSS v4, shadcn/ui (import from "@/components/ui/*"), Recharts, Lucide React (import { Icon } from "lucide-react"), D3.js, Three.js, Lodash, Chart.js (import from "chart.js/auto"), Plotly, Tone.js, Papaparse, SheetJS (xlsx), mammoth, mathjs, TensorFlow.js (@tensorflow/tfjs).

Guidelines:
- Default-export one functional component
- Use Tailwind for styling (no CSS files)
- Use inline/mock data (no fetch or external APIs)
- TypeScript is supported`

// rerender-memo: static content that never changes, skip all parent re-renders
export const LibraryBadgeList = memo(function LibraryBadgeList() {
  const handleCopyPrompt = useCallback(() => {
    navigator.clipboard.writeText(PREFIX_PROMPT).then(() => {
      toast.success('Prompt copied to clipboard')
    })
  }, [])

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
      <button
        type="button"
        onClick={handleCopyPrompt}
        title="Copy AI prompt with library info"
        className="ml-1 rounded p-1 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
      >
        <CopyIcon className="h-3.5 w-3.5" />
      </button>
    </div>
  )
})
