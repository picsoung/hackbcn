'use client'

import Link from 'next/link'
import { useIntl } from '../Intl'
import { CalendarIcon, MapPinIcon } from '@heroicons/react/24/outline'

type EventCardProps = {
  name: string
  href: string
  startDate: string
  endDate?: string
  location: string
  description?: string
  eventType: 'hackathon' | 'hacknight'
  ctaLabel?: string
  featured?: boolean
  imageUrl?: string
  sponsor?: string
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatDateRange(startDate: string, endDate?: string) {
  const start = new Date(startDate)
  const startStr = `${MONTHS[start.getUTCMonth()]} ${start.getUTCDate()}`
  if (!endDate) return `${startStr}, ${start.getUTCFullYear()}`

  const end = new Date(endDate)
  if (start.getUTCDate() === end.getUTCDate() && start.getUTCMonth() === end.getUTCMonth()) {
    return `${startStr}, ${start.getUTCFullYear()}`
  }
  return `${startStr} - ${MONTHS[end.getUTCMonth()]} ${end.getUTCDate()}, ${end.getUTCFullYear()}`
}

export default function EventCard({
  name,
  href,
  startDate,
  endDate,
  location,
  description,
  eventType,
  ctaLabel,
  featured = false,
  imageUrl,
  sponsor,
}: EventCardProps) {
  const intl = useIntl()
  const isPast = new Date(endDate || startDate) < new Date()

  const typeLabel = eventType === 'hackathon'
    ? intl.t('events.hackathon')
    : intl.t('events.hacknight')

  const cta = ctaLabel || (isPast ? intl.t('events.viewDetails') : intl.t('events.register'))

  const isExternal = href.startsWith('http')
  const LinkComponent = isExternal ? 'a' : Link

  return (
    <div
      className={`hb-px hb-px-shadow group transition-all p-px ${
        featured ? 'bg-accent/50' : 'bg-band-2'
      }`}
    >
      {/* Inner layer holds the fill; the 1px outer layer is the border, since
          a clipped element cannot render one. */}
      <div className="hb-px bg-ground-raised">
        {imageUrl && (
          <div className="hb-dither aspect-[2/1] overflow-hidden bg-band-2">
            <img
              src={imageUrl}
              alt={name}
              className="hb-dither-img w-full h-full"
            />
            <span aria-hidden="true" className="hb-dither-tex" />
          </div>
        )}
        <div className="p-6">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span
            className={`hb-px hb-px-sm inline-flex items-center px-2.5 py-0.5 text-xs font-medium ${
              eventType === 'hackathon'
                ? 'bg-accent/15 text-accent'
                : 'bg-inversion/15 text-inversion'
            }`}
          >
            {typeLabel}
          </span>
          {sponsor && (
            <span className="hb-px hb-px-sm inline-flex items-center px-2.5 py-0.5 text-xs font-medium bg-band-2 text-ink-dim">
              {sponsor}
            </span>
          )}
          {isPast && (
            <span className="hb-px hb-px-sm inline-flex items-center px-2.5 py-0.5 text-xs font-medium bg-band-2 text-ink-dim">
              {intl.t('events.past.label')}
            </span>
          )}
        </div>

        <h3 className={`font-semibold text-ink group-hover:text-accent transition-colors ${featured ? 'text-xl' : 'text-lg'}`}>
          {name}
        </h3>

        <div className="mt-3 space-y-1.5">
          <div className="flex items-center text-sm text-ink-dim">
            <CalendarIcon className="h-4 w-4 mr-2 flex-shrink-0" />
            {formatDateRange(startDate, endDate)}
          </div>
          <div className="flex items-center text-sm text-ink-dim">
            <MapPinIcon className="h-4 w-4 mr-2 flex-shrink-0" />
            {location}
          </div>
        </div>

        {description && (
          <p className="mt-3 text-sm text-ink-dim line-clamp-2">{description}</p>
        )}

        <div className="mt-5">
          <LinkComponent
            href={href}
            {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            /* Clipped AND interactive, so the ring goes inset: an offset ring
               is a box-shadow outside the box and clip-path erases it. */
            className={`hb-px hb-px-sm inline-flex items-center px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-2 ${
              isPast
                ? 'bg-band-2 text-ink hover:bg-accent hover:text-ground focus-visible:ring-ink'
                : 'bg-accent text-ground hover:bg-inversion focus-visible:ring-ground'
            }`}
          >
            {cta}
          </LinkComponent>
        </div>
        </div>
      </div>
    </div>
  )
}
