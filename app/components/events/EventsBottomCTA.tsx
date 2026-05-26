import Link from 'next/link'

export default function EventsBottomCTA() {
  return (
    <section className="bg-white border-t border-gray-100">
      <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24 lg:px-8">
        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-10 items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.32em] text-org-accent mb-3">
              / partner with us
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.05]">
              Put your brand on the <span className="text-org-accent">next one</span>.
            </h2>
            <p className="mt-5 text-base text-slate-600 leading-relaxed max-w-xl">
              Sponsor a hackathon, host a hack night in your office, or back the
              community year-round. Every edition is built with companies that
              want to spend a weekend with the people they hire.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
            <a
              href="https://hackbarna.com/sponsorship.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-org-accent px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-org-accent-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-org-accent focus-visible:ring-offset-2"
            >
              Sponsorship deck
              <span aria-hidden="true">→</span>
            </a>
            <a
              href="mailto:team@hackbarna.com?subject=Host%20a%20HackBarna%20event"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-6 py-3 text-base font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
            >
              Host at your office
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
