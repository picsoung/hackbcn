import { EventProvider } from '@/app/contexts/EventContext'
import { ThemeProvider } from '@/app/contexts/ThemeContext'
import { getEventBySlug } from '@/lib/events'

// This layout only wraps past legacy events with EventProvider + ThemeProvider.
// Newer event slugs (MDX, hack nights) get redirected to /events/<slug> by the
// page component below — we must NOT call notFound() here, or the layout error
// pre-empts the page's redirect.
export default function EventLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { eventSlug: string }
}) {
  const event = getEventBySlug(params.eventSlug)

  // If we don't have a legacy event for this slug, render children without
  // EventProvider/ThemeProvider. The page handles redirect or 404.
  if (!event) {
    return <>{children}</>
  }

  return (
    <EventProvider event={event}>
      <ThemeProvider eventSlug={params.eventSlug}>
        {children}
      </ThemeProvider>
    </EventProvider>
  )
}
