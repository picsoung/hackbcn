import { youtubeId } from '@/app/helpers/youtube'
import type { Event } from '@/types/events'
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
  registrationUrl?: string
  recapVideoUrl?: string
  recapDuration?: number
}

// Format once on the server: Node and browser ICU versions can differ.
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

export function toHomeEvent(event: Event, locale: string): HomeEvent {
  return {
    slug: event.slug,
    name: event.name,
    startDate: event.startDate,
    dateLabel: formatHomeDate(event.startDate, event.endDate, locale),
    location: event.location.split(',')[0],
    imageUrl: event.imageUrl,
    eventType: event.eventType === 'hacknight' ? 'hacknight' : 'hackathon',
    registrationUrl: event.registrationUrl,
    recapVideoUrl: event.recapVideoUrl,
    recapDuration:
      youtubeId(event.recapVideoUrl ?? '') === 'Z3qFd-oT8Xo' ? 89 : undefined,
  }
}

export function getHomepageEvents(locale: string, limit = 6) {
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
  const recap = all.find((event) => youtubeId(event.recapVideoUrl ?? ''))
  return {
    total: all.length,
    events: all
      .slice(0, Math.max(0, limit))
      .map((event) => toHomeEvent(event, locale)),
    recap: recap ? toHomeEvent(recap, locale) : undefined,
  }
}
