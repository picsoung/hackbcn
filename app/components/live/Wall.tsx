'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import VoteButton from './VoteButton'
import { chip, chipDim, filterBtn, pct } from './ui'

export type WallProject = {
  id: number
  slug: string
  name: string
  tagline: string
  creatorName: string
  category: string | null
  categoryConfidence: number | null
  voteCount: number
  shareCount: number
  hasVideo: boolean
  voted: boolean
}

export default function Wall({
  eventSlug,
  basePath,
  projects,
  categoryLabels,
  open,
}: {
  eventSlug: string
  basePath: string
  projects: WallProject[]
  categoryLabels: Record<string, string>
  open: boolean
}) {
  const [filter, setFilter] = useState('all')
  const counts = useMemo(() => {
    const m = new Map<string, number>()
    projects.forEach(
      (p) => p.category && m.set(p.category, (m.get(p.category) ?? 0) + 1),
    )
    return m
  }, [projects])
  const keys = Object.keys(categoryLabels).filter((k) => counts.get(k))
  const shown =
    filter === 'all' ? projects : projects.filter((p) => p.category === filter)

  return (
    <>
      {keys.length > 0 && (
        <div
          role="group"
          aria-label="Filter by Jev category"
          className="mb-8 flex flex-wrap gap-2"
        >
          <button
            type="button"
            className={filterBtn}
            aria-pressed={filter === 'all'}
            onClick={() => setFilter('all')}
          >
            All <span className="opacity-70">{projects.length}</span>
          </button>
          {keys.map((k) => (
            <button
              key={k}
              type="button"
              className={filterBtn}
              aria-pressed={filter === k}
              onClick={() => setFilter(k)}
            >
              {categoryLabels[k]}{' '}
              <span className="opacity-70">{counts.get(k)}</span>
            </button>
          ))}
        </div>
      )}
      <ol className="divide-y divide-night-violet border-y border-night-violet">
        {shown.map((p) => (
          <li key={p.id} className="flex items-center gap-4 py-5 sm:gap-6">
            <span
              className="w-10 shrink-0 font-mono text-2xl font-bold text-screen-dim"
              aria-label={`Rank ${projects.indexOf(p) + 1}`}
            >
              {String(projects.indexOf(p) + 1).padStart(2, '0')}
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold text-screen">
                <Link
                  href={`${basePath}/${p.slug}`}
                  className="hover:text-neon-cyan"
                >
                  {p.name}
                </Link>
              </h3>
              <p className="mt-1 text-screen-dim">{p.tagline}</p>
              <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-screen-dim">
                {p.category ? (
                  <span
                    className={chip}
                    title={`Jev is ${pct(p.categoryConfidence)} confident`}
                  >
                    {categoryLabels[p.category] ?? p.category}
                  </span>
                ) : (
                  <span className={chipDim}>Jev is sorting…</span>
                )}
                <span>by {p.creatorName}</span>
                {p.hasVideo && <span className="text-neon-pink">▶ video</span>}
                {p.shareCount > 0 && (
                  <span>
                    {p.shareCount} {p.shareCount === 1 ? 'share' : 'shares'}
                  </span>
                )}
              </p>
            </div>
            <VoteButton
              eventSlug={eventSlug}
              slug={p.slug}
              name={p.name}
              initialCount={p.voteCount}
              initialVoted={p.voted}
              disabled={!open}
            />
          </li>
        ))}
      </ol>
    </>
  )
}
