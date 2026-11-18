import extractedAvatars from '../data/maker-avatars.json'
import { testimonials } from '../data/testimonials'

/** Match public profile identities, never display names or project repository owners. */
export function makerProfileKey(value?: string): string | undefined {
  if (!value) return undefined
  try {
    const url = new URL(value)
    if (
      !['https:', 'http:'].includes(url.protocol) ||
      url.username ||
      url.password
    )
      return undefined
    const host = url.hostname.toLowerCase()
    if (/(^|\.)linkedin\.com$/.test(host)) {
      const match = url.pathname.match(/^\/in\/([^/]+)(?:\/[a-z]{2})?\/?$/i)
      return match
        ? `linkedin:${decodeURIComponent(match[1]).toLowerCase()}`
        : undefined
    }
    if (host === 'github.com' || host === 'www.github.com') {
      const match = url.pathname.match(/^\/([\w-]+)\/?$/)
      return match ? `github:${match[1].toLowerCase()}` : undefined
    }
  } catch {
    return undefined
  }
}

const avatars = new Map(
  [
    ...extractedAvatars,
    ...testimonials.flatMap((post) =>
      post.authorUrl && post.avatar && post.avatarKind !== 'logo'
        ? [{ profileUrl: post.authorUrl, image: post.avatar }]
        : [],
    ),
  ].flatMap(({ profileUrl, image }) => {
    const key = makerProfileKey(profileUrl)
    return key ? [[key, image] as const] : []
  }),
)

/** Images are checked in locally; rendering never scrapes a social profile. */
export function makerAvatar(links: Record<string, string>): string | undefined {
  for (const service of ['linkedin', 'github']) {
    const key = makerProfileKey(links[service])
    const image = key && avatars.get(key)
    if (image) return image
  }
}
