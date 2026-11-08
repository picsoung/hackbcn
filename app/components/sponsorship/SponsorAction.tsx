'use client'

import { trackOutbound } from '@/app/helpers/track'
import { sponsorBookingUrl, sponsorship } from '@/lib/sponsorship'

export default function SponsorAction({
  children,
  source,
  kind = 'booking',
  className = '',
}: {
  children: React.ReactNode
  source: string
  kind?: 'booking' | 'download'
  className?: string
}) {
  return (
    <a
      href={
        kind === 'booking'
          ? sponsorBookingUrl(source)
          : sponsorship.prospectusUrl
      }
      target={kind === 'booking' ? '_blank' : undefined}
      rel={kind === 'booking' ? 'noopener noreferrer' : undefined}
      download={
        kind === 'download'
          ? 'HackBarna-partnerships-2026-27-draft.pdf'
          : undefined
      }
      onClick={() =>
        trackOutbound(
          kind === 'booking'
            ? 'sponsor_booking_click'
            : 'sponsorship_deck_click',
          { source, offer_status: sponsorship.status },
        )
      }
      className={className}
    >
      {children}
    </a>
  )
}
