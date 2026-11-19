import 'server-only'
import { cookies } from 'next/headers'
import { getIdentityConfig } from './identity-config'
import { identityCookieName, sessionTokenHash } from './security'
import { identitySessionStore } from './session-store'
import { IdentityUnavailable, resolveIdentitySession } from './session-engine'
import { isRevokedCredential, refreshIdentity } from './oidc'

export async function getCurrentIdentity() {
  const config = getIdentityConfig()
  if (!config) return null
  const token = cookies().get(
    identityCookieName('session', config.redirectUri.startsWith('https:')),
  )?.value
  const hash = token && sessionTokenHash(token)
  if (!hash) return null
  try {
    return await resolveIdentitySession(
      hash,
      identitySessionStore(config),
      (credentials, subject) => refreshIdentity(config, credentials, subject),
      isRevokedCredential,
    )
  } catch {
    // Never expose SQL, token responses or provider credentials to a browser/error boundary.
    throw new IdentityUnavailable()
  }
}
