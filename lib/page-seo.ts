import type { Metadata } from 'next'
import i18nConfig from '../i18n.json'
import { buildOgImagePath } from './og'
import { siteOrigin } from './project-seo'

export const siteLocales = [
  i18nConfig.locale.source,
  ...i18nConfig.locale.targets,
]

/** Each public route owns its canonical and language alternates. */
export function localizedAlternates(locale: string, path = '') {
  const lang = siteLocales.includes(locale) ? locale : i18nConfig.locale.source
  const suffix = path === '/' ? '' : path
  const url = (language: string) => `${siteOrigin()}/${language}${suffix}`
  return {
    canonical: url(lang),
    languages: Object.fromEntries([
      ['x-default', url(i18nConfig.locale.source)],
      ...siteLocales.map((language) => [language, url(language)]),
    ]),
  }
}

export async function localizedPageMetadata(
  locale: string,
  path: string,
  titleKey: 'events.title' | 'conduct.title',
): Promise<Metadata> {
  const lang = siteLocales.includes(locale) ? locale : i18nConfig.locale.source
  const messages: Record<string, string> = (
    await import(`../i18n/${lang}.json`)
  ).default
  const label = messages[titleKey]
  const title = label.includes('HackBarna') ? label : `${label} · HackBarna`
  const description = messages['meta.description']
  const alternates = localizedAlternates(lang, path)
  const image = buildOgImagePath({ title })
  return {
    title,
    description,
    alternates,
    openGraph: {
      type: 'website',
      title,
      description,
      url: alternates.canonical,
      siteName: 'HackBarna',
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  }
}
