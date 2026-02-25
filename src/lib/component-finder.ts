const FUNCTION_COMPONENT = /(?:function|const|let)\s+([A-Z][A-Za-z0-9]*)/g
const PREFERRED_NAMES = ['App', 'Application', 'Main', 'Root']

export function findComponentName(code: string): string {
  const matches: string[] = []
  let match: RegExpExecArray | null

  while ((match = FUNCTION_COMPONENT.exec(code)) !== null) {
    matches.push(match[1])
  }

  if (matches.length === 0) {
    return 'App'
  }

  for (const preferred of PREFERRED_NAMES) {
    if (matches.includes(preferred)) {
      return preferred
    }
  }

  // Check for __DefaultExport__ (from stripped `export default`)
  if (code.includes('__DefaultExport__')) {
    return '__DefaultExport__'
  }

  return matches[matches.length - 1]
}
