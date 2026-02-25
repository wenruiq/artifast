const MARKDOWN_FENCE_START = /^```[\w]*\s*$/
const MARKDOWN_FENCE_END = /^```\s*$/
const EXPORT_DEFAULT_FUNCTION = /^export\s+default\s+function\s/
const EXPORT_DEFAULT_CLASS = /^export\s+default\s+class\s/
const EXPORT_DEFAULT_CONST = /^export\s+default\s+/
const EXPORT_NAMED = /^export\s+(const|let|function|class)\s/
const TYPE_IMPORT = /^import\s+type\s/
const CSS_IMPORT = /^import\s+['"][^'"]*\.(css|scss|less|sass)['"]\s*;?\s*$/

export function stripMarkdownFences(code: string): string {
  const lines = code.split('\n')
  const result: string[] = []
  let insideFence = false

  for (const line of lines) {
    if (!insideFence && MARKDOWN_FENCE_START.test(line.trim())) {
      insideFence = true
      continue
    }
    if (insideFence && MARKDOWN_FENCE_END.test(line.trim())) {
      insideFence = false
      continue
    }
    if (insideFence || !MARKDOWN_FENCE_START.test(line.trim())) {
      result.push(line)
    }
  }

  return result.join('\n')
}

export function stripExports(code: string): string {
  return code
    .split('\n')
    .map((line) => {
      const trimmed = line.trimStart()
      if (EXPORT_DEFAULT_FUNCTION.test(trimmed)) {
        return line.replace('export default ', '')
      }
      if (EXPORT_DEFAULT_CLASS.test(trimmed)) {
        return line.replace('export default ', '')
      }
      if (EXPORT_NAMED.test(trimmed)) {
        return line.replace(/^(\s*)export\s+/, '$1')
      }
      if (EXPORT_DEFAULT_CONST.test(trimmed)) {
        return line.replace(/^(\s*)export\s+default\s+/, '$1const __DefaultExport__ = ')
      }
      return line
    })
    .join('\n')
}

export function stripTypeImports(code: string): string {
  return code
    .split('\n')
    .filter((line) => !TYPE_IMPORT.test(line.trimStart()))
    .join('\n')
}

export function stripCssImports(code: string): string {
  return code
    .split('\n')
    .filter((line) => !CSS_IMPORT.test(line.trimStart()))
    .join('\n')
}

export function cleanCode(code: string): string {
  let cleaned = stripMarkdownFences(code)
  cleaned = stripTypeImports(cleaned)
  cleaned = stripCssImports(cleaned)
  cleaned = stripExports(cleaned)
  return cleaned
}
