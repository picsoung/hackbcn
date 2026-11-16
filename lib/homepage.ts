import { getProjects } from '@/app/helpers/projects'
import { getLiveEvent } from '@/lib/live/config'
import type { Event, GalleryPhoto } from '@/types/events'
import {
  getEventDataBySlug,
  getPastHackNights,
  getUnifiedPastEvents,
} from './events-server'

export type HomeEvent = {
  slug: string
  name: string
  startDate: string
  dateLabel: string
  location: string
  imageUrl?: string
  eventType: 'hackathon' | 'hacknight'
  photo?: GalleryPhoto
  galleryCredit?: Event['galleryCredit']
  recapVideoUrl?: string
  hasVideo: boolean
  hasProjects: boolean
  projectCount?: number
}

// Date ranges are formatted once on the server. Browser and Node ICU versions
// can produce different spacing, which otherwise breaks hydration.
export function formatHomeDate(start: string, end: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'Europe/Madrid',
  })
    .formatRange(new Date(start), new Date(end))
    .replace(/\s+/g, ' ')
}

export function getHomepageEvents(locale: string, limit = 6) {
  const counts = new Map<string, number>()
  for (const project of getProjects()) {
    if (project.data.event)
      counts.set(project.data.event, (counts.get(project.data.event) ?? 0) + 1)
  }
  const all = Array.from(
    new Map(
      [
        ...getUnifiedPastEvents(),
        ...getPastHackNights().flatMap((night) => {
          const event = getEventDataBySlug(night.slug)?.event
          return event ? [event] : []
        }),
      ].map((event) => [event.slug, event]),
    ).values(),
  ).sort((a, b) => Date.parse(b.startDate) - Date.parse(a.startDate))

  const selected = [
    all.find((event) => event.eventType === 'hacknight'),
    all.find((event) => event.eventType !== 'hacknight'),
  ].filter((event): event is Event => Boolean(event))
  for (const event of all) {
    if (selected.length >= 2) break
    if (!selected.some((item) => item.slug === event.slug)) selected.push(event)
  }
  const featured = selected.slice(0, Math.max(0, limit))
  const compact = all
    .filter((event) => !featured.some((item) => item.slug === event.slug))
    .slice(0, Math.max(0, limit - featured.length))
  const summary = (event: Event): HomeEvent => {
    const live = Boolean(getLiveEvent(event.slug))
    const count = counts.get(event.slug) ?? 0
    return {
      slug: event.slug,
      name: event.name,
      startDate: event.startDate,
      dateLabel: formatHomeDate(event.startDate, event.endDate, locale),
      location: event.location.split(',')[0],
      imageUrl: event.imageUrl,
      eventType: event.eventType === 'hacknight' ? 'hacknight' : 'hackathon',
      photo: event.gallery?.[0],
      galleryCredit: event.galleryCredit,
      recapVideoUrl: event.recapVideoUrl,
      hasVideo: Boolean(event.recapVideoUrl || event.shorts?.length),
      hasProjects: live || count > 0,
      // The live wall has its own database count on the event page.
      projectCount: live ? undefined : count,
    }
  }
  return {
    total: all.length,
    featured: featured.map(summary),
    compact: compact.map(summary),
  }
}
