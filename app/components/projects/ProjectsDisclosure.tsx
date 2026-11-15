'use client'

import { useEffect, useRef } from 'react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

export default function ProjectsDisclosure({
  count,
  tone,
  children,
}: {
  count: number
  tone: 'night' | 'light'
  children: React.ReactNode
}) {
  const disclosure = useRef<HTMLDetailsElement>(null)
  useEffect(() => {
    const revealFromHash = () => {
      if (window.location.hash === '#projects' && disclosure.current)
        disclosure.current.open = true
    }
    const followProjectLink = (event: MouseEvent) => {
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return
      const anchor =
        event.target instanceof Element ? event.target.closest('a[href]') : null
      if (!(anchor instanceof HTMLAnchorElement)) return
      const url = new URL(anchor.href)
      if (
        url.origin === window.location.origin &&
        url.pathname === window.location.pathname &&
        url.hash === '#projects' &&
        disclosure.current
      )
        disclosure.current.open = true
    }
    revealFromHash()
    window.addEventListener('hashchange', revealFromHash)
    // Capture same-hash clicks too, including Next links, after someone closes the panel.
    document.addEventListener('click', followProjectLink, true)
    return () => {
      window.removeEventListener('hashchange', revealFromHash)
      document.removeEventListener('click', followProjectLink, true)
    }
  }, [])

  const light = tone === 'light'
  const ink = light ? 'text-slate-900' : 'text-ink'
  const muted = light ? 'text-slate-600' : 'text-ink-dim'
  return (
    <details
      ref={disclosure}
      className={`group border-b ${light ? 'border-slate-200' : 'border-band-2'}`}
    >
      <summary
        className={`flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 ${ink} [&::-webkit-details-marker]:hidden`}
      >
        <h2 id="event-projects-heading" className="text-xl font-semibold">
          Projects{' '}
          <span className={`ml-2 text-sm font-normal tabular-nums ${muted}`}>
            {count}
          </span>
        </h2>
        <ChevronDownIcon
          aria-hidden="true"
          className={`h-5 w-5 shrink-0 transition-transform group-open:rotate-180 ${muted}`}
        />
      </summary>
      <div className="pb-8">{children}</div>
    </details>
  )
}
