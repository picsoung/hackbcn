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
        <div className="border-b border-band-2">
          <Disclosure.Button className="flex w-full items-center justify-between py-5 text-left">
            <h2 className="text-xl font-semibold text-ink">{title}</h2>
            <ChevronDownIcon
              className={`h-5 w-5 text-ink-dim transition-transform ${open ? 'rotate-180' : ''}`}
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
      <section className="py-10 border-b border-band-2">
        <p className="text-sm text-ink-dim">
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
            className="font-semibold text-accent hover:text-inversion underline underline-offset-2"
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
    <section className="py-10 border-b border-band-2">
      <h2 className="text-xl font-semibold text-ink mb-6">Sponsors</h2>
      <div className="space-y-8">
        {TIER_ORDER.map((tier) => {
          const tierSponsors = byTier[tier]
          if (!tierSponsors?.length) return null
          const { h, max, label } = TIER_SIZE[tier]
          return (
            <div key={tier}>
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-ink-dim mb-3">
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
                    className="hb-px hb-px-sm block bg-paper px-4 py-3 transition-transform hover:-rotate-1 focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-ground motion-reduce:transition-none motion-reduce:hover:rotate-0"
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
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-ink-dim mb-3">
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
                  className="hb-px hb-px-sm block bg-paper px-4 py-3 transition-transform hover:-rotate-1 focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-ground motion-reduce:transition-none motion-reduce:hover:rotate-0"
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
          <div className="pt-6 border-t border-band-2">
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-ink-dim mb-3">
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
                  className="hb-px hb-px-sm flex h-[76px] w-[152px] items-center justify-center bg-paper px-4 py-3 focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-ground"
                >
                  {/* A fixed plate rather than a fixed height: sizing logos by
                      height alone shrinks a square mark to a third of the width
                      of a wide one. Every plate is the same box and each logo
                      scales to fit it, so they read as equal partners. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cs.logo}
                    alt={cs.name}
                    className="max-h-full max-w-full object-contain"
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
    return <p className="text-sm text-ink-dim italic">{emptyLabel}</p>
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
            tapeColor="alt"
            showOverlay={false}
          />
          {p.description && (
            <p className="mt-2 text-center text-[11px] text-ink-dim leading-snug px-1">
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
  const eventFaq = event.faq?.[intl.locale] || event.faq?.en
  const sharedFaq = !isHackNight
    ? new Array(11)
        .fill(0)
        .map((_, i) => {
          const q = intl.t(`faq.item.${i}.title`)
          const a = intl.t(`faq.item.${i}.answer`)
          if (q === `faq.item.${i}.title`) return null
          return { q, a }
        })
        .filter((item): item is { q: string; a: string } => item !== null)
    : []
  const faq = eventFaq ?? sharedFaq

  return (
    <div className="bg-ground">
      {/* Hero */}
      <div className={isHackNight ? 'bg-ground border-b border-band-2' : 'bg-ground-raised'}>
        <div className="mx-auto max-w-4xl px-6 py-12 sm:py-16 lg:px-8">
          <Link
            href={`/${locale}/events`}
            className="inline-flex items-center text-sm text-ink-dim hover:text-ink mb-8 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            {intl.t('events.backToEvents')}
          </Link>

          <div className="grid lg:grid-cols-[1fr_280px] gap-10 items-start">
            <div>
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span
                  className={`hb-px hb-px-sm inline-flex items-center px-2.5 py-0.5 text-xs font-medium ${
                    isHackNight ? 'bg-band-2 text-ink' : 'bg-accent/15 text-accent'
                  }`}
                >
                  {isHackNight ? intl.t('events.hacknight') : intl.t('events.hackathon')}
                </span>
                {isHackNight && event.sponsor && (
                  <span className="hb-px hb-px-sm inline-flex items-center px-2.5 py-0.5 text-xs font-medium bg-accent/15 text-accent">
                    presented by {event.sponsor}
                  </span>
                )}
                {isPast && (
                  <span className="hb-px hb-px-sm inline-flex items-center px-2.5 py-0.5 text-xs font-medium bg-band-2 text-ink-dim">
                    {intl.t('events.past.label')}
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold text-ink mb-2">
                {event.name}
              </h1>
              {isHackNight && event.topic && (
                <p className="text-lg text-ink-dim mb-6">{event.topic}</p>
              )}
              {!isHackNight && <div className="mb-6" />}

              <div className="space-y-2 mb-6">
                <div className="flex items-center text-ink-dim">
                  <CalendarIcon className="h-5 w-5 mr-3 text-ink-dim" />
                  <span>
                    {formatDateRange(event.startDate, event.endDate)}
                    {isHackNight && (
                      <span className="ml-2 text-ink-dim">
                        · {formatTimeRange(event.startDate, event.endDate)}
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex items-center text-ink-dim">
                  <MapPinIcon className="h-5 w-5 mr-3 text-ink-dim" />
                  <span>{event.location}</span>
                </div>
                {event.capacity && (
                  <div className="flex items-center text-ink-dim">
                    <UserGroupIcon className="h-5 w-5 mr-3 text-ink-dim" />
                    <span>up to {event.capacity}</span>
                  </div>
                )}
              </div>

              {description && (
                <p className="text-lg text-ink-dim leading-relaxed mb-8">{description}</p>
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
                  className="hb-px inline-flex items-center px-6 py-3 text-base font-semibold bg-accent text-ground hover:bg-inversion transition-colors focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-ground"
                >
                  {intl.t('events.register')} →
                </a>
              )}
            </div>

            {event.imageUrl && (
              <div className="lg:sticky lg:top-8">
                <div className="hb-dither hb-px hb-px-shadow">
                  <Image
                    src={event.imageUrl}
                    alt={event.name}
                    width={1200}
                    height={630}
                    priority
                    className="hb-dither-img w-full h-auto"
                  />
                  <span aria-hidden="true" className="hb-dither-tex" />
                </div>
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
          <section className="py-10 border-b border-band-2">
            <h2 className="text-xl font-semibold text-ink mb-6">Partners</h2>
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
                  <span className="text-lg font-semibold text-ink">{p.name}</span>
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
                        className="hb-px hb-px-sm block bg-paper px-4 py-3 transition-transform hover:-rotate-1 focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-ground motion-reduce:transition-none motion-reduce:hover:rotate-0"
                      >
                        {inner}
                      </a>
                    ) : (
                      <div>{inner}</div>
                    )}
                    <span className="font-mono text-xs uppercase tracking-[0.18em] text-ink-dim">
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
          <section className="py-10 border-b border-band-2">
            <h2 className="text-xl font-semibold text-ink mb-6">Gallery</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {event.gallery.map((src, i) => (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  key={i}
                  src={src}
                  alt=""
                  className="hb-px w-full aspect-square object-cover"
                  loading="lazy"
                />
              ))}
            </div>
          </section>
        )}

        {/* Hack-night project links */}
        {isHackNight && event.projectLinks && event.projectLinks.length > 0 && (
          <section className="py-10 border-b border-band-2">
            <h2 className="text-xl font-semibold text-ink mb-4">Projects shipped</h2>
            <ul className="space-y-2">
              {event.projectLinks.map((url, i) => (
                <li key={i}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:text-inversion underline underline-offset-2 text-sm break-all"
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
                  <h3 className="text-lg font-semibold text-ink mb-4 pb-2 border-b border-band-2">
                    {day.title}
                  </h3>
                  <div className="space-y-4">
                    {day.sections.map((section, j) => (
                      <div key={j}>
                        <h4 className="text-sm font-medium text-accent uppercase tracking-wide mb-2">
                          {section.name}
                        </h4>
                        <ul className="space-y-1.5">
                          {section.items.map((item, k) => (
                            <li
                              key={k}
                              className="text-sm text-ink-dim pl-4 border-l border-band-2"
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

        {/* Event-specific FAQ takes precedence; legacy hackathons use shared copy. */}
        {faq.length > 0 && (
          <Section title={intl.t('faq.title')}>
            <div className="space-y-0 divide-y divide-band-2">
              {faq.map((item, i) => (
                <Disclosure key={i}>
                  {({ open }) => (
                    <div>
                      <Disclosure.Button className="flex w-full items-center justify-between py-4 text-left">
                        <span className="text-sm font-medium text-ink">{item.q}</span>
                        <ChevronDownIcon
                          className={`h-4 w-4 text-ink-dim flex-shrink-0 ml-4 transition-transform ${open ? 'rotate-180' : ''}`}
                        />
                      </Disclosure.Button>
                      <Disclosure.Panel className="pb-4 text-sm text-ink-dim">
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
          <section className="py-10 border-b border-band-2">
            <h2 className="text-xl font-semibold text-ink mb-3">Projects shipped this edition</h2>
            <p className="text-ink-dim mb-5">
              {projectCount} {projectCount === 1 ? 'project' : 'projects'} from {event.name}, from team formation to final demo.
            </p>
            <Link
              href={`/${locale}/events/${event.slug}/projects`}
              className="hb-px inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-accent text-ground hover:bg-inversion transition-colors focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-ground"
            >
              View all {projectCount} {projectCount === 1 ? 'project' : 'projects'}
              <span aria-hidden="true">→</span>
            </Link>
          </section>
        )}

        {/* Bottom CTA — repeat register button when future + has registration link */}
        {event.registrationUrl && !isPast && (
          <div className="py-12 text-center">
            <p className="text-lg text-ink mb-4">{intl.t('signupCTA.description')}</p>
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
              className="hb-px inline-flex items-center px-8 py-4 text-lg font-semibold bg-accent text-ground hover:bg-inversion transition-colors focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-ground"
            >
              {intl.t('events.register')} →
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
