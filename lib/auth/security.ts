import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'node:crypto'
import type { IdentityTransaction } from './types'

export const SESSION_COOKIE = 'hb_session'
export const TRANSACTION_COOKIE = 'hb_auth_transaction'
export const SESSION_TTL_SECONDS = 14 * 24 * 60 * 60
export const TRANSACTION_TTL_SECONDS = 10 * 60

export function identityCookieName(
  kind: 'session' | 'transaction',
  secure: boolean,
) {
  const name = kind === 'session' ? SESSION_COOKIE : TRANSACTION_COOKIE
  return secure ? `__Host-${name}` : name
}

export function randomSessionToken() {
  return randomBytes(32).toString('base64url')
}
export function sessionTokenHash(token: string) {
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return null
  return createHash('sha256').update(token).digest('hex')
}

function keyBytes(key: string) {
  if (!/^[a-f0-9]{64}$/i.test(key)) throw new Error('Invalid encryption key')
  return Buffer.from(key, 'hex')
}

/** Authenticated, purpose-bound encryption. Provider credentials never enter a browser cookie. */
export function seal(
  value: unknown,
  key: string,
  purpose: 'transaction' | 'credentials',
) {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', keyBytes(key), iv)
  cipher.setAAD(Buffer.from(`hackbarna:identity:v1:${purpose}`))
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(value), 'utf8'),
    cipher.final(),
  ])
  return [
    'v1',
    iv.toString('base64url'),
    cipher.getAuthTag().toString('base64url'),
    encrypted.toString('base64url'),
  ].join('.')
}

export function unseal(
  value: string,
  key: string,
  purpose: 'transaction' | 'credentials',
): unknown {
  if (value.length > 24_000) throw new Error('Invalid encrypted payload')
  const parts = value.split('.')
  if (
    parts.length !== 4 ||
    parts[0] !== 'v1' ||
    parts.slice(1).some((p) => !p || !/^[A-Za-z0-9_-]+$/.test(p))
  )
    throw new Error('Invalid encrypted payload')
  const iv = Buffer.from(parts[1], 'base64url')
  const tag = Buffer.from(parts[2], 'base64url')
  if (iv.length !== 12 || tag.length !== 16)
    throw new Error('Invalid encrypted payload')
  const decipher = createDecipheriv('aes-256-gcm', keyBytes(key), iv)
  decipher.setAAD(Buffer.from(`hackbarna:identity:v1:${purpose}`))
  decipher.setAuthTag(tag)
  return JSON.parse(
    Buffer.concat([
      decipher.update(Buffer.from(parts[3], 'base64url')),
      decipher.final(),
    ]).toString('utf8'),
  )
}

export function readTransaction(
  value: string,
  key: string,
  redirectUri: string,
  now = Date.now(),
): IdentityTransaction {
  const data = unseal(value, key, 'transaction') as IdentityTransaction
  if (
    !data ||
    typeof data !== 'object' ||
    ![data.state, data.nonce, data.verifier].every(
      (v) => typeof v === 'string' && /^[A-Za-z0-9_-]{43,128}$/.test(v),
    ) ||
    data.redirectUri !== redirectUri ||
    typeof data.returnPath !== 'string' ||
    !['en', 'es', 'ca', 'fr'].includes(data.locale) ||
    !Number.isFinite(data.issuedAt) ||
    !Number.isFinite(data.expiresAt) ||
    data.issuedAt > now + 30_000 ||
    data.expiresAt <= now ||
    data.expiresAt - data.issuedAt > TRANSACTION_TTL_SECONDS * 1000
  )
    throw new Error('Invalid or expired sign-in transaction')
  return data
}
