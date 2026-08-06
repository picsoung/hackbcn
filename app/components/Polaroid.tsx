'use client'

import Link from 'next/link'
import Dither from './Dither'

export type TapeColor = 'accent' | 'alt' | 'none'

type PolaroidProps = {
  src: string
  alt: string
  label: string
  href?: string
  // When provided, the polaroid is a button that fires this instead of navigating
  // (e.g. open a recap lightbox).
  onActivate?: () => void
  rotate?: number
  translateY?: number
  width?: string
  tapeColor?: TapeColor
  showOverlay?: boolean
  overlayText?: string
}

// Both tape colours carry near-black marks: they are drenched surfaces in
// miniature, and the drenched-band rule applies at any size.
const TAPE_STYLES: Record<Exclude<TapeColor, 'none'>, string> = {
  accent: 'bg-accent text-ground',
  alt: 'bg-inversion text-ground/80',
}

// The interactive element carries the focus ring and stays UNCLIPPED: the ring
// is a box-shadow, and clip-path would erase it silently. The bone frame and
// its stepped corners live on the inner div. The ring's offset colour is the
// page ground rather than white, so it reads as a gap in the ladder step it
// sits on instead of a white halo.
const FRAME_CLASS =
  'group relative block transition-transform duration-300 ease-out hover:scale-[1.06] hover:!rotate-0 focus-visible:scale-[1.06] focus-visible:!rotate-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ground motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:focus-visible:scale-100'

// drop-shadow rather than box-shadow, so the lift follows the staircase.
const PAPER_CLASS =
  'hb-px hb-px-lg hb-px-shadow-lg relative block bg-paper p-2 pb-8'

export default function Polaroid({
  src,
  alt,
  label,
  href,
  onActivate,
  rotate = 0,
  translateY = 0,
  width = 'w-44',
  tapeColor = 'none',
  showOverlay = true,
  overlayText = 'view recap →',
}: PolaroidProps) {
  const style = { transform: `rotate(${rotate}deg) translateY(${translateY}px)` }
  const ariaLabel = onActivate ? `${label}: watch recap` : `${label}: view event recap`

  const inner = (
    <>
      {/* The tape sits outside the paper's box, so it lives on the unclipped
          wrapper. Inside the clipped div it would be sliced off. */}
      {tapeColor !== 'none' && (
        <span
          aria-hidden="true"
          className={`hb-px hb-px-sm pointer-events-none absolute -top-2 left-1/2 z-10 -translate-x-1/2 -rotate-3 px-3 py-0.5 text-[9px] font-bold uppercase tracking-[0.2em] ${TAPE_STYLES[tapeColor]}`}
        >
          ✦ ✦ ✦
        </span>
      )}
      <span className={PAPER_CLASS}>
        {/* Dithered at rest, developing on the frame's own hover/focus. */}
        <Dither src={src} alt={alt} className="hb-px block w-full aspect-square" />
        <span className="block text-center text-xs text-ground/70 mt-2 font-medium px-1 truncate">
          {label}
        </span>
        {showOverlay && (
          <span
            aria-hidden="true"
            className="hb-px hb-px-sm pointer-events-none absolute inset-x-2 bottom-2 flex items-center justify-center bg-paper/95 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-accent opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
          >
            {overlayText}
          </span>
        )}
      </span>
    </>
  )

  if (onActivate) {
    return (
      <button
        type="button"
        onClick={onActivate}
        aria-label={ariaLabel}
        className={`${FRAME_CLASS} ${width} text-left appearance-none`}
        style={style}
      >
        {inner}
      </button>
    )
  }

  return (
    <Link href={href ?? '#'} aria-label={ariaLabel} className={`${FRAME_CLASS} ${width}`} style={style}>
      {inner}
    </Link>
  )
}
