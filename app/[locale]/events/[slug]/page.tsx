import OrgNavbar from '@/app/components/home/OrgNavbar'
import OrgFooter from '@/app/components/home/OrgFooter'
import HackNightDetail from '@/app/components/events/HackNightDetail'
import EventDetail from '@/app/components/events/EventDetail'
import { getHackNightBySlug, hackNights } from '@/data/hacknights'
import { getEventBySlug, events } from '@/lib/events'
import { notFound } from 'next/navigation'

export async function generateStaticParams() {
  return [
    ...hackNights.map((hn) => ({ slug: hn.slug })),
    ...events.map((e) => ({ slug: e.slug })),
  ]
}

export default function EventDetailPage({
  params,
}: {
  params: { locale: string; slug: string }
}) {
  const hackNight = getHackNightBySlug(params.slug)
  const event = getEventBySlug(params.slug)

  if (!hackNight && !event) {
    notFound()
  }

  return (
    <div>
      <OrgNavbar />
      <main>
        {hackNight ? (
          <HackNightDetail hackNight={hackNight} />
        ) : event ? (
          <EventDetail event={event} locale={params.locale} />
        ) : null}
      </main>
      <OrgFooter />
    </div>
  )
}
