'use client'

import Link from 'next/link'
import { useIntl } from '../Intl'
import TestimonialCard from '../testimonials/TestimonialCard'
import { testimonialEvents, testimonials } from '@/data/testimonials'

const featuredPosts = testimonials.filter((post) => post.featuredOnHome).slice(0, 3)

export default function HomeTestimonials() {
  const intl = useIntl()

  if (featuredPosts.length === 0) return null

  return (
    <section className="bg-ground py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-accent">
              {intl.t('home.testimonials.eyebrow')}
            </p>
            <h2 className="text-3xl font-bold text-ink">{intl.t('testimonials.title')}</h2>
            <p className="mt-3 max-w-2xl text-ink-dim">{intl.t('home.testimonials.intro')}</p>
          </div>
          <Link
            href={`/${intl.locale}/testimonials`}
            className="text-sm font-medium text-accent hover:text-ink transition-colors"
          >
            {intl.t('home.testimonials.seeAll')} &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {featuredPosts.map((post) => (
            <div key={post.url} className="flex flex-col gap-3">
              <p className="font-mono text-xs uppercase tracking-wide text-ink-dim">
                {testimonialEvents.find((event) => event.slug === post.eventSlug)?.name}
              </p>
              <div className="flex-1">
                <TestimonialCard post={post} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
