// A small bridge keeps Next's server-only database modules inside the Next runtime.
export default async () => {
  if (process.env.HACKBARNA_REVIEW_NOTIFICATIONS_ENABLED !== 'true') return
  const token = process.env.HACKBARNA_REVIEW_DISPATCH_TOKEN
  if (!/^[0-9a-f]{64}$/i.test(token ?? ''))
    throw new Error('Review notification dispatcher is not configured')
  const origin = new URL(
    process.env.HACKBARNA_OIDC_REDIRECT_URI || 'https://www.hackbarna.com',
  ).origin
  if (!['https://www.hackbarna.com', 'https://hackbarna.com'].includes(origin))
    return
  const response = await fetch(`${origin}/api/internal/review-notifications`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    redirect: 'error',
    signal: AbortSignal.timeout(22000),
  })
  if (!response.ok)
    throw new Error(
      `Review notification dispatcher returned ${response.status}`,
    )
  console.log('Review notification delivery', await response.json())
}
export const config = { schedule: '*/5 * * * *' }
