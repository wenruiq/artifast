import { lookupLibrary, SIDE_EFFECT_PATTERNS } from '../constants/library-registry'
import type { ImportWarning } from '../types'

interface RewriteResult {
  readonly rewrittenCode: string
  readonly warnings: readonly ImportWarning[]
}

function collapseMultilineImports(code: string): string {
  return code.replace(/import\s*\{[^}]*\n[^}]*\}/g, (match) =>
    match.replace(/\s*\n\s*/g, ' '),
  )
}

function isSideEffectImport(line: string): boolean {
  const match = line.match(/^import\s+['"]([^'"]+)['"]\s*;?\s*$/)
  if (!match) return false
  const pkg = match[1]
  return SIDE_EFFECT_PATTERNS.some((p) => p.test(pkg))
}

function isTypeOnlyImport(line: string): boolean {
  return /^import\s+type\s/.test(line.trimStart())
}

function parseImportLine(line: string): {
  namedImports: string[]
  defaultImport: string | null
  namespaceImport: string | null
  packageName: string
} | null {
  const trimmed = line.trimStart()

  // import * as X from 'pkg'
  const nsMatch = trimmed.match(
    /^import\s+\*\s+as\s+(\w+)\s+from\s+['"]([^'"]+)['"]\s*;?\s*$/,
  )
  if (nsMatch) {
    return {
      namedImports: [],
      defaultImport: null,
      namespaceImport: nsMatch[1],
      packageName: nsMatch[2],
    }
  }

  // import Default, { Named1, Named2 } from 'pkg'
  const mixedMatch = trimmed.match(
    /^import\s+(\w+)\s*,\s*\{([^}]*)\}\s+from\s+['"]([^'"]+)['"]\s*;?\s*$/,
  )
  if (mixedMatch) {
    const named = mixedMatch[2]
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    return {
      namedImports: named,
      defaultImport: mixedMatch[1],
      namespaceImport: null,
      packageName: mixedMatch[3],
    }
  }

  // import { Named1, Named2 } from 'pkg'
  const namedMatch = trimmed.match(
    /^import\s+\{([^}]*)\}\s+from\s+['"]([^'"]+)['"]\s*;?\s*$/,
  )
  if (namedMatch) {
    const named = namedMatch[1]
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    return {
      namedImports: named,
      defaultImport: null,
      namespaceImport: null,
      packageName: namedMatch[2],
    }
  }

  // import Default from 'pkg'
  const defaultMatch = trimmed.match(
    /^import\s+(\w+)\s+from\s+['"]([^'"]+)['"]\s*;?\s*$/,
  )
  if (defaultMatch) {
    return {
      namedImports: [],
      defaultImport: defaultMatch[1],
      namespaceImport: null,
      packageName: defaultMatch[2],
    }
  }

  return null
}

function rewriteSingleImport(
  line: string,
  warnings: ImportWarning[],
): string | null {
  const trimmed = line.trimStart()

  if (!trimmed.startsWith('import ')) return null
  if (isTypeOnlyImport(trimmed)) return ''
  if (isSideEffectImport(trimmed)) return ''

  // Side-effect import of non-CSS (e.g., import 'some-module')
  const sideEffectMatch = trimmed.match(/^import\s+['"]([^'"]+)['"]\s*;?\s*$/)
  if (sideEffectMatch) return ''

  const parsed = parseImportLine(trimmed)
  if (!parsed) return null

  const library = lookupLibrary(parsed.packageName)
  if (!library) {
    warnings.push({
      packageName: parsed.packageName,
      message: `"${parsed.packageName}" is not available in the sandbox`,
    })
    return ''
  }

  const { globalName } = library
  const lines: string[] = []

  if (parsed.namespaceImport) {
    // Skip if binding name matches the global (already in scope)
    if (parsed.namespaceImport !== globalName) {
      lines.push(`const ${parsed.namespaceImport} = window.${globalName};`)
    }
    return lines.join('\n')
  }

  if (parsed.defaultImport) {
    // Skip if binding name matches the global (already in scope)
    if (parsed.defaultImport !== globalName) {
      lines.push(`const ${parsed.defaultImport} = ${globalName};`)
    }
  }

  if (parsed.namedImports.length > 0) {
    const destructured = parsed.namedImports
      .map((imp) => {
        const parts = imp.split(/\s+as\s+/)
        return parts.length === 2 ? `${parts[0]}: ${parts[1]}` : imp
      })
      .join(', ')
    lines.push(`const { ${destructured} } = ${globalName};`)
  }

  return lines.join('\n')
}

export function rewriteImports(code: string): RewriteResult {
  const collapsed = collapseMultilineImports(code)
  const lines = collapsed.split('\n')
  const warnings: ImportWarning[] = []
  const resultLines: string[] = []

  for (const line of lines) {
    const rewritten = rewriteSingleImport(line, warnings)
    if (rewritten !== null) {
      if (rewritten !== '') {
        resultLines.push(rewritten)
      }
    } else {
      resultLines.push(line)
    }
  }

  return { rewrittenCode: resultLines.join('\n'), warnings }
}
