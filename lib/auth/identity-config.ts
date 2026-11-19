export const DIGEST_ISSUER = 'https://usfkgslefvtrtlwexnfo.supabase.co/auth/v1'

export type IdentityConfig = {
  issuer: string
  clientId: string
  clientSecret: string
  redirectUri: string
  encryptionKey: string
}

/** Server environment only. Client input can never choose the provider or callback. */
export function getIdentityConfig(
  env: Record<string, string | undefined> = process.env,
): IdentityConfig | null {
  const clientId = env.HACKBARNA_OIDC_CLIENT_ID?.trim()
  const clientSecret = env.HACKBARNA_OIDC_CLIENT_SECRET?.trim()
  const redirectUri = env.HACKBARNA_OIDC_REDIRECT_URI?.trim()
  const encryptionKey = env.HACKBARNA_SESSION_KEY?.trim()
  if (!clientId || !clientSecret || !redirectUri || !encryptionKey) return null
  const issuer = env.HACKBARNA_OIDC_ISSUER?.trim() || DIGEST_ISSUER
  const provider = new URL(issuer)
  const redirect = new URL(redirectUri)
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(redirect.hostname)
  if (
    provider.protocol !== 'https:' ||
    provider.username ||
    provider.password ||
    provider.search ||
    provider.hash ||
    (redirect.protocol !== 'https:' &&
      !(local && redirect.protocol === 'http:')) ||
    redirect.username ||
    redirect.password ||
    redirect.search ||
    redirect.hash ||
    redirect.pathname !== '/auth/callback' ||
    !/^[a-f0-9]{64}$/i.test(encryptionKey)
  )
    throw new Error('Invalid server identity configuration')
  return {
    issuer: provider.href.replace(/\/$/, ''),
    clientId,
    clientSecret,
    redirectUri: redirect.href,
    encryptionKey,
  }
}
