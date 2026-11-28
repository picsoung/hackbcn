import { createHash } from 'node:crypto'
import { makerProfileKey } from './maker-avatar'
import { projectBuilder, type ProjectBuilder } from './project-detail'

export type BuilderCredit = { projectKey: string; index: number }
export type BuilderProfile = {
  slug: string
  name: string
  image?: string
  bio?: string
  claimed?: boolean
  edited?: boolean
  links: Record<string, string>
  credits: BuilderCredit[]
  projectKeys: string[]
}

export function builderProfilePath(locale: string, slug: string) {
  return `/${locale}/builders/${encodeURIComponent(slug)}`
}

function profileKey(value?: string, service?: 'linkedin' | 'github') {
  const key = makerProfileKey(value)
  return key &&
    (!service || key.startsWith(`${service}:`)) &&
    !/[\s/@\\<>?#]/.test(key.slice(key.indexOf(':') + 1))
    ? key
    : undefined
}

function publicLink(service: string, value: string) {
  if (service === 'linkedin' || service === 'github') {
    const key = profileKey(value)
    if (!key?.startsWith(`${service}:`)) return undefined
    const handle = key.slice(key.indexOf(':') + 1)
    return service === 'linkedin'
      ? `https://www.linkedin.com/in/${encodeURIComponent(handle)}/`
      : `https://github.com/${handle}`
  }
  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol) &&
      !url.username &&
      !url.password
      ? url.href
      : undefined
  } catch {
    return undefined
  }
}

function identitySlug(identity: string) {
  const handle = identity.startsWith('credit:')
    ? 'builder'
    : identity.slice(identity.indexOf(':') + 1)
  const prefix =
    handle
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 60) || 'builder'
  // Only public profile identity or a public project credit enters this hash.
  return `${prefix}-${createHash('sha256').update(identity).digest('hex').slice(0, 12)}`
}

function nameScore(name: string) {
  return (
    name.split(/\s+/).length * 1000 +
    name.length * 10 +
    (name.match(/[A-Z]/g)?.length ?? 0)
  )
}

/** Public identity joins only. Names alone never combine credits across projects. */
export function buildBuilderDirectory(
  entries: { projectKey: string; builders: ProjectBuilder[] }[],
): BuilderProfile[] {
  const credits = entries.flatMap(({ projectKey, builders }) =>
    builders.flatMap((source, index) => {
      if (!source.name.trim()) return []
      const builder = projectBuilder({
        name: source.name,
        description: source.role,
        image: { src: source.image },
        links: source.links,
        creditIndex: source.creditIndex,
        profileSlug: source.profileSlug,
        hiddenFields: source.hiddenFields,
      })
      if (builder.image && !builder.image.startsWith('/'))
        builder.image = publicLink('image', builder.image)
      return [
        {
          projectKey,
          index: source.creditIndex ?? index,
          builder,
          linkedin: profileKey(builder.links.linkedin, 'linkedin'),
          github: profileKey(builder.links.github, 'github'),
        },
      ]
    }),
  )
  const githubOwners = new Map<string, Set<string>>()
  for (const credit of credits) {
    if (!credit.linkedin || !credit.github) continue
    const owners = githubOwners.get(credit.github) ?? new Set<string>()
    owners.add(credit.linkedin)
    githubOwners.set(credit.github, owners)
  }
  const groups = new Map<string, typeof credits>()
  for (const credit of credits) {
    const owners = credit.github ? githubOwners.get(credit.github) : undefined
    const identity =
      (credit.builder.profileSlug
        ? `builder:${credit.builder.profileSlug}`
        : undefined) ||
      credit.linkedin ||
      (credit.github && (!owners || owners.size <= 1)
        ? owners?.values().next().value || credit.github
        : undefined) ||
      `credit:${credit.projectKey}:${credit.index}:${credit.builder.name}`
    const group = groups.get(identity) ?? []
    group.push(credit)
    groups.set(identity, group)
  }
  return Array.from(groups, ([identity, group]) => {
    const names = group
      .map(({ builder }) => builder.name)
      .sort((a, b) => nameScore(b) - nameScore(a) || a.localeCompare(b))
    const candidates = new Map<string, Set<string>>()
    for (const { builder } of group) {
      for (const [service, value] of Object.entries(builder.links)) {
        const link = publicLink(service, value)
        if (!link) continue
        const urls = candidates.get(service) ?? new Set<string>()
        urls.add(link)
        candidates.set(service, urls)
      }
    }
    return {
      slug: identity.startsWith('builder:')
        ? identity.slice(8)
        : identitySlug(identity),
      name: names[0],
      image: group.find(({ builder }) => builder.image)?.builder.image,
      links: Object.fromEntries(
        Array.from(candidates)
          .filter(([, urls]) => urls.size === 1)
          .map(([service, urls]) => [service, Array.from(urls)[0]]),
      ),
      credits: group.map(({ projectKey, index }) => ({ projectKey, index })),
      projectKeys: Array.from(
        new Set(group.map(({ projectKey }) => projectKey)),
      ),
    }
  }).sort((a, b) => a.name.localeCompare(b.name))
}

export function builderForCredit(
  profiles: BuilderProfile[],
  projectKey: string,
  index: number,
) {
  return profiles.find((profile) =>
    profile.credits.some(
      (credit) => credit.projectKey === projectKey && credit.index === index,
    ),
  )
}
