import Link from 'next/link'
import OrgNavbar from '@/app/components/home/OrgNavbar'
import OrgFooter from '@/app/components/home/OrgFooter'
import TestimonialGrid from '@/app/components/testimonials/TestimonialGrid'
import { testimonials, testimonialEvents } from '@/data/testimonials'
import { getFeaturedUpcomingEvent } from '@/lib/events-server'

export const metadata = {
  title: 'Community voices — HackBarna',
  description: 'Public posts from HackBarna hackathons and hack nights in Barcelona.',
}

export default function TestimonialsPage({ params }: { params: { locale: string } }) {
  return (
    <div data-register="night" className="min-h-screen bg-ground text-ink">
      <OrgNavbar featuredEvent={getFeaturedUpcomingEvent()} />
      <main className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-accent">Community voices</p>
        <h1 className="mb-4 text-4xl font-semibold sm:text-5xl">What builders are saying</h1>
        <p className="mb-12 max-w-2xl text-ink-dim">
          Highlights from public posts about HackBarna events. Open a card to read the original.
        </p>

        {testimonialEvents.map((event) => {
          const posts = testimonials.filter((post) => post.eventSlug === event.slug)
          if (posts.length === 0) return null
          return (
            <section id={event.slug} key={event.slug} className="mb-14 scroll-mt-8 border-t border-band-2 pt-8">
              <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="mb-1 font-mono text-xs uppercase tracking-wide text-ink-dim">{event.date}</p>
                  <h2 className="text-2xl font-semibold sm:text-3xl">{event.name}</h2>
                </div>
                <Link
                  href={event.slug === 'v1-2024' || event.slug === 'aisummit25'
                    ? `/${params.locale}/${event.slug}`
                    : `/${params.locale}/events/${event.slug}`}
                  className="text-sm font-semibold text-accent hover:underline"
                >
                  View event ↗
                </Link>
              </div>
              <TestimonialGrid posts={posts} />
            </section>
          )
        })}
      </main>
      <OrgFooter />
    </div>
  )
}
