import type { LibraryMapping } from '../types'

export const LIBRARY_REGISTRY: ReadonlyMap<string, LibraryMapping> = new Map([
  [
    'react',
    {
      packageName: 'react',
      globalName: 'React',
      cdnUrl: 'https://unpkg.com/react@18/umd/react.development.js',
      version: '18.x',
    },
  ],
  [
    'react-dom',
    {
      packageName: 'react-dom',
      globalName: 'ReactDOM',
      cdnUrl: 'https://unpkg.com/react-dom@18/umd/react-dom.development.js',
      version: '18.x',
    },
  ],
  [
    'react-dom/client',
    {
      packageName: 'react-dom/client',
      globalName: 'ReactDOM',
      cdnUrl: '',
      version: '18.x',
    },
  ],
  [
    'lucide-react',
    {
      packageName: 'lucide-react',
      globalName: 'LucideReact',
      cdnUrl: 'https://unpkg.com/lucide-react@latest/dist/umd/lucide-react.js',
      version: 'latest',
    },
  ],
  [
    'recharts',
    {
      packageName: 'recharts',
      globalName: 'Recharts',
      cdnUrl: 'https://unpkg.com/recharts@2/umd/Recharts.js',
      version: '2.x',
    },
  ],
  [
    'd3',
    {
      packageName: 'd3',
      globalName: 'd3',
      cdnUrl: 'https://unpkg.com/d3@7/dist/d3.min.js',
      version: '7.x',
    },
  ],
  [
    'three',
    {
      packageName: 'three',
      globalName: 'THREE',
      cdnUrl: 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
      version: 'r128',
    },
  ],
  [
    'lodash',
    {
      packageName: 'lodash',
      globalName: '_',
      cdnUrl: 'https://unpkg.com/lodash@4/lodash.min.js',
      version: '4.x',
    },
  ],
])

const SHADCN_PATTERN = /^@\/components\/ui\//

export function isShadcnImport(packageName: string): boolean {
  return SHADCN_PATTERN.test(packageName)
}

export function lookupLibrary(packageName: string): LibraryMapping | undefined {
  if (isShadcnImport(packageName)) {
    return {
      packageName,
      globalName: 'ShadcnUI',
      cdnUrl: 'https://cdn.jsdelivr.net/npm/shadcdn@0.0.8/+esm',
      version: '0.0.8',
    }
  }
  return LIBRARY_REGISTRY.get(packageName)
}

export const SIDE_EFFECT_PATTERNS = [/\.css$/, /\.scss$/, /\.less$/, /\.sass$/]

export const SUPPORTED_LIBRARY_NAMES = [
  'HTML',
  'React',
  'Tailwind CSS',
  'shadcn/ui',
  'Recharts',
  'Lucide',
  'D3',
  'Three.js',
  'Lodash',
] as const
