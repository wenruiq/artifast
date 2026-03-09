import { Toaster } from "sonner";
import { useHashState } from "./hooks/use-hash-state";
import { CreatorPage } from "./pages/creator-page";
import { ViewerPage } from "./pages/viewer-page";

// rendering-hoist-jsx: static config hoisted outside component
const TOAST_STYLE = {
  background: "#18181b",
  border: "1px solid #27272a",
  color: "#e4e4e7",
} as const;

const TOAST_OPTIONS = { style: TOAST_STYLE } as const;

export function App() {
  const { isViewerMode } = useHashState();

  return (
    <>
      {isViewerMode ? <ViewerPage /> : <CreatorPage />}
      <Toaster
        position="top-center"
        theme="dark"
        toastOptions={TOAST_OPTIONS}
      />
    </>
  );
}
