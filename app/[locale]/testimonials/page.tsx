'use client'

import React, { useEffect, useState } from 'react'
import { useIntl } from '../../components/Intl'
import dynamic from 'next/dynamic'
import Linkedin from '@/app/components/mdx/Linkedin'

export default function Page(props: { params: { locale: string } }) {
  const intl = useIntl()

  // const TestimonialContent = dynamic(() => import('@/content/testimonials.mdx'))

  const linkedinPosts = [
    'https://www.linkedin.com/embed/feed/update/urn:li:share:7212055783725776896',
    'https://www.linkedin.com/embed/feed/update/urn:li:share:7213604246716354560',
    'https://www.linkedin.com/embed/feed/update/urn:li:share:7213289595147358208',
    'https://www.linkedin.com/embed/feed/update/urn:li:share:7207761309445062656',
    'https://www.linkedin.com/embed/feed/update/urn:li:activity:7213465366092517376',
    'https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:7213496637116080128',
    'https://www.linkedin.com/embed/feed/update/urn:li:activity:7213265618735681536',
    'https://www.linkedin.com/embed/feed/update/urn:li:activity:7213876927835566080',
    'https://www.linkedin.com/embed/feed/update/urn:li:activity:7213647093612085249',
    'https://www.linkedin.com/embed/feed/update/urn:li:activity:7213585380573376514',
    'https://www.linkedin.com/embed/feed/update/urn:li:activity:7213530083985166336',
    'https://www.linkedin.com/embed/feed/update/urn:li:activity:7213464034547830785',
  ]

  return (
    <div
      id="testimonials"
      className="flex min-h-screen flex-col bg-white py-10 sm:py-10"
    >
      <div className="mx-auto w-full px-4 lg:px-8">
        <h2 className="mt-2 text-3xl sm:text-5xl font-cal font-semibold text-indigo-600">
          {intl.t('testimonials.title')}
        </h2>
        <div className="max-w-full w-full">
          <div className="flex flex-col gap-4">
            <h3 className="m-2 text-2xl">Linkedin Posts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {linkedinPosts.map((post, index) => (
                <Linkedin title={`${index}`} link={post} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
