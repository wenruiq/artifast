# Artifast

A browser-based sandbox for previewing and sharing React components and HTML artifacts — instantly, with zero build step on the client.

Paste JSX/TSX or raw HTML into the editor, get a live preview. Share via URL. Recipients can remix shared artifacts back into the editor.

## How It Works

Code entered in the editor is sent to a sandboxed iframe (`public/sandbox.html`) via `postMessage`. The sandbox transpiles JSX/TSX with **Babel Standalone**, wraps the component in an error boundary, and renders it — all client-side with no server round-trip.

Sharing uses **Upstash Redis** (via Vercel serverless functions) as a rate-limited pastebin. Pastes are accessed via `#p:{id}` URL hashes. A client-side compression fallback (`deflate-raw` + base64url in the hash) is used if the API is unreachable.

## Tech Stack

| Layer | Tech |
|-------|------|
| UI | React 19, Tailwind CSS v4 |
| Transpilation | Babel Standalone (in-iframe) |
| Build | Vite 8, React Compiler |
| Storage | Upstash Redis via `@upstash/redis` |
| Deployment | Vercel (static + serverless functions) |

The sandbox runs on React 18 (via import map) and supports a broad library set — Recharts, Lucide, D3, Three.js, Chart.js, Plotly, Tone.js, shadcn/ui, and more. Imports are rewritten to globals, and each library is **lazy-loaded from CDN only when an artifact actually imports it**, so a first load isn't blocked on libraries it never uses.

## Local Development

Requires the [Vercel CLI](https://vercel.com/docs/cli) — the API routes (`/api/share`, `/api/paste/[id]`) are Vercel serverless functions and need `vercel dev` to run locally.

```bash
npm install
vercel link          # link to your Vercel project (one-time)
vercel env pull      # pull Redis credentials to .env.local
vercel dev           # starts Vite + serverless functions
```

> `npm run dev` works for frontend-only development but sharing will not function without the serverless API.

## Build

```bash
npm run build        # tsc + vite build → dist/
npm run preview      # preview production build locally
```

## Project Structure

```
src/
├── pages/            # CreatorPage (editor + preview) and ViewerPage (read-only preview)
├── components/       # Toolbar, CodeEditor, PreviewFrame, ErrorPanel, etc.
├── hooks/            # useSandbox, useShare, useResolveHash, useDebouncedCode, usePanelResize
├── lib/              # Code cleaning, import rewriting, component detection, paste API
api/
├── share.ts          # POST — create paste (nanoid + Redis)
├── paste/[id].ts     # GET — fetch paste by ID
public/
├── sandbox.html      # Isolated iframe: Babel transpile + render + on-demand CDN libraries
```
