'use client'

import { useIntl } from '../Intl'
import type { Event } from '@/types/events'
import type { Sponsor } from '@/data/sponsors'
import type { Person } from '@/app/helpers/projects'
import Link from 'next/link'
import Image from 'next/image'
import { Disclosure } from '@headlessui/react'
import {
  CalendarIcon,
  MapPinIcon,
  ArrowLeftIcon,
  ChevronDownIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'
import Polaroid from '../Polaroid'
import RecapVideo from './RecapVideo'
import { withUtm } from '../../helpers/utm'
import { trackOutbound } from '../../helpers/track'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function formatDateRange(startDate: string, endDate: string) {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const sameDay =
    start.getUTCFullYear() === end.getUTCFullYear() &&
    start.getUTCMonth() === end.getUTCMonth() &&
    start.getUTCDate() === end.getUTCDate()

  if (sameDay) {
    return `${DAYS[start.getUTCDay()]}, ${MONTHS[start.getUTCMonth()]} ${start.getUTCDate()}, ${start.getUTCFullYear()}`
  }
  const startStr = `${DAYS[start.getUTCDay()]}, ${MONTHS[start.getUTCMonth()]} ${start.getUTCDate()}`
  const endStr = `${DAYS[end.getUTCDay()]}, ${MONTHS[end.getUTCMonth()]} ${end.getUTCDate()}, ${end.getUTCFullYear()}`
  return `${startStr} – ${endStr}`
}

function formatTimeRange(startDate: string, endDate: string) {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const fmt = (d: Date) =>
    d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  return `${fmt(start)} – ${fmt(end)}`
}

function Section({
  title,
  defaultOpen = false,
  children,
}: {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  return (
    <Disclosure defaultOpen={defaultOpen}>
      {({ open }) => (
        <div className="border-b border-slate-100">
          <Disclosure.Button className="flex w-full items-center justify-between py-5 text-left">
            <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
            <ChevronDownIcon
              className={`h-5 w-5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
            />
          </Disclosure.Button>
          <Disclosure.Panel className="pb-8">{children}</Disclosure.Panel>
        </div>
      )}
    </Disclosure>
  )
}

const TIER_ORDER: Array<'supergold' | 'gold' | 'silver' | 'bronze'> = [
  'supergold',
  'gold',
  'silver',
  'bronze',
]
const TIER_SIZE: Record<string, { h: number; max: number; label: string }> = {
  supergold: { h: 80, max: 280, label: 'Founding partners' },
  gold: { h: 64, max: 220, label: 'Gold' },
  silver: { h: 52, max: 180, label: 'Silver' },
  bronze: { h: 44, max: 140, label: 'Bronze' },
  default: { h: 56, max: 200, label: 'Partners' },
}

function SponsorBlock({
  sponsors,
  communitySponsors,
  isPast,
  isHackNight,
  hackNightSponsor,
  eventSlug,
}: {
  sponsors: Sponsor[]
  communitySponsors: Sponsor[]
  isPast: boolean
  isHackNight: boolean
  hackNightSponsor?: string
  eventSlug: string
}) {
  const campaign = `hackbarna-${eventSlug}`
  const deckCampaign = `hackbarna-${eventSlug}-deck`
  // Hack nights surface their "presented by" sponsor in the hero pill; no logo block.
  if (isHackNight) return null

  const hasAny = sponsors.length > 0 || communitySponsors.length > 0

  // Past events with no data: hide entirely. No nag.
  if (isPast && !hasAny) return null

  // Future events with no data: quiet one-line CTA.
  if (!hasAny) {
    return (
      <section className="py-10 border-b border-slate-100">
        <p className="text-sm text-slate-500">
          No sponsors yet. Want to be the first?{' '}
          <a
            href="/sponsorship.pdf"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              trackOutbound('sponsorship_deck_click', {
                event_slug: eventSlug,
                source: 'empty-state',
              })
            }
            className="font-semibold text-org-accent hover:text-org-accent-dark underline underline-offset-2"
          >
            View the deck →
          </a>
        </p>
      </section>
    )
  }

  const byTier = sponsors.reduce<Record<string, Sponsor[]>>((acc, s) => {
    const t = s.tier || 'default'
    if (!acc[t]) acc[t] = []
    acc[t].push(s)
    return acc
  }, {})

  return (
    <section className="py-10 border-b border-slate-100">
      <h2 className="text-xl font-semibold text-slate-900 mb-6">Sponsors</h2>
      <div className="space-y-8">
        {TIER_ORDER.map((tier) => {
          const tierSponsors = byTier[tier]
          if (!tierSponsors?.length) return null
          const { h, max, label } = TIER_SIZE[tier]
          return (
            <div key={tier}>
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-slate-500 mb-3">
                {label}
              </p>
              <div className="flex flex-wrap items-center gap-x-10 gap-y-6">
                {tierSponsors.map((s) => (
                  <a
                    key={s.name}
                    href={withUtm(s.url, { medium: 'sponsor', campaign, content: s.tier ?? tier })}
                    target="_blank"
                    rel="noopener"
                    aria-label={s.name}
                    onClick={() =>
                      trackOutbound('sponsor_click', {
                        sponsor: s.name,
                        tier: s.tier ?? tier,
                        event_slug: eventSlug,
                        source: 'event_detail',
                      })
                    }
                    className="block transition-transform hover:-rotate-1"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={s.logo}
                      alt={s.name}
                      style={{ height: h, maxWidth: max, width: 'auto' }}
                      className="object-contain"
                    />
                  </a>
                ))}
              </div>
            </div>
          )
        })}
        {byTier['default']?.length > 0 && (
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-slate-500 mb-3">
              {TIER_SIZE['default'].label}
            </p>
            <div className="flex flex-wrap items-center gap-x-10 gap-y-6">
              {byTier['default'].map((s) => (
                <a
                  key={s.name}
                  href={withUtm(s.url, { medium: 'sponsor', campaign, content: 'untiered' })}
                  target="_blank"
                  rel="noopener"
                  aria-label={s.name}
                  onClick={() =>
                    trackOutbound('sponsor_click', {
                      sponsor: s.name,
                      tier: 'untiered',
                      event_slug: eventSlug,
                      source: 'event_detail',
                    })
                  }
                  className="block transition-transform hover:-rotate-1"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.logo}
                    alt={s.name}
                    style={{ height: TIER_SIZE['default'].h, maxWidth: TIER_SIZE['default'].max, width: 'auto' }}
                    className="object-contain"
                  />
                </a>
              ))}
            </div>
          </div>
        )}
        {communitySponsors.length > 0 && (
          <div className="pt-6 border-t border-slate-100">
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-slate-500 mb-3">
              Community partners
            </p>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
              {communitySponsors.map((cs) => (
                <a
                  key={cs.name}
                  href={withUtm(cs.url, { medium: 'community-sponsor', campaign })}
                  target="_blank"
                  rel="noopener"
                  aria-label={cs.name}
                  onClick={() =>
                    trackOutbound('community_sponsor_click', {
                      sponsor: cs.name,
                      event_slug: eventSlug,
                      source: 'event_detail',
                    })
                  }
                  className="block opacity-80 hover:opacity-100 transition-opacity"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cs.logo}
                    alt={cs.name}
                    style={{ height: 36, maxWidth: 120, width: 'auto' }}
                    className="object-contain"
                  />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

function PolaroidPeopleGrid({
  people,
  emptyLabel,
  showEmpty,
}: {
  people: Person[]
  emptyLabel: string
  showEmpty: boolean
}) {
  if (people.length === 0) {
    if (!showEmpty) return null
    return <p className="text-sm text-slate-500 italic">{emptyLabel}</p>
  }
  // Alternating rotations for the polaroid hand-placed feel.
  const ROTATIONS = [-2, 2, -1, 1, -3, 3]
  return (
    <ul className="flex flex-wrap justify-center sm:justify-start gap-x-6 gap-y-8">
      {people.map((p, i) => (
        <li key={p.name} className="w-32">
          <Polaroid
            src={p.image?.src || '/hackbcnlogo.png'}
            alt={p.name}
            label={p.name}
            href="#"
            rotate={ROTATIONS[i % ROTATIONS.length]}
            translateY={0}
            width="w-32"
            tapeColor="kraft"
            showOverlay={false}
          />
          {p.description && (
            <p className="mt-2 text-center text-[11px] text-slate-500 leading-snug px-1">
              {p.description}
            </p>
          )}
        </li>
      ))}
    </ul>
  )
}

export default function EventDetail({
  event,
  sponsors,
  communitySponsors,
  judges,
  mentors,
  locale,
  projectCount = 0,
}: {
  event: Event
  sponsors: Sponsor[]
  communitySponsors: Sponsor[]
  judges: Person[]
  mentors: Person[]
  locale: string
  projectCount?: number
}) {
  const intl = useIntl()
  const description = event.description?.[intl.locale] || event.description?.en || ''
  const isPast = event.past ?? new Date(event.endDate) < new Date()
  const isHackNight = event.eventType === 'hacknight'
  const schedule = event.schedule?.[intl.locale] || event.schedule?.en || []

  return (
    <div className="bg-white">
      {/* Hero */}
      <div className={isHackNight ? 'bg-white border-b border-slate-100' : 'bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50'}>
        <div className="mx-auto max-w-4xl px-6 py-12 sm:py-16 lg:px-8">
          <Link
            href={`/${locale}/events`}
            className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700 mb-8 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            {intl.t('events.backToEvents')}
          </Link>

          <div className="grid lg:grid-cols-[1fr_280px] gap-10 items-start">
            <div>
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    isHackNight ? 'bg-slate-100 text-slate-700' : 'bg-org-accent/10 text-org-accent'
                  }`}
                >
                  {isHackNight ? intl.t('events.hacknight') : intl.t('events.hackathon')}
                </span>
                {isHackNight && event.sponsor && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-org-accent/10 text-org-accent">
                    presented by {event.sponsor}
                  </span>
                )}
                {isPast && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                    {intl.t('events.past.label')}
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
                {event.name}
              </h1>
              {isHackNight && event.topic && (
                <p className="text-lg text-slate-600 mb-6">{event.topic}</p>
              )}
              {!isHackNight && <div className="mb-6" />}

              <div className="space-y-2 mb-6">
                <div className="flex items-center text-slate-600">
                  <CalendarIcon className="h-5 w-5 mr-3 text-slate-400" />
                  <span>
                    {formatDateRange(event.startDate, event.endDate)}
                    {isHackNight && (
                      <span className="ml-2 text-slate-500">
                        · {formatTimeRange(event.startDate, event.endDate)}
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex items-center text-slate-600">
                  <MapPinIcon className="h-5 w-5 mr-3 text-slate-400" />
                  <span>{event.location}</span>
                </div>
                {event.capacity && (
                  <div className="flex items-center text-slate-600">
                    <UserGroupIcon className="h-5 w-5 mr-3 text-slate-400" />
                    <span>up to {event.capacity}</span>
                  </div>
                )}
              </div>

              {description && (
                <p className="text-lg text-slate-600 leading-relaxed mb-8">{description}</p>
              )}

              {event.registrationUrl && !isPast && (
                <a
                  href={withUtm(event.registrationUrl, {
                    medium: 'cta',
                    campaign: `hackbarna-${event.slug}`,
                    content: 'register-hero',
                  })}
                  target="_blank"
                  rel="noopener"
                  onClick={() =>
                    trackOutbound('registration_click', {
                      event_slug: event.slug,
                      source: 'register-hero',
                    })
                  }
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

      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        {/* Relive this edition — long-form recap or vertical Shorts (self-hides if none) */}
        <RecapVideo
          recapVideoUrl={event.recapVideoUrl}
          shorts={event.shorts}
          eventName={event.name}
        />

        {/* Sponsors — always-visible block (or quiet empty-state CTA / suppressed for past) */}
        <SponsorBlock
          sponsors={sponsors}
          communitySponsors={communitySponsors}
          isPast={isPast}
          isHackNight={isHackNight}
          hackNightSponsor={event.sponsor}
          eventSlug={event.slug}
        />

        {/* Partners with roles (hack nights) */}
        {event.partners && event.partners.length > 0 && (
          <section className="py-10 border-b border-slate-100">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Partners</h2>
            <div className="flex flex-wrap items-start gap-x-12 gap-y-8">
              {event.partners.map((p) => {
                const inner = p.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.logo}
                    alt={p.name}
                    style={{ height: 36, maxWidth: 160, width: 'auto' }}
                    className="object-contain"
                  />
                ) : (
                  <span className="text-lg font-semibold text-slate-800">{p.name}</span>
                )
                return (
                  <div key={p.name} className="flex flex-col gap-2">
                    {p.url ? (
                      <a
                        href={withUtm(p.url, { medium: 'partner', campaign: `hackbarna-${event.slug}`, content: p.role })}
                        target="_blank"
                        rel="noopener"
                        aria-label={p.name}
                        onClick={() =>
                          trackOutbound('sponsor_click', {
                            sponsor: p.name,
                            tier: p.role,
                            event_slug: event.slug,
                            source: 'event_detail_partners',
                          })
                        }
                        className="block transition-transform hover:-rotate-1"
                      >
                        {inner}
                      </a>
                    ) : (
                      <div>{inner}</div>
                    )}
                    <span className="font-mono text-xs uppercase tracking-[0.18em] text-slate-500">
                      {p.role}
                    </span>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Hack-night gallery */}
        {isHackNight && event.gallery && event.gallery.length > 0 && (
          <section className="py-10 border-b border-slate-100">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Gallery</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {event.gallery.map((src, i) => (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  key={i}
                  src={src}
                  alt=""
                  className="w-full aspect-square object-cover rounded-lg"
                  loading="lazy"
                />
              ))}
            </div>
          </section>
        )}

        {/* Hack-night project links */}
        {isHackNight && event.projectLinks && event.projectLinks.length > 0 && (
          <section className="py-10 border-b border-slate-100">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Projects shipped</h2>
            <ul className="space-y-2">
              {event.projectLinks.map((url, i) => (
                <li key={i}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-org-accent hover:text-org-accent-dark underline underline-offset-2 text-sm break-all"
                  >
                    {url}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Schedule */}
        {schedule.length > 0 && (
          <Section title={intl.t('schedule.title')} defaultOpen={!isPast}>
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
                            <li
                              key={k}
                              className="text-sm text-slate-600 pl-4 border-l-2 border-slate-100"
                            >
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

        {/* Judges — hackathon only. Default open whenever something is shown,
            including the "announced soon" placeholder for upcoming events. */}
        {!isHackNight && (judges.length > 0 || !isPast) && (
          <Section title={intl.t('judges.title')} defaultOpen>
            <PolaroidPeopleGrid
              people={judges}
              emptyLabel="Judges announced soon."
              showEmpty={!isPast}
            />
          </Section>
        )}

        {/* Mentors — hackathon only. Same default-open rule. */}
        {!isHackNight && (mentors.length > 0 || !isPast) && (
          <Section title={intl.t('mentors.title')} defaultOpen>
            <PolaroidPeopleGrid
              people={mentors}
              emptyLabel="Mentors signing on. Know one we should call? team@hackbarna.com"
              showEmpty={!isPast}
            />
          </Section>
        )}

        {/* FAQ — hackathon only */}
        {!isHackNight && (
          <Section title={intl.t('faq.title')}>
            <div className="space-y-0 divide-y divide-slate-100">
              {new Array(11)
                .fill(0)
                .map((_, i) => {
                  const title = intl.t(`faq.item.${i}.title`)
                  const answer = intl.t(`faq.item.${i}.answer`)
                  if (title === `faq.item.${i}.title`) return null
                  return { title, answer, i }
                })
                .filter((x): x is { title: string; answer: string; i: number } => x !== null)
                .map((item) => (
                  <Disclosure key={item.i}>
                    {({ open }) => (
                      <div>
                        <Disclosure.Button className="flex w-full items-center justify-between py-4 text-left">
                          <span className="text-sm font-medium text-slate-800">{item.title}</span>
                          <ChevronDownIcon
                            className={`h-4 w-4 text-slate-400 flex-shrink-0 ml-4 transition-transform ${open ? 'rotate-180' : ''}`}
                          />
                        </Disclosure.Button>
                        <Disclosure.Panel className="pb-4 text-sm text-slate-600">
                          {item.answer}
                        </Disclosure.Panel>
                      </div>
                    )}
                  </Disclosure>
                ))}
            </div>
          </Section>
        )}

        {/* Event-specific FAQ (hack nights) */}
        {event.faq && (event.faq[intl.locale] || event.faq.en) && (
          <Section title={intl.t('faq.title')}>
            <div className="space-y-0 divide-y divide-slate-100">
              {(event.faq[intl.locale] || event.faq.en).map((item, i) => (
                <Disclosure key={i}>
                  {({ open }) => (
                    <div>
                      <Disclosure.Button className="flex w-full items-center justify-between py-4 text-left">
                        <span className="text-sm font-medium text-slate-800">{item.q}</span>
                        <ChevronDownIcon
                          className={`h-4 w-4 text-slate-400 flex-shrink-0 ml-4 transition-transform ${open ? 'rotate-180' : ''}`}
                        />
                      </Disclosure.Button>
                      <Disclosure.Panel className="pb-4 text-sm text-slate-600">
                        {item.a}
                      </Disclosure.Panel>
                    </div>
                  )}
                </Disclosure>
              ))}
            </div>
          </Section>
        )}

        {/* Projects shipped — only for past events with projects */}
        {isPast && projectCount > 0 && (
          <section className="py-10 border-b border-slate-100">
            <h2 className="text-xl font-semibold text-slate-900 mb-3">Projects shipped this edition</h2>
            <p className="text-slate-600 mb-5">
              {projectCount} {projectCount === 1 ? 'project' : 'projects'} from {event.name}, from team formation to final demo.
            </p>
            <Link
              href={`/${locale}/events/${event.slug}/projects`}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-700 transition-colors"
            >
              View all {projectCount} {projectCount === 1 ? 'project' : 'projects'}
              <span aria-hidden="true">→</span>
            </Link>
          </section>
        )}

        {/* Bottom CTA — repeat register button when future + has registration link */}
        {event.registrationUrl && !isPast && (
          <div className="py-12 text-center">
            <p className="text-lg text-slate-700 mb-4">{intl.t('signupCTA.description')}</p>
            <a
              href={withUtm(event.registrationUrl, {
                medium: 'cta',
                campaign: `hackbarna-${event.slug}`,
                content: 'register-bottom',
              })}
              target="_blank"
              rel="noopener"
              onClick={() =>
                trackOutbound('registration_click', {
                  event_slug: event.slug,
                  source: 'register-bottom',
                })
              }
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
