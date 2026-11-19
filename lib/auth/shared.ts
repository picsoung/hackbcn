export function isHackBarnaHost(hostname: string) {
  const host = hostname.toLowerCase().replace(/\.$/, '')
  return host === 'hackbarna.com' || host.endsWith('.hackbarna.com')
}

// Each website owns its session. No Domain attribute, including in production.
export function getAuthCookieOptions(hostname: string, https = false) {
  return {
    path: '/',
    sameSite: 'lax' as const,
    secure: https || isHackBarnaHost(hostname),
    httpOnly: true,
  }
}

export function getAuthLocale(value: string | null | undefined) {
  return ['en', 'es', 'ca', 'fr'].includes(value ?? '') ? value! : 'en'
}

export function getDigestLocale(locale: string) {
  return ['en', 'es', 'ca'].includes(locale) ? locale : 'en'
}

// Never turn a user-supplied return path into a cross-origin redirect.
export function getSafeReturnPath(
  value: string | null | undefined,
  fallback: string,
) {
  if (
    typeof value !== 'string' ||
    !value ||
    value.length > 1024 ||
    !value.startsWith('/') ||
    value.startsWith('//')
  )
    return fallback
  if (/[\\\u0000-\u001f\u007f]/.test(value)) return fallback
  try {
    const url = new URL(value, 'https://return.invalid')
    const decodedPath = decodeURIComponent(url.pathname)
    if (
      url.origin !== 'https://return.invalid' ||
      decodedPath.startsWith('//') ||
      /[\\\u0000-\u001f\u007f]/.test(decodedPath) ||
      /^\/auth\/(start|callback|signout)(\/|$)/.test(decodedPath)
    )
      return fallback
    if (/^\/(en|es|ca|fr)\/auth(\/|$)/.test(decodedPath)) return fallback
    return url.pathname + url.search + url.hash
  } catch {
    return fallback
  }
}
