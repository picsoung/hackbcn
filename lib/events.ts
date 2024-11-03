import { Event } from "@/types/events"

export const events: Event[] = [
  {
    id: '1',
    slug: 'v1-2024',
    year: '2024',
    name: 'HackBarna',
    active: false,
    startDate: '2024-06-29',
    endDate: '2024-06-30',
    location: 'Le Wagon Barcelona',
  },
  {
    id: '2',
    slug: 'mwc25',
    year: '2025',
    name: 'HackBarna MWC25',
    active: true,
    startDate: '2025-02-24',
    endDate: '2025-02-25',
    location: 'Barcelona',
  },
]

export const getEventBySlug = (slug: string) => {
  return events.find(event => event.slug === slug)
}

export const getCurrentEvent = () => {
  return events.find(event => event.active)
}
