import { notFound, redirect } from 'next/navigation'
import LiveShell from '@/app/components/live/LiveShell'
import SubmitForm from '@/app/components/live/SubmitForm'
import { kicker } from '@/app/components/live/ui'
import { getLiveEvent } from '@/lib/live/config'
import { projectListPath } from '@/lib/project-seo'

export function generateMetadata({ params }: { params: { slug: string } }) {
  const event = getLiveEvent(params.slug)
  return event
    ? {
        title: `Submit your project · ${event.name} · HackBarna`,
        robots: { index: false, follow: true },
      }
    : {}
}

export default function SubmitPage({
  params,
}: {
  params: { locale: string; slug: string }
}) {
  const event = getLiveEvent(params.slug)
  if (!event) notFound()
  const wallBase = `/${params.locale}/events/${event.slug}/projects`
  if (!event.open) redirect(projectListPath(params.locale, event.slug))

  const steps = [
    "Submit what you built, even if it's held together with tape.",
    'Jev reads your pitch and sorts it into a category.',
    'Share your link. Votes follow shares.',
  ]
  return (
    <LiveShell locale={params.locale} event={event} active="submit">
      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[1fr_32rem]">
        <div>
          <p className={kicker}>/ submit</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
            Put your project on the wall.
          </h1>
          <p className="mt-5 max-w-[60ch] text-lg text-screen-dim">
            Takes a minute. You get a page with your own link, a share kit, and
            a spot on the live leaderboard.
          </p>
          <ol className="mt-8 space-y-4">
            {steps.map((s, i) => (
              <li key={s} className="flex gap-4">
                <span className="hb-px hb-px-sm flex h-8 w-8 shrink-0 items-center justify-center bg-neon-cyan font-mono font-bold text-night-ink">
                  {i + 1}
                </span>
                <span className="pt-1">{s}</span>
              </li>
            ))}
          </ol>
        </div>
        <SubmitForm eventSlug={event.slug} wallBase={wallBase} />
      </section>
    </LiveShell>
  )
}
