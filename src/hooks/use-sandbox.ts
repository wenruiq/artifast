import { useCallback, useEffect, useRef, useState } from 'react'
import type { ParentMessage, SandboxMessage } from '../types'

interface SandboxState {
  readonly iframeRef: React.RefObject<HTMLIFrameElement | null>
  readonly isReady: boolean
  readonly error: string | null
  readonly errorType: 'render-error' | 'transpile-error' | null
  readonly sendRender: (code: string, componentName: string) => void
  readonly sendHtml: (html: string) => void
  readonly sendClear: () => void
}

export function useSandbox(): SandboxState {
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errorType, setErrorType] = useState<
    'render-error' | 'transpile-error' | null
  >(null)
  const pendingRef = useRef<ParentMessage | null>(null)
  const htmlModeRef = useRef(false)
  // rerender-defer-reads: use ref so callbacks don't depend on isReady state
  const isReadyRef = useRef(false)

  useEffect(() => {
    function onMessage(event: MessageEvent<SandboxMessage>) {
      const { data } = event
      if (!data || typeof data.type !== 'string') return

      switch (data.type) {
        case 'ready':
          isReadyRef.current = true
          setIsReady(true)
          if (pendingRef.current && iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage(
              pendingRef.current,
              '*',
            )
            pendingRef.current = null
          }
          break
        case 'render-success':
          setError(null)
          setErrorType(null)
          break
        case 'render-error':
          setError(data.error)
          setErrorType('render-error')
          break
        case 'transpile-error':
          setError(data.error)
          setErrorType('transpile-error')
          break
      }
    }

    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  const restoreSandbox = useCallback(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    htmlModeRef.current = false
    isReadyRef.current = false
    iframe.removeAttribute('srcdoc')
    iframe.src = '/sandbox.html'
    setIsReady(false)
  }, [])

  const sendRender = useCallback(
    (code: string, componentName: string) => {
      if (htmlModeRef.current) {
        const message: ParentMessage = { type: 'render', code, componentName }
        pendingRef.current = message
        restoreSandbox()
        return
      }

      const message: ParentMessage = { type: 'render', code, componentName }

      if (isReadyRef.current && iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(message, '*')
      } else {
        pendingRef.current = message
      }
    },
    [restoreSandbox],
  )

  const sendHtml = useCallback((html: string) => {
    const iframe = iframeRef.current
    if (!iframe) return

    htmlModeRef.current = true
    pendingRef.current = null
    iframe.srcdoc = html
    setError(null)
    setErrorType(null)
  }, [])

  const sendClear = useCallback(() => {
    if (htmlModeRef.current) {
      restoreSandbox()
    } else if (isReadyRef.current && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: 'clear' }, '*')
    }
    pendingRef.current = null
    setError(null)
    setErrorType(null)
  }, [restoreSandbox])

  return {
    iframeRef,
    isReady,
    error,
    errorType,
    sendRender,
    sendHtml,
    sendClear,
  }
}
