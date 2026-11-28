'use client'

import { useParams } from 'next/navigation'
import i18nConfig from '@/i18n.json'

const locales = [i18nConfig.locale.source, ...i18nConfig.locale.targets]

// Keep the document in the root layout so page-level 404s replace its contents.
// Router params keep its language correct during SSR and locale navigation
// without making every public page dynamic by reading request headers.
export default function SiteDocument({
  children,
  className,
}: {
  children: React.ReactNode
  className: string
}) {
  const params = useParams<{ locale?: string }>()
  const locale =
    params?.locale && locales.includes(params.locale)
      ? params.locale
      : i18nConfig.locale.source

  return (
    <html lang={locale}>
      <body className={className}>{children}</body>
    </html>
  )
}
