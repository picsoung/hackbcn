import { managedImageId } from '../media/shared'

export type CommunityProfile = {
  displayName: string
  avatarUrl: string
  bio: string
  linkedinUrl: string
  githubUrl: string
  revision: number
}

export class ProfileValidationError extends Error {
  constructor(public field: string) {
    super('Invalid profile field')
  }
}

export function profileImage(value: unknown) {
  if (typeof value !== 'string' || value.length > 2048) return ''
  if (value === '') return ''
  try {
    const url = new URL(value)
    if (
      (url.protocol === 'https:' ||
        (url.protocol === 'http:' &&
          ['localhost', '127.0.0.1'].includes(url.hostname) &&
          managedImageId(value))) &&
      !url.username &&
      !url.password
    )
      return url.href
  } catch {}
  return ''
}

export function personalProfileLink(
  value: string,
  service: 'linkedin' | 'github',
) {
  if (!value.trim()) return ''
  try {
    const url = new URL(value.trim())
    const hosts =
      service === 'linkedin'
        ? ['linkedin.com', 'www.linkedin.com']
        : ['github.com', 'www.github.com']
    const match =
      service === 'linkedin'
        ? url.pathname.match(/^\/in\/([^/]+)\/?$/)
        : url.pathname.match(/^\/([a-zA-Z0-9-]+)\/?$/)
    if (
      url.protocol !== 'https:' ||
      url.username ||
      url.password ||
      url.port ||
      !hosts.includes(url.hostname) ||
      !match
    )
      throw Error()
    const handle = decodeURIComponent(match[1])
    if (/[\s/@\\<>?#\u0000-\u001f]/.test(handle) || handle.length > 150)
      throw Error()
    return service === 'linkedin'
      ? `https://www.linkedin.com/in/${encodeURIComponent(handle)}/`
      : `https://github.com/${handle}`
  } catch {
    throw new ProfileValidationError(service + 'Url')
  }
}

export function validateCommunityProfile(input: unknown): CommunityProfile {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw new ProfileValidationError('profile')
  const data = input as Record<string, unknown>
  for (const field of [
    'displayName',
    'avatarUrl',
    'bio',
    'linkedinUrl',
    'githubUrl',
  ]) {
    if (typeof data[field] !== 'string') throw new ProfileValidationError(field)
  }
  const displayName = (data.displayName as string).trim()
  if (
    !displayName ||
    displayName.length > 120 ||
    /[\u0000-\u001f\u007f]/.test(displayName)
  )
    throw new ProfileValidationError('displayName')
  const bio = (data.bio as string).trim()
  if (bio.length > 600 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(bio))
    throw new ProfileValidationError('bio')
  const avatarUrl = profileImage(data.avatarUrl)
  if ((data.avatarUrl as string).trim() && !avatarUrl)
    throw new ProfileValidationError('avatarUrl')
  if (!Number.isSafeInteger(data.revision) || (data.revision as number) < 0)
    throw new ProfileValidationError('revision')
  return {
    displayName,
    bio,
    avatarUrl,
    linkedinUrl: personalProfileLink(data.linkedinUrl as string, 'linkedin'),
    githubUrl: personalProfileLink(data.githubUrl as string, 'github'),
    revision: data.revision as number,
  }
}

export function defaultCommunityProfile(
  name: string | null,
  avatar: string | null,
): CommunityProfile {
  return {
    displayName: name?.slice(0, 120) || 'HackBarna member',
    avatarUrl: profileImage(avatar),
    bio: '',
    linkedinUrl: '',
    githubUrl: '',
    revision: 0,
  }
}

/** Read-only public-credit matching. These editable links NEVER grant ownership or edit rights. */
export function profileMatchesLinks(
  profile: Pick<CommunityProfile, 'linkedinUrl' | 'githubUrl'>,
  links: Record<string, string>,
) {
  return (['linkedin', 'github'] as const).some((service) => {
    const saved = profile[service === 'linkedin' ? 'linkedinUrl' : 'githubUrl']
    if (!saved || !links[service]) return false
    try {
      return (
        personalProfileLink(saved, service).toLowerCase() ===
        personalProfileLink(links[service], service).toLowerCase()
      )
    } catch {
      return false
    }
  })
}
