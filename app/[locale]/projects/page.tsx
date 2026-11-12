import Link from 'next/link'
import { getProjectCatalog } from '@/lib/project-catalog'
import { groupProjectCards } from '@/lib/project-cards'
import {
  projectListSchema,
  projectMetadata,
  serializeJsonLd,
} from '@/lib/project-seo'
import ProjectGrid from '@/app/components/projects/ProjectGrid'

export const dynamic = 'force-dynamic'

export function generateMetadata({ params }: { params: { locale: string } }) {
  return projectMetadata(
    `/${params.locale}/projects`,
    'Community projects',
    'Explore projects built at HackBarna hack nights and hackathons in Barcelona, with demos and builder profiles.',
  )
}

export default async function ProjectArchive({
  params,
}: {
  params: { locale: string }
}) {
  const localeData = await import(`@/i18n/${params.locale}.json`).catch(
    () => import('@/i18n/en.json'),
  )
  const title = localeData.default['projects.title'] ?? 'Project Archive'
  const projects = await getProjectCatalog(params.locale)
  const groups = groupProjectCards(projects)
  const dateFormat = new Intl.DateTimeFormat(
    ['en', 'es', 'ca', 'fr'].includes(params.locale) ? params.locale : 'en',
    { month: 'long', year: 'numeric' },
  )
  return (
    <div id="projects" className="min-h-screen bg-white py-12 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(
            projectListSchema(
              title,
              `/${params.locale}/projects`,
              projects.map((project) => ({
                name: project.name,
                path: project.href,
              })),
            ),
          ),
        }}
      />
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <header className="mb-12">
          <h1 className="text-3xl font-semibold text-indigo-600 sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600">
            {projects.length} community projects. Explore what people built at
            HackBarna, from hack nights to weekend hackathons.
          </p>
        </header>
        <div className="space-y-16">
          {groups.map((group) => (
            <section key={group.key} aria-labelledby={`projects-${group.key}`}>
              <div className="mb-7 flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                  <h2
                    id={`projects-${group.key}`}
                    className="text-2xl font-semibold text-slate-900"
                  >
                    {group.href ? (
                      <Link
                        href={group.href}
                        className="underline decoration-slate-300 underline-offset-4 hover:decoration-slate-900"
                      >
                        {group.name}
                      </Link>
                    ) : (
                      group.name
                    )}
                  </h2>
                  <p className="mt-2 text-sm text-slate-600">
                    {group.projects.length}{' '}
                    {group.projects.length === 1 ? 'project' : 'projects'}
                    {group.date > 0 && (
                      <>
                        {' '}
                        ·{' '}
                        <time dateTime={new Date(group.date).toISOString()}>
                          {dateFormat.format(new Date(group.date))}
                        </time>
                      </>
                    )}
                  </p>
                </div>
                {group.href && (
                  <Link
                    href={group.href}
                    className="py-2 text-sm font-semibold text-slate-900 underline underline-offset-4"
                  >
                    View event
                  </Link>
                )}
              </div>
              <ProjectGrid projects={group.projects} tone="light" />
            </section>
          ))}
          {projects.length === 0 && (
            <p className="text-slate-600">No projects published yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
