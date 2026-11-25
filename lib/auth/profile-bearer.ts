import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from 'jose'
import { DIGEST_ISSUER } from './identity-config'
import { profileImage } from '../community/profile'

const jwks = createRemoteJWKSet(
  new URL(DIGEST_ISSUER + '/.well-known/jwks.json'),
  { timeoutDuration: 10000 },
)
export async function verifyProfileBearer(
  token: string,
  trustedClients: string[],
  keys: JWTVerifyGetKey = jwks,
) {
  const { payload } = await jwtVerify(token, keys, {
    issuer: DIGEST_ISSUER,
    audience: 'authenticated',
    algorithms: ['ES256'],
    requiredClaims: ['sub', 'exp', 'iat'],
  })
  if (
    !payload.sub ||
    payload.role !== 'authenticated' ||
    !/^[a-f\d]{8}(-[a-f\d]{4}){3}-[a-f\d]{12}$/i.test(payload.sub) ||
    payload.is_anonymous === true
  )
    throw Error('Invalid account token')
  // Third-party OAuth clients inherit a user subject. Identity alone does not grant this API access.
  if (
    payload.client_id !== undefined &&
    (typeof payload.client_id !== 'string' ||
      !trustedClients.includes(payload.client_id))
  )
    throw Error('OAuth client not permitted')
  const metadata = payload.user_metadata as Record<string, unknown> | undefined
  const name =
    typeof metadata?.full_name === 'string'
      ? metadata.full_name
      : typeof metadata?.name === 'string'
        ? metadata.name
        : null
  return {
    id: payload.sub,
    name,
    avatarUrl: profileImage(metadata?.avatar_url ?? metadata?.picture) || null,
  }
}
