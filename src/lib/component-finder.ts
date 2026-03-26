const STARTS_LOWERCASE = /^[a-z]/;
const UPPER_DECL = /(?:function|const|let|var|class)\s+([A-Z][A-Za-z0-9]*)/g;
const ANY_DECL =
  /(?:function|const|let|var|class)\s+([a-zA-Z_$][A-Za-z0-9_$]*)/g;
const PREFERRED_NAMES = ["App", "Application", "Main", "Root"] as const;

function collectMatches(code: string, re: RegExp): string[] {
  const matches: string[] = [];
  for (;;) {
    const match = re.exec(code);
    if (match === null) {
      break;
    }
    matches.push(match[1]);
  }
  return matches;
}

export function findComponentName(code: string): string | null {
  // __DefaultExport__ is the most reliable — it's whatever was actually
  // `export default`-ed, even if that was a HOC wrapper like React.memo().
  if (code.includes("__DefaultExport__")) {
    return "__DefaultExport__";
  }

  const upperMatches = collectMatches(code, UPPER_DECL);

  if (upperMatches.length > 0) {
    const matchSet = new Set(upperMatches);
    for (const preferred of PREFERRED_NAMES) {
      if (matchSet.has(preferred)) {
        return preferred;
      }
    }
    // biome-ignore lint/style/useAtIndex: .at() returns undefined, array access is narrower here
    return upperMatches[upperMatches.length - 1];
  }

  // Fallback: match lowercase declarations (e.g. `const hello = () => ...`)
  // These need to be aliased to an uppercase name by the caller since
  // React requires component names to start with a capital letter.
  const anyMatches = collectMatches(code, ANY_DECL);
  if (anyMatches.length > 0) {
    // biome-ignore lint/style/useAtIndex: .at() returns undefined, array access is narrower here
    return anyMatches[anyMatches.length - 1];
  }

  return null;
}

export function isLowercaseName(name: string): boolean {
  return STARTS_LOWERCASE.test(name);
}
