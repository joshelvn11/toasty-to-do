import fs from 'node:fs'
import path from 'node:path'

const clientDistPath = path.resolve(process.cwd(), 'dist/client')

const contentTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.gif', 'image/gif'],
  ['.html', 'text/html; charset=utf-8'],
  ['.ico', 'image/x-icon'],
  ['.jpg', 'image/jpeg'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.webp', 'image/webp'],
  ['.woff2', 'font/woff2'],
])

export function hasClientBuild() {
  return fs.existsSync(clientDistPath)
}

export function resolveStaticAssetPath(requestPath: string) {
  const safePath = path.posix.normalize(requestPath)
  const assetPath = safePath === '/' ? '/index.html' : safePath
  const candidatePath = path.resolve(clientDistPath, `.${assetPath}`)

  if (!candidatePath.startsWith(clientDistPath)) {
    return null
  }

  if (!fs.existsSync(candidatePath) || !fs.statSync(candidatePath).isFile()) {
    return null
  }

  return candidatePath
}

export function getStaticContentType(filePath: string) {
  return contentTypes.get(path.extname(filePath).toLowerCase())
}
