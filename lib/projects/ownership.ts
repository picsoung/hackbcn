export type ProjectVisibility = 'public' | 'private'
export type ProjectReference =
  | { kind: 'archive'; key: string; slug: string[] }
  | { kind: 'submitted'; key: string; event: string; slug: string }

const segment = /^[a-zA-Z0-9_-]{1,150}$/

/** Parse identifiers only: never fetch a submitted URL or use it as a file path. */
export function projectReference(input: unknown): ProjectReference | null {
  if (typeof input !== 'string' || input.length > 1000) return null
  let value = input.trim()
  try {
    if (/^https?:\/\//i.test(value)) {
      const url = new URL(value)
      if (
        url.username ||
        url.password ||
        (![
          'hackbarna.com',
          'www.hackbarna.com',
          'localhost',
          '127.0.0.1',
        ].includes(url.hostname) &&
          !url.hostname.endsWith('--hackbarna.netlify.app'))
      )
        return null
      const parts = url.pathname
        .split('/')
        .filter(Boolean)
        .map(decodeURIComponent)
      if (!['en', 'es', 'ca', 'fr'].includes(parts.shift() ?? '')) return null
      if (parts[0] === 'projects') value = `archive:${parts.slice(1).join('/')}`
      else if (
        parts.length === 4 &&
        parts[0] === 'events' &&
        parts[2] === 'projects'
      )
        value = `submitted:${parts[1]}:${parts[3]}`
      else return null
    }
    if (value.startsWith('archive:')) {
      const slug = value.slice(8).split('/')
      return slug.length > 0 &&
        slug.length <= 3 &&
        slug.every((part) => segment.test(part))
        ? { kind: 'archive', key: value, slug }
        : null
    }
    const parts = value.split(':')
    if (
      parts.length === 3 &&
      parts[0] === 'submitted' &&
      segment.test(parts[1]) &&
      segment.test(parts[2])
    )
      return { kind: 'submitted', key: value, event: parts[1], slug: parts[2] }
  } catch {}
  return null
}

export function isProjectOrganiser(
  user: { id: string; emailVerified: boolean; email?: string | null },
  ids = process.env.HACKBARNA_ORGANISER_IDS ?? '',
) {
  return (
    user.emailVerified &&
    !!user.email &&
    ids
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean)
      .includes(user.id)
  )
}

export class ProjectAccessError extends Error {
  constructor(
    public code: 'forbidden' | 'not_found' | 'conflict' | 'invalid' | 'limit',
    public status: number,
  ) {
    super(code)
  }
}
