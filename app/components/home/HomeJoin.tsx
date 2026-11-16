'use client'

import Image from 'next/image'
import Link from 'next/link'
import { homeCopy } from '@/data/homepage'
import { testimonials } from '@/data/testimonials'
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

  return (
    <section
      id="join"
      aria-labelledby="home-join-title"
      className="scroll-mt-6 bg-ground py-14 sm:py-20"
    >
      <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-2 lg:gap-20 lg:px-8">
        <div>
          <h2
            id="home-join-title"
            className="text-3xl font-bold tracking-tight text-ink sm:text-4xl"
          >
            {copy.joinTitle}
          </h2>
          {firstTimer && (
            <figure className="mt-7">
              <blockquote
                lang={firstTimer.excerptLang ?? 'en'}
                className="max-w-xl text-xl leading-relaxed text-ink"
              >
                “{firstTimer.excerpt}”
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-4">
                {firstTimer.avatar && (
                  <Image
                    src={firstTimer.avatar}
                    alt=""
                    width={48}
                    height={48}
                    className="hb-px h-12 w-12 object-cover"
                  />
                )}
                <div className="text-sm text-ink-dim">
                  <p className="font-semibold text-ink">{firstTimer.author}</p>
                  <p>{firstTimer.position} · AI Summit 2025</p>
                </div>
              </figcaption>
              <a
                href={firstTimer.url}
                className="mt-3 inline-flex min-h-11 items-center text-sm text-ink-dim underline underline-offset-4 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
              >
                {copy.readPost} ↗
              </a>
            </figure>
          )}
          <Link
            href={`/${intl.locale}/testimonials`}
            className="mt-1 inline-flex min-h-11 items-center text-sm font-semibold text-accent underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          >
            {copy.allPosts} ↗
          </Link>
        </div>
        <div className="lg:pt-3">
          <h3 className="text-2xl font-semibold text-ink">
            {copy.signupTitle}
          </h3>
          <p className="mt-4 max-w-md leading-relaxed text-ink-dim">
            {copy.joinDescription}
          </p>
          <div className="mt-6 max-w-md">
            <SubscribeForm title={copy.invitation} />
          </div>
        </div>
      </div>
    </section>
  )
}
