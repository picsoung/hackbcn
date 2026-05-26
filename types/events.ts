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
