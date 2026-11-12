'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { btnPrimary, chip, filterBtn } from './ui'

type Row = {
  rank: number
  slug: string
  name: string
  creatorName: string
  category: string | null
  categoryLabel: string | null
  voteCount: number
  shareCount: number
  hasVideo: boolean
}
type Data = {
  updatedAt: string
  categories: Record<string, string>
  projects: Row[]
}

/** Projector view: polls every 5s (15s when the tab is hidden). */
export default function LiveBoard({
  eventSlug,
  wallBase,
  submitPath,
}: {
  eventSlug: string
  wallBase: string
  submitPath: string
}) {
  const [data, setData] = useState<Data | null>(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    let alive = true
    async function poll() {
      try {
        const res = await fetch(`/api/live/${eventSlug}/leaderboard`, {
          cache: 'no-store',
        })
        if (res.ok && alive) setData(await res.json())
      } catch {}
      if (alive) timer = setTimeout(poll, document.hidden ? 15000 : 5000)
    }
    poll()
    return () => {
      alive = false
      clearTimeout(timer)
    }
  }, [eventSlug])

  if (!data) return <p className="text-screen-dim">Loading…</p>

  const all = data.projects
  const list = filter === 'all' ? all : all.filter((p) => p.category === filter)
  const max = Math.max(1, ...list.map((p) => p.voteCount))
  const counts: Record<string, number> = {}
  all.forEach(
    (p) => p.category && (counts[p.category] = (counts[p.category] ?? 0) + 1),
  )
  const keys = Object.keys(data.categories).filter((k) => counts[k])

  return (
    <>
      {keys.length > 0 && (
        <div
          role="group"
          aria-label="Filter leaderboard by Jev category"
          className="mb-6 flex flex-wrap gap-2"
        >
          <button
            type="button"
            className={filterBtn}
            aria-pressed={filter === 'all'}
            onClick={() => setFilter('all')}
          >
            All <span className="opacity-70">{all.length}</span>
          </button>
          {keys.map((k) => (
            <button
              key={k}
              type="button"
              className={filterBtn}
              aria-pressed={filter === k}
              onClick={() => setFilter(k)}
            >
              {data.categories[k]}{' '}
              <span className="opacity-70">{counts[k]}</span>
            </button>
          ))}
        </div>
      )}
      {list.length === 0 ? (
        <div className="hb-px bg-night-raised p-8">
          <p className="text-xl font-semibold text-screen">No projects yet.</p>
          <p className="mb-4 text-screen-dim">Be the first on the board.</p>
          <Link href={submitPath} className={btnPrimary}>
            Submit your project
          </Link>
        </div>
      ) : (
        <ol aria-live="polite" className="space-y-3">
          {list.map((p, i) => (
            <li
              key={p.slug}
              className="hb-px relative grid grid-cols-[3.5rem_1fr_auto] items-center gap-4 overflow-hidden bg-night-raised px-5 py-4"
            >
              <span
                className={`font-mono text-3xl font-bold ${i === 0 ? 'text-neon-pink' : 'text-screen-dim'}`}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <Link href={`${wallBase}/${p.slug}`} className="min-w-0">
                <h3 className="truncate text-xl font-semibold text-screen sm:text-2xl">
                  {p.name}
                </h3>
                <p className="mt-1 flex flex-wrap items-center gap-3 text-sm text-screen-dim">
                  {p.categoryLabel && (
                    <span className={chip}>{p.categoryLabel}</span>
                  )}
                  <span>by {p.creatorName}</span>
                  {p.hasVideo && (
                    <span className="text-neon-pink">▶ video</span>
                  )}
                  {p.shareCount > 0 && <span>{p.shareCount} shares</span>}
                </p>
              </Link>
              <div className="text-right font-mono">
                <strong className="block text-3xl text-screen sm:text-4xl">
                  {p.voteCount}
                </strong>
                <span className="text-xs uppercase tracking-widest text-screen-dim">
                  {p.voteCount === 1 ? 'vote' : 'votes'}
                </span>
              </div>
              <div
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-1 bg-night-indigo"
              >
                <span
                  className="block h-full origin-left bg-neon-cyan transition-transform duration-500 motion-reduce:transition-none"
                  style={{ transform: `scaleX(${p.voteCount / max})` }}
                />
              </div>
            </li>
          ))}
        </ol>
      )}
      <p className="mt-6 font-mono text-xs text-screen-dim">
        Updated {new Date(data.updatedAt).toLocaleTimeString()} · refreshes
        every 5 seconds
      </p>
    </>
  )
}
