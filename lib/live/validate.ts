export interface ProjectInput {
  name: string
  tagline: string
  url: string
  videoUrl: string | null
  creatorName: string
  creatorEmail: string
  linkedinUrl: string
  shareConsent: boolean
}

function str(v: unknown) {
  return typeof v === 'string' ? v.trim() : ''
}

function httpUrl(v: string): string | null {
  const candidate = /^https?:\/\//i.test(v) ? v : `https://${v}`
  try {
    const u = new URL(candidate)
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null
    if (!u.hostname.includes('.')) return null
    return u.toString()
  } catch {
    return null
  }
}

export function validateProject(
  body: Record<string, unknown>,
):
  | { ok: true; value: ProjectInput }
  | { ok: false; errors: Record<string, string> } {
  const errors: Record<string, string> = {}

  const name = str(body.name)
  if (name.length < 2) errors.name = 'Give your project a name.'
  else if (name.length > 80) errors.name = 'Keep the name under 80 characters.'

  const tagline = str(body.tagline)
  if (tagline.length < 10)
    errors.tagline = 'Tell us what it does in a sentence or two.'
  else if (tagline.length > 280)
    errors.tagline = 'Keep it under 280 characters.'

  const url = httpUrl(str(body.url))
  if (!str(body.url)) errors.url = 'Add a link people can open.'
  else if (!url) errors.url = "That link doesn't look right."

  let videoUrl: string | null = null
  if (str(body.videoUrl)) {
    videoUrl = httpUrl(str(body.videoUrl))
    if (!videoUrl) errors.videoUrl = "That video link doesn't look right."
  }

  const creatorName = str(body.creatorName)
  if (creatorName.length < 2) errors.creatorName = 'Who built it?'
  else if (creatorName.length > 80)
    errors.creatorName = 'Keep it under 80 characters.'

  const creatorEmail = str(body.creatorEmail).toLowerCase()
  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(creatorEmail) ||
    creatorEmail.length > 200
  )
    errors.creatorEmail = 'We need a valid email to reach you.'

  const linkedinRaw = str(body.linkedinUrl)
  const linkedinUrl = httpUrl(linkedinRaw)
  if (!linkedinRaw) errors.linkedinUrl = 'Add your LinkedIn profile.'
  else if (
    !linkedinUrl ||
    !/(^|\.)linkedin\.com$/i.test(new URL(linkedinUrl).hostname)
  )
    errors.linkedinUrl = 'Use your linkedin.com profile link.'

  const shareConsent =
    body.shareConsent === true ||
    body.shareConsent === 'on' ||
    body.shareConsent === 'true'

  if (Object.keys(errors).length) return { ok: false, errors }
  return {
    ok: true,
    value: {
      name,
      tagline,
      url: url!,
      videoUrl,
      creatorName,
      creatorEmail,
      linkedinUrl: linkedinUrl!,
      shareConsent,
    },
  }
}

export function slugify(s: string) {
  return (
    s
      .normalize('NFKD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) || 'project'
  )
}

/** Returns an embeddable URL for YouTube, Loom or Vimeo links, otherwise null. */
export function videoEmbed(url: string | null): string | null {
  if (!url) return null
  try {
    const u = new URL(url)
    const host = u.hostname.replace(/^www\.|^m\./, '')
    if (host === 'youtu.be')
      return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(u.pathname.slice(1))}`
    if (host === 'youtube.com') {
      const id =
        u.searchParams.get('v') ??
        u.pathname.match(/^\/(?:shorts|embed|live)\/([^/]+)/)?.[1]
      if (id)
        return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}`
    }
    if (host === 'loom.com') {
      const id = u.pathname.match(/^\/(?:share|embed)\/([a-zA-Z0-9]+)/)?.[1]
      if (id) return `https://www.loom.com/embed/${id}`
    }
    if (host === 'vimeo.com') {
      const id = u.pathname.match(/^\/(\d+)/)?.[1]
      if (id) return `https://player.vimeo.com/video/${id}`
    }
  } catch {}
  return null
}
