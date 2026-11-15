import { getProjectCatalog } from '@/lib/project-catalog'
import {
  projectListSchema,
  projectMetadata,
  serializeJsonLd,
} from '@/lib/project-seo'
import ProjectArchiveBrowser from '@/app/components/projects/ProjectArchiveBrowser'

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
  return (
    <div
      id="projects"
      className="bg-ground pb-20 pt-12 text-ink selection:bg-accent selection:text-ground sm:pb-28 sm:pt-20"
    >
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
        <header className="mb-10 grid gap-5 sm:mb-14 lg:grid-cols-[1.2fr_1fr] lg:items-end lg:gap-16">
          <h1 className="text-balance text-4xl font-bold leading-[1.1] tracking-tight text-ink sm:text-5xl lg:text-6xl">
            {title}
            <span className="text-accent">.</span>
          </h1>
          <p className="max-w-lg text-base leading-relaxed text-ink-dim sm:text-lg">
            Built in Barcelona, by the HackBarna community. Explore the projects
            and meet the makers behind them.
          </p>
        </header>
        <ProjectArchiveBrowser projects={projects} locale={params.locale} />
      </div>
    </div>
  )
}
