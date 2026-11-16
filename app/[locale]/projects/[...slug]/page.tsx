import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import ReactMarkdown from 'react-markdown'
import { TrophyIcon } from '@heroicons/react/24/outline'
import { getProject, type Project } from '@/app/helpers/projects'
import { archivedProjectCard } from '@/lib/project-cards'
import { archivedProjectDemo, archivedProjectUrl } from '@/lib/archived-project'
import { getRelatedProjectCards } from '@/lib/project-catalog'
import { getEventDataBySlug } from '@/lib/events-server'
import {
  projectMetadata,
  serializeJsonLd,
  siteOrigin,
  validProjectDate,
} from '@/lib/project-seo'
import { projectPageCopy } from '@/data/project-page'
import ProjectRecommendations from '@/app/components/projects/ProjectRecommendations'
import ArchivedProjectDemo, {
  type ArchivedProjectDemoProps,
} from '@/app/components/projects/ArchivedProjectDemo'

type Params = { params: { slug: string[]; locale: string } }

export function generateMetadata({ params }: Params) {
  try {
    const project = getProject(params.slug)
    return projectMetadata(
      `/${params.locale}/projects/${params.slug.map(encodeURIComponent).join('/')}`,
      project.data.title,
      project.data.description,
    )
  } catch {
    return {}
  }
}

export const dynamic = 'force-dynamic'

export default async function ProjectBySlug({ params }: Params) {
  let project: Project
  try {
    project = getProject(params.slug)
  } catch {
    notFound()
  }
  const { data, content } = project
  const copy = projectPageCopy(params.locale)
  const event = data.event ? getEventDataBySlug(data.event)?.event : undefined
  const current = archivedProjectCard(project, params.locale, event)
  const related = await getRelatedProjectCards(current, params.locale)
  const demo = archivedProjectDemo(data.youtubeLink)
  const inlineDemo = /<YouTube\b/.test(content)
  const labels: Record<string, string> = {
    website: copy.openProject,
    github: 'GitHub',
    video: copy.watchDemo,
    youtube: copy.watchDemo,
    slides: copy.slides,
    linkedin: 'LinkedIn',
    twitter: 'X',
  }
  const seenLinks = new Set<string>()
  const links = Object.entries({
    ...data.links,
    ...(data.youtubeLink ? { video: data.youtubeLink } : {}),
  }).flatMap(([type, value]) => {
    const href = archivedProjectUrl(value)
    if (!href || seenLinks.has(href)) return []
    seenLinks.add(href)
    return [{ type, href, label: labels[type] ?? type }]
  })
  const textLink =
    'inline-flex min-h-11 items-center text-sm font-medium text-accent underline underline-offset-4 hover:text-inversion focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent'

  return (
    <div id="project" className="bg-ground text-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd({
            '@context': 'https://schema.org',
            '@type': 'CreativeWork',
            name: data.title,
            description: data.description,
            url: `${siteOrigin()}${current.href}`,
            image: current.image
              ? new URL(current.image, siteOrigin()).href
              : undefined,
            datePublished: validProjectDate(data.publishedDate)?.toISOString(),
            dateModified: validProjectDate(data.modifiedDate)?.toISOString(),
            author: current.hackers.map((hacker) => ({
              '@type': 'Person',
              name: hacker.name,
              url: hacker.linkedinUrl ?? undefined,
            })),
            award: current.award,
            isPartOf: current.eventHref
              ? {
                  '@type': 'CollectionPage',
                  name: current.eventName,
                  url: `${siteOrigin()}${current.eventHref}`,
                }
              : undefined,
          }),
        }}
      />
      <div className="mx-auto max-w-6xl px-6 pb-12 pt-6 sm:pt-8 lg:px-8">
        <nav
          aria-label={copy.breadcrumb}
          className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-dim"
        >
          <Link
            href={`/${params.locale}/projects`}
            className="inline-flex min-h-11 items-center underline underline-offset-4 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            {copy.allProjects}
          </Link>
          {current.eventHref && (
            <>
              <span aria-hidden="true">/</span>
              <Link
                href={current.eventHref}
                className="inline-flex min-h-11 items-center underline underline-offset-4 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              >
                {current.eventName}
              </Link>
            </>
          )}
        </nav>
        <header className="pb-8 pt-5 sm:pb-10 sm:pt-7">
          {current.award && (
            <p className="mb-4 flex items-center gap-2 font-semibold text-accent">
              <TrophyIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
              {current.award}
            </p>
          )}
          <h1 className="max-w-4xl break-words text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[1.1] tracking-tight [overflow-wrap:anywhere]">
            {data.title}
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-ink-dim sm:text-xl">
            {data.description}
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
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </header>
        <div className="grid items-start gap-10 border-t border-band-2 pt-8 sm:pt-10 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-14">
          <div className="min-w-0">
            <h2 className="mb-5 text-2xl font-semibold tracking-tight">
              {copy.about}
            </h2>
            {!inlineDemo && demo && (
              <ArchivedProjectDemo
                {...demo}
                title={data.title}
                announce={copy.watchDemo}
                thumbnail={data.thumbnailUrl}
              />
            )}
            {!inlineDemo && !demo && current.image && (
              <div className="hb-px mb-8 bg-ground-raised">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={current.image}
                  alt={`${data.title} project preview`}
                  className="h-auto w-full"
                />
              </div>
            )}
            <article className="prose prose-invert hb-prose max-w-none [overflow-wrap:anywhere] prose-headings:font-semibold prose-headings:text-ink prose-p:text-ink-dim prose-a:text-accent prose-a:underline prose-a:underline-offset-4 prose-strong:text-ink prose-code:text-ink prose-pre:overflow-x-auto prose-pre:bg-ground-raised prose-li:text-ink-dim prose-img:hb-px">
              {data.contentFormat === 'markdown' ? (
                <ReactMarkdown skipHtml>{content}</ReactMarkdown>
              ) : (
                <MDXRemote
                  source={content}
                  components={{
                    YouTube: (
                      props: Omit<
                        ArchivedProjectDemoProps,
                        'announce' | 'title'
                      > & { title?: string },
                    ) => (
                      <ArchivedProjectDemo
                        {...props}
                        title={props.title || data.title}
                        announce={copy.watchDemo}
                      />
                    ),
                  }}
                />
              )}
            </article>
          </div>
          <aside className="min-w-0 space-y-9 border-t border-band-2 pt-8 lg:border-t-0 lg:pt-0">
            {data.hackers?.length > 0 && (
              <section aria-labelledby="project-builders-heading">
                <h2
                  id="project-builders-heading"
                  className="mb-5 text-xl font-semibold"
                >
                  {copy.builders}
                </h2>
                <ul className="space-y-6">
                  {data.hackers.map((hacker, index) => {
                    const linkedin = archivedProjectUrl(hacker.links?.linkedin)
                    const github = archivedProjectUrl(hacker.links?.github)
                    const role = hacker.description || hacker.job
                    return (
                      <li
                        key={`${hacker.name}-${index}`}
                        className="flex items-start gap-4"
                      >
                        {hacker.image?.src && (
                          <div className="hb-px h-14 w-14 shrink-0 overflow-hidden bg-ground-raised">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={hacker.image.src}
                              alt=""
                              width={56}
                              height={56}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="break-words font-semibold">
                            {linkedin ? (
                              <a
                                href={linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline underline-offset-4 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                              >
                                {hacker.name}
                              </a>
                            ) : (
                              hacker.name
                            )}
                          </p>
                          {role && (
                            <p className="mt-1 text-sm leading-relaxed text-ink-dim">
                              {role}
                            </p>
                          )}
                          {github && (
                            <a
                              href={github}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={textLink}
                              aria-label={`GitHub: ${hacker.name}`}
                            >
                              GitHub
                            </a>
                          )}
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </section>
            )}
            {data.techStack?.length > 0 && (
              <section aria-labelledby="project-stack-heading">
                <h2
                  id="project-stack-heading"
                  className="mb-4 text-xl font-semibold"
                >
                  {copy.stack}
                </h2>
                <ul className="flex flex-wrap gap-2">
                  {data.techStack.map((tag) => (
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
        </div>
      </div>
      <ProjectRecommendations current={current} related={related} />
    </div>
  )
}
