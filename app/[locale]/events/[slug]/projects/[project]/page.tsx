import { notFound } from 'next/navigation'
import Link from 'next/link'
import ProjectPageShell from '@/app/components/projects/ProjectPageShell'
import ProjectRecommendations from '@/app/components/projects/ProjectRecommendations'
import { submittedProjectCard } from '@/lib/project-cards'
import { getRelatedProjectCards } from '@/lib/project-catalog'
import { TrophyIcon } from '@heroicons/react/24/outline'
import {
  btnPrimary,
  btnSecondary,
  card,
  chip,
  pct,
} from '@/app/components/live/ui'
import { getLiveEvent } from '@/lib/live/config'
import {
  backfill,
  categoryLabel,
  getJevAnswers,
  getPublicProject,
} from '@/lib/live/projects'
import { videoEmbed } from '@/lib/live/validate'
import { projectHackers } from '@/lib/live/validate'
import {
  projectListPath,
  projectMetadata,
  serializeJsonLd,
  siteOrigin,
} from '@/lib/project-seo'

export const dynamic = 'force-dynamic'

type Params = {
  params: { locale: string; slug: string; project: string }
  searchParams: { new?: string }
}

export async function generateMetadata({ params }: Params) {
  const event = getLiveEvent(params.slug)
  const project = event && (await getPublicProject(event.slug, params.project))
  if (!event || !project) return {}
  const description = `${project.tagline} Built by ${projectHackers(project)
    .map((hacker) => hacker.name)
    .join(', ')} at ${event.name}.`
  return projectMetadata(
    projectListPath(params.locale, event.slug, project.slug),
    `${project.name} · ${event.name}`,
    description,
  )
}

export default async function ProjectPage({ params, searchParams }: Params) {
  const event = getLiveEvent(params.slug)
  if (!event) notFound()
  let p = await getPublicProject(event.slug, params.project)
  if (!p) notFound()
  if (event.open && !p.category) {
    await backfill([p], 2000)
    p = (await getPublicProject(event.slug, params.project)) ?? p
  }
  const hackers = projectHackers(p)
  const current = submittedProjectCard(p, params.locale, event)
  const [jev, related] = await Promise.all([
    getJevAnswers(p.id),
    getRelatedProjectCards(current, params.locale),
  ])

  const link = `${siteOrigin()}${projectListPath(params.locale, event.slug, p.slug)}`
  const embed = videoEmbed(p.videoUrl)
  const screenshot = p.screenshotKey
    ? `/api/live/${event.slug}/projects/${p.slug}/screenshot?v=${encodeURIComponent(p.screenshotKey)}`
    : null
  const top = jev?.probabilities
    ? Object.entries(jev.probabilities)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
    : []

  return (
    <ProjectPageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd({
            '@context': 'https://schema.org',
            '@type': 'CreativeWork',
            name: p.name,
            description: p.tagline,
            url: link,
            image: screenshot ? `${siteOrigin()}${screenshot}` : undefined,
            datePublished: p.createdAt.toISOString(),
            author: hackers.map((hacker) => ({
              '@type': 'Person',
              name: hacker.name,
              url: hacker.linkedinUrl ?? undefined,
            })),
            award: p.award ?? undefined,
            isPartOf: {
              '@type': 'CollectionPage',
              name: `Projects from ${event.name}`,
              url: `${siteOrigin()}${projectListPath(params.locale, event.slug)}`,
            },
          }),
        }}
      />
      <nav
        aria-label="Breadcrumb"
        className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-2 px-6 pt-8 text-sm lg:px-8"
      >
        <Link
          href={`/${params.locale}/projects`}
          className="text-ink-dim underline underline-offset-4 hover:text-ink"
        >
          All projects
        </Link>
        <span aria-hidden="true" className="text-ink-dim">
          /
        </span>
        <Link
          href={projectListPath(params.locale, event.slug)}
          className="text-ink-dim underline underline-offset-4 hover:text-ink"
        >
          {event.name}
        </Link>
      </nav>
      {event.open && searchParams.new === '1' && (
        <section className="bg-neon-pink text-night-ink">
          <div className="mx-auto max-w-6xl px-6 py-10">
            <p className="text-3xl font-bold tracking-tight sm:text-4xl">
              Your project is published.
            </p>
            <p className="mt-2 max-w-[70ch]">
              Your demo and team are now part of the event’s project collection.
            </p>
          </div>
        </section>
      )}
      <section className="mx-auto grid max-w-6xl gap-10 px-6 pb-16 pt-8 lg:grid-cols-[1fr_24rem]">
        <div className="min-w-0">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            {p.name}
          </h1>
          <p className="mt-5 max-w-[60ch] text-lg text-screen-dim">
            {p.tagline}
          </p>
          {p.award && (
            <p className="mt-5 flex items-center gap-2 font-semibold text-neon-pink">
              <TrophyIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
              {p.award}
            </p>
          )}
          <div className="mt-5">
            <p className="mb-2 text-sm text-screen-dim">Built by</p>
            <ul
              aria-label="Project hackers"
              className="flex flex-wrap gap-x-5 gap-y-2"
            >
              {hackers.map((hacker, index) => (
                <li key={`${hacker.name}-${index}`}>
                  {hacker.linkedinUrl ? (
                    <a
                      href={hacker.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-neon-cyan underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
                    >
                      {hacker.name}
                    </a>
                  ) : (
                    <span>{hacker.name}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href={p.url}
              target="_blank"
              rel="noopener"
              className={btnPrimary}
            >
              Open project ↗
            </a>
          </div>
          {screenshot && !embed && (
            <figure className="mt-10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={screenshot}
                alt={`${p.name} project screenshot`}
                className="hb-px w-full bg-night-raised"
              />
            </figure>
          )}
          {embed ? (
            <div className="hb-px hb-px-lg mt-10 aspect-video bg-night-raised">
              <iframe
                src={embed}
                title={`${p.name} demo video`}
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
                loading="lazy"
                className="h-full w-full"
              />
            </div>
          ) : (
            p.videoUrl && (
              <p className="mt-8">
                <a
                  href={p.videoUrl}
                  target="_blank"
                  rel="noopener"
                  className={btnSecondary}
                >
                  ▶ Watch the demo video
                </a>
              </p>
            )
          )}
          {screenshot && embed && (
            <a
              href={screenshot}
              className="mt-4 inline-block text-neon-cyan underline underline-offset-4"
            >
              View project screenshot
            </a>
          )}
          {p.jevUsage && (
            <section className="mt-10">
              <h2 className="text-2xl font-semibold">How it uses Jev</h2>
              <p className="mt-3 whitespace-pre-wrap text-screen-dim">
                {p.jevUsage}
              </p>
            </section>
          )}
        </div>
        <aside className="space-y-6">
          <div className={card}>
            <h2 className="mb-3 text-xl font-semibold">What Jev thinks</h2>
            {p.judgeScore != null && (
              <div className="mb-5">
                <p className="text-3xl font-bold text-neon-cyan">
                  {p.judgeScore.toFixed(1)}
                  <span className="text-sm text-screen-dim">
                    {' '}
                    / 100 Jev score
                  </span>
                </p>
                <dl className="mt-3 space-y-1 text-sm text-screen-dim">
                  {(
                    [
                      ['Impact', p.judgeImpact],
                      ['Creativity', p.judgeCreativity],
                      ['Use of Jev', p.judgeJevUse],
                    ] as const
                  ).map(
                    ([label, value]) =>
                      value != null && (
                        <div key={label} className="flex justify-between gap-4">
                          <dt>{label}</dt>
                          <dd>{Math.round(value * 100)}%</dd>
                        </div>
                      ),
                  )}
                </dl>
                {p.usedLovable && (
                  <p className="mt-2 text-sm text-screen-dim">
                    Built with Lovable
                  </p>
                )}
              </div>
            )}
            {p.category ? (
              <>
                <p>
                  <span className={chip}>{categoryLabel(p.category)}</span>{' '}
                  <span className="text-sm text-screen-dim">
                    {pct(p.categoryConfidence)} confident
                  </span>
                </p>
                <ul className="mt-3 space-y-1.5">
                  {top.map(([k, v]) => (
                    <li
                      key={k}
                      className="grid grid-cols-[8rem_1fr_3rem] items-center gap-3 text-sm"
                    >
                      <span className="truncate text-screen-dim">
                        {categoryLabel(k)}
                      </span>
                      <span className="h-2 bg-night-indigo">
                        <span
                          className="block h-full bg-neon-cyan"
                          style={{ width: pct(v) }}
                        />
                      </span>
                      <span className="text-right font-mono">{pct(v)}</span>
                    </li>
                  ))}
                </ul>
                {jev?.decisionPowered != null && (
                  <p className="mt-3 text-sm text-screen-dim">
                    Decision-powered app: {pct(jev.decisionPowered)} likely.
                  </p>
                )}
              </>
            ) : (
              <p className="text-screen-dim">
                Jev hasn&apos;t sorted this one yet. Refresh in a moment.
              </p>
            )}
          </div>
        </aside>
      </section>
      <ProjectRecommendations current={current} related={related} />
    </ProjectPageShell>
  )
}
