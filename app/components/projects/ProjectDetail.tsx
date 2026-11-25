import type { ReactNode } from 'react'
import Link from 'next/link'
import { TrophyIcon } from '@heroicons/react/24/outline'
import type { ProjectCard, relatedProjectCards } from '@/lib/project-cards'
import type {
  ProjectBuilder,
  ProjectLink,
  ProjectMedia as Media,
} from '@/lib/project-detail'
import {
  serializeJsonLd,
  siteOrigin,
  validProjectDate,
} from '@/lib/project-seo'
import { projectPageCopy } from '@/data/project-page'
import { projectManagementCopy } from '@/data/project-management'
import ProjectBuilders from './ProjectBuilders'
import ProjectMedia from './ProjectMedia'
import ProjectRecommendations from './ProjectRecommendations'

export default function ProjectDetail({
  project,
  builders,
  links,
  media,
  stack = [],
  children,
  related,
  locale,
  publishedDate,
  modifiedDate,
  published = false,
}: {
  project: ProjectCard
  builders: ProjectBuilder[]
  links: ProjectLink[]
  media?: Media
  stack?: string[]
  children?: ReactNode
  related: ReturnType<typeof relatedProjectCards>
  locale: string
  publishedDate?: Date
  modifiedDate?: Date
  published?: boolean
}) {
  const copy = projectPageCopy(locale)
  const labels: Record<string, string> = {
    website: copy.openProject,
    github: 'GitHub',
    submission: copy.originalSubmission,
    video: copy.watchDemo,
    youtube: copy.watchDemo,
    slides: copy.slides,
    screenshot: copy.viewScreenshot,
    linkedin: 'LinkedIn',
    twitter: 'Twitter',
  }
  const textLink =
    'inline-flex min-h-11 items-center text-sm font-medium text-accent underline underline-offset-4 hover:text-inversion focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent'
  return (
    <div id="project" className="bg-ground text-ink" data-project-detail>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd({
            '@context': 'https://schema.org',
            '@type': 'CreativeWork',
            name: project.name,
            description: project.description,
            url: `${siteOrigin()}${project.href}`,
            image: project.image
              ? new URL(project.image, siteOrigin()).href
              : undefined,
            datePublished: validProjectDate(publishedDate)?.toISOString(),
            dateModified: validProjectDate(modifiedDate)?.toISOString(),
            author: builders.map((builder) => ({
              '@type': 'Person',
              name: builder.name,
              url: builder.href
                ? `${siteOrigin()}${builder.href}`
                : builder.links.linkedin,
              sameAs: Object.values(builder.links),
            })),
            award: project.award,
            isPartOf: project.eventHref
              ? {
                  '@type': 'CollectionPage',
                  name: project.eventName,
                  url: `${siteOrigin()}${project.eventHref}`,
                }
              : undefined,
          }),
        }}
      />
      {published && (
        <section className="bg-accent text-ground">
          <div className="mx-auto max-w-6xl px-6 py-8 lg:px-8">
            <p className="text-2xl font-semibold">{copy.publishedTitle}</p>
            <p className="mt-2 max-w-[70ch]">{copy.publishedDescription}</p>
          </div>
        </section>
      )}
      <div className="mx-auto max-w-6xl px-6 pb-12 pt-6 sm:pt-8 lg:px-8">
        <nav
          aria-label={copy.breadcrumb}
          className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-dim"
        >
          <Link
            href={`/${locale}/projects`}
            className="inline-flex min-h-11 items-center underline underline-offset-4 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            {copy.allProjects}
          </Link>
          {project.eventHref && (
            <>
              <span aria-hidden="true">/</span>
              <Link
                href={project.eventHref}
                className="inline-flex min-h-11 items-center underline underline-offset-4 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              >
                {project.eventName}
              </Link>
            </>
          )}
        </nav>
        <header className="pb-8 pt-5 sm:pb-10 sm:pt-7">
          {project.award && (
            <p className="mb-4 flex items-center gap-2 font-semibold text-accent">
              <TrophyIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
              {project.award}
            </p>
          )}
          <h1 className="max-w-4xl break-words text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[1.1] tracking-tight [overflow-wrap:anywhere]">
            {project.name}
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-ink-dim sm:text-xl">
            {project.description}
          </p>
          {links.length > 0 && (
            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={
                    link.type === 'website'
                      ? 'hb-px inline-flex min-h-11 items-center bg-accent px-5 py-3 text-sm font-semibold text-ground transition-colors hover:bg-inversion focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ground'
                      : textLink
                  }
                >
                  {labels[link.type] ?? link.type}
                </a>
              ))}
            </div>
          )}
        </header>
        <div
          data-project-content
          className="grid items-start gap-10 border-t border-band-2 pt-8 sm:pt-10 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-14"
        >
          <div className="min-w-0 lg:col-start-1">
            <ProjectMedia media={media} name={project.name} locale={locale} />
          </div>
          <aside
            className={`min-w-0 space-y-9 border-t border-band-2 pt-8 lg:col-start-2 lg:row-start-1 lg:border-t-0 lg:pt-0 ${children ? 'lg:row-span-2' : ''}`}
          >
            <ProjectBuilders builders={builders} locale={locale} />
            <Link
              href={`/${locale}/account/projects?project=${encodeURIComponent(project.key)}`}
              className={textLink}
            >
              {projectManagementCopy(locale).manage}
            </Link>
            {stack.length > 0 && (
              <section aria-labelledby="project-stack-heading">
                <h2
                  id="project-stack-heading"
                  className="mb-4 text-xl font-semibold"
                >
                  {copy.stack}
                </h2>
                <ul className="flex flex-wrap gap-2">
                  {stack.map((tag) => (
                    <li
                      key={tag}
                      className="hb-px hb-px-sm bg-band-2 px-3 py-1.5 text-sm text-ink-dim"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </aside>
          {children && (
            <section
              className="min-w-0 lg:col-start-1"
              aria-labelledby="project-about-heading"
            >
              <h2
                id="project-about-heading"
                className="mb-5 text-2xl font-semibold tracking-tight"
              >
                {copy.about}
              </h2>
              <article className="prose prose-invert hb-prose max-w-none [overflow-wrap:anywhere] prose-headings:font-semibold prose-headings:text-ink prose-p:text-ink-dim prose-a:text-accent prose-a:underline prose-a:underline-offset-4 prose-strong:text-ink prose-code:text-ink prose-pre:overflow-x-auto prose-pre:bg-ground-raised prose-li:text-ink-dim prose-img:hb-px">
                {children}
              </article>
            </section>
          )}
        </div>
      </div>
      <ProjectRecommendations
        current={project}
        related={related}
        locale={locale}
      />
    </div>
  )
}
