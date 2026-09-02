import type { Sponsor } from '@/data/sponsors'
import type { Person } from '@/app/helpers/projects'

export type ScheduleItem = {
  title: string
  sections: {
    name: string
    items: string[]
  }[]
}

export type EventType = 'hackathon' | 'hacknight'

export type Event = {
  id: string
  slug: string
  year: string
  name: string
  active: boolean
  startDate: string
  endDate: string
  location: string
  timeZone?: Intl.DateTimeFormatOptions['timeZone']
  eventType: EventType
  description?: { [locale: string]: string }
  registrationUrl?: string
  imageUrl?: string
  schedule?: {
    [locale: string]: ScheduleItem[]
  }
  // Hacknight-friendly extras
  topic?: string
  sponsor?: string // "presented by" pill (hacknight)
  capacity?: number
  gallery?: string[]
  projectLinks?: string[]
  past?: boolean // optional override; usually computed from endDate
  // Recap video
  recapVideoUrl?: string // long-form aftermovie (landscape)
  shorts?: string[] // vertical clips / YouTube Shorts
  // Event-specific FAQ (hack nights). Hackathons use the shared i18n FAQ.
  faq?: { [locale: string]: { q: string; a: string }[] }
  // Sponsored problem statements for this edition. Each challenge ties to a
  // sponsor by name (reusing that sponsor's logo/url) and carries its own prize.
  // Localized like schedule/faq.
  challenges?: { [locale: string]: Challenge[] }
  // Top / overall prizes for the edition (distinct from the per-challenge prize).
  prizes?: { [locale: string]: Prize[] }
  // Partners with roles (hack nights): main sponsor, venue, co-organizer, etc.
  partners?: Partner[]
  // Visual register for this edition's detail page. Omit for the parent
  // HackBarna ladder; 'night-sea' swaps to the cooler rungs and promotes amber
  // to the primary accent. This is the whole per-event theming hook, on
  // purpose: a full theming system is not warranted by two editions.
  register?: 'night' | 'night-sea'
}

export type Partner = {
  name: string
  role: string
  url?: string
  logo?: string
}

// A sponsored challenge/track. `sponsor` matches a Sponsor.name in the same
// event so the UI can reuse that sponsor's logo and url; `prize` is free text
// for this challenge's reward.
export type Challenge = {
  title: string
  description: string
  sponsor?: string
  prize?: string
  // Optional labeled lists (e.g. "Requirements", "What a strong submission looks like").
  details?: { heading: string; items: string[] }[]
}

// A top/overall prize row.
export type Prize = {
  place: string // "Grand Prize", "2nd", "Best Rookie", ...
  title?: string
  value?: string
  description?: string
  perks?: string[] // itemized rewards, rendered as a list
}

// Bundle returned by the unified getEventDataBySlug helper.
// Page-level code passes this into EventDetail.
export type EventData = {
  event: Event
  sponsors: Sponsor[]
  communitySponsors: Sponsor[]
  judges: Person[]
  mentors: Person[]
}
