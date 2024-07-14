'use client'

import Link from 'next/link'
import LiteYouTubeEmbed from 'react-lite-youtube-embed'
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css'

export default function Linkedin({
  title,
  link,
  imgSrc,
}: {
  title: string
  link: string
  imgSrc: string
}) {
  return (
    <div className="mb-4 break-inside overflow-hidden shadow-lg rounded-md">
      <Link href={link}>
        <img src={imgSrc} />
      </Link>
    </div>
  )
}
