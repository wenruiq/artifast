export interface LibraryMapping {
  readonly cdnUrl: string;
  readonly globalName: string;
  readonly packageName: string;
  readonly version: string;
}

export interface ImportWarning {
  readonly message: string;
  readonly packageName: string;
}

export interface TransformResult {
  readonly code: string;
  readonly componentName: string;
  readonly warnings: readonly ImportWarning[];
}

export type SandboxMessage =
  | { readonly type: "ready" }
  | { readonly type: "render-success" }
  | { readonly type: "render-error"; readonly error: string }
  | { readonly type: "transpile-error"; readonly error: string };

export interface ParentMessage {
  readonly code: string;
  readonly componentName: string;
  // Global names (e.g. "Recharts", "d3") the artifact imports. The sandbox
  // lazy-loads only these before rendering instead of eagerly loading every
  // supported library on boot.
  readonly libraries: readonly string[];
  readonly type: "render";
}
