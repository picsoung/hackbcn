'use client'

import React, { useEffect, useState } from 'react'
import { useIntl } from '../../components/Intl'
import dynamic from 'next/dynamic'

export default function Page(props: { params: { locale: string } }) {
  const intl = useIntl()

  const ConductContent = dynamic(
    () => import('@/legal/code-of-conduct/' + props.params.locale + '.mdx'),
  )

  return (
    /* Long-form skips the ladder: a code of conduct should not descend into an
       amber band. It sits on one mid rung with hb-prose, which adds the extra
       leading light type needs on a dark ground. */
    <div
      id="conduct"
      data-register="night"
      className="flex min-h-screen flex-col bg-band-2 py-10 sm:py-10"
    >
      <div className="mx-auto max-w-3xl px-4 lg:px-8">
        <h2 className="mt-2 text-3xl sm:text-5xl font-semibold tracking-tight text-ink">
          {intl.t('conduct.title')}
        </h2>
        <article className="hb-prose prose prose-invert mt-8 max-w-none prose-headings:text-ink prose-a:text-accent">
          <ConductContent />
        </article>
      </div>
    </div>
  )
}
