import { notFound } from 'next/navigation'
import JevLab from '@/app/components/live/JevLab'
import LiveShell from '@/app/components/live/LiveShell'
import { kicker } from '@/app/components/live/ui'
import { getLiveEvent } from '@/lib/live/config'
import { PLAYGROUND_SNIPPET } from '@/lib/live/jev'
import { projectMetadata } from '@/lib/project-seo'

export function generateMetadata({
  params,
}: {
  params: { locale: string; slug: string }
}) {
  const event = getLiveEvent(params.slug)
  return event
    ? projectMetadata(
        `/${params.locale}/events/${event.slug}/jev`,
        `Jev lab · ${event.name}`,
        'Try the decision model that categorizes projects from the HackBarna community.',
      )
    : {}
}

export default function JevPage({
  params,
}: {
  params: { locale: string; slug: string }
}) {
  const event = getLiveEvent(params.slug)
  if (!event) notFound()
  return (
    <LiveShell locale={params.locale} event={event} active="jev">
      <section className="mx-auto max-w-6xl px-6 py-16">
        <p className={kicker}>/ jev lab</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
          Watch Jev make a call.
        </h1>
        <p className="mb-10 mt-5 max-w-[70ch] text-lg text-screen-dim">
          Jev is TypeSafe&apos;s decision model. Instead of generating text, it
          answers typed questions about whatever you give it: pick one of these
          labels, rate this on a rubric, yes or no. Every answer comes back with
          calibrated probabilities. This is exactly how projects on the wall get
          their category.
        </p>
        <JevLab />
      </section>
      <section className="bg-night-indigo py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-3xl font-bold tracking-tight">
            The code behind it
          </h2>
          <p className="mt-2 text-screen-dim">
            One <code className="font-mono">systemOne</code> call through
            Netlify AI Gateway. No API key in the code, no prompt parsing, no
            JSON repair.
          </p>
          <pre className="hb-px mt-6 overflow-x-auto bg-night-ink p-6 font-mono text-sm text-screen">
            <code>{PLAYGROUND_SNIPPET}</code>
          </pre>
        </div>
      </section>
    </LiveShell>
  )
}
