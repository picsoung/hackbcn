'use client'

import LiteYouTubeEmbed from 'react-lite-youtube-embed'
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css'

export default function Linkedin({
  title,
  link,
}: {
  title: string
  link: string
}) {
  return (
    <div className="overflow-hidden shadow-lg rounded-md">
      <iframe
        src={link}
        height="1000px"
        className="w-full overflow-hidden"
        loading="lazy"
        title={title}
      ></iframe>
    </div>
  )
}
