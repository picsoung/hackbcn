export type ScheduleItem = {
  title: string
  sections: {
    name: string
    items: string[]
  }[]
}

export type Event = {
    id: string
    slug: string
    year: string
    name: string
    active: boolean
    startDate: string
    endDate: string
    location: string
    schedule: {
      [locale: string]: ScheduleItem[]
    }
    // judges: Judge[];
    // sponsors: Sponsor[];
    // Add other event-specific fields
}