// Server- and client-safe. Adds standard UTM params to an outbound URL.
// Existing UTM values are preserved so a partner-specific campaign is never
// silently replaced by the site-wide defaults.
//
// Convention:
//   utm_source   = 'hackbarna' (override per-call if needed)
//   utm_medium   = 'sponsor' | 'community-sponsor' | 'partner' | 'cta'
//   utm_campaign = 'hackbarna-<event-slug>' for event-scoped clicks
//                  'hackbarna-homepage' for the cross-event partner marquee
//                  'hackbarna-events-deck' for the standalone /events bottom CTA
//   utm_content  = sponsor tier, position label, or any extra sub-context

export type UtmContext = {
  medium: string
  campaign: string
  content?: string
  source?: string
}

export function withUtm(url: string, ctx: UtmContext): string {
  if (!url) return url
  // Bail on non-http(s) URLs (mailto:, tel:, anchor #, etc.) — UTMs don't make sense there.
  if (!/^https?:\/\//i.test(url)) return url
  try {
    const u = new URL(url)
    if (!u.searchParams.has('utm_source')) {
      u.searchParams.set('utm_source', ctx.source ?? 'hackbarna')
    }
    if (!u.searchParams.has('utm_medium')) {
      u.searchParams.set('utm_medium', ctx.medium)
    }
    if (!u.searchParams.has('utm_campaign')) {
      u.searchParams.set('utm_campaign', ctx.campaign)
    }
    if (ctx.content && !u.searchParams.has('utm_content')) {
      u.searchParams.set('utm_content', ctx.content)
    }
    return u.toString()
  } catch {
    // Malformed URL — better to ship a working un-UTM'd link than crash the render.
    return url
  }
}
