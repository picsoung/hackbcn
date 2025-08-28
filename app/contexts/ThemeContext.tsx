'use client'

import { createContext, useContext, ReactNode } from 'react'
import { Theme, getThemeByEventSlug } from '@/lib/themes'

type ThemeContextType = {
  theme: Theme
  currentEventSlug: string | null
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ 
  children, 
  eventSlug 
}: { 
  children: ReactNode
  eventSlug: string | null
}) {
  const theme = getThemeByEventSlug(eventSlug)

  return (
    <ThemeContext.Provider value={{ theme, currentEventSlug: eventSlug }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}