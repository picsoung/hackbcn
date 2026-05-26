// Server- and client-safe. Adds standard UTM params to an outbound URL.
// Used at every outbound-link render site to give sponsors HackBarna attribution
// in their own analytics (GA, Mixpanel, Plausible, Amplitude all recognise UTMs).
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
    u.searchParams.set('utm_source', ctx.source ?? 'hackbarna')
    u.searchParams.set('utm_medium', ctx.medium)
    u.searchParams.set('utm_campaign', ctx.campaign)
    if (ctx.content) u.searchParams.set('utm_content', ctx.content)
    return u.toString()
  } catch {
    // Malformed URL — better to ship a working un-UTM'd link than crash the render.
    return url
  }
}
