'use client'

import Link from 'next/link'

export type TapeColor = 'coral' | 'kraft' | 'none'

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

const TAPE_STYLES: Record<Exclude<TapeColor, 'none'>, string> = {
  coral: 'bg-org-accent/70 text-white/90',
  kraft: 'bg-amber-200/85 text-amber-900/70',
}

const FRAME_CLASS =
  'group relative block bg-white p-2 pb-8 shadow-lg transition-transform duration-300 ease-out hover:scale-[1.06] hover:!rotate-0 focus-visible:scale-[1.06] focus-visible:!rotate-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-org-accent focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:focus-visible:scale-100'

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
      {tapeColor !== 'none' && (
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 -rotate-3 px-3 py-0.5 text-[9px] font-bold uppercase tracking-[0.2em] shadow-sm ${TAPE_STYLES[tapeColor]}`}
        >
          ✦ ✦ ✦
        </span>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="w-full aspect-square object-cover"
        loading="lazy"
      />
      <p className="text-center text-xs text-slate-500 mt-2 font-medium px-1 truncate">
        {label}
      </p>
      {showOverlay && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-2 bottom-2 flex items-center justify-center bg-white/95 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-org-accent opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
        >
          {overlayText}
        </span>
      )}
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
