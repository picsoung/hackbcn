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
    schedule: {
      [locale: string]: ScheduleItem[]
    }
    topic?: string
    gallery?: string[]
    projectLinks?: string[]
}