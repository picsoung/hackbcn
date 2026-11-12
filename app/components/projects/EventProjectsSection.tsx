import Link from 'next/link'
import type { ProjectCard } from '@/lib/project-cards'
import { getLiveEvent } from '@/lib/live/config'
import {
  projectListPath,
  projectListSchema,
  serializeJsonLd,
} from '@/lib/project-seo'
import ProjectGrid from './ProjectGrid'

export default function EventProjectsSection({
  locale,
  eventSlug,
  eventName,
  projects,
  tone = 'night',
}: {
  locale: string
  eventSlug: string
  eventName: string
  projects: ProjectCard[]
  tone?: 'night' | 'light'
}) {
  const live = getLiveEvent(eventSlug)
  const light = tone === 'light'
  const ink = light ? 'text-slate-900' : 'text-ink'
  const muted = light ? 'text-slate-600' : 'text-ink-dim'
  const link = light ? 'text-slate-900' : 'text-accent'
  return (
    <section
      id="projects"
      aria-labelledby="event-projects-heading"
      className={`scroll-mt-8 py-12 ${light ? '' : 'border-b border-band-2'}`}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(
            projectListSchema(
              `Projects from ${eventName}`,
              projectListPath(locale, eventSlug),
              projects.map((project) => ({
                name: project.name,
                path: project.href,
              })),
            ),
          ),
        }}
      />
      <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
        <div>
          <h2
            id="event-projects-heading"
            className={`text-2xl font-semibold sm:text-3xl ${ink}`}
          >
            Projects built at this event
          </h2>
          <p className={`mt-2 text-sm ${muted}`}>
            {projects.length
              ? `${projects.length} ${projects.length === 1 ? 'project' : 'projects'}. Explore the demos and meet the builders.`
              : 'Projects will appear here as builders submit them.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-5 text-sm font-semibold">
          {live?.open && (
            <Link
              href={`/${locale}/events/${eventSlug}/submit`}
              className={`${link} underline underline-offset-4`}
            >
              Submit a project
            </Link>
          )}
          {live && projects.length > 0 && (
            <Link
              href={`/${locale}/events/${eventSlug}/leaderboard`}
              className={`${link} underline underline-offset-4`}
            >
              Leaderboard
            </Link>
          )}
          <Link
            href={`/${locale}/projects`}
            className={`${link} underline underline-offset-4`}
          >
            All community projects
          </Link>
        </div>
      </div>
      {projects.length > 0 && <ProjectGrid projects={projects} tone={tone} />}
    </section>
  )
}
