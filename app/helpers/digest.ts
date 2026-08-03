const DIGEST_LOCALES = new Set(['en', 'es', 'ca'])

export function getDigestHref(locale: string) {
  const digestLocale = DIGEST_LOCALES.has(locale) ? locale : 'en'
  return `https://digest.hackbarna.com/${digestLocale}`
}
