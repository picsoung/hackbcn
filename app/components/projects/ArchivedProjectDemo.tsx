'use client'

import LiteYouTubeEmbed from 'react-lite-youtube-embed'
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css'

export type ArchivedProjectDemoProps = {
  id: string
  timestamp?: string
  title: string
  thumbnail?: string
  announce: string
}

export default function ArchivedProjectDemo({
  id,
  timestamp = '0',
  title,
  thumbnail,
  announce,
}: ArchivedProjectDemoProps) {
  const start = /^\d+$/.test(timestamp) ? timestamp : '0'
  return (
    <div className="not-prose my-8 hb-px hb-px-lg bg-paper p-2 sm:p-3">
      <div className="hb-px overflow-hidden [&_.lty-playbtn]:!rounded-none [&_.lty-playbtn]:!bg-accent [&_.lty-playbtn]:before:!border-l-ground [&_.yt-lite:hover_.lty-playbtn]:!bg-inversion [&_.lty-playbtn]:focus-visible:outline [&_.lty-playbtn]:focus-visible:outline-2 [&_.lty-playbtn]:focus-visible:outline-offset-4 [&_.lty-playbtn]:focus-visible:outline-paper">
        <LiteYouTubeEmbed
          id={id}
          title={title}
          announce={announce}
          thumbnail={thumbnail || undefined}
          adNetwork={false}
          params={`start=${start}&playsinline=1&rel=0`}
        />
      </div>
    </div>
  )
}
