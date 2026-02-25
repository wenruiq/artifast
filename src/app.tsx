import { Toaster } from 'sonner'
import { useUrlHash } from './hooks/use-url-hash'
import { CreatorPage } from './pages/creator-page'
import { ViewerPage } from './pages/viewer-page'

export function App() {
  const { isViewerMode } = useUrlHash()

  return (
    <>
      {isViewerMode ? <ViewerPage /> : <CreatorPage />}
      <Toaster
        theme="dark"
        position="bottom-center"
        toastOptions={{
          style: {
            background: '#18181b',
            border: '1px solid #27272a',
            color: '#e4e4e7',
          },
        }}
      />
    </>
  )
}
