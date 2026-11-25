import { createHmac, timingSafeEqual } from 'node:crypto'

export function invitationKey(value = process.env.HACKBARNA_INVITATION_KEY) {
  if (!value || !/^[0-9a-f]{64}$/i.test(value))
    throw new Error('Invitation configuration unavailable')
  return value
}

function sign(value: string, key: string) {
  return createHmac('sha256', Buffer.from(invitationKey(key), 'hex'))
    .update(value)
    .digest('base64url')
}

/** Keyed hash prevents address enumeration. Email addresses never enter the URL. */
export function invitationEmailHash(email: string, key = invitationKey()) {
  const canonical = email.trim().toLowerCase()
  if (canonical.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(canonical))
    throw new Error('Invalid invitation recipient')
  return createHmac('sha256', Buffer.from(invitationKey(key), 'hex'))
    .update(`hackbarna-invitation-address-v1\0${canonical}`)
    .digest('hex')
}

export function invitationOptOutToken(email: string, key = invitationKey()) {
  const hash = invitationEmailHash(email, key)
  return `v1.${hash}.${sign(`hackbarna-invitation-opt-out-v1\0${hash}`, key)}`
}

export function validInvitationTokenShape(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    /^v1\.[0-9a-f]{64}\.[A-Za-z0-9_-]{43}$/.test(value)
  )
}

/** A permanent unsubscribe capability only; this token cannot sign in or claim a project. */
export function verifyInvitationOptOutToken(
  value: unknown,
  key = invitationKey(),
) {
  if (!validInvitationTokenShape(value)) return null
  const [, hash, signature] = value.split('.')
  const expected = sign(`hackbarna-invitation-opt-out-v1\0${hash}`, key)
  return timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
    ? hash
    : null
}
