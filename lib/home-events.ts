import { getProjects } from '@/app/helpers/projects'
import { getTestimonialsForEvent } from '@/data/testimonials'
import { getLiveEvent } from '@/lib/live/config'
import {
  getEventDataBySlug,
  getPastHackNights,
  getUnifiedPastEvents,
} from './events-server'

export type HomePastEvent = {
  slug: string
  name: string
  startDate: string
  endDate: string
  dateLabel: string
  location: string
  imageUrl?: string
  eventType: 'hackathon' | 'hacknight'
  projectCount?: number
  hasProjects: boolean
  postCount: number
  photoCount: number
  hasVideo: boolean
}

export function formatHomeEventDate(
  start: string,
  end: string,
  locale: string,
) {
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'Europe/Madrid',
  })
    .formatRange(new Date(start), new Date(end))
    .replace(/\s+/g, ' ')
}

export function getHomePastEvents(limit = 6, locale = 'en'): HomePastEvent[] {
  const projectCounts = new Map<string, number>()
  for (const project of getProjects()) {
    if (project.data.event)
      projectCounts.set(
        project.data.event,
        (projectCounts.get(project.data.event) ?? 0) + 1,
      )
  }
  const editions = new Map(
    [
      ...getUnifiedPastEvents(),
      ...getPastHackNights().flatMap((night) => {
        const event = getEventDataBySlug(night.slug)?.event
        return event ? [event] : []
      }),
    ].map((event) => [event.slug, event]),
  )

  return Array.from(editions.values())
    .sort((a, b) => Date.parse(b.startDate) - Date.parse(a.startDate))
    .slice(0, limit)
    .map((event) => {
      const count = projectCounts.get(event.slug) ?? 0
      // Live database totals belong on the event page, rather than a cached
      // homepage. Keep the project link without presenting a partial count.
      const live = Boolean(getLiveEvent(event.slug))
      return {
        slug: event.slug,
        name: event.name,
        startDate: event.startDate,
        endDate: event.endDate,
        dateLabel: formatHomeEventDate(event.startDate, event.endDate, locale),
        location: event.location,
        imageUrl: event.imageUrl,
        eventType: event.eventType === 'hacknight' ? 'hacknight' : 'hackathon',
        projectCount: live ? undefined : count,
        hasProjects: live || count > 0,
        postCount: getTestimonialsForEvent(event.slug).length,
        photoCount: event.gallery?.length ?? 0,
        hasVideo: Boolean(event.recapVideoUrl || event.shorts?.length),
      }
    })
}
