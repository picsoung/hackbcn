import Link from 'next/link'
import type { ProjectCard, relatedProjectCards } from '@/lib/project-cards'
import ProjectGrid from './ProjectGrid'

export default function ProjectRecommendations({
  current,
  related,
  tone = 'night',
}: {
  current: ProjectCard
  related: ReturnType<typeof relatedProjectCards>
  tone?: 'night' | 'light'
}) {
  if (!related.byBuilder.length && !related.byEvent.length) return null
  const ink = tone === 'light' ? 'text-slate-900' : 'text-ink'
  const muted = tone === 'light' ? 'text-slate-600' : 'text-ink-dim'
  const border = tone === 'light' ? 'border-slate-200' : 'border-band-2'
  const link = tone === 'light' ? 'text-slate-900' : 'text-accent'
  return (
    <div className="mx-auto max-w-6xl px-6 pb-16 lg:px-8">
      {related.byBuilder.length > 0 && (
        <section
          aria-labelledby="related-builder-heading"
          className={`border-t ${border} py-12`}
        >
          <h2
            id="related-builder-heading"
            className={`mb-8 break-words text-2xl font-semibold sm:text-3xl ${ink}`}
          >
            {current.hackers.length === 1
              ? `More by ${current.hackers[0].name}`
              : 'More from the builders'}
          </h2>
          <ProjectGrid projects={related.byBuilder} tone={tone} showEvent />
        </section>
      )}
      {related.byEvent.length > 0 && (
        <section
          aria-labelledby="related-event-heading"
          className={`border-t ${border} py-12`}
        >
          <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
            <div>
              <h2
                id="related-event-heading"
                className={`text-2xl font-semibold sm:text-3xl ${ink}`}
              >
                More from this event
              </h2>
              <p className={`mt-2 text-sm ${muted}`}>{current.eventName}</p>
            </div>
            {current.eventHref && (
              <Link
                href={current.eventHref}
                className={`py-2 text-sm font-semibold underline underline-offset-4 ${link}`}
              >
                View all event projects
              </Link>
            )}
          </div>
          <ProjectGrid projects={related.byEvent} tone={tone} />
        </section>
      )}
    </div>
  )
}
