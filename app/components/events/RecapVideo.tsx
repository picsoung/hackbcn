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
}: {
  recapVideoUrl?: string
  shorts?: string[]
  eventName: string
}) {
  const longId = recapVideoUrl ? youtubeId(recapVideoUrl) : null
  const shortIds = (shorts ?? [])
    .map(youtubeId)
    .filter((x): x is string => Boolean(x))

  if (!longId && shortIds.length === 0) return null

  return (
    <section className="py-10 border-b border-slate-100">
      <p className="font-mono text-xs uppercase tracking-[0.28em] text-org-accent mb-3">
        / recap
      </p>
      <h2 className="text-xl font-semibold text-slate-900 mb-6">Relive {eventName}</h2>

      {longId ? (
        <div className="max-w-3xl overflow-hidden rounded-xl shadow-sm">
          <LiteYouTubeEmbed id={longId} title={`${eventName} recap`} />
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
          {shortIds.map((id) => (
            <div
              key={id}
              className="snap-start shrink-0 w-44 sm:w-52 overflow-hidden rounded-xl shadow-sm"
            >
              <LiteYouTubeEmbed
                id={id}
                title={`${eventName} clip`}
                aspectWidth={9}
                aspectHeight={16}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
