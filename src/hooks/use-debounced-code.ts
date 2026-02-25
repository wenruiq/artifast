import { useEffect, useState } from 'react'

export function useDebouncedCode(rawCode: string, delay = 300): string {
  const [debouncedCode, setDebouncedCode] = useState(rawCode)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCode(rawCode)
    }, delay)
    return () => clearTimeout(timer)
  }, [rawCode, delay])

  return debouncedCode
}
