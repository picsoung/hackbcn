'use client'

import { useState } from 'react'
import { CodeBracketIcon } from '@heroicons/react/24/outline'

export default function ProjectPreview({
  src,
  name,
}: {
  src?: string
  name: string
}) {
  const [failed, setFailed] = useState(false)
  return (
    <div className="aspect-[16/10] overflow-hidden">
      {src && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={`${name} project preview`}
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div
          className="flex h-full items-center justify-center"
          aria-label={`${name} demo`}
        >
          <CodeBracketIcon
            className="h-12 w-12 opacity-50"
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  )
}
