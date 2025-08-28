'use client'
import { useIntl } from './Intl'
import { useTheme } from '@/app/contexts/ThemeContext'
import { getEventBySlug } from '@/lib/events'

export default function Dates() {
  const intl = useIntl()
  const { currentEventSlug } = useTheme()
  const currentEvent = currentEventSlug ? getEventBySlug(currentEventSlug) : null

  if (!currentEvent) {
    return null
  }

  // Format the dates for display
  const startDate = new Date(currentEvent.startDate)
  const endDate = new Date(currentEvent.endDate)
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString(intl.locale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDateShort = (date: Date) => {
    return date.toLocaleDateString(intl.locale, {
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="py-10">
      <div className="max-w-7xl mx-auto px-8">
        <h3 className="text-3xl sm:text-5xl font-cal font-semibold text-white">
          {intl.t('schedule.dates')}
        </h3>
        <p className="mt-4 text-xl text-gray-200">
          <span className="font-semibold">{intl.t('schedule.hacking')}: </span>
          {formatDate(startDate)} - {formatDate(endDate)}
          <br />
          <span className="font-semibold">{intl.t('schedule.location')}: </span>
          {currentEvent.location}
          <br />
          <span className="font-semibold pr-1">{intl.t('schedule.demo')}:</span>
          {formatDateShort(endDate)}
        </p>
      </div>
    </div>
  )
}
