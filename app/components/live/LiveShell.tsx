import Link from 'next/link'
import OrgNavbar from '@/app/components/home/OrgNavbar'
import OrgFooter from '@/app/components/home/OrgFooter'
import type { LiveEvent } from '@/lib/live/config'
import { projectListPath } from '@/lib/project-seo'
import Toaster from './Toaster'
import { btnPrimary, btnSm } from './ui'

type Tab = 'wall' | 'leaderboard' | 'jev' | 'submit'

/** Site chrome plus the event ribbon and wall tabs, in the night register. */
export default function LiveShell({
  locale,
  event,
  active,
  bare = false,
  children,
}: {
  locale: string
  event: LiveEvent
  active?: Tab
  /** Projector mode: no site navbar/footer. */
  bare?: boolean
  children: React.ReactNode
}) {
  const base = `/${locale}/events/${event.slug}`
  const tab = (key: Tab, href: string, label: string) => (
    <Link
      href={href}
      aria-current={active === key ? 'page' : undefined}
      className="px-1 py-2 text-sm text-screen-dim hover:text-screen aria-[current=page]:text-screen aria-[current=page]:underline aria-[current=page]:decoration-neon-pink aria-[current=page]:decoration-2 aria-[current=page]:underline-offset-8"
    >
      {label}
    </Link>
  )

  return (
    <>
      {/* getFeaturedUpcomingEvent() reads MDX from disk; skipped here so these dynamic routes stay self-contained. */}
      {!bare && <OrgNavbar featuredEvent={null} />}
      <div
        data-register="night"
        className="min-h-screen bg-night-ink text-screen"
      >
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 bg-night-indigo px-6 py-2 font-mono text-xs">
          {event.open && (
            <span className="hb-px hb-px-sm bg-neon-pink px-2 py-0.5 font-bold text-night-ink">
              LIVE
            </span>
          )}
          <Link href={base} className="text-screen hover:text-neon-cyan">
            {event.name}
          </Link>
          <span className="text-screen-dim">{event.date}</span>
          <a
            href={event.registrationUrl}
            target="_blank"
            rel="noopener"
            className="text-screen-dim hover:text-screen"
          >
            Event page ↗
          </a>
        </div>
        <nav
          aria-label="Project wall"
          className="mx-auto flex max-w-6xl flex-wrap items-center gap-6 px-6 py-4"
        >
          {tab('wall', projectListPath(locale, event.slug), 'Projects')}
          {tab('leaderboard', `${base}/leaderboard`, 'Leaderboard')}
          {tab('jev', `${base}/jev`, 'Jev lab')}
          {event.open && (
            <Link
              href={`${base}/submit`}
              className={`${btnPrimary} ${btnSm} ml-auto`}
            >
              Submit project
            </Link>
          )}
        </nav>
        <main>{children}</main>
        <Toaster />
      </div>
      {!bare && <OrgFooter />}
    </>
  )
}
