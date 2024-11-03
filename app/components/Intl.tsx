'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { IntlShape, createIntl } from '@formatjs/intl'

interface IntlContextType {
  intl: IntlShape
  locales: string[]
}

interface IntlProviderProps {
  locale: string
  locales: string[]
  data: Record<string, string>
  children: ReactNode
}

// Create context with a default value
const IntlContext = createContext<IntlContextType>({
  intl: createIntl({ locale: 'en' }),
  locales: [],
})

// Provider component
export function IntlProvider({ locale, locales, data, children }: IntlProviderProps) {
  const value = {
    intl: createIntl({
      locale,
      messages: data,
    }),
    locales,
  }

  return (
    <IntlContext.Provider value={value}>
      {children}
    </IntlContext.Provider>
  )
}

// Custom hook for using intl
export function useIntl() {
  const ctx = useContext(IntlContext)
  
  return {
    t: (id: string) => ctx.intl.formatMessage({ id }),
    locale: ctx.intl.locale,
    locales: ctx.locales,
  }
}