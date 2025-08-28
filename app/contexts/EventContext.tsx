'use client'

import { createContext, useContext } from 'react'
import { Event } from '@/types/events'
type EventContextType = {
  event: Event
}

export const EventContext = createContext<EventContextType | undefined>(
  undefined,
)

export function EventProvider({
  children,
  event,
}: {
  children: React.ReactNode
  event: Event
}) {
  return (
    <EventContext.Provider value={{ event }}>{children}</EventContext.Provider>
  )
}

export function useEvent() {
  const context = useContext(EventContext)
  if (context === undefined) {
    throw new Error('useEvent must be used within an EventProvider')
  }
  return context.event
}
