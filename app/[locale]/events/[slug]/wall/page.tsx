import Link from 'next/link'
import { notFound } from 'next/navigation'
import LiveShell from '@/app/components/live/LiveShell'
import Wall from '@/app/components/live/Wall'
import { btnPrimary, btnSecondary, kicker } from '@/app/components/live/ui'
import { getLiveEvent } from '@/lib/live/config'
import {
  backfill,
  categoryLabels,
  listProjects,
  votedProjectIds,
} from '@/lib/live/projects'
import { readVoterId } from '@/lib/live/voter'

export const dynamic = 'force-dynamic'

export function generateMetadata({ params }: { params: { slug: string } }) {
  const event = getLiveEvent(params.slug)
  if (!event) return {}
  return {
    title: `Projects · ${event.name} · HackBarna`,
    description: `Vote for your favourite projects built at ${event.name} and follow the live leaderboard.`,
  }
}

export default async function WallPage({
  params,
}: {
  params: { locale: string; slug: string }
}) {
  const event = getLiveEvent(params.slug)
  if (!event) notFound()

  let list = await listProjects(event.slug)
  if (list.some((p) => !p.category)) {
    await backfill(list, 1500)
    list = await listProjects(event.slug)
  }
  const voted = await votedProjectIds(readVoterId())
  const totalVotes = list.reduce((n, p) => n + p.voteCount, 0)
  const base = `/${params.locale}/events/${event.slug}`

  return (
    <LiveShell locale={params.locale} event={event} active="wall">
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 lg:grid-cols-[1fr_auto] lg:py-24">
        <div>
          <p className={kicker}>/ {event.name}</p>
          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
            Built something tonight?{' '}
            <span className="text-neon-pink">Put it on the wall.</span>
          </h1>
          <p className="mt-5 max-w-[60ch] text-lg text-screen-dim">
            Submit your project in a minute, share your link everywhere, and let
            the room vote. The leaderboard updates live during demos, and Jev
            sorts every project by the kind of decision it makes.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {event.open && (
              <Link href={`${base}/submit`} className={btnPrimary}>
                Submit your project
              </Link>
            )}
            <Link href={`${base}/leaderboard`} className={btnSecondary}>
              Open live leaderboard
            </Link>
          </div>
          <p className="mt-6 font-mono text-sm text-screen-dim">
            {list.length} {list.length === 1 ? 'project' : 'projects'} ·{' '}
            {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'} so far
          </p>
        </div>
        {event.image && (
          <figure className="hb-px hidden w-72 -rotate-3 bg-paper p-3 pb-10 lg:block">
            <div className="hb-dither">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="hb-dither-img"
                src={event.image}
                alt={`${event.name} event cover`}
                width={320}
                height={320}
              />
              <span className="hb-dither-tex" aria-hidden="true" />
            </div>
            <figcaption className="mt-3 text-center font-mono text-xs text-night-ink">
              {event.venue.split(',')[0]}
            </figcaption>
          </figure>
        )}
      </section>

      <section className="bg-neon-pink text-night-ink">
        <div className="mx-auto grid max-w-6xl gap-4 px-6 py-10 lg:grid-cols-[auto_1fr] lg:items-center lg:gap-10">
          <p className="text-3xl font-bold tracking-tight sm:text-4xl">
            Votes follow shares.
          </p>
          <p>
            Every project gets its own page. Post it on LinkedIn, drop it in
            your group chats, tag <strong>@HackBarna</strong> and{' '}
            <strong>#{event.hashtag}</strong>. The more people see it, the
            higher you climb.
          </p>
        </div>
      </section>

      <section className="bg-night-indigo py-16 lg:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
              The wall
            </h2>
            <p className="mt-2 text-screen-dim">
              Tap the arrow to vote. One vote per project, as many projects as
              you like.
            </p>
          </div>
          {list.length ? (
            <Wall
              eventSlug={event.slug}
              basePath={`${base}/wall`}
              categoryLabels={categoryLabels}
              open={event.open}
              projects={list.map((p) => ({
                id: p.id,
                slug: p.slug,
                name: p.name,
                tagline: p.tagline,
                creatorName: p.creatorName,
                category: p.category,
                categoryConfidence: p.categoryConfidence,
                voteCount: p.voteCount,
                shareCount: p.shareCount,
                hasVideo: Boolean(p.videoUrl),
                voted: voted.has(p.id),
              }))}
            />
          ) : (
            <div className="hb-px bg-night-raised p-8">
              <p className="text-xl font-semibold">
                The wall is empty. Be the first.
              </p>
              <p className="mb-4 text-screen-dim">
                First on the wall gets the most eyeballs.
              </p>
              {event.open && (
                <Link href={`${base}/submit`} className={btnPrimary}>
                  Submit your project
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="bg-night-violet py-16 lg:py-24">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 lg:grid-cols-2">
          <div>
            <p className={kicker}>/ sorted by jev</p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
              Every project, read by a decision model.
            </h2>
          </div>
          <div>
            <p className="mb-6">
              When you submit, Jev reads your pitch and picks a category:
              moderation, lead scoring, routing, agent handoffs and more. It
              doesn&apos;t write text. It answers typed questions with
              calibrated probabilities, usually in well under a second.
            </p>
            <Link
              href={`${base}/jev`}
              className={btnSecondary.replace(
                'bg-night-violet',
                'bg-night-indigo',
              )}
            >
              Try it in the Jev lab
            </Link>
          </div>
        </div>
      </section>
    </LiveShell>
  )
}
