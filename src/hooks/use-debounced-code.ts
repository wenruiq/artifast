import { useEffect, useState } from 'react'

export function useDebouncedCode(rawCode: string, delay = 300): string {
  const [debouncedCode, setDebouncedCode] = useState(rawCode)

  useEffect(() => {
    // Flush immediately when input is cleared so preview resets without delay
    if (!rawCode.trim()) {
      setDebouncedCode(rawCode)
      return
    }

    const timer = setTimeout(() => {
      setDebouncedCode(rawCode)
    }, delay)
    return () => clearTimeout(timer)
  }, [rawCode, delay])

  return debouncedCode
}
