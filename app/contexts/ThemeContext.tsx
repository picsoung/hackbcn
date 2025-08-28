'use client'

import { createContext, useContext, ReactNode, useEffect } from 'react'
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

  // Apply CSS variable overrides to document root for AI Summit theme
  useEffect(() => {
    if (eventSlug === 'aisummit25') {
      const root = document.documentElement
      root.style.setProperty('--background', '21 16% 15%') // Dark background for AI Summit
      root.style.setProperty('--foreground', '0 0% 100%') // White text
      root.style.setProperty('--primary', '15 100% 58%') // AI orange (#FF5733)
      root.style.setProperty('--primary-foreground', '0 0% 100%') // White text on orange
      root.style.setProperty('--secondary', '353 100% 47%') // AI red (#C70039)
      root.style.setProperty('--secondary-foreground', '0 0% 100%') // White text on red
      root.style.setProperty('--accent', '344 100% 33%') // AI burgundy (#900C3F)
      root.style.setProperty('--accent-foreground', '0 0% 100%') // White text on burgundy
      
      return () => {
        // Cleanup: reset to default values when component unmounts
        root.style.removeProperty('--background')
        root.style.removeProperty('--foreground')
        root.style.removeProperty('--primary')
        root.style.removeProperty('--primary-foreground')
        root.style.removeProperty('--secondary')
        root.style.removeProperty('--secondary-foreground')
        root.style.removeProperty('--accent')
        root.style.removeProperty('--accent-foreground')
      }
    }
  }, [eventSlug])

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