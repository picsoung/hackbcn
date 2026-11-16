'use client'

import Image from 'next/image'
import Link from 'next/link'
import { homeCopy } from '@/data/homepage'
import { testimonials } from '@/data/testimonials'
import Dither from '../Dither'
import { useIntl } from '../Intl'
import SubscribeForm from './SubscribeForm'

const firstTimer = testimonials.find(
  (post) =>
    post.author === 'Lilibeth Bustos Linares' &&
    post.eventSlug === 'aisummit25',
)

export default function HomeJoin() {
  const intl = useIntl()
  const copy = homeCopy(intl.locale)
  const linkClass =
    'inline-flex min-h-11 items-center text-sm text-ink-dim underline underline-offset-4 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent'

  return (
    <section
      aria-labelledby="home-community-title"
      className="bg-ground py-12 sm:py-20"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-9 px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <figure>
          <div className="hb-px hb-px-lg bg-paper p-2 pb-4">
            <Dither
              src="/events/aisummit26/building-together.jpg"
              alt={copy.communityPhotoAlt}
              className="relative aspect-[4/3]"
              sizes="(min-width: 1024px) 560px, 90vw"
            />
            <figcaption className="mt-3 px-1 text-center text-xs font-medium text-ground">
              AI Summit 2026
            </figcaption>
          </div>
          <p className="mt-3 text-xs text-ink-dim">
            {copy.photosBy}{' '}
            <a
              href="https://keig-studio.com/"
              className="inline-flex min-h-6 items-center underline underline-offset-4 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
            >
              Keig Studio
            </a>
          </p>
        </figure>
        <div>
          <h2
            id="home-community-title"
            className="text-2xl font-bold tracking-tight text-ink sm:text-3xl"
          >
            {copy.joinTitle}
          </h2>
          {firstTimer && (
            <figure className="mt-5">
              <blockquote
                lang={firstTimer.excerptLang ?? 'en'}
                className="text-lg leading-relaxed text-ink sm:text-xl"
              >
                “{firstTimer.excerpt}”
              </blockquote>
              <figcaption className="mt-4 flex items-center gap-3">
                {firstTimer.avatar && (
                  <Image
                    src={firstTimer.avatar}
                    alt=""
                    width={40}
                    height={40}
                    className="hb-px h-10 w-10 object-cover"
                  />
                )}
                <div className="text-xs leading-relaxed text-ink-dim sm:text-sm">
                  <p className="font-semibold text-ink">{firstTimer.author}</p>
                  <p>{firstTimer.position} · AI Summit 2025</p>
                </div>
              </figcaption>
              <div className="mt-2 flex flex-wrap gap-x-5">
                <a href={firstTimer.url} className={linkClass}>
                  {copy.readPost} ↗
                </a>
                <Link
                  href={`/${intl.locale}/testimonials`}
                  className={linkClass}
                >
                  {copy.allPosts} ↗
                </Link>
              </div>
            </figure>
          )}
          <div
            id="join"
            className="mt-5 scroll-mt-8 border-t border-band-2 pt-5"
          >
            <h3 className="text-lg font-semibold text-ink">
              {copy.signupTitle}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-dim">
              {copy.joinDescription}
            </p>
            <div className="mt-4">
              <SubscribeForm title={copy.invitation} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
