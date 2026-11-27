import Link from 'next/link'
import type { ProjectCard } from '@/lib/project-cards'
import { projectPageCopy } from '@/data/project-page'
import ProjectAward from './ProjectAward'
import ProjectPreview from './ProjectPreview'

export default function ProjectGrid({
  projects,
  tone = 'night',
  showEvent = false,
  locale = 'en',
}: {
  projects: ProjectCard[]
  tone?: 'night' | 'light'
  showEvent?: boolean
  locale?: string
}) {
  const copy = projectPageCopy(locale)
  const night = tone === 'night'
  const styles = night
    ? {
        surface: 'hb-px bg-ground-raised',
        title: 'text-ink group-hover:text-accent',
        muted: 'text-ink-dim',
        focus: 'focus-visible:outline-accent',
        tag: 'bg-band-2 text-ink-dim',
      }
    : {
        surface: 'bg-slate-50',
        title: 'text-slate-900 group-hover:underline',
        muted: 'text-slate-600',
        focus: 'focus-visible:outline-slate-900',
        tag: 'bg-slate-200 text-slate-700',
      }
  return (
    <ul
      data-project-grid
      className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3"
    >
      {projects.map((project) => (
        <li
          key={project.key}
          data-project-card={project.key}
          className="min-w-0"
        >
          <article className="flex h-full flex-col">
            <Link
              href={project.href}
              aria-label={`${copy.viewProject.replace('{name}', () => project.name)}${project.award?.trim() ? `. ${copy.prizeWinner}: ${project.award}` : ''}`}
              className={`group flex flex-1 flex-col focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 ${styles.focus}`}
            >
              <div
                className={`flex h-full flex-col ${styles.surface} ${styles.muted}`}
              >
                <ProjectAward
                  award={project.award}
                  locale={locale}
                  tone={tone}
                />
                <ProjectPreview
                  key={project.image ?? project.key}
                  src={project.image}
                  name={project.name}
                />
                <div className="flex flex-1 flex-col p-5">
                  <h3
                    className={`break-words text-xl font-semibold leading-snug ${styles.title}`}
                  >
                    {project.name}
                  </h3>
                  <p
                    className={`mt-3 line-clamp-3 text-sm leading-relaxed ${styles.muted}`}
                  >
                    {project.description}
                  </p>
                  {project.creator && (
                    <p
                      className={`mt-4 line-clamp-2 text-xs leading-relaxed ${styles.muted}`}
                    >
                      By {project.creator}
                    </p>
                  )}
                  {showEvent && (
                    <p className={`mt-2 text-xs ${styles.muted}`}>
                      {project.eventName}
                    </p>
                  )}
                  {project.tags.length > 0 && (
                    <ul
                      className="mt-4 flex flex-wrap gap-1.5"
                      aria-label="Project tags"
                    >
                      {project.tags.slice(0, 4).map((tag) => (
                        <li
                          key={tag}
                          className={`px-2 py-1 text-xs ${styles.tag}`}
                        >
                          {tag}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </Link>
          </article>
        </li>
      ))}
    </ul>
  )
}
