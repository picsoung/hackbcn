export type IdentityUser = {
  id: string
  email: string | null
  emailVerified: boolean
  name: string | null
  avatarUrl: string | null
}

export type IdentityCredentials = {
  accessToken: string
  refreshToken?: string
  expiresAt: number
}

export type IdentityTransaction = {
  state: string
  nonce: string
  verifier: string
  redirectUri: string
  returnPath: string
  locale: string
  issuedAt: number
  expiresAt: number
}
