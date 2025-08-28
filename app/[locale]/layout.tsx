import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './../globals.css'
import { Analytics } from '@vercel/analytics/react'
import { IntlProvider } from '@/app/components/Intl'
import i18nConfig from '../../i18n.json'

const inter = Inter({ subsets: ['latin'] })

export async function generateMetadata(args: any) {
  const finalLocale = [
    i18nConfig.locale.source,
    ...i18nConfig.locale.targets,
  ].includes(args.params.locale)
    ? args.params.locale
    : i18nConfig.locale.source

  const localeData = await loadLocaleData(finalLocale)
  return {
    title: localeData['meta.title'],
    description: localeData['meta.description'],
    icons: {
      icon: ['/favicon.ico?v=4'],
    },
    manifest: '/site.webmanifest',
    metadataBase: new URL(`https://hackbarna.com`),
    alternates: {
      canonical: '/',
      languages: {
        'x-default': '/',
        en: '/en',
        fr: '/fr',
        es: '/es',
        ca: '/ca',
      },
    },
    openGraph: {
      type: 'website',
      url: `https://hackbarna.com/${args.params.locale}`,
      title: localeData['meta.title'],
      description: localeData['meta.description-og'],
      siteName: localeData['meta.name'],
      images: '/og_image.png',
    },
  } satisfies Metadata
}
interface HomeLayoutProps {
  children: React.ReactNode
  params: {
    locale: string
  }
}

export default async function HomeLayout({
  children,
  params,
}: HomeLayoutProps) {
  // Load translation data for the current locale
  const localeData = await loadLocaleData(params.locale)

  // Get all available locales from config
  const allLocales = [i18nConfig.locale.source, ...i18nConfig.locale.targets]

  return (
    <IntlProvider locale={params.locale} data={localeData} locales={allLocales}>
      <html>
        <body className={inter.className}>
          {children}
          <Analytics />
        </body>
      </html>
    </IntlProvider>
  )
}

async function loadLocaleData(locale: string) {
  // Load the locale JSON file dynamically
  const finalLocale = [
    i18nConfig.locale.source,
    ...i18nConfig.locale.targets,
  ].includes(locale)
    ? locale
    : i18nConfig.locale.source

  const localeData = await import(`@/i18n/${finalLocale}.json`)
  return localeData.default
}
