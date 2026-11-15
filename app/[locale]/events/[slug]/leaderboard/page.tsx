import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import LiveBoard from '@/app/components/live/LiveBoard'
import LiveShell from '@/app/components/live/LiveShell'
import { kicker } from '@/app/components/live/ui'
import { getLiveEvent } from '@/lib/live/config'
import { projectListPath, projectMetadata } from '@/lib/project-seo'

export const dynamic = 'force-dynamic'

export function generateMetadata({
  params,
}: {
  params: { locale: string; slug: string }
}) {
  const event = getLiveEvent(params.slug)
  return event
    ? {
        ...projectMetadata(
          `/${params.locale}/events/${event.slug}/leaderboard`,
          `Leaderboard · ${event.name}`,
          `Project rankings from ${event.name}.`,
        ),
        robots: { index: false, follow: true },
      }
    : {}
}

/** Built for the projector during demos: no site chrome, big voting URL. */
export default function LeaderboardPage({
  params,
}: {
  params: { locale: string; slug: string }
}) {
  const event = getLiveEvent(params.slug)
  if (!event) notFound()
  const base = `/${params.locale}/events/${event.slug}`
  const host =
    headers().get('x-forwarded-host') ??
    headers().get('host') ??
    'hackbarna.com'

  return (
    <LiveShell locale={params.locale} event={event} active="leaderboard" bare>
      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className={kicker}>/ live leaderboard</p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              {event.open ? "Who's winning the room" : 'Final project rankings'}
            </h1>
          </div>
          <div className="text-right">
            <p className="font-mono text-screen-dim">
              {event.open ? 'Vote at' : 'Projects at'}
            </p>
            <p className="break-all font-mono text-xl font-bold text-neon-cyan sm:text-2xl">
              {host}
              {projectListPath(params.locale, event.slug)}
            </p>
          </div>
        </div>
        <LiveBoard
          eventSlug={event.slug}
          wallBase={`${base}/projects`}
          submitPath={`${base}/submit`}
        />
      </section>
    </LiveShell>
  )
}
