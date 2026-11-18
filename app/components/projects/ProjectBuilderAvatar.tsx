'use client'

import { useState } from 'react'

export default function ProjectBuilderAvatar({
  name,
  src,
}: {
  name: string
  src?: string
}) {
  const [failed, setFailed] = useState(false)
  const names = name.trim().split(/\s+/)
  const initials = [
    names[0],
    ...(names.length > 1 ? [names[names.length - 1]] : []),
  ]
    .map((part) => Array.from(part)[0])
    .join('')
    .toUpperCase()
  return (
    <div
      aria-hidden="true"
      className="hb-px flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden bg-band-2 text-lg font-semibold text-ink"
    >
      {src && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          width={56}
          height={56}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  )
}
