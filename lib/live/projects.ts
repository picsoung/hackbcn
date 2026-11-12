import 'server-only'
import { and, desc, eq, isNull, sql } from 'drizzle-orm'
import { getDb } from '@/db'
import { liveProjects as projects, liveVotes as votes } from '@/db/schema'
import { CATEGORIES, categorizeProject } from './jev'
import { slugify, type ProjectInput } from './validate'

/** Public shape of a project. Email is deliberately left out. */
const publicColumns = {
  id: projects.id,
  eventSlug: projects.eventSlug,
  slug: projects.slug,
  name: projects.name,
  tagline: projects.tagline,
  url: projects.url,
  videoUrl: projects.videoUrl,
  creatorName: projects.creatorName,
  linkedinUrl: projects.linkedinUrl,
  shareConsent: projects.shareConsent,
  category: projects.category,
  categoryConfidence: projects.categoryConfidence,
  voteCount: projects.voteCount,
  shareCount: projects.shareCount,
  createdAt: projects.createdAt,
}

export type PublicProject = {
  id: number
  eventSlug: string
  slug: string
  name: string
  tagline: string
  url: string
  videoUrl: string | null
  creatorName: string
  linkedinUrl: string
  shareConsent: boolean
  category: string | null
  categoryConfidence: number | null
  voteCount: number
  shareCount: number
  createdAt: Date
}

export function categoryLabel(key: string | null) {
  if (!key) return null
  return (CATEGORIES as Record<string, { label: string }>)[key]?.label ?? key
}

export const categoryLabels = Object.fromEntries(
  Object.entries(CATEGORIES).map(([k, v]) => [k, v.label]),
) as Record<string, string>

export async function listProjects(
  eventSlug: string,
): Promise<PublicProject[]> {
  return getDb()
    .select(publicColumns)
    .from(projects)
    .where(eq(projects.eventSlug, eventSlug))
    .orderBy(
      desc(projects.voteCount),
      desc(projects.shareCount),
      projects.createdAt,
    )
}

/** Small public query for crawler discovery, without cookies or private contact data. */
export async function listProjectSitemapEntries() {
  return getDb()
    .select({
      eventSlug: projects.eventSlug,
      slug: projects.slug,
      name: projects.name,
      createdAt: projects.createdAt,
    })
    .from(projects)
    .orderBy(projects.eventSlug, projects.slug)
}

export async function getJevAnswers(id: number) {
  const [row] = await getDb()
    .select({ jevAnswers: projects.jevAnswers })
    .from(projects)
    .where(eq(projects.id, id))
    .limit(1)
  return (row?.jevAnswers ?? null) as {
    probabilities?: Record<string, number>
    decisionPowered?: number
  } | null
}

export async function votedProjectIds(
  voterId: string | undefined,
): Promise<Set<number>> {
  if (!voterId) return new Set()
  const rows = await getDb()
    .select({ id: votes.projectId })
    .from(votes)
    .where(eq(votes.voterId, voterId))
  return new Set(rows.map((r) => r.id))
}

async function findId(eventSlug: string, slug: string) {
  const [p] = await getDb()
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.eventSlug, eventSlug), eq(projects.slug, slug)))
    .limit(1)
  return p?.id ?? null
}

async function uniqueSlug(eventSlug: string, name: string) {
  const base = slugify(name)
  for (let i = 0; i < 20; i++) {
    const candidate = i === 0 ? base : `${base}-${i + 1}`
    if (!(await findId(eventSlug, candidate))) return candidate
  }
  return `${base}-${crypto.randomUUID().slice(0, 6)}`
}

export async function createProject(eventSlug: string, input: ProjectInput) {
  // Categorize before insert so the project lands with its Jev label. If Jev is slow or
  // unavailable the project is still saved and categorized later by backfill().
  const jev = await categorizeProject(input).catch((err) => {
    console.error('Jev categorization failed', err)
    return null
  })

  const slug = await uniqueSlug(eventSlug, input.name)
  const [row] = await getDb()
    .insert(projects)
    .values({
      ...input,
      eventSlug,
      slug,
      category: jev?.category ?? null,
      categoryConfidence: jev?.confidence ?? null,
      jevAnswers: jev
        ? {
            probabilities: jev.probabilities,
            decisionPowered: jev.decisionPowered,
          }
        : null,
      jevModel: jev?.model ?? null,
    })
    .returning({ slug: projects.slug, category: projects.category })
  return row
}

/**
 * Retries Jev for up to 3 projects saved while it was unavailable. Callers await it with a
 * short cap, because Next 14 has no after()/waitUntil for route handlers.
 */
const lastAttempt = new Map<number, number>()
export async function backfill(list: PublicProject[], capMs = 2500) {
  const now = Date.now()
  const pending = list
    .filter((p) => !p.category && now - (lastAttempt.get(p.id) ?? 0) > 60_000)
    .slice(0, 3)
  if (!pending.length) return
  pending.forEach((p) => lastAttempt.set(p.id, now))
  const work = Promise.allSettled(
    pending.map(async (p) => {
      const jev = await categorizeProject(p)
      await getDb()
        .update(projects)
        .set({
          category: jev.category,
          categoryConfidence: jev.confidence,
          jevAnswers: {
            probabilities: jev.probabilities,
            decisionPowered: jev.decisionPowered,
          },
          jevModel: jev.model,
        })
        .where(and(eq(projects.id, p.id), isNull(projects.category)))
    }),
  )
  await Promise.race([work, new Promise((r) => setTimeout(r, capMs))])
}

async function refreshVoteCount(projectId: number) {
  const [row] = await getDb()
    .update(projects)
    .set({
      voteCount: sql`(select count(*)::int from ${votes} where ${votes.projectId} = ${projectId})`,
    })
    .where(eq(projects.id, projectId))
    .returning({ voteCount: projects.voteCount })
  return row?.voteCount ?? 0
}

export async function setVote(
  eventSlug: string,
  slug: string,
  voterId: string,
  on: boolean,
) {
  const id = await findId(eventSlug, slug)
  if (!id) return null
  if (on) {
    await getDb()
      .insert(votes)
      .values({ projectId: id, voterId })
      .onConflictDoNothing()
  } else {
    await getDb()
      .delete(votes)
      .where(and(eq(votes.projectId, id), eq(votes.voterId, voterId)))
  }
  return { voted: on, voteCount: await refreshVoteCount(id) }
}

export async function addShare(eventSlug: string, slug: string) {
  const [row] = await getDb()
    .update(projects)
    .set({ shareCount: sql`${projects.shareCount} + 1` })
    .where(and(eq(projects.eventSlug, eventSlug), eq(projects.slug, slug)))
    .returning({ shareCount: projects.shareCount })
  return row ?? null
}

/** Projects whose builders agreed to be featured on hackbarna.com. No emails. */
export async function exportShareable(eventSlug: string) {
  return getDb()
    .select({
      slug: projects.slug,
      name: projects.name,
      tagline: projects.tagline,
      url: projects.url,
      videoUrl: projects.videoUrl,
      creatorName: projects.creatorName,
      linkedinUrl: projects.linkedinUrl,
      category: projects.category,
      voteCount: projects.voteCount,
      createdAt: projects.createdAt,
    })
    .from(projects)
    .where(
      and(eq(projects.eventSlug, eventSlug), eq(projects.shareConsent, true)),
    )
    .orderBy(desc(projects.voteCount))
}
