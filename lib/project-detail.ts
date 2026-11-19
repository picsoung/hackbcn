import type { Project } from '../app/helpers/projects'
import { videoEmbed } from './live/validate'
import { archivedProjectDemo, archivedProjectUrl } from './archived-project'
import { makerAvatar } from './maker-avatar'

export type ProjectBuilder = {
  name: string
  href?: string
  role?: string
  image?: string
  links: Record<string, string>
}

export type ProjectLink = { type: string; href: string }
export type ProjectMedia =
  | { type: 'youtube'; id: string; timestamp: string; thumbnail?: string }
  | { type: 'embed'; src: string }
  | { type: 'image'; src: string }

const profileServices = [
  'linkedin',
  'github',
  'twitter',
  'website',
  'medium',
  'gitlab',
  'bluesky',
  'mastodon',
]

export function projectBuilder(source: {
  name: string
  description?: string
  job?: string
  image?: { src?: string }
  links?: Record<string, string | undefined>
  linkedinUrl?: string | null
}): ProjectBuilder {
  const links = Object.fromEntries(
    profileServices.flatMap((service) => {
      const url = archivedProjectUrl(
        service === 'linkedin'
          ? source.linkedinUrl || source.links?.linkedin
          : source.links?.[service],
      )
      return url ? [[service, url]] : []
    }),
  )
  const photo = source.image?.src
  return {
    name: source.name.trim(),
    role: source.description || source.job || undefined,
    image:
      photo?.startsWith('/') && !photo.startsWith('//')
        ? photo
        : archivedProjectUrl(photo) || makerAvatar(links),
    links,
  }
}

/** Normalize both archived metadata and submitted-project actions without dropping distinct links. */
export function projectLinks(
  entries: [string, string | null | undefined][],
): ProjectLink[] {
  const seen = new Set<string>()
  const priority: Record<string, number> = {
    website: 0,
    github: 1,
    video: 2,
    youtube: 2,
    screenshot: 3,
  }
  return entries
    .slice()
    .sort(([a], [b]) => (priority[a] ?? 4) - (priority[b] ?? 4))
    .flatMap(([type, value]) => {
      const href =
        value?.startsWith('/') && !value.startsWith('//')
          ? value
          : archivedProjectUrl(value ?? undefined)
      if (!href || seen.has(href)) return []
      seen.add(href)
      return [{ type, href }]
    })
}

export function projectVideo(
  url?: string | null,
  thumbnail?: string,
): ProjectMedia | undefined {
  const youtube = archivedProjectDemo(url ?? undefined)
  if (youtube)
    return { type: 'youtube', ...youtube, thumbnail: thumbnail || undefined }
  const embed = videoEmbed(url ?? null)
  return embed && !embed.includes('youtube')
    ? { type: 'embed', src: embed }
    : undefined
}

/** Move the first historical MDX demo into the same media slot as every other project. */
export function archivedProjectContent(project: Project): {
  content: string
  media?: ProjectMedia
} {
  const { data } = project
  if (data.contentFormat !== 'markdown') {
    const inline = project.content.match(/<YouTube\b([^>]*?)\/>/)
    if (inline) {
      const attributes = Object.fromEntries(
        Array.from(inline[1].matchAll(/(\w+)="([^"]*)"/g), (match) => [
          match[1],
          match[2],
        ]),
      )
      if (
        /^[\w-]{11}$/.test(attributes.id ?? '') &&
        /^\d+$/.test(attributes.timestamp ?? '0')
      ) {
        return {
          content: project.content.replace(inline[0], '').trim(),
          media: {
            type: 'youtube',
            id: attributes.id,
            timestamp: attributes.timestamp ?? '0',
            thumbnail: attributes.thumbnail || data.thumbnailUrl || undefined,
          },
        }
      }
    }
  }
  return {
    content: project.content,
    media:
      projectVideo(data.youtubeLink, data.thumbnailUrl) ??
      (data.thumbnailUrl
        ? { type: 'image', src: data.thumbnailUrl }
        : undefined),
  }
}
