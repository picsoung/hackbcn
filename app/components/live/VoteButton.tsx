'use client'

import { useState } from 'react'
import { toast } from './Toaster'

export default function VoteButton({
  eventSlug,
  slug,
  name,
  initialCount,
  initialVoted,
  size = 'sm',
  disabled = false,
}: {
  eventSlug: string
  slug: string
  name: string
  initialCount: number
  initialVoted: boolean
  size?: 'sm' | 'lg'
  disabled?: boolean
}) {
  const [voted, setVoted] = useState(initialVoted)
  const [count, setCount] = useState(initialCount)
  const [busy, setBusy] = useState(false)

  async function toggle() {
    if (busy) return
    const next = !voted
    const prev = count
    setBusy(true)
    setVoted(next)
    setCount(prev + (next ? 1 : -1))
    try {
      const res = await fetch(
        `/api/live/${eventSlug}/projects/${encodeURIComponent(slug)}/vote`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ voted: next }),
        },
      )
      if (!res.ok) throw new Error()
      const data = (await res.json()) as { voteCount: number }
      setCount(data.voteCount)
      if (next) toast('Vote counted. Share it so others vote too.')
    } catch {
      setVoted(!next)
      setCount(prev)
      toast("Couldn't save your vote. Try again.")
    } finally {
      setBusy(false)
    }
  }

  // The stepped corner clips the inner span, so the button itself can keep an outset focus ring.
  return (
    <button
      type="button"
      onClick={toggle}
      disabled={disabled}
      aria-pressed={voted}
      aria-label={`${voted ? 'Remove your vote for' : 'Vote for'} ${name}`}
      className="shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-screen disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span
        className={`hb-px hb-px-sm flex flex-col items-center font-mono transition-colors ${
          size === 'lg' ? 'min-w-[6rem] px-5 py-3' : 'min-w-[4.5rem] px-3 py-2'
        } ${voted ? 'bg-neon-pink text-night-ink' : 'bg-night-violet text-screen hover:bg-night-indigo'}`}
      >
        <svg
          aria-hidden="true"
          width="14"
          height="14"
          viewBox="0 0 5 5"
          shapeRendering="crispEdges"
        >
          <path fill="currentColor" d="M2 0h1v1h1v1h1v1H4v2H1V3H0V2h1V1h1z" />
        </svg>
        <span
          className={size === 'lg' ? 'text-2xl font-bold' : 'text-lg font-bold'}
        >
          {count}
        </span>
        <span className="text-[10px] uppercase tracking-widest">
          {voted ? 'Voted' : 'Vote'}
        </span>
      </span>
    </button>
  )
}
