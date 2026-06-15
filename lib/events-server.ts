// SERVER ONLY. Do not import from client components — pulls fs/path/glob via
// lib/event-content. Anything calling these helpers must run in a server
// component or generateStaticParams.

import type { Event, EventData } from '@/types/events'
import type { Sponsor } from '@/data/sponsors'

import { events as legacyEvents } from './events'
import { getSponsorsByEvent } from '@/data/sponsors'
import { getCommunitySponsorsByEvent } from '@/data/communitySponsors'
import { getJudgesByEvent } from '@/data/judges'
import { getMentorsByEvent } from '@/data/mentors'
import {
  hackNights,
  getHackNightBySlug,
  getUpcomingHackNights,
  getPastHackNights,
} from '@/data/hacknights'
import type { HackNight } from '@/data/hacknights'
import { getAllMdxEvents, readMdxEvent } from './event-content'

function hackNightToEvent(hn: HackNight): Event {
  return {
    id: hn.id,
    slug: hn.slug,
    year: String(new Date(hn.date).getUTCFullYear()),
    name: hn.name,
    active: false,
    startDate: hn.date,
    endDate: hn.endDate,
    location: hn.location,
    timeZone: 'Europe/Madrid',
    eventType: 'hacknight',
    description: hn.description,
    registrationUrl: hn.registrationUrl,
    imageUrl: hn.imageUrl,
    topic: hn.topic,
    sponsor: hn.sponsor,
    capacity: hn.capacity,
    gallery: hn.gallery,
    projectLinks: hn.projectLinks,
    past: hn.past,
    recapVideoUrl: hn.recapVideoUrl,
    shorts: hn.shorts,
    schedule: hn.schedule,
    faq: hn.faq,
    partners: hn.partners,
  }
}

export type ShortRef = { url: string; eventName: string; eventSlug: string }

// Aggregate vertical Shorts across all events + hack nights, most recent first.
// Used by the homepage ShortsStrip.
export function getRecentShorts(limit = 8): ShortRef[] {
  const fromMdx = getAllMdxEvents().map((m) => m.event)
  const fromHackNights = hackNights.map(hackNightToEvent)
  const all = [...fromMdx, ...legacyEvents, ...fromHackNights]
    .filter((e) => e.shorts && e.shorts.length > 0)
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())

  const out: ShortRef[] = []
  for (const event of all) {
    for (const url of event.shorts ?? []) {
      out.push({ url, eventName: event.name, eventSlug: event.slug })
      if (out.length >= limit) return out
    }
  }
  return out
}

// All known event slugs across all sources. Used by generateStaticParams.
export function getAllUnifiedEventSlugs(): string[] {
  const mdxSlugs = getAllMdxEvents().map((m) => m.event.slug)
  const legacySlugs = legacyEvents.map((e) => e.slug)
  const hackNightSlugs = hackNights.map((hn) => hn.slug)
  return Array.from(new Set([...mdxSlugs, ...legacySlugs, ...hackNightSlugs]))
}

// Returns the full bundle: event + sponsors + community sponsors + judges + mentors.
// MDX-first lookup; falls back to legacy TS data for past events; falls back to
// hack nights (converted to Event shape) for hack-night slugs.
export function getEventDataBySlug(slug: string): EventData | null {
  const mdx = readMdxEvent(slug)
  if (mdx) {
    return {
      event: mdx.event,
      sponsors: mdx.sponsors,
      communitySponsors: mdx.communitySponsors,
      judges: mdx.judges,
      mentors: mdx.mentors,
    }
  }

  const legacy = legacyEvents.find((e) => e.slug === slug)
  if (legacy) {
    return {
      event: legacy,
      sponsors: getSponsorsByEvent(slug).sponsors,
      communitySponsors: getCommunitySponsorsByEvent(slug).communitySponsors,
      judges: getJudgesByEvent(slug).judges,
      mentors: getMentorsByEvent(slug).mentors,
    }
  }

  const hn = getHackNightBySlug(slug)
  if (hn) {
    return {
      event: hackNightToEvent(hn),
      sponsors: [],
      communitySponsors: [],
      judges: [],
      mentors: [],
    }
  }

  return null
}

// Returns all events (MDX + legacy) as Event objects. Does NOT include hack nights —
// most callers (UpcomingEvents, OrgNavbar ribbon) want hackathons-style events.
export function getAllUnifiedEvents(): Event[] {
  const fromMdx = getAllMdxEvents().map((m) => m.event)
  return [...fromMdx, ...legacyEvents]
}

export function getUnifiedUpcomingEvents(): Event[] {
  const now = Date.now()
  return getAllUnifiedEvents()
    .filter((e) => new Date(e.startDate).getTime() > now)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
}

export function getUnifiedPastEvents(): Event[] {
  const now = Date.now()
  return getAllUnifiedEvents()
    .filter((e) => new Date(e.endDate).getTime() < now)
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
}

// All upcoming events (hackathons + hack nights), soonest first.
export function getAllUpcoming(): Event[] {
  const now = Date.now()
  const allEvents = getAllUnifiedEvents()
  const hackNightsAsEvents = hackNights.map(hackNightToEvent)
  return [...allEvents, ...hackNightsAsEvents]
    .filter((e) => new Date(e.startDate).getTime() > now)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
}

// Featured: next upcoming hackathon-or-hacknight by start date.
export function getFeaturedUpcomingEvent(): Event | null {
  return getAllUpcoming()[0] ?? null
}

// Hack nights store their sponsor as a free-text string. Map the ones we have
// brand logos for so they can surface in the homepage partners marquee.
const HACKNIGHT_SPONSOR_LOGOS: Record<string, { logo: string; url: string }> = {
  Netlify: { logo: '/logos/netlify.svg', url: 'https://www.netlify.com/' },
}

function hackNightPartnerSponsors(): Sponsor[] {
  const out: Sponsor[] = []
  for (const hn of hackNights) {
    const meta = hn.sponsor ? HACKNIGHT_SPONSOR_LOGOS[hn.sponsor] : undefined
    if (meta) out.push({ name: hn.sponsor as string, logo: meta.logo, url: meta.url })
  }
  return out
}

// Aggregator for the PartnersBar marquee on the homepage.
export function getAllSponsorsAcrossEvents(): Sponsor[] {
  const fromMdx = getAllMdxEvents().flatMap((m) => m.sponsors)
  const fromLegacy = legacyEvents.flatMap(
    (e) => getSponsorsByEvent(e.slug).sponsors
  )
  return dedupeByName([...fromMdx, ...fromLegacy, ...hackNightPartnerSponsors()])
}

export function getAllCommunitySponsorsAcrossEvents(): Sponsor[] {
  const fromMdx = getAllMdxEvents().flatMap((m) => m.communitySponsors)
  const fromLegacy = legacyEvents.flatMap(
    (e) => getCommunitySponsorsByEvent(e.slug).communitySponsors
  )
  return dedupeByName([...fromMdx, ...fromLegacy])
}

function dedupeByName<T extends { name: string }>(items: T[]): T[] {
  const seen = new Set<string>()
  const out: T[] = []
  for (const item of items) {
    if (seen.has(item.name)) continue
    seen.add(item.name)
    out.push(item)
  }
  return out
}

// Hack-night helpers re-exported here so server pages can pull everything
// they need from one module.
export { getUpcomingHackNights, getPastHackNights }
