const FUNCTION_COMPONENT = /(?:function|const|let)\s+([A-Z][A-Za-z0-9]*)/g;
const PREFERRED_NAMES = ["App", "Application", "Main", "Root"] as const;

export function findComponentName(code: string): string {
  const matches: string[] = [];

  for (;;) {
    const match = FUNCTION_COMPONENT.exec(code);
    if (match === null) {
      break;
    }
    matches.push(match[1]);
  }

  if (matches.length === 0) {
    return "App";
  }

  // Check preferred names in priority order, using Set for O(1) membership test
  const matchSet = new Set(matches);
  for (const preferred of PREFERRED_NAMES) {
    if (matchSet.has(preferred)) {
      return preferred;
    }
  }

  // Check for __DefaultExport__ (from stripped `export default`)
  if (code.includes("__DefaultExport__")) {
    return "__DefaultExport__";
  }

  // biome-ignore lint/style/useAtIndex: .at() returns undefined, array access is narrower here
  return matches[matches.length - 1];
}
