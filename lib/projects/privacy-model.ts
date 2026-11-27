import { projectReference } from './ownership'

export const PRIVACY_FIELDS = [
  'linkedin',
  'github',
  'otherLinks',
  'photo',
  'bio',
] as const
export type PrivacyField = (typeof PRIVACY_FIELDS)[number]
export type PrivacySetting = {
  subjectKey: string
  hidden: boolean
  hiddenFields: PrivacyField[]
  revision: number
}
export type BuilderBinding = {
  projectKey: string
  creditIndex: number
  rosterDigest: string
  accountId: string
}

export function privacySubject(key: unknown) {
  if (typeof key !== 'string' || key.length > 1200) return null
  if (/^builder:[a-z0-9-]{1,80}$/.test(key))
    return { kind: 'builder' as const, slug: key.slice(8), key }
  if (key.startsWith('project:')) {
    const project = projectReference(key.slice(8))
    return project && key === `project:${project.key}`
      ? { kind: 'project' as const, projectKey: project.key, key }
      : null
  }
  if (key.startsWith('credit:')) {
    const end = key.lastIndexOf(':'),
      project = projectReference(key.slice(7, end)),
      slug = key.slice(end + 1)
    return project &&
      /^[a-z0-9-]{1,80}$/.test(slug) &&
      key === `credit:${project.key}:${slug}`
      ? { kind: 'credit' as const, projectKey: project.key, slug, key }
      : null
  }
  return null
}
export function visibleLinks(
  links: Record<string, string>,
  fields: readonly PrivacyField[],
) {
  return Object.fromEntries(
    Object.entries(links).filter(
      ([service, url]) =>
        !fields.includes(
          service === 'linkedin'
            ? 'linkedin'
            : service === 'github'
              ? 'github'
              : 'otherLinks',
        ) && !!visibleProjectUrl(url, fields),
    ),
  )
}
export function maskBuilderFields<
  T extends {
    name?: string
    links: Record<string, string>
    image?: string
    bio?: string
    role?: string
  },
>(builder: T, fields: readonly PrivacyField[]): T {
  if (!fields.length) return builder
  return {
    ...builder,
    ...(typeof builder.name === 'string'
      ? { name: visibleTextLinks(builder.name, fields) }
      : {}),
    links: visibleLinks(builder.links, fields),
    ...(fields.includes('photo') ? { image: undefined } : {}),
    ...(fields.includes('bio')
      ? { bio: undefined, role: undefined }
      : {
          bio: builder.bio ? visibleTextLinks(builder.bio, fields) : undefined,
          role: builder.role
            ? visibleTextLinks(builder.role, fields)
            : undefined,
        }),
  }
}
export function visibleProjectUrl(
  url: string | null | undefined,
  fields: readonly PrivacyField[],
) {
  if (!url) return ''
  try {
    const host = new URL(
      /^https?:\/\//i.test(url) ? url : `https://${url}`,
    ).hostname.toLowerCase()
    const field = /(^|\.)github\.com$/.test(host)
      ? 'github'
      : /(^|\.)linkedin\.com$/.test(host)
        ? 'linkedin'
        : 'otherLinks'
    return fields.includes(field) ? '' : url
  } catch {
    return fields.includes('otherLinks') ? '' : url
  }
}
export function privacySetting(
  subjectKey: string,
  row?: { hidden: boolean; hiddenFields: PrivacyField[]; revision: number },
): PrivacySetting {
  return {
    subjectKey,
    hidden: row?.hidden ?? false,
    hiddenFields: row?.hiddenFields ?? [],
    revision: row?.revision ?? 0,
  }
}
export function visibleTextLinks(
  text: string,
  fields: readonly PrivacyField[],
) {
  return text.replace(
    /(?:https?:\/\/|www\.|(?:github|linkedin)\.com\/)[^\s<>"')\]]+/gi,
    (url) => visibleProjectUrl(url, fields) || '#',
  )
}
