import type { useShare } from "../hooks/use-share";
import { ShareDialog } from "./share-dialog";
import { Button } from "./ui/button";

interface ToolbarProps {
  readonly code: string;
  readonly editorCollapsed: boolean;
  readonly onCollapseEditor: () => void;
  readonly onRestoreEditor: () => void;
  readonly shareHook: ReturnType<typeof useShare>;
}

export function Toolbar({
  code,
  shareHook,
  editorCollapsed,
  onRestoreEditor,
  onCollapseEditor,
}: ToolbarProps) {
  return (
    <header className="flex h-12 items-center justify-between border-zinc-800 border-b bg-zinc-950 px-4">
      <div className="flex items-center gap-2">
        <Button
          className="text-zinc-400 hover:text-zinc-200"
          onClick={editorCollapsed ? onRestoreEditor : onCollapseEditor}
          size="xs"
          title={editorCollapsed ? "Show editor" : "Hide editor"}
          variant="ghost"
        >
          {editorCollapsed ? "\u00BB" : "\u00AB"}
        </Button>
        <h1 className="cursor-default font-semibold text-base text-zinc-100 tracking-tight">
          Artifast
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <ShareDialog code={code} {...shareHook} />
      </div>
    </header>
  );
}
