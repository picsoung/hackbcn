import type { MetadataRoute } from 'next'
import {
  getAllUnifiedEvents,
  getFeaturedUpcomingEvent,
} from '@/lib/events-server'
import { hackNights } from '@/data/hacknights'
import i18nConfig from '../i18n.json'

const SITE = 'https://hackbarna.com'

// Past events keep their legacy URL as canonical. Newer events live at /events/<slug>.
const PAST_LEGACY_SLUGS = ['v1-2024', 'aisummit25']

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = [i18nConfig.locale.source, ...i18nConfig.locale.targets]
  const featured = getFeaturedUpcomingEvent()
  const allEvents = getAllUnifiedEvents()
  const newEventSlugs = allEvents
    .map((e) => e.slug)
    .filter((s) => !PAST_LEGACY_SLUGS.includes(s))
  const hackNightSlugs = hackNights.map((hn) => hn.slug)

  const now = new Date()

  function safeDate(input: unknown): Date {
    if (input instanceof Date && !isNaN(input.getTime())) return input
    const d = new Date(input as string)
    return isNaN(d.getTime()) ? now : d
  }

  const out: MetadataRoute.Sitemap = []

  for (const locale of locales) {
    // Homepage
    out.push({
      url: `${SITE}/${locale}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    })
    // Events list
    out.push({
      url: `${SITE}/${locale}/events`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    })

    // Past editions on legacy URL (canonical)
    for (const slug of PAST_LEGACY_SLUGS) {
      out.push({
        url: `${SITE}/${locale}/${slug}`,
        lastModified: now,
        changeFrequency: 'yearly',
        priority: 0.5,
      })
    }

    // New events at canonical /events/<slug>
    for (const slug of newEventSlugs) {
      const event = allEvents.find((e) => e.slug === slug)
      out.push({
        url: `${SITE}/${locale}/events/${slug}`,
        lastModified: event ? safeDate(event.endDate) : now,
        changeFrequency: 'monthly',
        priority: featured?.slug === slug ? 0.95 : 0.7,
      })
    }

    // Hack nights
    for (const slug of hackNightSlugs) {
      const hn = hackNights.find((x) => x.slug === slug)
      out.push({
        url: `${SITE}/${locale}/events/${slug}`,
        lastModified: hn ? safeDate(hn.endDate) : now,
        changeFrequency: 'yearly',
        priority: 0.4,
      })
    }
  }

  return out
}
