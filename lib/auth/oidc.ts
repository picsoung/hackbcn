import * as client from 'openid-client'
import { createHash } from 'node:crypto'
import type { IdentityConfig } from './identity-config'
import type {
  IdentityCredentials,
  IdentityTransaction,
  IdentityUser,
} from './types'

const cached = new Map<
  string,
  { config: client.Configuration; until: number }
>()

export async function getProvider(
  config: IdentityConfig,
  transport?: client.CustomFetch,
) {
  const key = `${config.issuer}|${config.clientId}|${createHash('sha256').update(config.clientSecret).digest('hex')}`
  const existing = !transport && cached.get(key)
  if (existing && existing.until > Date.now()) return existing.config
  const provider = await client.discovery(
    new URL(config.issuer),
    config.clientId,
    {
      client_secret: config.clientSecret,
      id_token_signed_response_alg: 'ES256',
    },
    client.ClientSecretPost(config.clientSecret),
    {
      timeout: 10,
      execute: [client.enableNonRepudiationChecks],
      ...(transport ? { [client.customFetch]: transport } : {}),
    },
  )
  const metadata = provider.serverMetadata()
  for (const endpoint of [
    metadata.authorization_endpoint,
    metadata.token_endpoint,
    metadata.jwks_uri,
    metadata.userinfo_endpoint,
  ]) {
    if (!endpoint || new URL(endpoint).origin !== new URL(config.issuer).origin)
      throw new Error('Unexpected identity provider endpoint')
  }
  // Cache resolved configurations only. Preview/test transports never enter the shared cache.
  if (!transport)
    cached.set(key, { config: provider, until: Date.now() + 300_000 })
  return provider
}

export async function beginSignIn(
  config: IdentityConfig,
  returnPath: string,
  locale: string,
  transport?: client.CustomFetch,
) {
  const provider = await getProvider(config, transport)
  const now = Date.now()
  const transaction: IdentityTransaction = {
    state: client.randomState(),
    nonce: client.randomNonce(),
    verifier: client.randomPKCECodeVerifier(),
    redirectUri: config.redirectUri,
    returnPath,
    locale,
    issuedAt: now,
    expiresAt: now + 600_000,
  }
  const url = client.buildAuthorizationUrl(provider, {
    response_type: 'code',
    redirect_uri: config.redirectUri,
    scope: 'openid profile email offline_access',
    state: transaction.state,
    nonce: transaction.nonce,
    code_challenge_method: 'S256',
    code_challenge: await client.calculatePKCECodeChallenge(
      transaction.verifier,
    ),
  })
  return { url, transaction }
}

function userFromInfo(info: Record<string, unknown>): IdentityUser {
  if (
    typeof info.sub !== 'string' ||
    !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(
      info.sub,
    )
  )
    throw new Error('Invalid identity subject')
  const picture =
    typeof info.picture === 'string' && info.picture.length < 2000
      ? info.picture
      : null
  let avatarUrl: string | null = null
  try {
    if (picture && new URL(picture).protocol === 'https:') avatarUrl = picture
  } catch {}
  return {
    id: info.sub,
    email:
      typeof info.email === 'string' && info.email.length <= 320
        ? info.email
        : null,
    emailVerified: info.email_verified === true,
    name: typeof info.name === 'string' ? info.name.slice(0, 200) : null,
    avatarUrl,
  }
}

function credentials(
  tokens: client.TokenEndpointResponse,
  previousRefresh?: string,
): IdentityCredentials {
  const seconds =
    typeof tokens.expires_in === 'number' && tokens.expires_in > 0
      ? Math.min(tokens.expires_in, 86400)
      : 300
  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token || previousRefresh,
    expiresAt: Date.now() + seconds * 1000,
  }
}

export async function finishSignIn(
  config: IdentityConfig,
  callback: URL,
  transaction: IdentityTransaction,
  transport?: client.CustomFetch,
) {
  const expected = new URL(config.redirectUri)
  if (
    callback.origin !== expected.origin ||
    callback.pathname !== expected.pathname ||
    transaction.redirectUri !== config.redirectUri ||
    transaction.expiresAt <= Date.now()
  )
    throw new Error('Invalid sign-in callback')
  const provider = await getProvider(config, transport)
  const tokens = await client.authorizationCodeGrant(provider, callback, {
    pkceCodeVerifier: transaction.verifier,
    expectedState: transaction.state,
    expectedNonce: transaction.nonce,
    idTokenExpected: true,
  })
  const claims = tokens.claims()
  if (!claims?.sub) throw new Error('Missing verified identity')
  const info = await client.fetchUserInfo(
    provider,
    tokens.access_token,
    claims.sub,
  )
  return { user: userFromInfo(info), credentials: credentials(tokens) }
}

export async function refreshIdentity(
  config: IdentityConfig,
  previous: IdentityCredentials,
  subject: string,
  transport?: client.CustomFetch,
) {
  if (!previous.refreshToken) throw new Error('No refresh credential')
  const provider = await getProvider(config, transport)
  const tokens = await client.refreshTokenGrant(provider, previous.refreshToken)
  const info = await client.fetchUserInfo(
    provider,
    tokens.access_token,
    subject,
  )
  return {
    user: userFromInfo(info),
    credentials: credentials(tokens, previous.refreshToken),
  }
}

export function isRevokedCredential(error: unknown) {
  return (
    error instanceof client.ResponseBodyError && error.error === 'invalid_grant'
  )
}
