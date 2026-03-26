const COMPONENT_DECL =
  /(?:function|const|let|var|class)\s+([A-Z][A-Za-z0-9]*)/g;
const PREFERRED_NAMES = ["App", "Application", "Main", "Root"] as const;

export function findComponentName(code: string): string | null {
  const matches: string[] = [];

  for (;;) {
    const match = COMPONENT_DECL.exec(code);
    if (match === null) {
      break;
    }
    matches.push(match[1]);
  }

  // __DefaultExport__ is the most reliable — it's whatever was actually
  // `export default`-ed, even if that was a HOC wrapper like React.memo().
  // Preferred-name matching can pick an inner function that isn't in scope.
  if (code.includes("__DefaultExport__")) {
    return "__DefaultExport__";
  }

  if (matches.length === 0) {
    return null;
  }

  // Check preferred names in priority order, using Set for O(1) membership test
  const matchSet = new Set(matches);
  for (const preferred of PREFERRED_NAMES) {
    if (matchSet.has(preferred)) {
      return preferred;
    }
  }

  // biome-ignore lint/style/useAtIndex: .at() returns undefined, array access is narrower here
  return matches[matches.length - 1];
}
