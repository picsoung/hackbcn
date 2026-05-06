'use client'

import { useIntl } from '../Intl'

const stats = [
  { key: 'home.stats.hackers', value: '400+' },
  { key: 'home.stats.projects', value: '200+' },
  { key: 'home.stats.events', value: '6' },
  { key: 'home.stats.sponsors', value: '15+' },
]

export default function StatsBar() {
  const intl = useIntl()

  return (
    <section className="bg-org-accent">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.key} className="text-center">
              <p className="text-3xl sm:text-4xl font-bold text-white">{stat.value}</p>
              <p className="mt-1 text-sm text-teal-100">{intl.t(stat.key)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
