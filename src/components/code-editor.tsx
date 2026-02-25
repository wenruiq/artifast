import { useCallback } from 'react'

const PLACEHOLDER = `// Paste your React code here...
// Example:
import { useState } from 'react'
import { Search } from 'lucide-react'

function App() {
  const [query, setQuery] = useState('')
  return (
    <div className="p-8">
      <div className="flex items-center gap-2">
        <Search className="w-5 h-5" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border rounded px-3 py-1"
          placeholder="Search..."
        />
      </div>
    </div>
  )
}`

interface CodeEditorProps {
  readonly code: string
  readonly onChange: (code: string) => void
}

export function CodeEditor({ code, onChange }: CodeEditorProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value)
    },
    [onChange],
  )

  return (
    <textarea
      value={code}
      onChange={handleChange}
      placeholder={PLACEHOLDER}
      spellCheck={false}
      className="h-full w-full resize-none bg-zinc-950 p-4 font-mono text-sm text-zinc-100 outline-none placeholder:text-zinc-600"
    />
  )
}
