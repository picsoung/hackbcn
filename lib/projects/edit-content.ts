import { ProjectAccessError } from './ownership'

export type ProjectEditContent = {
  name: string
  description: string
  website: string
  video: string
  image?: string
}
export function validateProjectEdit(input: unknown): ProjectEditContent {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw new ProjectAccessError('invalid', 422)
  const data = input as Record<string, unknown>
  if (
    Object.keys(data).some(
      (key) =>
        !['name', 'description', 'website', 'video', 'image'].includes(key),
    )
  )
    throw new ProjectAccessError('invalid', 422)
  const text = (key: string, max: number, min = 0) => {
    const value = data[key]
    if (
      typeof value !== 'string' ||
      value.trim().length < min ||
      value.length > max ||
      /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)
    )
      throw new ProjectAccessError('invalid', 422)
    return value.trim()
  }
  const link = (key: string) => {
    const value = text(key, 2048)
    if (!value) return ''
    try {
      const url = new URL(value)
      if (
        !['https:', 'http:'].includes(url.protocol) ||
        url.username ||
        url.password
      )
        throw new Error()
      return url.href
    } catch {
      throw new ProjectAccessError('invalid', 422)
    }
  }
  let image: string | undefined
  if (data.image !== undefined) {
    image = text('image', 2048)
    if (image) {
      try {
        const url = new URL(image, 'https://www.hackbarna.com')
        if (
          !['https:', 'http:'].includes(url.protocol) ||
          url.username ||
          url.password ||
          image.includes('\\') ||
          image.startsWith('//')
        )
          throw new Error()
      } catch {
        throw new ProjectAccessError('invalid', 422)
      }
    }
  }
  return {
    ...(image !== undefined ? { image } : {}),
    name: text('name', 160, 1),
    description: text('description', 2000, 1),
    website: link('website'),
    video: link('video'),
  }
}
