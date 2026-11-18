/** Older submissions include profile links without a protocol. */
export function archivedProjectUrl(value?: string) {
  if (!value?.trim()) return undefined
  const input = value.trim()
  const candidate = /^[a-z][a-z\d+.-]*:/i.test(input)
    ? input
    : `https://${input}`
  try {
    const url = new URL(candidate)
    return ['https:', 'http:'].includes(url.protocol) && url.hostname
      ? url.href
      : undefined
  } catch {
    return undefined
  }
}

/** Preserve timestamps in the first edition's recorded demo URLs. */
export function archivedProjectDemo(value?: string) {
  const href = archivedProjectUrl(value)
  if (!href) return undefined
  const url = new URL(href)
  const host = url.hostname.replace(/^www\./, '')
  if (!['youtube.com', 'm.youtube.com', 'youtu.be'].includes(host))
    return undefined
  const id =
    host === 'youtu.be'
      ? url.pathname.split('/').filter(Boolean)[0]
      : (url.searchParams.get('v') ??
        url.pathname.match(/^\/(?:embed|shorts)\/([^/]+)/)?.[1])
  if (!id || !/^[\w-]{11}$/.test(id)) return undefined
  const time = url.searchParams.get('t') ?? url.searchParams.get('start') ?? '0'
  const units = time.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/)
  const timestamp = /^\d+$/.test(time)
    ? Number(time)
    : units
      ? Number(units[1] ?? 0) * 3600 +
        Number(units[2] ?? 0) * 60 +
        Number(units[3] ?? 0)
      : 0
  return { id, timestamp: String(timestamp) }
}
