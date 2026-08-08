import fs from 'node:fs'
import path from 'node:path'

const MIME_TYPES: Record<string, string> = {
  '.gif': 'image/gif',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
}

/**
 * ImageResponse does not have a browser document URL to resolve relative image
 * paths against. For assets in /public, read the bytes in the Node runtime and
 * inline them as a data URL so OG rendering is self-contained. Remote images
 * remain remote URLs.
 */
export function getOgImageSource(imageUrl?: string): string | undefined {
  if (!imageUrl) return undefined
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl

  const publicDir = path.resolve(process.cwd(), 'public')
  const relativePath = imageUrl.replace(/^\/+/, '')
  const filePath = path.resolve(publicDir, relativePath)

  // Event content is trusted, but keep this helper constrained to /public.
  if (filePath !== publicDir && !filePath.startsWith(`${publicDir}${path.sep}`)) {
    return undefined
  }

  const mimeType = MIME_TYPES[path.extname(filePath).toLowerCase()]
  if (!mimeType) return undefined

  try {
    const file = fs.readFileSync(filePath)
    return `data:${mimeType};base64,${file.toString('base64')}`
  } catch {
    return undefined
  }
}
