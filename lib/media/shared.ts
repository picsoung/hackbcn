export const MAX_IMAGE_BYTES = 4 * 1024 * 1024
export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const assetPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
/** Match the exact managed path. Ownership and origin are checked on the server. */
export function managedImageId(value: string) {
  try {
    const url = new URL(value, 'https://www.hackbarna.com')
    const match = url.pathname.match(/^\/api\/media\/([^/]+)$/)
    return match && assetPattern.test(match[1]) && !url.search && !url.hash
      ? match[1].toLowerCase()
      : null
  } catch {
    return null
  }
}

export class ImageUploadError extends Error {
  constructor(
    public code: 'invalid_image' | 'too_large' | 'limit',
    public status: number,
  ) {
    super(code)
  }
}
