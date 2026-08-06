'use client'

import posthog from 'posthog-js'

// Explicit PostHog capture for outbound clicks that benefit from structured props.
// Autocapture is also tracking these as $autocapture events — this just adds clean
// event names and named properties for dashboard insights.
//
// Errors swallowed: if PostHog isn't configured (no env var) or capture throws,
// we don't want to break the user's click path.

type OutboundEvent =
  | 'sponsor_click'
  | 'community_sponsor_click'
  | 'sponsorship_deck_click'
  | 'sponsor_contact_click'
  | 'registration_click'
  | 'partner_marquee_click'

export function trackOutbound(event: OutboundEvent, props: Record<string, unknown>) {
  try {
    posthog.capture(event, props)
  } catch {
    // No-op when PostHog isn't initialized (e.g. local dev without env vars).
  }
}
