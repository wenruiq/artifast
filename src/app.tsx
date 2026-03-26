import { lazy, Suspense } from "react";
import { Toaster } from "sonner";
import { useHashState } from "./hooks/use-hash-state";

const CreatorPage = lazy(() =>
  import("./pages/creator-page").then((m) => ({ default: m.CreatorPage }))
);
const ViewerPage = lazy(() =>
  import("./pages/viewer-page").then((m) => ({ default: m.ViewerPage }))
);

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
      <Suspense>{isViewerMode ? <ViewerPage /> : <CreatorPage />}</Suspense>
      <Toaster
        position="top-center"
        theme="dark"
        toastOptions={TOAST_OPTIONS}
      />
    </>
  );
}
