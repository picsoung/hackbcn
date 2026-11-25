import { createHash } from 'node:crypto'

export type ReviewAlert = {
  kind: 'project_edit' | 'project_claim'
  project: string
  event: string
  actor: string
  fields: string[]
  path: string
}
export function reviewNotificationSettings(
  env: Record<string, string | undefined> = {
    ...process.env,
    SITE_ORIGIN: process.env.SITE_ORIGIN,
  },
) {
  const webhook = env.HACKBARNA_REVIEW_SLACK_WEBHOOK?.trim() ?? ''
  let valid = false
  try {
    const url = new URL(webhook)
    valid =
      url.protocol === 'https:' &&
      url.hostname === 'hooks.slack.com' &&
      !url.port &&
      !url.username &&
      !url.password &&
      !url.search &&
      !url.hash &&
      /^\/services\/[A-Za-z0-9_-]+\/[A-Za-z0-9_-]+\/[A-Za-z0-9_-]+$/.test(
        url.pathname,
      )
  } catch {}
  const origin = (env.SITE_ORIGIN || 'https://www.hackbarna.com').replace(
    /\/$/,
    '',
  )
  const enabled =
    env.HACKBARNA_REVIEW_NOTIFICATIONS_ENABLED === 'true' &&
    ['https://www.hackbarna.com', 'https://hackbarna.com'].includes(origin) &&
    valid
  return {
    enabled,
    webhook,
    origin,
    fingerprint: valid
      ? createHash('sha256').update(webhook).digest('hex')
      : '',
  }
}
export function reviewText(value: string | null | undefined, fallback: string) {
  return (value || fallback)
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\S+@\S+\.\S+/g, '[email omitted]')
    .slice(0, 160)
}
export function slackReviewPayload(alert: ReviewAlert, origin: string) {
  if (!alert.path.startsWith('/en/account/review?') || alert.path.includes('#'))
    throw new Error('Invalid review path')
  const url = new URL(alert.path, origin)
  if (url.origin !== origin) throw new Error('Invalid review origin')
  url.hash =
    alert.kind === 'project_edit' ? 'project-review' : 'ownership-review'
  return {
    text:
      alert.kind === 'project_edit'
        ? 'HackBarna project changes need review.'
        : 'A HackBarna ownership request needs review.',
    mrkdwn: false,
    parse: 'none',
    unfurl_links: false,
    unfurl_media: false,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text:
            alert.kind === 'project_edit'
              ? 'Project changes need review'
              : 'Ownership request needs review',
          emoji: false,
        },
      },
      {
        type: 'section',
        text: {
          type: 'plain_text',
          text: `Project: ${reviewText(alert.project, 'Requested project')}\nEvent: ${reviewText(alert.event, 'HackBarna')}\nSubmitted by: ${reviewText(alert.actor, 'HackBarna member')}${alert.fields.length ? `\nChanged: ${alert.fields.join(', ')}` : ''}`,
          emoji: false,
        },
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Review in HackBarna',
              emoji: false,
            },
            url: url.href,
            action_id: 'review_project',
          },
        ],
      },
    ],
  }
}
