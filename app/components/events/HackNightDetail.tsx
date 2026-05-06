'use client'

import { useIntl } from '../Intl'
import { HackNight } from '@/data/hacknights'
import Link from 'next/link'
import { CalendarIcon, MapPinIcon, ArrowLeftIcon, UsersIcon } from '@heroicons/react/24/outline'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return `${DAYS[date.getUTCDay()]}, ${MONTHS[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr)
  const h = date.getUTCHours()
  const m = date.getUTCMinutes()
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`
}

export default function HackNightDetail({ hackNight }: { hackNight: HackNight }) {
  const intl = useIntl()
  const description = hackNight.description[intl.locale] || hackNight.description.en
  const isPast = new Date(hackNight.endDate) < new Date()

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-4xl px-6 py-12 sm:py-16 lg:px-8">
        <Link
          href={`/${intl.locale}/events`}
          className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700 mb-8 transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          {intl.t('events.backToEvents')}
        </Link>

        <div className="grid lg:grid-cols-[1fr_300px] gap-10 items-start">
          <div>
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                {intl.t('events.hacknight')}
              </span>
              {hackNight.sponsor && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                  {hackNight.sponsor}
                </span>
              )}
              {isPast && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                  {intl.t('events.past.label')}
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
              {hackNight.name}
            </h1>
            <p className="text-xl text-org-accent font-medium mb-6">{hackNight.topic}</p>

            <div className="space-y-2 mb-8">
              <div className="flex items-center text-slate-600">
                <CalendarIcon className="h-5 w-5 mr-3 text-slate-400" />
                <span>{formatDate(hackNight.date)} &middot; {formatTime(hackNight.date)} - {formatTime(hackNight.endDate)}</span>
              </div>
              <div className="flex items-center text-slate-600">
                <MapPinIcon className="h-5 w-5 mr-3 text-slate-400" />
                <span>{hackNight.location}</span>
              </div>
              {hackNight.capacity && (
                <div className="flex items-center text-slate-600">
                  <UsersIcon className="h-5 w-5 mr-3 text-slate-400" />
                  <span>{hackNight.capacity} {intl.t('events.attendees')}</span>
                </div>
              )}
            </div>

            <div className="prose prose-slate max-w-none mb-10">
              <p>{description}</p>
            </div>

            {hackNight.registrationUrl && (
              <a
                href={hackNight.registrationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center px-6 py-3 text-base font-semibold rounded-lg transition-colors ${
                  isPast
                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    : 'bg-org-accent text-white hover:bg-org-accent-dark'
                }`}
              >
                {isPast ? intl.t('events.viewOnLuma') : intl.t('events.register')} →
              </a>
            )}
          </div>

          {hackNight.imageUrl && (
            <div className="lg:sticky lg:top-8">
              <img
                src={hackNight.imageUrl}
                alt={hackNight.name}
                className="w-full rounded-xl shadow-sm"
              />
            </div>
          )}
        </div>

        {hackNight.gallery && hackNight.gallery.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-semibold text-slate-900 mb-6">{intl.t('events.gallery')}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {hackNight.gallery.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`${hackNight.name} photo ${i + 1}`}
                  className="rounded-lg object-cover w-full aspect-[4/3]"
                />
              ))}
            </div>
          </div>
        )}

        {hackNight.projectLinks && hackNight.projectLinks.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">{intl.t('events.projects')}</h2>
            <ul className="space-y-2">
              {hackNight.projectLinks.map((link, i) => (
                <li key={i}>
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-org-accent hover:text-org-accent-dark underline transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
