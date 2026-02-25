import { useCallback, useRef, useState } from 'react'

const DEFAULT_WIDTH_PERCENT = 50
const MIN_WIDTH_PERCENT = 5
const COLLAPSE_THRESHOLD_PERCENT = 3
const MAX_WIDTH_PERCENT = 80

export function usePanelResize(defaultPercent = DEFAULT_WIDTH_PERCENT) {
  const [widthPercent, setWidthPercent] = useState(defaultPercent)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const isCollapsed = widthPercent === 0

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)

    const container = containerRef.current
    if (!container) return

    // Snapshot the rect once at drag start — avoids repeated reflows
    const rect = container.getBoundingClientRect()

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const rawPercent = ((moveEvent.clientX - rect.left) / rect.width) * 100
      const clamped = Math.min(Math.max(rawPercent, 0), MAX_WIDTH_PERCENT)

      setWidthPercent(
        clamped < COLLAPSE_THRESHOLD_PERCENT
          ? 0
          : Math.max(clamped, MIN_WIDTH_PERCENT),
      )
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [])

  const restore = useCallback(() => {
    setWidthPercent(DEFAULT_WIDTH_PERCENT)
  }, [])

  const collapse = useCallback(() => {
    setWidthPercent(0)
  }, [])

  const handleDoubleClick = useCallback(() => {
    setWidthPercent(DEFAULT_WIDTH_PERCENT)
  }, [])

  return {
    widthPercent,
    isCollapsed,
    isDragging,
    containerRef,
    handleMouseDown,
    handleDoubleClick,
    restore,
    collapse,
  }
}
