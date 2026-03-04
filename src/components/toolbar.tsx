import type { ShareResult } from '../hooks/use-url-hash'
import { ShareDialog } from './share-dialog'

interface ToolbarProps {
  readonly code: string
  readonly getShareUrl: (code: string) => Promise<ShareResult>
  readonly getCachedShareUrl: (code: string) => ShareResult | null
  readonly editorCollapsed: boolean
  readonly onRestoreEditor: () => void
  readonly onCollapseEditor: () => void
}

export function Toolbar({ code, getShareUrl, getCachedShareUrl, editorCollapsed, onRestoreEditor, onCollapseEditor }: ToolbarProps) {
  return (
    <header className="flex h-12 items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={editorCollapsed ? onRestoreEditor : onCollapseEditor}
          className="rounded-md bg-zinc-800 px-2 py-1 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
          title={editorCollapsed ? 'Show editor' : 'Hide editor'}
        >
          {editorCollapsed ? '\u00BB' : '\u00AB'}
        </button>
        <h1 className="text-base font-semibold text-zinc-100 tracking-tight">
          Artifast
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <ShareDialog code={code} getShareUrl={getShareUrl} getCachedShareUrl={getCachedShareUrl} />
      </div>
    </header>
  )
}
