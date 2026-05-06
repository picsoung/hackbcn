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
      className={`rounded-xl border bg-white shadow-sm hover:shadow-md transition-all overflow-hidden ${
        featured ? 'border-org-accent/30 ring-1 ring-org-accent/10' : 'border-gray-200'
      }`}
    >
      {imageUrl && (
        <div className="aspect-[2/1] overflow-hidden bg-slate-100">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              eventType === 'hackathon'
                ? 'bg-org-accent/10 text-org-accent'
                : 'bg-purple-100 text-purple-700'
            }`}
          >
            {typeLabel}
          </span>
          {sponsor && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
              {sponsor}
            </span>
          )}
          {isPast && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
              {intl.t('events.past.label')}
            </span>
          )}
        </div>

        <h3 className={`font-semibold text-slate-900 ${featured ? 'text-xl' : 'text-lg'}`}>
          {name}
        </h3>

        <div className="mt-3 space-y-1.5">
          <div className="flex items-center text-sm text-slate-500">
            <CalendarIcon className="h-4 w-4 mr-2 flex-shrink-0" />
            {formatDateRange(startDate, endDate)}
          </div>
          <div className="flex items-center text-sm text-slate-500">
            <MapPinIcon className="h-4 w-4 mr-2 flex-shrink-0" />
            {location}
          </div>
        </div>

        {description && (
          <p className="mt-3 text-sm text-slate-600 line-clamp-2">{description}</p>
        )}

        <div className="mt-5">
          <LinkComponent
            href={href}
            {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              isPast
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-org-accent text-white hover:bg-org-accent-dark'
            }`}
          >
            {cta}
          </LinkComponent>
        </div>
      </div>
    </div>
  )
}
