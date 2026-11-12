import type { Metadata } from 'next'

export function siteOrigin() {
  const origin = (
    process.env.SITE_ORIGIN || 'https://www.hackbarna.com'
  ).replace(/\/$/, '')
  return origin === 'https://hackbarna.com'
    ? 'https://www.hackbarna.com'
    : origin
}

export function projectListPath(
  locale: string,
  event: string,
  project?: string,
) {
  if (project)
    return `/${locale}/events/${encodeURIComponent(event)}/projects/${encodeURIComponent(project)}`
  const eventPath = ['v1-2024', 'aisummit25'].includes(event)
    ? `/${locale}/${encodeURIComponent(event)}`
    : `/${locale}/events/${encodeURIComponent(event)}`
  return `${eventPath}#projects`
}

export function projectMetadata(
  path: string,
  title: string,
  description: string,
): Metadata {
  const url = `${siteOrigin()}${path}`
  return {
    title: `${title} · HackBarna`,
    description,
    alternates: { canonical: url, languages: {} },
    openGraph: {
      type: 'website',
      title,
      description,
      url,
      siteName: 'HackBarna',
    },
    twitter: { card: 'summary_large_image', title, description },
  }
}

// Project names and pitches are untrusted user input, including inside JSON-LD.
export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}

export function validProjectDate(value: unknown): Date | undefined {
  if (value == null) return undefined
  const date = value instanceof Date ? value : new Date(value as string)
  return Number.isFinite(date.getTime()) ? date : undefined
}

export function projectListSchema(
  name: string,
  path: string,
  projects: { name: string; path: string }[],
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    url: `${siteOrigin()}${path}`,
    numberOfItems: projects.length,
    itemListElement: projects.map((project, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: project.name,
      url: `${siteOrigin()}${project.path}`,
    })),
  }
}
