/**
 * A photograph, quantized.
 *
 * Satisfies the Real Place Rule: every dark surface either depicts something
 * that actually happened or is plain ramp ground. The dither exists to
 * quantize a real evening, not to decorate emptiness.
 *
 * At rest the image is thresholded through an ordered 4x4 Bayer tile — the
 * same matrix as the dusk study — with the filter chain tinted toward ember
 * and amber rather than to grey, so a dithered photo still reads warm. On
 * hover or focus both layers resolve: the photo develops.
 *
 * Inside a Polaroid the develop is driven by the frame's own `group` hover, so
 * the whole card responds as one object rather than only the image area.
 */

type DitherProps = {
  src: string
  alt: string
  className?: string
  /** Extra classes for the <img> itself, e.g. an aspect ratio or object-position. */
  imgClassName?: string
  loading?: 'lazy' | 'eager'
}

export default function Dither({
  src,
  alt,
  className = '',
  imgClassName = '',
  loading = 'lazy',
}: DitherProps) {
  // A <span> rather than a <div>: Polaroid nests this inside an <a> and a
  // <button>, and a button may only contain phrasing content.
  return (
    <span className={`hb-dither block ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading={loading}
        className={`hb-dither-img ${imgClassName}`}
      />
      <span aria-hidden="true" className="hb-dither-tex" />
    </span>
  )
}
