/**
 * The pixel mark.
 *
 * Served as static SVG files rather than inlined path data: the full lockup is
 * 14KB of coordinates, and OrgNavbar is a client component, so inlining would
 * put it in the JS bundle on every page. `drop-shadow()` follows an <img>'s
 * alpha channel, so the chromatic split still works on a file-served mark.
 *
 * Two tones, because the ladder only ever puts the mark on two kinds of ground:
 * `bone` for every night step, `ink` for the amber inversion band.
 */

type Tone = 'bone' | 'ink'

type MarkProps = {
  tone?: Tone
  className?: string
  /** Chromatic fringe on hover/focus of the enclosing link. State, never rest. */
  split?: boolean
  /**
   * Omit for a decorative mark sitting beside a text label. Pass a string when
   * the mark is the only thing identifying its link.
   */
  alt?: string
}

const WORDMARK: Record<Tone, string> = {
  bone: '/brand/wordmark-white.svg',
  ink: '/brand/wordmark-black.svg',
}

const SIGNET: Record<Tone, string> = {
  bone: '/brand/signet-white.svg',
  ink: '/brand/signet-black.svg',
}

function Mark({
  src,
  tone,
  className,
  split,
  alt,
  width,
  height,
}: MarkProps & { src: Record<Tone, string>; width: number; height: number }) {
  const decorative = alt === undefined
  return (
    /* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */
    <img
      src={src[tone ?? 'bone']}
      alt={decorative ? '' : alt}
      aria-hidden={decorative || undefined}
      width={width}
      height={height}
      className={`${split ? 'hb-split ' : ''}${className ?? ''}`}
    />
  )
}

export function Wordmark(props: MarkProps) {
  return <Mark {...props} src={WORDMARK} width={485} height={90} />
}

export function Signet(props: MarkProps) {
  return <Mark {...props} src={SIGNET} width={90} height={90} />
}
