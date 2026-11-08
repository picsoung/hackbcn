import sponsorship from '@/data/sponsorship.json'

export { sponsorship }

type AudienceMetric = {
  id: string
  value: number
  labelKey: string
  basisKey: string
  status: 'approved' | 'pending'
  source: string
}

// Only publish a demographic percentage after its definition, cohort and source
// have been approved. Pending suggestions live in scripts/sponsorship-claims-review.json.
export function getPublishedAudienceMetrics(): AudienceMetric[] {
  return (sponsorship.audienceMetrics as AudienceMetric[]).filter(
    (metric) =>
      metric.status === 'approved' && metric.source && metric.basisKey,
  )
}

export function sponsorBookingUrl(source: string) {
  const url = new URL(sponsorship.bookingUrl)
  url.searchParams.set('utm_source', 'hackbarna')
  url.searchParams.set('utm_medium', 'partnership')
  url.searchParams.set('utm_campaign', 'sponsorship-2026-27')
  url.searchParams.set('utm_content', source)
  const notes =
    sponsorship.bookingTopics[source as keyof typeof sponsorship.bookingTopics]
  if (notes) url.searchParams.set('notes', notes)
  return url.toString()
}
