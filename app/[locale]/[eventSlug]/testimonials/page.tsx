import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'
import TestimonialGrid from '@/app/components/testimonials/TestimonialGrid'
import { getTestimonialsForEvent, testimonialEvents } from '@/data/testimonials'
import { getEventDataBySlug } from '@/lib/events-server'

const legacySlugs = new Set(['v1-2024', 'aisummit25'])

export default function EventTestimonialsPage({
  params,
}: {
  params: { locale: string; eventSlug: string }
}) {
  const { locale, eventSlug } = params

  if (!legacySlugs.has(eventSlug)) {
    if (getEventDataBySlug(eventSlug)) {
      permanentRedirect(`/${locale}/events/${eventSlug}#testimonials`)
    }
    notFound()
  }

  const event = testimonialEvents.find((item) => item.slug === eventSlug)
  const posts = getTestimonialsForEvent(eventSlug)

  return (
    <main className="min-h-screen bg-white px-6 py-12 text-slate-900 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Link href={`/${locale}/testimonials`} className="mb-8 inline-block text-sm font-medium text-indigo-600 hover:underline">
          ← All community posts
        </Link>
        <h1 className="mb-2 text-3xl font-semibold sm:text-5xl">{event?.name} testimonials</h1>
        <p className="mb-10 text-slate-600">{event?.date} · Open a card to read the original post.</p>
        <TestimonialGrid posts={posts} light />
      </div>
    </main>
  )
}
