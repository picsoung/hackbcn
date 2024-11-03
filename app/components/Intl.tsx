'use client'

import { createIntl } from '@formatjs/intl'
import { createContext, useContext } from 'react'

export const IntlContext = createContext({
  intl: createIntl({ locale: 'en' }),
  locales: [] as string[],
})

export type IntlProviderProps = {
  locale: string
  locales: string[]
  data: Record<string, string>
  children: React.ReactNode
}

export function IntlProvider(props: IntlProviderProps) {
  console.log("intl", props)
  return (
    <IntlContext.Provider
      value={{
        intl: createIntl({
          locale: props.locale,
          messages: props.data,
        }),
        locales: props.locales,
      }}
    >
      {props.children}
    </IntlContext.Provider>
  )
}

export const useIntl = () => {
  const ctx = useContext(IntlContext)
  return {
    t: (id: string) => ctx.intl.formatMessage({ id }),
    locale: ctx.intl.locale,
    locales: ctx.locales,
  }
}

export function IntlMessage({ id }: any) {
  const intl = useIntl()
  return intl.t(id)
}
