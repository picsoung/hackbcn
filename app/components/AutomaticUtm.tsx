'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { withUtm } from '@/app/helpers/utm'

const NON_EVENT_ROUTES = new Set([
  'conduct',
  'events',
  'projects',
  'testimonials',
])

function campaignFromPathname(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean)

  // Current event pages: /:locale/events/:eventSlug[/...]
  if (segments[1] === 'events' && segments[2]) {
    return `hackbarna-${segments[2]}`
  }

  // Legacy event pages: /:locale/:eventSlug[/...]
  if (segments[1] && !NON_EVENT_ROUTES.has(segments[1])) {
    return `hackbarna-${segments[1]}`
  }

  return 'hackbarna-website'
}

function decorateExternalLink(anchor: HTMLAnchorElement, campaign: string) {
  if (anchor.dataset.noUtm !== undefined) return

  const rawHref = anchor.getAttribute('href')
  if (!rawHref) return

  let url: URL
  try {
    url = new URL(rawHref, window.location.href)
  } catch {
    return
  }

  if (!['http:', 'https:'].includes(url.protocol)) return
  if (url.origin === window.location.origin) return

  const taggedHref = withUtm(url.toString(), {
    medium: anchor.dataset.utmMedium || 'referral',
    campaign: anchor.dataset.utmCampaign || campaign,
    content: anchor.dataset.utmContent,
  })

  if (taggedHref !== anchor.href) anchor.href = taggedHref
}

/**
 * Adds attribution to every external link, including links introduced after
 * hydration. Individual links can opt out with data-no-utm or override the
 * defaults with data-utm-medium, data-utm-campaign, and data-utm-content.
 */
export default function AutomaticUtm() {
  const pathname = usePathname()

  useEffect(() => {
    const campaign = campaignFromPathname(pathname)
    const decorate = (root: ParentNode) => {
      root.querySelectorAll<HTMLAnchorElement>('a[href]').forEach((anchor) => {
        decorateExternalLink(anchor, campaign)
      })
    }

    decorate(document)

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes') {
          if (mutation.target instanceof HTMLAnchorElement) {
            decorateExternalLink(mutation.target, campaign)
          }
          continue
        }

        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return
          if (node instanceof HTMLAnchorElement) {
            decorateExternalLink(node, campaign)
          }
          decorate(node)
        })
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['href'],
    })

    // This also covers a click that happens before a newly rendered link has
    // been processed by the observer.
    const handleClick = (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof Element)) return
      const anchor = target.closest<HTMLAnchorElement>('a[href]')
      if (anchor) decorateExternalLink(anchor, campaign)
    }
    document.addEventListener('click', handleClick, true)

    return () => {
      observer.disconnect()
      document.removeEventListener('click', handleClick, true)
    }
  }, [pathname])

  return null
}
