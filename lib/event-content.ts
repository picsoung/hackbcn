import path from 'path'
import fs from 'fs'
import { globSync } from 'glob'
import matter from 'gray-matter'

import type { Event } from '@/types/events'
import type { Sponsor } from '@/data/sponsors'
import type { Person } from '@/app/helpers/projects'

// Server-only MDX parser for event content files at /events/<slug>.mdx.
// Frontmatter holds the structured data (mirrors Event + sponsors/judges/mentors arrays).
// Body content is parsed but not yet rendered anywhere — reserved for future rich content.

export type MdxEventContent = {
  event: Event
  sponsors: Sponsor[]
  communitySponsors: Sponsor[]
  judges: Person[]
  mentors: Person[]
  body: string
}

function getEventsDirectory(): string {
  return path.join(process.cwd(), 'events')
}

export function getAllMdxEventSlugs(): string[] {
  const dir = getEventsDirectory()
  if (!fs.existsSync(dir)) return []
  return globSync(['*.mdx', '*.md'], { cwd: dir, absolute: false }).map((file) =>
    file.replace(/\.(mdx|md)$/, '')
  )
}

export function readMdxEvent(slug: string): MdxEventContent | null {
  const dir = getEventsDirectory()
  const candidates = [
    path.join(dir, `${slug}.mdx`),
    path.join(dir, `${slug}.md`),
  ]
  const filePath = candidates.find((p) => fs.existsSync(p))
  if (!filePath) return null

  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)

  // Map frontmatter into the structured types. We trust the file shape; for
  // hackathon-scale content a runtime schema isn't worth the dependency cost.
  const event: Event = {
    id: String(data.id ?? slug),
    slug,
    year: String(data.year ?? new Date(data.startDate ?? Date.now()).getUTCFullYear()),
    name: data.name,
    active: Boolean(data.active),
    startDate: data.startDate,
    endDate: data.endDate,
    location: data.location,
    timeZone: data.timeZone,
    eventType: data.eventType ?? 'hackathon',
    description: data.description,
    registrationUrl: data.registrationUrl,
    imageUrl: data.imageUrl,
    schedule: data.schedule,
    topic: data.topic,
    sponsor: data.sponsor,
    capacity: data.capacity,
    gallery: data.gallery,
    projectLinks: data.projectLinks,
    past: data.past,
  }

  return {
    event,
    sponsors: (data.sponsors as Sponsor[]) ?? [],
    communitySponsors: (data.communitySponsors as Sponsor[]) ?? [],
    judges: (data.judges as Person[]) ?? [],
    mentors: (data.mentors as Person[]) ?? [],
    body: content,
  }
}

export function getAllMdxEvents(): MdxEventContent[] {
  return getAllMdxEventSlugs()
    .map(readMdxEvent)
    .filter((x): x is MdxEventContent => x !== null)
}
