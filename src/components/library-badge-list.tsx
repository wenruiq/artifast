import { memo, useCallback, useState } from "react";
import { toast } from "sonner";
import { SUPPORTED_LIBRARY_NAMES } from "../constants/library-registry";

function CopyIcon({ className }: { readonly className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect height="14" rx="2" ry="2" width="14" x="8" y="8" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

const PREFIX_PROMPT = `Generate a single-file UI demo (React component with default export, or plain HTML). The sandbox has these libraries pre-installed — just import and use as needed:

- Tailwind CSS v4
- shadcn/ui (import from "@/components/ui/*")
- Recharts
- Lucide React (import { IconName } from "lucide-react")
- D3.js
- Three.js (standalone only — no @react-three/fiber or OrbitControls)
- Lodash
- Chart.js (import from "chart.js/auto")
- Plotly
- Tone.js
- Papaparse
- SheetJS (import from "xlsx")
- mammoth
- mathjs
- TensorFlow.js (import from "@tensorflow/tfjs")

Use inline or mock data — no external API calls.`;

const VISIBLE_COUNT = 5;

// rerender-memo: static content that never changes, skip all parent re-renders
export const LibraryBadgeList = memo(function LibraryBadgeList() {
  const [expanded, setExpanded] = useState(false);

  const handleCopyPrompt = useCallback(() => {
    navigator.clipboard.writeText(PREFIX_PROMPT).then(() => {
      toast.success("Prompt copied to clipboard");
    });
  }, []);

  const visible = expanded
    ? SUPPORTED_LIBRARY_NAMES
    : SUPPORTED_LIBRARY_NAMES.slice(0, VISIBLE_COUNT);
  const hiddenCount = SUPPORTED_LIBRARY_NAMES.length - VISIBLE_COUNT;

  return (
    <div className="flex items-center gap-1 border-zinc-800 border-t bg-zinc-950 px-4 py-2">
      <span className="mr-1 shrink-0 text-xs text-zinc-500">Supports:</span>
      {visible.map((name) => (
        <span
          className="shrink-0 rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-400"
          key={name}
        >
          {name}
        </span>
      ))}
      {!expanded && hiddenCount > 0 && (
        <button
          className="shrink-0 rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-500 transition-colors hover:text-zinc-300"
          onClick={() => setExpanded(true)}
          type="button"
        >
          +{hiddenCount} more
        </button>
      )}
      {expanded && (
        <button
          className="shrink-0 rounded px-1.5 py-0.5 text-xs text-zinc-500 transition-colors hover:text-zinc-300"
          onClick={() => setExpanded(false)}
          type="button"
        >
          show less
        </button>
      )}
      <button
        className="shrink-0 rounded p-1 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
        onClick={handleCopyPrompt}
        title="Copy AI prompt with library info"
        type="button"
      >
        <CopyIcon className="h-3.5 w-3.5" />
      </button>
      <span
        className="ml-auto shrink-0 font-mono text-[10px] text-zinc-600"
        title={`build ${__COMMIT_SHA__}`}
      >
        v{__APP_VERSION__}
      </span>
    </div>
  );
});
