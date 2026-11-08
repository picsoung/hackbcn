'use client'

import Link from 'next/link'
import { useIntl } from '../Intl'
import SponsorAction from '../sponsorship/SponsorAction'

export default function EventsBottomCTA() {
  const intl = useIntl()
  return (
    <section className="bg-band-3 border-t border-band-4">
      <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24 lg:px-8">
        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-10 items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.32em] text-inversion mb-3">
              / partner with us
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-ink leading-[1.1]">
              Put your brand on the <span className="text-inversion">next one</span>.
            </h2>
            <p className="mt-5 text-base text-ink-dim leading-relaxed max-w-xl">
              Sponsor a hackathon, host a hack night in your office, or back the
              community year-round. Every edition is built with companies that
              want to spend a weekend with the people they hire.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
            <SponsorAction
              source="events-page-bottom"
              className="hb-px inline-flex items-center justify-center gap-2 bg-accent px-6 py-3 text-base font-semibold text-ground transition-colors hover:bg-inversion focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-ground"
            >
              {intl.t('partner.book')}
            </SponsorAction>
            <Link
              href={`/${intl.locale}/sponsor`}
              className="hb-px inline-flex items-center justify-center gap-2 bg-ink/10 px-6 py-3 text-base font-semibold text-ink transition-colors hover:bg-ink/20 focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-inversion"
            >
              {intl.t('partner.nav')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
