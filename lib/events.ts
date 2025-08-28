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
    slug: 'aisummit25',
    year: '2025',
    name: 'HackBarna AI Summit 25',
    active: true,
    startDate: '2025-10-11',
    endDate: '2025-10-12',
    location: 'Barcelona',
  },
]

export const getAllEventSlugs = () => {
  return events.map(event => event.slug)
}

export const getEventBySlug = (slug: string) => {
  return events.find(event => event.slug === slug)
}

export const getCurrentEvent = () => {
  return events.find(event => event.active)
}
