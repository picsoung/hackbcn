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
        <div id="conduct" className="flex min-h-screen flex-col bg-white py-10 sm:py-10">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <h2 className="mt-2 text-3xl sm:text-5xl font-cal font-semibold text-indigo-600">
              {intl.t('conduct.title')}
            </h2>
            <article className="prose">
              <ConductContent />
            </article>
          </div>
        </div>
  )
}
