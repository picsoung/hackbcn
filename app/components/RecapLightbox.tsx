'use client'

import { useEffect } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { youtubeId } from '@/app/helpers/youtube'

// Fullscreen recap player. Opened on a user click, so autoplay (with sound) is allowed.
// Vertical (9:16) by default for Shorts; pass aspect for horizontal recaps.
export default function RecapLightbox({
  url,
  title,
  onClose,
  aspect = '9 / 16',
}: {
  url: string | null
  title?: string
  onClose: () => void
  aspect?: string
}) {
  useEffect(() => {
    if (!url) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [url, onClose])

  if (!url) return null
  const id = youtubeId(url)
  if (!id) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title ?? 'Event recap'}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 sm:p-8"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close recap"
        className="absolute right-4 top-4 rounded-full p-2 text-white/80 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
      >
        <XMarkIcon className="h-8 w-8" />
      </button>
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative h-[85vh] max-h-full max-w-full"
        style={{ aspectRatio: aspect }}
      >
        <iframe
          src={`https://www.youtube.com/embed/${id}?autoplay=1&playsinline=1&rel=0`}
          title={title ?? 'Event recap'}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          className="h-full w-full rounded-xl shadow-2xl"
        />
      </div>
    </div>
  )
}
