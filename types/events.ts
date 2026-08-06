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

// Bundle returned by the unified getEventDataBySlug helper.
// Page-level code passes this into EventDetail.
export type EventData = {
  event: Event
  sponsors: Sponsor[]
  communitySponsors: Sponsor[]
  judges: Person[]
  mentors: Person[]
}
