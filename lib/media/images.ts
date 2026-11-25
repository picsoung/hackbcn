import 'server-only'
import sharp from 'sharp'
import { imageType } from '../live/media'
import { MAX_IMAGE_BYTES, IMAGE_TYPES, ImageUploadError } from './shared'

export { ImageUploadError } from './shared'
export async function readImageBody(request: Request) {
  if (
    !IMAGE_TYPES.includes(
      request.headers.get('content-type')?.split(';')[0] ?? '',
    )
  )
    throw new ImageUploadError('invalid_image', 415)
  const length = Number(request.headers.get('content-length'))
  if (length > MAX_IMAGE_BYTES) throw new ImageUploadError('too_large', 413)
  const reader = request.body?.getReader()
  if (!reader) throw new ImageUploadError('invalid_image', 422)
  const chunks: Uint8Array[] = []
  let size = 0
  try {
    for (;;) {
      const result = await reader.read()
      if (result.done) break
      size += result.value.byteLength
      if (size > MAX_IMAGE_BYTES) {
        await reader.cancel()
        throw new ImageUploadError('too_large', 413)
      }
      chunks.push(result.value)
    }
  } finally {
    reader.releaseLock()
  }
  return Buffer.concat(chunks)
}
export async function normalizeImage(
  bytes: Buffer,
  purpose: 'avatar' | 'project',
) {
  if (!bytes.length) throw new ImageUploadError('invalid_image', 422)
  if (bytes.length > MAX_IMAGE_BYTES)
    throw new ImageUploadError('too_large', 413)
  if (!IMAGE_TYPES.includes(imageType(bytes) ?? ''))
    throw new ImageUploadError('invalid_image', 422)
  try {
    const image = sharp(bytes, {
      limitInputPixels: 24_000_000,
      failOn: 'warning',
    })
    const metadata = await image.metadata()
    if (
      !['jpeg', 'png', 'webp'].includes(metadata.format ?? '') ||
      (metadata.pages ?? 1) > 1
    )
      throw new Error()
    // Auto-orient, decode and re-encode: no original file, SVG, animation, EXIF or GPS metadata survives.
    return await image
      .rotate()
      .resize(
        purpose === 'avatar'
          ? { width: 512, height: 512, fit: 'cover' }
          : {
              width: 1600,
              height: 1200,
              fit: 'inside',
              withoutEnlargement: true,
            },
      )
      .webp({ quality: 84 })
      .toBuffer()
  } catch {
    throw new ImageUploadError('invalid_image', 422)
  }
}
