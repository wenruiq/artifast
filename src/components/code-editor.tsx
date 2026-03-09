import { useCallback } from "react";

const PLACEHOLDER = `// Paste your React component here...
//
// Supports: Tailwind, shadcn/ui, Recharts, Lucide,
// D3, Three.js, Lodash, Chart.js, Plotly, Tone.js,
// Papaparse, SheetJS, mammoth, mathjs, TensorFlow.js
//
// Just import and use — all libraries are pre-loaded.`;

interface CodeEditorProps {
  readonly code: string;
  readonly onChange: (code: string) => void;
}

export function CodeEditor({ code, onChange }: CodeEditorProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  return (
    <textarea
      className="h-full w-full resize-none bg-zinc-950 p-4 font-mono text-sm text-zinc-100 outline-none placeholder:text-zinc-600"
      onChange={handleChange}
      placeholder={PLACEHOLDER}
      spellCheck={false}
      value={code}
    />
  );
}
