import 'server-only'
import { getDb } from '@/db'
import {
  projectClaims,
  projectContent,
  projectVisibility,
  creatorPrivacy,
} from '@/db/schema'
import { eq } from 'drizzle-orm'
import { getBuiltProjects } from '@/app/helpers/projects'
import { getEventDataBySlug } from '@/lib/events-server'
import { listManagedProjects } from '@/lib/live/projects'
import { getLiveEvent } from '@/lib/live/config'
import { archivedProjectCard, submittedProjectCard } from '@/lib/project-cards'
import {
  approvedProjectContent,
  applyArchiveContent,
} from '@/lib/projects/approved-content'
import {
  isProjectOrganiser,
  ProjectAccessError,
} from '@/lib/projects/ownership'
import type { IdentityUser } from '@/lib/auth/types'
import { sourceBuilderProfiles } from '@/lib/builder-catalog'
import { builderDisplayOverrides } from '@/lib/community/builder-profiles'
import { applyBuilderDisplays } from '@/lib/community/builder-display'
import { claimedBuilderDisplays } from '@/lib/community/claimed-profiles'
import { applyClaimedDisplays } from '@/lib/community/claimed-display'
import { projectBuilder } from '@/lib/project-detail'

export function requireOrganiser(user: IdentityUser) {
  if (!isProjectOrganiser(user)) throw new ProjectAccessError('forbidden', 403)
}

/** Includes hidden real projects, never private creator contacts or excluded test entries. */
export async function organiserCatalog(user: IdentityUser, locale: string) {
  requireOrganiser(user)
  const sources = getBuiltProjects()
  const [
    submitted,
    visibility,
    claims,
    content,
    approved,
    privacy,
    pendingClaims,
  ] = await Promise.all([
    listManagedProjects(),
    getDb().select().from(projectVisibility),
    getDb()
      .select({ projectKey: projectClaims.projectKey })
      .from(projectClaims)
      .where(eq(projectClaims.status, 'verified')),
    getDb()
      .select({
        key: projectContent.projectKey,
        status: projectContent.status,
      })
      .from(projectContent),
    approvedProjectContent(sources.map((project) => `archive:${project.slug}`)),
    getDb().select().from(creatorPrivacy),
    getDb()
      .select({
        id: projectClaims.id,
        projectKey: projectClaims.projectKey,
      })
      .from(projectClaims)
      .where(eq(projectClaims.status, 'pending')),
  ])
  const settings = new Map(visibility.map((row) => [row.projectKey, row]))
  const edits = new Map(content.map((row) => [row.key, row.status]))
  const privacyStates = new Map(privacy.map((row) => [row.subjectKey, row]))
  const projects = [
    ...sources.map((source) => ({
      project: archivedProjectCard(
        {
          ...applyArchiveContent(
            source,
            approved.get(`archive:${source.slug}`),
          ),
          builders: source.data.hackers.map(projectBuilder),
        },
        locale,
        source.data.event
          ? getEventDataBySlug(source.data.event)?.event
          : undefined,
      ),
      visibility:
        settings.get(`archive:${source.slug}`)?.visibility ??
        (source.data.status === 'private'
          ? ('private' as const)
          : ('public' as const)),
      revision: settings.get(`archive:${source.slug}`)?.revision ?? 0,
    })),
    ...submitted.map((source) => ({
      project: submittedProjectCard(
        source,
        locale,
        getEventDataBySlug(source.eventSlug)?.event ??
          getLiveEvent(source.eventSlug)!,
      ),
      visibility: source.visibility,
      revision:
        settings.get(`submitted:${source.eventSlug}:${source.slug}`)
          ?.revision ?? 0,
    })),
  ]
    .map((row) => ({
      ...row,
      claimCount: claims.filter((claim) => claim.projectKey === row.project.key)
        .length,
      editStatus: edits.get(row.project.key) ?? null,
      creatorPrivacy: {
        subjectKey: `project:${row.project.key}`,
        hidden:
          privacyStates.get(`project:${row.project.key}`)?.hidden ?? false,
        hiddenFields:
          privacyStates.get(`project:${row.project.key}`)?.hiddenFields ?? [],
        revision:
          privacyStates.get(`project:${row.project.key}`)?.revision ?? 0,
      },
    }))
    .sort(
      (a, b) =>
        b.project.eventDate - a.project.eventDate ||
        a.project.name.localeCompare(b.project.name),
    )
  const cards = projects.map((row) => row.project)
  const sourceProfiles = sourceBuilderProfiles(cards)
  const profiles = applyClaimedDisplays(
    applyBuilderDisplays(
      sourceProfiles,
      await builderDisplayOverrides(
        sourceProfiles.map((profile) => profile.slug),
      ),
    ),
    new Map(cards.map((project) => [project.key, project.hackers])),
    await claimedBuilderDisplays(cards.map((project) => project.key)),
  )
  return {
    pendingClaims,
    projects: projects.map((row) => ({
      ...row,
      hasHiddenCreators:
        row.creatorPrivacy.hidden ||
        sourceProfiles.some(
          (profile) =>
            (privacyStates.get(`builder:${profile.slug}`)?.hidden ||
              privacyStates.get(`credit:${row.project.key}:${profile.slug}`)
                ?.hidden) &&
            profile.projectKeys.includes(row.project.key),
        ),
    })),
    profiles: profiles.map((profile) => ({
      ...profile,
      creatorPrivacy: {
        subjectKey: `builder:${profile.slug}`,
        hidden: privacyStates.get(`builder:${profile.slug}`)?.hidden ?? false,
        hiddenFields:
          privacyStates.get(`builder:${profile.slug}`)?.hiddenFields ?? [],
        revision: privacyStates.get(`builder:${profile.slug}`)?.revision ?? 0,
      },
    })),
  }
}
