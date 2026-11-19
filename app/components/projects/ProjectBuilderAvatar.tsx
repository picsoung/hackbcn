'use client'

import { useState } from 'react'

export default function ProjectBuilderAvatar({
  name,
  src,
  size = 'credit',
}: {
  name: string
  src?: string
  size?: 'credit' | 'profile'
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
      className={`hb-px flex shrink-0 items-center justify-center overflow-hidden bg-band-2 font-semibold text-ink ${size === 'profile' ? 'h-20 w-20 text-3xl sm:h-32 sm:w-32 sm:text-4xl' : 'h-14 w-14 text-lg'}`}
    >
      {src && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          width={size === 'profile' ? 128 : 56}
          height={size === 'profile' ? 128 : 56}
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
