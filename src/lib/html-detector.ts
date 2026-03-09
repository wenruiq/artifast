const HTML_PATTERN = /^\s*<!doctype\s+html|^\s*<html[\s>]/i;

export function isHtmlDocument(code: string): boolean {
  return HTML_PATTERN.test(code);
}
