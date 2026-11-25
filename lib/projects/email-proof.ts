import { createHash, createHmac } from 'node:crypto'

export function claimEmail(value: unknown) {
  if (typeof value !== 'string') return null
  const email = value.trim().toLowerCase()
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ? email
    : null
}

export function claimLookupKey(
  value = process.env.HACKBARNA_PROJECT_CLAIM_KEY,
) {
  return value && /^[0-9a-f]{64}$/i.test(value) ? value : null
}

export function claimEmailHash(email: string, key: string) {
  const normalized = claimEmail(email)
  if (!normalized || !claimLookupKey(key))
    throw new Error('Invalid claim lookup input')
  return createHmac('sha256', Buffer.from(key, 'hex'))
    .update(`hackbarna-project-email-v1\0${normalized}`)
    .digest('hex')
}

export function claimKeyId(key: string) {
  if (!claimLookupKey(key)) throw new Error('Invalid claim lookup key')
  return createHmac('sha256', Buffer.from(key, 'hex'))
    .update('hackbarna-project-claim-key-v1')
    .digest('hex')
}

export function claimRosterDigest(
  hackers: { name: string; linkedinUrl?: string | null }[],
) {
  return createHash('sha256')
    .update(
      JSON.stringify(
        hackers.map((hacker) => ({
          name: hacker.name,
          linkedinUrl: hacker.linkedinUrl ?? null,
        })),
      ),
    )
    .digest('hex')
}
