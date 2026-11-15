'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import type { Testimonial } from '@/data/testimonials'
import TestimonialGrid from './TestimonialGrid'

export default function EventTestimonialsSection({
  posts,
  locale,
  eventSlug,
}: {
  posts: Testimonial[]
  locale: string
  eventSlug: string
}) {
  const disclosure = useRef<HTMLDetailsElement>(null)

  useEffect(() => {
    const revealFromHash = () => {
      if (window.location.hash === '#testimonials' && disclosure.current)
        disclosure.current.open = true
    }
    const followLink = (event: MouseEvent) => {
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return
      const anchor =
        event.target instanceof Element ? event.target.closest('a[href]') : null
      if (!(anchor instanceof HTMLAnchorElement)) return
      const url = new URL(anchor.href)
      if (
        url.origin === window.location.origin &&
        url.pathname === window.location.pathname &&
        url.hash === '#testimonials' &&
        disclosure.current
      )
        disclosure.current.open = true
    }
    revealFromHash()
    window.addEventListener('hashchange', revealFromHash)
    document.addEventListener('click', followLink, true)
    return () => {
      window.removeEventListener('hashchange', revealFromHash)
      document.removeEventListener('click', followLink, true)
    }
  }, [])

  return (
    <section
      id="testimonials"
      aria-labelledby="event-testimonials-heading"
      className="scroll-mt-8"
    >
      <details ref={disclosure} className="group border-b border-band-2">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent [&::-webkit-details-marker]:hidden">
          <h2 id="event-testimonials-heading" className="text-xl font-semibold">
            Community posts{' '}
            <span className="ml-2 text-sm font-normal tabular-nums text-ink-dim">
              {posts.length}
            </span>
          </h2>
          <ChevronDownIcon
            aria-hidden="true"
            className="h-5 w-5 shrink-0 text-ink-dim group-open:rotate-180"
          />
        </summary>
        <div className="pb-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
            <p className="text-sm text-ink-dim">
              Recaps and project demos from this event.
            </p>
            <Link
              href={`/${locale}/testimonials#${eventSlug}`}
              className="inline-flex min-h-11 items-center text-sm font-semibold text-accent underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              View in community archive
            </Link>
          </div>
          <TestimonialGrid posts={posts} />
        </div>
      </details>
    </section>
  )
}
