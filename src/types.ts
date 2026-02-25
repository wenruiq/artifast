export interface LibraryMapping {
  readonly packageName: string
  readonly globalName: string
  readonly cdnUrl: string
  readonly version: string
}

export interface ImportWarning {
  readonly packageName: string
  readonly message: string
}

export interface TransformResult {
  readonly code: string
  readonly componentName: string
  readonly warnings: readonly ImportWarning[]
}

export type SandboxMessage =
  | { readonly type: 'ready' }
  | { readonly type: 'render-success' }
  | { readonly type: 'render-error'; readonly error: string }
  | { readonly type: 'transpile-error'; readonly error: string }

export interface ParentMessage {
  readonly type: 'render'
  readonly code: string
  readonly componentName: string
}
