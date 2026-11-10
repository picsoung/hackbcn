/**
 * Events that have a live project wall. Only slugs listed here accept submissions and votes,
 * so random /events/<slug>/wall URLs can't create orphan data.
 *
 * Kept as plain data (not read from events/*.mdx) so the dynamic routes don't depend on
 * MDX files being bundled into the serverless function.
 */
export type LiveEvent = {
  slug: string
  name: string
  date: string
  venue: string
  registrationUrl: string
  image?: string
  hashtag: string
  /** Set to false after the event to freeze the wall: no new submissions or votes. */
  open: boolean
}

export const LIVE_EVENTS: Record<string, LiveEvent> = {
  'hacknight-5-jevathon-2026': {
    slug: 'hacknight-5-jevathon-2026',
    name: 'HackNight #5: Jev-a-thon',
    date: 'Tue 10 Nov 2026 · 17:30',
    venue: 'Itnig, Carrer de Pujades 100, Barcelona',
    registrationUrl: 'https://luma.com/fd8y5zmb',
    image:
      'https://images.lumacdn.com/uploads/dt/b80574ad-a7fa-468e-b802-c1da23ea9c47.jpg',
    hashtag: 'HackNightBCN',
    open: true,
  },
}

export function getLiveEvent(slug: string): LiveEvent | null {
  return Object.hasOwn(LIVE_EVENTS, slug) ? LIVE_EVENTS[slug] : null
}

export function wallPath(locale: string, eventSlug: string, project?: string) {
  return `/${locale}/events/${eventSlug}/wall${project ? `/${project}` : ''}`
}
