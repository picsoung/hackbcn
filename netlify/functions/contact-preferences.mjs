export default async () => {
  if (process.env.HACKBARNA_CONTACT_SYNC_ENABLED !== 'true') return
  const token = process.env.HACKBARNA_CONTACT_DISPATCH_TOKEN
  if (!/^[0-9a-f]{64}$/i.test(token ?? ''))
    throw new Error('Contact dispatcher not configured')
  const origin = new URL(
    process.env.HACKBARNA_OIDC_REDIRECT_URI || 'https://www.hackbarna.com',
  ).origin
  if (!['https://www.hackbarna.com', 'https://hackbarna.com'].includes(origin))
    return
  const response = await fetch(`${origin}/api/internal/contact-preferences`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    redirect: 'error',
    signal: AbortSignal.timeout(22000),
  })
  if (!response.ok)
    throw new Error(`Contact dispatcher returned ${response.status}`)
  console.log('Communication preference sync', await response.json())
}
export const config = { schedule: '*/5 * * * *' }
