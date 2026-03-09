const MARKDOWN_FENCE_START = /^```[\w]*\s*$/;
const MARKDOWN_FENCE_END = /^```\s*$/;
const EXPORT_DEFAULT_FUNCTION = /^export\s+default\s+function\s/;
const EXPORT_DEFAULT_CLASS = /^export\s+default\s+class\s/;
const EXPORT_DEFAULT_CONST = /^export\s+default\s+/;
const EXPORT_NAMED = /^export\s+(const|let|function|class)\s/;
const TYPE_IMPORT = /^import\s+type\s/;
const CSS_IMPORT = /^import\s+['"][^'"]*\.(css|scss|less|sass)['"]\s*;?\s*$/;

export function stripMarkdownFences(code: string): string {
  const lines = code.split("\n");
  const result: string[] = [];
  let insideFence = false;

  for (const line of lines) {
    if (!insideFence && MARKDOWN_FENCE_START.test(line.trim())) {
      insideFence = true;
      continue;
    }
    if (insideFence && MARKDOWN_FENCE_END.test(line.trim())) {
      insideFence = false;
      continue;
    }
    if (insideFence || !MARKDOWN_FENCE_START.test(line.trim())) {
      result.push(line);
    }
  }

  return result.join("\n");
}

// js-combine-iterations: single-pass clean that strips markdown fences,
// type/CSS imports, and rewrites exports in one iteration
export function cleanCode(code: string): string {
  const lines = code.split("\n");
  const result: string[] = [];
  let insideFence = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Strip markdown fences
    if (!insideFence && MARKDOWN_FENCE_START.test(trimmed)) {
      insideFence = true;
      continue;
    }
    if (insideFence && MARKDOWN_FENCE_END.test(trimmed)) {
      insideFence = false;
      continue;
    }
    if (!insideFence && MARKDOWN_FENCE_START.test(trimmed)) {
      continue;
    }

    const trimStart = line.trimStart();

    // Strip type imports and CSS imports
    if (TYPE_IMPORT.test(trimStart) || CSS_IMPORT.test(trimStart)) {
      continue;
    }

    // Rewrite exports
    if (EXPORT_DEFAULT_FUNCTION.test(trimStart)) {
      result.push(line.replace("export default ", ""));
    } else if (EXPORT_DEFAULT_CLASS.test(trimStart)) {
      result.push(line.replace("export default ", ""));
    } else if (EXPORT_NAMED.test(trimStart)) {
      result.push(line.replace(/^(\s*)export\s+/, "$1"));
    } else if (EXPORT_DEFAULT_CONST.test(trimStart)) {
      result.push(
        line.replace(
          /^(\s*)export\s+default\s+/,
          "$1const __DefaultExport__ = "
        )
      );
    } else {
      result.push(line);
    }
  }

  return result.join("\n");
}
