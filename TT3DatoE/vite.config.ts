import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'
import { promises as fs } from 'fs'
import path from 'path'

interface RepoFile {
  path: string
  type: 'blob' | 'tree'
  size: number
}

// Раздача файлов репозитория приложению (тот же способ, которым работает агент:
// репозиторий лежит на диске — читаем его напрямую).
function repoFileServer(): Plugin {
  const repoRoot = path.resolve(process.cwd(), '..')
  const EXCLUDED_DIRS = new Set([
    'node_modules', 'dist', 'build', '.git', '.gradle', '.idea',
    '__pycache__', 'vendor', '.next', '.cache',
  ])
  const BINARY_EXT = new Set([
    'apk', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'ico', 'bmp', 'svgz',
    'pdf', 'zip', 'gz', 'tar', '7z', 'rar', 'wasm', 'mp4', 'mp3',
    'ogg', 'wav', 'woff', 'woff2', 'ttf', 'otf', 'exe', 'dll', 'so',
    'o', 'a', 'keystore', 'jks', 'der', 'pyc', 'class',
  ])
  const MAX_SIZE = 300 * 1024

  async function walk(dir: string, base: string): Promise<RepoFile[]> {
    const out: RepoFile[] = []
    let entries
    try {
      entries = await fs.readdir(dir, { withFileTypes: true })
    } catch {
      return out
    }
    for (const e of entries) {
      const full = path.join(dir, e.name)
      const rel = path.relative(base, full).split(path.sep).join('/')
      if (e.isDirectory()) {
        if (EXCLUDED_DIRS.has(e.name)) continue
        out.push(...(await walk(full, base)))
      } else if (e.isFile()) {
        const name = e.name.toLowerCase()
        if (name === '.env' || name === '.env.local' || name === '.npmrc' || name === '.netrc') continue
        if (name.endsWith('.pem') || name.endsWith('.key') || name.endsWith('.keystore')) continue
        const ext = e.name.split('.').pop()?.toLowerCase() ?? ''
        if (BINARY_EXT.has(ext)) continue
        let stat
        try {
          stat = await fs.stat(full)
        } catch {
          continue
        }
        if (stat.size > MAX_SIZE) continue
        out.push({ path: rel, type: 'blob', size: stat.size })
      }
    }
    return out
  }

  function handle(req: import('http').IncomingMessage, res: import('http').ServerResponse) {
    const url = new URL(req.url ?? '/', 'http://localhost')
    res.setHeader('Cache-Control', 'no-store')
    if (url.pathname === '/__repo/tree') {
      walk(repoRoot, repoRoot)
        .then((files) => {
          files.sort((a, b) => a.path.localeCompare(b.path))
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(JSON.stringify(files))
        })
        .catch((e) => {
          res.statusCode = 500
          res.end(String(e))
        })
      return
    }
    if (url.pathname === '/__repo/file') {
      const rel = url.searchParams.get('path') ?? ''
      const full = path.resolve(repoRoot, rel)
      if (!full.startsWith(repoRoot + path.sep)) {
        res.statusCode = 403
        res.end('Forbidden')
        return
      }
      fs.readFile(full, 'utf-8')
        .then((text) => {
          res.setHeader('Content-Type', 'text/plain; charset=utf-8')
          res.end(text)
        })
        .catch((e) => {
          res.statusCode = 500
          res.end(String(e))
        })
      return
    }
    res.statusCode = 404
    res.end('Not found')
  }

  return {
    name: 'repo-file-server',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.startsWith('/__repo')) handle(req, res)
        else next()
      })
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.startsWith('/__repo')) handle(req, res)
        else next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), repoFileServer()],
  server: {
    allowedHosts: ['.monkeycode-ai.live'],
    proxy: {
      '/v1': {
        target: 'http://localhost:20128',
        changeOrigin: true,
      },
    },
  },
})
