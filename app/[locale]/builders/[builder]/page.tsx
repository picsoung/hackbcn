import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getBuilderCatalog } from '@/lib/builder-catalog'
import { builderProfilePath } from '@/lib/builders'
import { groupProjectCards } from '@/lib/project-cards'
import {
  projectMetadata,
  projectListSchema,
  serializeJsonLd,
  siteOrigin,
} from '@/lib/project-seo'
import { builderPageCopy } from '@/data/builder-page'
import { projectPageCopy } from '@/data/project-page'
import ProjectBuilderAvatar from '@/app/components/projects/ProjectBuilderAvatar'
import BuilderSocialLinks from '@/app/components/projects/BuilderSocialLinks'
import ProjectGrid from '@/app/components/projects/ProjectGrid'

export const dynamic = 'force-dynamic'
type Params = { params: { locale: string; builder: string } }

export async function generateMetadata({ params }: Params) {
  const { profiles } = await getBuilderCatalog(params.locale)
  const profile = profiles.find((builder) => builder.slug === params.builder)
  if (!profile) notFound()
  const metadata = projectMetadata(
    builderProfilePath(params.locale, profile.slug),
    profile.name,
    builderPageCopy(params.locale).description.replace(
      '{name}',
      () => profile.name,
    ),
  )
  return {
    ...metadata,
    alternates: {
      ...metadata.alternates,
      languages: Object.fromEntries(
        ['en', 'es', 'ca', 'fr'].map((locale) => [
          locale,
          `${siteOrigin()}${builderProfilePath(locale, profile.slug)}`,
        ]),
      ),
    },
  }
}

export default async function BuilderPage({ params }: Params) {
  const { profiles, projects } = await getBuilderCatalog(params.locale)
  const profile = profiles.find((builder) => builder.slug === params.builder)
  if (!profile) notFound()
  const owned = new Set(profile.projectKeys)
  const built = projects.filter((project) => owned.has(project.key))
  const groups = groupProjectCards(built)
  const copy = builderPageCopy(params.locale)
  const projectCopy = projectPageCopy(params.locale)
  const path = builderProfilePath(params.locale, profile.slug)
  const url = `${siteOrigin()}${path}`
  const projectCount = `${built.length} ${built.length === 1 ? copy.project : copy.projects}`
  const eventCount = `${groups.length} ${groups.length === 1 ? copy.event : copy.events}`
  return (
    <div data-builder-profile className="bg-ground text-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd({
            '@context': 'https://schema.org',
            '@type': 'ProfilePage',
            url,
            mainEntity: {
              '@type': 'Person',
              name: profile.name,
              url,
              image: profile.image
                ? new URL(profile.image, siteOrigin()).href
                : undefined,
              sameAs: Object.values(profile.links),
            },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(
            projectListSchema(
              profile.name,
              path,
              built.map((project) => ({
                name: project.name,
                path: project.href,
              })),
            ),
          ),
        }}
      />
      <div className="mx-auto max-w-6xl px-6 pb-16 pt-6 sm:pb-24 sm:pt-8 lg:px-8">
        <nav aria-label={projectCopy.breadcrumb}>
          <Link
            href={`/${params.locale}/projects`}
            className="inline-flex min-h-11 items-center text-sm text-ink-dim underline underline-offset-4 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            {projectCopy.allProjects}
          </Link>
        </nav>
        <header className="flex items-start gap-5 pb-10 pt-6 sm:gap-8 sm:pb-14 sm:pt-8">
          <ProjectBuilderAvatar
            key={profile.slug}
            name={profile.name}
            src={profile.image}
            size="profile"
          />
          <div className="min-w-0 flex-1">
            <h1 className="break-words text-3xl font-bold leading-tight tracking-tight text-ink sm:text-5xl [overflow-wrap:anywhere]">
              {profile.name}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-ink-dim sm:text-base">
              {copy.summary
                .replace('{projects}', projectCount)
                .replace('{events}', eventCount)}
            </p>
            {profile.bio && (
              <p className="mt-4 max-w-prose whitespace-pre-line text-sm leading-relaxed text-ink-dim sm:text-base">
                {profile.bio}
              </p>
            )}
            <div className="mt-2">
              <BuilderSocialLinks builder={profile} locale={params.locale} />
            </div>
          </div>
        </header>
        <section
          aria-labelledby="builder-projects-heading"
          className="border-t border-band-2 pt-8 sm:pt-10"
        >
          <h2
            id="builder-projects-heading"
            className="mb-6 text-2xl font-semibold sm:mb-8 sm:text-3xl"
          >
            {copy.heading}
          </h2>
          <ProjectGrid
            projects={groups.flatMap((group) => group.projects)}
            showEvent
          />
        </section>
      </div>
    </div>
  )
}
