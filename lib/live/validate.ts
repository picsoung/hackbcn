import { PRIVACY_FIELDS, type PrivacyField } from '../projects/privacy-model'
// Reviewed public credits from legacy team submissions.
// Apply only while a source still has its exact recorded name and primary profile.
const projectTeamCredits = [
  {
    eventSlug: 'hacknight-5-jevathon-2026',
    projectSlug: 'bicing-planner',
    submittedName: 'Eduard Blancode',
    primaryProfilePath: '/in/eduardblanco',
    primaryName: 'Eduard Blanco',
    otherNames: [],
  },
  {
    eventSlug: 'hacknight-5-jevathon-2026',
    projectSlug: 'council-convention',
    submittedName: 'Tiam Haghshenas / Stepan Gritsun',
    primaryProfilePath: '/in/tiam-haghshenas-58a9063b7',
    primaryName: 'Tiam Haghshenas',
    otherNames: ['Stepan Gritsun'],
  },
  {
    eventSlug: 'hacknight-5-jevathon-2026',
    projectSlug: 'push-cube',
    submittedName: 'Arnab Dey, Alex Garcia',
    primaryProfilePath: '/in/arnabdey0503',
    primaryName: 'Arnab Dey',
    otherNames: ['Alex Garcia'],
  },
  {
    eventSlug: 'hacknight-5-jevathon-2026',
    projectSlug: 'skillars',
    submittedName: 'Chloe, Xénia & Majo',
    primaryProfilePath: '/in/chloe-beck',
    primaryName: 'Chloe',
    otherNames: ['Xénia', 'Majo'],
  },
]

export type ProjectHacker = {
  hiddenFields?: PrivacyField[]
  name: string
  linkedinUrl: string | null
  creditIndex?: number
  profileSlug?: string
}

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

/** Public team members only. Legacy names change only for explicitly reviewed credits. */
export function projectHackers(project: {
  eventSlug?: string
  slug?: string
  hackers?: unknown
  creatorName: string
  linkedinUrl: string
  creatorCreditsHidden?: boolean
}): ProjectHacker[] {
  if (project.creatorCreditsHidden) return []
  const hackers = Array.isArray(project.hackers)
    ? project.hackers.flatMap((value) => {
        if (!value || typeof value !== 'object' || !str(value.name)) return []
        return [
          {
            name: str(value.name),
            ...(Array.isArray(value.hiddenFields)
              ? {
                  hiddenFields: value.hiddenFields.filter(
                    (field: PrivacyField) => PRIVACY_FIELDS.includes(field),
                  ),
                }
              : {}),
            ...(Number.isSafeInteger(value.creditIndex) &&
            value.creditIndex >= 0
              ? { creditIndex: value.creditIndex }
              : {}),
            ...(typeof value.profileSlug === 'string' &&
            /^[a-z0-9-]{1,80}$/.test(value.profileSlug)
              ? { profileSlug: value.profileSlug }
              : {}),
            linkedinUrl: str(value.linkedinUrl)
              ? linkedinProfile(str(value.linkedinUrl))
              : null,
          },
        ]
      })
    : []
  const team = hackers.length
    ? hackers
    : [
        {
          name: project.creatorName,
          linkedinUrl: project.linkedinUrl
            ? linkedinProfile(project.linkedinUrl)
            : null,
        },
      ]
  const reviewed = projectTeamCredits.find(
    (credit) =>
      credit.eventSlug === project.eventSlug &&
      credit.projectSlug === project.slug,
  )
  if (
    reviewed &&
    team.length === 1 &&
    team[0].name === reviewed.submittedName &&
    team[0].linkedinUrl &&
    new URL(team[0].linkedinUrl).pathname.replace(/\/+$/, '').toLowerCase() ===
      reviewed.primaryProfilePath
  ) {
    return [
      { name: reviewed.primaryName, linkedinUrl: team[0].linkedinUrl },
      ...reviewed.otherNames.map((name) => ({ name, linkedinUrl: null })),
    ]
  }
  return team
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
