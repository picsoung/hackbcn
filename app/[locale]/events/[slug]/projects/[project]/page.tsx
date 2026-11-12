import { notFound } from 'next/navigation'
import Link from 'next/link'
import LiveShell from '@/app/components/live/LiveShell'
import ShareKit from '@/app/components/live/ShareKit'
import VoteButton from '@/app/components/live/VoteButton'
import {
  btnPrimary,
  btnSecondary,
  card,
  chip,
  kicker,
  pct,
} from '@/app/components/live/ui'
import { getLiveEvent } from '@/lib/live/config'
import {
  backfill,
  categoryLabel,
  getJevAnswers,
  listProjects,
  votedProjectIds,
} from '@/lib/live/projects'
import { videoEmbed } from '@/lib/live/validate'
import { readVoterId } from '@/lib/live/voter'
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

async function load(eventSlug: string, project: string) {
  const list = await listProjects(eventSlug)
  const index = list.findIndex((p) => p.slug === project)
  return index === -1 ? null : { list, index, p: list[index] }
}

export async function generateMetadata({ params }: Params) {
  const event = getLiveEvent(params.slug)
  const found = event && (await load(event.slug, params.project))
  if (!event || !found) return {}
  const description = `${found.p.tagline} Built by ${found.p.creatorName} at ${event.name}.`
  return projectMetadata(
    projectListPath(params.locale, event.slug, found.p.slug),
    `${event.open ? 'Vote for ' : ''}${found.p.name} · ${event.name}`,
    description,
  )
}

export default async function ProjectPage({ params, searchParams }: Params) {
  const event = getLiveEvent(params.slug)
  if (!event) notFound()
  let found = await load(event.slug, params.project)
  if (!found) notFound()
  if (!found.p.category) {
    await backfill([found.p], 2000)
    found = (await load(event.slug, params.project)) ?? found
  }
  const { p, index, list } = found
  const [voted, jev] = await Promise.all([
    votedProjectIds(readVoterId()),
    getJevAnswers(p.id),
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
    <LiveShell locale={params.locale} event={event} active="wall">
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
            author: {
              '@type': 'Person',
              name: p.creatorName,
              url: p.linkedinUrl,
            },
            isPartOf: {
              '@type': 'CollectionPage',
              name: `Projects from ${event.name}`,
              url: `${siteOrigin()}${projectListPath(params.locale, event.slug)}`,
            },
          }),
        }}
      />
      {event.open && searchParams.new === '1' && (
        <section className="bg-neon-pink text-night-ink">
          <div className="mx-auto max-w-6xl px-6 py-10">
            <p className="text-3xl font-bold tracking-tight sm:text-4xl">
              You&apos;re live. Now go get votes.
            </p>
            <p className="mt-2 max-w-[70ch]">
              Your project is on the wall at rank #{index + 1}. Post the link
              below in at least two places before demos start. Projects with a
              video and a LinkedIn post climb fastest.
            </p>
          </div>
        </section>
      )}
      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[1fr_24rem]">
        <div className="min-w-0">
          <p className={kicker}>
            / project · rank #{index + 1} of {list.length}
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            {p.name}
          </h1>
          <p className="mt-5 max-w-[60ch] text-lg text-screen-dim">
            {p.tagline}
          </p>
          <p className="mt-4">
            by{' '}
            <a
              href={p.linkedinUrl}
              target="_blank"
              rel="noopener"
              className="text-neon-cyan underline underline-offset-4"
            >
              {p.creatorName}
            </a>{' '}
            <span className="font-mono text-sm text-screen-dim">
              · LinkedIn ↗
            </span>
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <VoteButton
              eventSlug={event.slug}
              slug={p.slug}
              name={p.name}
              initialCount={p.voteCount}
              initialVoted={voted.has(p.id)}
              size="lg"
              disabled={!event.open}
            />
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
            <h2 className="text-xl font-semibold">
              {event.open ? 'Share it, climb it' : 'Share this project'}
            </h2>
            <p className="text-sm text-screen-dim">
              {p.voteCount} {p.voteCount === 1 ? 'vote' : 'votes'} ·{' '}
              {p.shareCount} {p.shareCount === 1 ? 'share' : 'shares'}{' '}
              {event.open ? 'so far' : 'at the event'}
            </p>
            <ShareKit
              eventSlug={event.slug}
              eventName={event.name}
              hashtag={event.hashtag}
              slug={p.slug}
              name={p.name}
              tagline={p.tagline}
              link={link}
              open={event.open}
            />
          </div>
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
            <Link
              href={`/${params.locale}/events/${event.slug}/jev`}
              className="mt-3 inline-block text-sm text-neon-cyan underline underline-offset-4"
            >
              How this works
            </Link>
          </div>
        </aside>
      </section>
    </LiveShell>
  )
}
