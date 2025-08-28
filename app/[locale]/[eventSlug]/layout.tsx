import { EventProvider } from '@/app/contexts/EventContext'
import { ThemeProvider } from '@/app/contexts/ThemeContext'
import { getEventBySlug } from '@/lib/events'
import { notFound } from 'next/navigation'

export default function EventLayout({ 
  children, 
  params 
}: { 
  children: React.ReactNode
  params: { eventSlug: string }
}) {
  const event = getEventBySlug(params.eventSlug)
  
  if (!event) {
    notFound()
  }

  return (
    <EventProvider event={event}>
      <ThemeProvider eventSlug={params.eventSlug}>
        {children}
      </ThemeProvider>
    </EventProvider>
  )
}
