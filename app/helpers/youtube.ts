// Extract a YouTube video id from any common URL form:
// watch?v=ID, youtu.be/ID, /shorts/ID, /embed/ID, or a bare id.
export function youtubeId(url: string): string | null {
  if (!url) return null
  // Bare 11-char id
  if (/^[\w-]{11}$/.test(url)) return url
  try {
    const u = new URL(url)
    const v = u.searchParams.get('v')
    if (v) return v
    const parts = u.pathname.split('/').filter(Boolean)
    // youtu.be/ID, /shorts/ID, /embed/ID
    const last = parts[parts.length - 1]
    if (last && /^[\w-]{11}$/.test(last)) return last
    return null
  } catch {
    return null
  }
}
