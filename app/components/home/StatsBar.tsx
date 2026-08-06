'use client'

import { useIntl } from '../Intl'

const stats = [
  { key: 'home.stats.hackers', value: '400+', highlight: true },
  { key: 'home.stats.projects', value: '200+', highlight: false },
  { key: 'home.stats.events', value: '6', highlight: true },
  { key: 'home.stats.sponsors', value: '15+', highlight: false },
]

export default function StatsBar() {
  const intl = useIntl()

  return (
    <section className="bg-band-4 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <p className="font-mono text-xs uppercase tracking-[0.32em] text-ground/80 mb-10 text-center">
          / by the numbers
        </p>

        <dl className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-10">
          {stats.map((stat) => (
            <div key={stat.key} className="text-center">
              <dt className="sr-only">{intl.t(stat.key)}</dt>
              <dd>
                <p
                  className={`text-4xl sm:text-5xl font-bold tracking-tight leading-none ${
                    stat.highlight ? 'text-ground' : 'text-ground/85'
                  }`}
                >
                  {stat.value}
                </p>
                <p className="mt-3 text-xs sm:text-sm uppercase tracking-[0.18em] text-ground font-semibold">
                  {intl.t(stat.key)}
                </p>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
