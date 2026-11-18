'use client'

import { useState } from 'react'
import type { ProjectMedia as Media } from '@/lib/project-detail'
import { projectPageCopy } from '@/data/project-page'
import ProjectVideo from './ProjectVideo'

export default function ProjectMedia({
  media,
  name,
  locale,
}: {
  media?: Media
  name: string
  locale: string
}) {
  const copy = projectPageCopy(locale)
  const [failedImage, setFailedImage] = useState<string>()
  if (!media || (media.type === 'image' && media.src === failedImage))
    return (
      <div
        data-project-media-placeholder
        className="hb-px hb-px-lg bg-band-2 p-2 sm:p-3"
      >
        <div className="hb-px flex aspect-video flex-col items-center justify-center gap-4 bg-ground-raised px-6 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/signet-white.svg"
            alt=""
            width={64}
            height={64}
            className="h-16 w-16 opacity-40"
          />
          <p className="text-sm text-ink-dim">{copy.noPreview}</p>
        </div>
      </div>
    )
  if (media.type === 'youtube')
    return <ProjectVideo {...media} title={name} announce={copy.watchDemo} />
  return (
    <figure className="hb-px hb-px-lg bg-paper p-2 sm:p-3">
      <div className="hb-px relative aspect-video overflow-hidden bg-ground-raised">
        {media.type === 'embed' ? (
          <iframe
            src={media.src}
            title={`${copy.watchDemo}: ${name}`}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            loading="lazy"
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <a
            href={media.src}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${copy.viewScreenshot}: ${name}`}
            className="block h-full w-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-accent"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={media.src}
              alt={`${name}: ${copy.preview}`}
              className="h-full w-full object-contain"
              onError={() => setFailedImage(media.src)}
            />
          </a>
        )}
      </div>
    </figure>
  )
}
