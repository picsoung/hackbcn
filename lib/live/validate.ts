export type ProjectHacker = { name: string; linkedinUrl: string | null }

export interface ProjectInput {
  name: string
  tagline: string
  url: string
  videoUrl: string | null
  creatorName: string
  creatorEmail: string
  linkedinUrl: string
  hackers: ProjectHacker[]
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

function linkedinProfile(value: string): string | null {
  const url = httpUrl(value)
  if (!url) return null
  const parsed = new URL(url)
  return /(^|\.)linkedin\.com$/i.test(parsed.hostname) &&
    !parsed.username &&
    !parsed.password
    ? url
    : null
}

/** Public team members only. Keep legacy credits intact rather than guessing how to split names. */
export function projectHackers(project: {
  hackers?: unknown
  creatorName: string
  linkedinUrl: string
}): ProjectHacker[] {
  const hackers = Array.isArray(project.hackers)
    ? project.hackers.flatMap((value) => {
        if (!value || typeof value !== 'object' || !str(value.name)) return []
        return [
          {
            name: str(value.name),
            linkedinUrl: str(value.linkedinUrl)
              ? linkedinProfile(str(value.linkedinUrl))
              : null,
          },
        ]
      })
    : []
  return hackers.length
    ? hackers
    : [
        {
          name: project.creatorName,
          linkedinUrl: project.linkedinUrl
            ? linkedinProfile(project.linkedinUrl)
            : null,
        },
      ]
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

  let hackers: ProjectHacker[] = []
  if (body.hackers !== undefined) {
    if (
      !Array.isArray(body.hackers) ||
      body.hackers.length < 1 ||
      body.hackers.length > 20
    ) {
      errors.hackers = 'Add between 1 and 20 hackers.'
    } else {
      hackers = body.hackers.map((value, index) => {
        const member =
          value && typeof value === 'object' && !Array.isArray(value)
            ? value
            : {}
        const name = str(member.name)
        if (name.length < 2 || name.length > 80)
          errors[`hackers.${index}.name`] =
            'Use a name between 2 and 80 characters.'
        const raw = str(member.linkedinUrl)
        const linkedinUrl =
          raw && raw.length <= 500 ? linkedinProfile(raw) : null
        if (raw && !linkedinUrl)
          errors[`hackers.${index}.linkedinUrl`] =
            'Use a linkedin.com profile link or leave this blank.'
        return { name, linkedinUrl }
      })
    }
  } else {
    // Compatibility for the standalone import and older API clients.
    const name = str(body.creatorName)
    if (name.length < 2) errors.creatorName = 'Who built it?'
    else if (name.length > 80)
      errors.creatorName = 'Keep it under 80 characters.'
    const raw = str(body.linkedinUrl)
    const linkedinUrl = raw && raw.length <= 500 ? linkedinProfile(raw) : null
    if (!raw) errors.linkedinUrl = 'Add your LinkedIn profile.'
    else if (!linkedinUrl)
      errors.linkedinUrl = 'Use your linkedin.com profile link.'
    hackers = [{ name, linkedinUrl }]
  }
  const creatorName = hackers[0]?.name ?? ''
  const linkedinUrl = hackers[0]?.linkedinUrl ?? ''

  const creatorEmail = str(body.creatorEmail).toLowerCase()
  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(creatorEmail) ||
    creatorEmail.length > 200
  )
    errors.creatorEmail = 'We need a valid email to reach you.'

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
      linkedinUrl,
      hackers,
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
