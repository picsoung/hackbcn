'use client'

import { useIntl } from '../Intl'
import { Event } from '@/types/events'
import Link from 'next/link'
import Image from 'next/image'
import { Disclosure } from '@headlessui/react'
import { CalendarIcon, MapPinIcon, ArrowLeftIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import { getSponsorsByEvent } from '@/data/sponsors'
import { getCommunitySponsorsByEvent } from '@/data/communitySponsors'
import { getJudgesByEvent } from '@/data/judges'
import { getMentorsByEvent } from '@/data/mentors'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function formatDateRange(startDate: string, endDate: string) {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const startStr = `${DAYS[start.getUTCDay()]}, ${MONTHS[start.getUTCMonth()]} ${start.getUTCDate()}`
  const endStr = `${DAYS[end.getUTCDay()]}, ${MONTHS[end.getUTCMonth()]} ${end.getUTCDate()}, ${end.getUTCFullYear()}`
  return `${startStr} - ${endStr}`
}

function Section({ title, defaultOpen = false, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  return (
    <Disclosure defaultOpen={defaultOpen}>
      {({ open }) => (
        <div className="border-b border-slate-100">
          <Disclosure.Button className="flex w-full items-center justify-between py-5 text-left">
            <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
            <ChevronDownIcon className={`h-5 w-5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
          </Disclosure.Button>
          <Disclosure.Panel className="pb-8">
            {children}
          </Disclosure.Panel>
        </div>
      )}
    </Disclosure>
  )
}

export default function EventDetail({ event, locale }: { event: Event; locale: string }) {
  const intl = useIntl()
  const description = event.description?.[intl.locale] || event.description?.en || ''
  const isPast = new Date(event.endDate) < new Date()
  const schedule = event.schedule?.[intl.locale] || event.schedule?.en || []

  const { sponsors } = getSponsorsByEvent(event.slug)
  const { communitySponsors } = getCommunitySponsorsByEvent(event.slug)
  const { judges } = getJudgesByEvent(event.slug)
  const { mentors } = getMentorsByEvent(event.slug)

  const faqItems = new Array(11).fill(0).map((_, i) => {
    const title = intl.t(`faq.item.${i}.title`)
    const answer = intl.t(`faq.item.${i}.answer`)
    if (title === `faq.item.${i}.title`) return null
    return { title, answer }
  }).filter(Boolean)

  return (
    <div className="bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50">
        <div className="mx-auto max-w-4xl px-6 py-12 sm:py-16 lg:px-8">
          <Link
            href={`/${intl.locale}/events`}
            className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700 mb-8 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            {intl.t('events.backToEvents')}
          </Link>

          <div className="grid lg:grid-cols-[1fr_280px] gap-10 items-start">
            <div>
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-org-accent/10 text-org-accent">
                  {intl.t('events.hackathon')}
                </span>
                {isPast && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                    {intl.t('events.past.label')}
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
                {event.name}
              </h1>

              <div className="space-y-2 mb-6">
                <div className="flex items-center text-slate-600">
                  <CalendarIcon className="h-5 w-5 mr-3 text-slate-400" />
                  <span>{formatDateRange(event.startDate, event.endDate)}</span>
                </div>
                <div className="flex items-center text-slate-600">
                  <MapPinIcon className="h-5 w-5 mr-3 text-slate-400" />
                  <span>{event.location}</span>
                </div>
              </div>

              {description && (
                <p className="text-lg text-slate-600 leading-relaxed mb-8">{description}</p>
              )}

              {event.registrationUrl && !isPast && (
                <a
                  href={event.registrationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 text-base font-semibold rounded-lg bg-org-accent text-white hover:bg-org-accent-dark transition-colors"
                >
                  {intl.t('events.register')} →
                </a>
              )}
            </div>

            {event.imageUrl && (
              <div className="lg:sticky lg:top-8">
                <Image
                  src={event.imageUrl}
                  alt={event.name}
                  width={1200}
                  height={630}
                  priority
                  className="w-full h-auto rounded-xl shadow-sm"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Collapsible sections */}
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        {schedule.length > 0 && (
          <Section title={intl.t('schedule.title')} defaultOpen>
            <div className="space-y-8">
              {schedule.map((day, i) => (
                <div key={i}>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100">
                    {day.title}
                  </h3>
                  <div className="space-y-4">
                    {day.sections.map((section, j) => (
                      <div key={j}>
                        <h4 className="text-sm font-medium text-org-accent uppercase tracking-wide mb-2">
                          {section.name}
                        </h4>
                        <ul className="space-y-1.5">
                          {section.items.map((item, k) => (
                            <li key={k} className="text-sm text-slate-600 pl-4 border-l-2 border-slate-100">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {sponsors.length > 0 && (
          <Section title={intl.t('sponsors.title')}>
            <div className="flex flex-wrap items-center gap-8">
              {sponsors.map((sponsor) => (
                <a
                  key={sponsor.name}
                  href={sponsor.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={sponsor.logo} alt={sponsor.name} className="h-10 w-auto max-w-[140px] object-contain" />
                </a>
              ))}
            </div>
            {communitySponsors.length > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-50">
                <div className="flex flex-wrap items-center gap-6">
                  {communitySponsors.map((cs) => (
                    <a
                      key={cs.name}
                      href={cs.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:opacity-80 transition-opacity"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={cs.logo} alt={cs.name} className="h-8 w-auto max-w-[100px] object-contain" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </Section>
        )}

        {judges.length > 0 && (
          <Section title={intl.t('judges.title')}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {judges.map((judge) => (
                <div key={judge.name} className="text-center">
                  {judge.image?.src && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={judge.image.src} alt={judge.name} className="w-16 h-16 rounded-full mx-auto mb-2 object-cover" />
                  )}
                  <p className="text-sm font-medium text-slate-900">{judge.name}</p>
                  {judge.description && <p className="text-xs text-slate-500">{judge.description}</p>}
                </div>
              ))}
            </div>
          </Section>
        )}

        {mentors.length > 0 && (
          <Section title={intl.t('mentors.title')}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {mentors.map((mentor) => (
                <div key={mentor.name} className="text-center">
                  {mentor.image?.src && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={mentor.image.src} alt={mentor.name} className="w-16 h-16 rounded-full mx-auto mb-2 object-cover" />
                  )}
                  <p className="text-sm font-medium text-slate-900">{mentor.name}</p>
                  {mentor.description && <p className="text-xs text-slate-500">{mentor.description}</p>}
                </div>
              ))}
            </div>
          </Section>
        )}

        {faqItems.length > 0 && (
          <Section title={intl.t('faq.title')}>
            <div className="space-y-0 divide-y divide-slate-100">
              {faqItems.map((item, i) => (
                <Disclosure key={i}>
                  {({ open }) => (
                    <div>
                      <Disclosure.Button className="flex w-full items-center justify-between py-4 text-left">
                        <span className="text-sm font-medium text-slate-800">{item!.title}</span>
                        <ChevronDownIcon className={`h-4 w-4 text-slate-400 flex-shrink-0 ml-4 transition-transform ${open ? 'rotate-180' : ''}`} />
                      </Disclosure.Button>
                      <Disclosure.Panel className="pb-4 text-sm text-slate-600">
                        {item!.answer}
                      </Disclosure.Panel>
                    </div>
                  )}
                </Disclosure>
              ))}
            </div>
          </Section>
        )}

        {/* Register CTA at bottom for non-past events */}
        {event.registrationUrl && !isPast && (
          <div className="py-12 text-center">
            <p className="text-lg text-slate-700 mb-4">{intl.t('signupCTA.description')}</p>
            <a
              href={event.registrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-4 text-lg font-semibold rounded-lg bg-org-accent text-white hover:bg-org-accent-dark transition-colors"
            >
              {intl.t('events.register')} →
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
