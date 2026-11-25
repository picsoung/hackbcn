import Link from 'next/link'
import type { ProjectCard } from '@/lib/project-cards'
import { getLiveEvent } from '@/lib/live/config'
import { projectPrivacyNotice } from '@/data/project-privacy'
import {
  projectListPath,
  projectListSchema,
  serializeJsonLd,
} from '@/lib/project-seo'
import ProjectGrid from './ProjectGrid'
import ProjectsDisclosure from './ProjectsDisclosure'

export default function EventProjectsSection({
  locale,
  eventSlug,
  eventName,
  projects,
  total = projects.length,
  tone = 'night',
}: {
  locale: string
  eventSlug: string
  eventName: string
  projects: ProjectCard[]
  total?: number
  tone?: 'night' | 'light'
}) {
  const live = getLiveEvent(eventSlug)
  const light = tone === 'light'
  const muted = light ? 'text-slate-600' : 'text-ink-dim'
  const link = light ? 'text-slate-900' : 'text-accent'
  return (
    <section
      id="projects"
      aria-labelledby="event-projects-heading"
      className="scroll-mt-8"
    >
      <ProjectsDisclosure count={total} tone={tone}>
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
            <p className={`text-sm ${muted}`}>
              {projects.length
                ? 'Explore the demos and meet the builders.'
                : total > 0
                  ? projectPrivacyNotice(locale)
                  : 'Projects will appear here as builders submit them.'}
            </p>
            {projects.length > 0 && total > projects.length && (
              <p className={`mt-2 max-w-2xl text-sm ${muted}`}>
                {projectPrivacyNotice(locale)}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-5 text-sm font-semibold">
            {live?.open && (
              <Link
                href={`/${locale}/events/${eventSlug}/submit`}
                className={`inline-flex min-h-11 items-center ${link} underline underline-offset-4`}
              >
                Submit a project
              </Link>
            )}
            {live && projects.length > 0 && (
              <Link
                href={`/${locale}/events/${eventSlug}/leaderboard`}
                className={`inline-flex min-h-11 items-center ${link} underline underline-offset-4`}
              >
                Leaderboard
              </Link>
            )}
            <Link
              href={`/${locale}/projects`}
              className={`inline-flex min-h-11 items-center ${link} underline underline-offset-4`}
            >
              All community projects
            </Link>
          </div>
        </div>
        {projects.length > 0 && <ProjectGrid projects={projects} tone={tone} />}
      </ProjectsDisclosure>
    </section>
  )
}
