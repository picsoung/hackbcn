'use client'

import { useIntl } from '../Intl'
import { homeCopy } from '@/data/homepage'

export default function StatsBar({ eventCount }: { eventCount: number }) {
  const intl = useIntl()
  const stats = [
    { label: 'home.stats.hackers', value: '400+' },
    { label: 'home.stats.projects', value: '200+' },
    { label: 'home.stats.events', value: String(eventCount) },
  ]
  return (
    <section
      aria-label={homeCopy(intl.locale).communityLabel}
      className="bg-accent text-ground"
    >
      <dl className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-8 gap-y-3 px-6 py-6 sm:py-7 lg:px-8">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-baseline gap-3">
            <dt className="order-2 text-sm font-medium sm:text-base">
              {intl.t(stat.label)}
            </dt>
            <dd className="order-1 text-2xl font-bold tracking-tight sm:text-3xl">
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
