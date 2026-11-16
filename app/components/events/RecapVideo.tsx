'use client'

import LiteYouTubeEmbed from 'react-lite-youtube-embed'
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css'
import { youtubeId } from '@/app/helpers/youtube'

// "Relive this edition" recap on past-event detail pages.
// Long-form aftermovie if recapVideoUrl is set; otherwise the event's vertical
// Shorts in a small row. Renders nothing when neither exists (caller drops it in
// unconditionally and it self-hides).
export default function RecapVideo({
  recapVideoUrl,
  shorts,
  eventName,
  tone = 'light',
}: {
  recapVideoUrl?: string
  shorts?: string[]
  eventName: string
  tone?: 'light' | 'night'
}) {
  const longId = recapVideoUrl ? youtubeId(recapVideoUrl) : null
  const shortIds = (shorts ?? [])
    .map(youtubeId)
    .filter((x): x is string => Boolean(x))

  if (!longId && shortIds.length === 0) return null

  const isNight = tone === 'night'
  const frameClass = isNight ? 'hb-px' : 'rounded-xl shadow-sm'
  const linkClass = `inline-flex min-h-11 items-center text-sm underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 ${
    isNight
      ? 'text-ink-dim hover:text-ink focus-visible:outline-accent'
      : 'text-slate-600 hover:text-slate-900 focus-visible:outline-org-accent'
  }`

  return (
    <section
      id="recap"
      aria-labelledby="recap-title"
      className={`py-10 border-b ${isNight ? 'border-band-2' : 'border-slate-100'}`}
    >
      <p
        className={`font-mono text-xs uppercase tracking-[0.28em] mb-3 ${isNight ? 'text-accent' : 'text-org-accent'}`}
      >
        / recap
      </p>
      <h2
        id="recap-title"
        className={`text-xl font-semibold mb-6 ${isNight ? 'text-ink' : 'text-slate-900'}`}
      >
        Relive {eventName}
      </h2>

      {longId ? (
        <div className="max-w-3xl">
          <div className={`overflow-hidden ${frameClass}`}>
            <LiteYouTubeEmbed id={longId} title={`${eventName} recap`} />
          </div>
          <a
            href={`https://www.youtube.com/watch?v=${longId}`}
            className={linkClass}
          >
            Watch on YouTube
          </a>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
          {shortIds.map((id, index) => (
            <div key={id} className="snap-start shrink-0 w-44 sm:w-52">
              <div className={`overflow-hidden ${frameClass}`}>
                <LiteYouTubeEmbed
                  id={id}
                  title={`${eventName} clip ${index + 1}`}
                  aspectWidth={9}
                  aspectHeight={16}
                />
              </div>
              <a
                href={`https://www.youtube.com/shorts/${id}`}
                className={linkClass}
              >
                Watch on YouTube
              </a>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
