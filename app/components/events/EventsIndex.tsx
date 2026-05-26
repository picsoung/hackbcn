import { getUpcomingEvents, getPastEvents } from '@/lib/events'
import { getUpcomingHackNights, getPastHackNights } from '@/data/hacknights'
import EventsTimeline from './EventsTimeline'

export default function EventsIndex() {
  const pastHackathons = getPastEvents().length
  const pastHackNights = getPastHackNights().length
  const upcoming =
    getUpcomingEvents().length + getUpcomingHackNights().length

  const indexStrip = [
    { count: pastHackathons + getUpcomingEvents().length, label: 'hackathons' },
    { count: pastHackNights + getUpcomingHackNights().length, label: 'hack nights' },
    { count: upcoming, label: upcoming === 1 ? 'upcoming' : 'upcoming' },
  ]

  return (
    <section className="bg-stone-50">
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-12 sm:pt-20 sm:pb-16 lg:px-8">
        {/* Page index strip — counts about this page, not lifetime stats */}
        <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-xs uppercase tracking-[0.28em] text-slate-500">
          <li className="text-slate-400">/ index</li>
          {indexStrip.map((item, i) => (
            <li key={item.label} className="flex items-center gap-2">
              <span className="text-slate-900 font-semibold">{item.count}</span>
              <span>{item.label}</span>
              {i < indexStrip.length - 1 && (
                <span aria-hidden="true" className="ml-3 text-slate-300">·</span>
              )}
            </li>
          ))}
        </ul>

        {/* Editorial headline — left-aligned, "catalogue" feel */}
        <h1 className="mt-10 max-w-4xl text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05] text-slate-900">
          Everything we&apos;ve built,
          <br />
          and <span className="text-org-accent">what&apos;s next</span>.
        </h1>

        <p className="mt-5 max-w-2xl text-lg text-slate-600 leading-relaxed">
          One flagship hackathon a year. Hack nights every few weeks. A growing
          archive of projects shipped on deadline.
        </p>

        {/* Timeline rule — the page's visual signature */}
        <div className="mt-14">
          <EventsTimeline className="h-20 max-w-5xl mx-auto sm:mx-0" />
        </div>
      </div>
    </section>
  )
}
