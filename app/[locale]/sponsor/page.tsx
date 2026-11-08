import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import OrgNavbar from '@/app/components/home/OrgNavbar'
import OrgFooter from '@/app/components/home/OrgFooter'
import Dither from '@/app/components/Dither'
import SponsorAction from '@/app/components/sponsorship/SponsorAction'
import { getFeaturedUpcomingEvent } from '@/lib/events-server'
import { sponsorship, getPublishedAudienceMetrics } from '@/lib/sponsorship'
import i18nConfig from '@/i18n.json'
import './sponsor.css'

const locales = [i18nConfig.locale.source, ...i18nConfig.locale.targets]
async function copy(locale: string): Promise<Record<string, string>> {
  return (
    await import(`@/i18n/${locales.includes(locale) ? locale : 'en'}.json`)
  ).default
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const messages = await copy(params.locale)
  const path = `/${params.locale}/sponsor`
  return {
    title: messages['partner.meta.title'],
    description: messages['partner.meta.description'],
    alternates: {
      canonical: path,
      languages: Object.fromEntries([
        ['x-default', '/en/sponsor'],
        ...locales.map((locale) => [locale, `/${locale}/sponsor`]),
      ]),
    },
    openGraph: {
      title: messages['partner.meta.title'],
      description: messages['partner.meta.description'],
      url: path,
      images: [
        {
          url: sponsorship.photos.hero,
          width: 2000,
          height: 1122,
          alt: messages['partner.hero.alt'],
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: messages['partner.meta.title'],
      description: messages['partner.meta.description'],
      images: [sponsorship.photos.hero],
    },
  }
}

export default async function SponsorPage({
  params,
}: {
  params: { locale: string }
}) {
  const messages = await copy(params.locale)
  const t = (key: string) => messages[`partner.${key}`]
  const latest = sponsorship.evidence[sponsorship.evidence.length - 1]
  const metrics = getPublishedAudienceMetrics()
  const date = (value: string) =>
    new Intl.DateTimeFormat(params.locale, {
      month: 'short',
      year: 'numeric',
      timeZone: 'Europe/Madrid',
    }).format(new Date(`${value}T12:00:00Z`))
  const button =
    'sponsor-button hb-px inline-flex items-center justify-center bg-accent px-5 py-3 font-semibold text-ground hover:bg-inversion focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ground'

  return (
    <div
      data-register="night"
      className="sponsor-page min-h-screen bg-ground text-ink"
    >
      <OrgNavbar featuredEvent={getFeaturedUpcomingEvent()} />
      <main id="main-content" className="sponsor-wrap">
        <section className="sponsor-hero" aria-labelledby="partner-title">
          <div>
            <p className="sponsor-kicker text-inversion">{t('eyebrow')}</p>
            <h1 id="partner-title" className="sponsor-headline">
              {t('hero.title')}{' '}
              <span className="text-accent">{t('hero.accent')}</span>
            </h1>
            <p className="sponsor-lead">{t('hero.body')}</p>
            <div className="sponsor-actions">
              <SponsorAction source="hero" className={button}>
                {t('book')}
              </SponsorAction>
              <a href="#packages" className="sponsor-text-link">
                {t('formats.cta')}
              </a>
            </div>
          </div>
          <figure className="sponsor-photo">
            <Dither
              src={sponsorship.photos.hero}
              alt={t('hero.alt')}
              loading="eager"
              imgClassName="object-top"
              className="relative aspect-[4/3]"
              sizes="(min-width: 800px) 300px, 90vw"
            />
            <figcaption>{t('hero.caption')}</figcaption>
          </figure>
          <dl className="sponsor-stats" aria-label={t('audience.title')}>
            <div>
              <dt>{t('audience.hacknightAverage')}</dt>
              <dd>{sponsorship.communityStats.hackNightAverageBuilders}</dd>
            </div>
            <div>
              <dt>{t('audience.hackers')}</dt>
              <dd>{latest.hackers}</dd>
            </div>
            <div>
              <dt>{t('audience.mailingList')}</dt>
              <dd>
                {new Intl.NumberFormat(params.locale).format(
                  sponsorship.communityStats.mailingListSubscribers,
                )}
                {sponsorship.communityStats.mailingListQualifier}
              </dd>
            </div>
            {metrics.map((metric) => (
              <div key={metric.id}>
                <dt>{t(metric.labelKey)}</dt>
                <dd>{metric.value}%</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="sponsor-section" aria-labelledby="stories-title">
          <h2 id="stories-title">{t('stories.title')}</h2>
          <div className="sponsor-stories">
            {sponsorship.cases.map((story) => (
              <article key={story.id}>
                <div className="sponsor-partner-heading">
                  <div className="sponsor-logo hb-px">
                    <Image
                      src={story.logo}
                      alt=""
                      aria-hidden="true"
                      unoptimized
                      width={180}
                      height={56}
                      className="h-9 w-auto max-w-[160px] object-contain"
                    />
                  </div>
                  <h3 className="sr-only">{story.partner}</h3>
                </div>
                <p className="sponsor-story-summary">
                  {t(`case.${story.id}.summary`)}
                </p>
                <div className="sponsor-partner-events">
                  <h4>{t('partner.events')}</h4>
                  <ul>
                    {story.events.map((event) => (
                      <li key={event.path}>
                        <Link
                          href={`/${params.locale}${event.path}`}
                          className="sponsor-text-link"
                        >
                          {event.name}
                        </Link>
                        <span>{date(event.date)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <a
                  href={story.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sponsor-text-link sponsor-recap-link"
                >
                  {t('source.link')}
                </a>
              </article>
            ))}
          </div>
          <p className="sponsor-proof-note">
            <Link
              href={`/${params.locale}${latest.eventPath}`}
              className="sponsor-text-link"
            >
              {latest.outputCount} {t('audience.projects')}
            </Link>
          </p>
        </section>

        <section
          id="packages"
          className="sponsor-section"
          aria-labelledby="packages-title"
        >
          <h2 id="packages-title">{t('packages.title')}</h2>
          <div className="sponsor-options">
            {sponsorship.partnershipOptions.map((option) => (
              <article
                key={option.id}
                className={`sponsor-option ${option.id === 'technology' ? 'sponsor-option-featured' : ''}`}
              >
                <h3>{t(`option.${option.id}.name`)}</h3>
                <ul>
                  {option.features.map((feature) => (
                    <li key={feature}>{t(`option.${option.id}.${feature}`)}</li>
                  ))}
                </ul>
                <SponsorAction
                  source={`option-${option.id}`}
                  className={button}
                >
                  {t(`option.${option.id}.cta`)}
                </SponsorAction>
              </article>
            ))}
          </div>
          <p className="sponsor-package-details">{t('packages.details')}</p>
        </section>

        <section
          id="host-venue"
          className="sponsor-section sponsor-venue"
          aria-labelledby="venue-title"
        >
          <div>
            <h2 id="venue-title">{t('venue.title')}</h2>
            <p className="sponsor-intro">{t('venue.body')}</p>
          </div>
          <div className="sponsor-venue-actions">
            <SponsorAction source="host-venue" className={button}>
              {t('venue.cta')}
            </SponsorAction>
            <SponsorAction
              kind="download"
              source="venue"
              className="sponsor-text-link sponsor-download"
            >
              {t('download')}
            </SponsorAction>
          </div>
        </section>
      </main>
      <OrgFooter />
    </div>
  )
}
