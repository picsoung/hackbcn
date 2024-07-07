 "use client"

import LiteYouTubeEmbed from 'react-lite-youtube-embed';
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css'

export default function YouTube({
  id,
  timestamp,
  title,
  thumbnail,
}: {
  id: string
  timestamp: string
  title: string
  thumbnail: string
}) {
  return (
    <div>
      <LiteYouTubeEmbed
        id={id}
        title={title}
        params={`start=${timestamp}`}
        thumbnail={thumbnail}
      />
    </div>
  )
}
