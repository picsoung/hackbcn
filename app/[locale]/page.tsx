import { getCurrentEvent } from '@/lib/events'
import { redirect } from 'next/navigation'

export default function HomePage( {params }: { params: { locale: string } }) {
  const currentEvent = getCurrentEvent()

  if (currentEvent) {
    redirect(`/${params.locale}/${currentEvent.slug}`)
  }

  // Fallback content if no active event
  return <div>No active event</div>
}
