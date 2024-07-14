'use client'

import React, { useEffect, useState } from 'react'
import { useIntl } from '../../components/Intl'
import dynamic from 'next/dynamic'
import Linkedin from '@/app/components/mdx/Linkedin'

export default function Page(props: { params: { locale: string } }) {
  const intl = useIntl()

  // const TestimonialContent = dynamic(() => import('@/content/testimonials.mdx'))

  const linkedinPosts = [
    {
      img: '/testimonials/alberto_linkedin.png',
      link: 'https://www.linkedin.com/posts/albertolabarga_ai-hackathon-barcelona-activity-7213455842057023488-csBw',
    },
    {
      img: '/testimonials/alex_linkedin.png',
      link: 'https://www.linkedin.com/posts/alexpalazon_we-spent-this-weekend-at-hackbcn24-and-built-activity-7213876927835566080-7I7z',
    },
    {
      img: '/testimonials/arnau_linkedin.png',
      link: 'https://www.linkedin.com/posts/arnau-soler-recasens_hackbcn-ai-artificialintelligence-activity-7213489033279119361-mlRe',
    },
    {
      img: '/testimonials/eyuel_linkedin.png',
      link: 'https://www.linkedin.com/posts/eyuel-muse-woldesembet_big-thank-you-to-everyone-involved-in-the-activity-7213407210981208065-NIkJ',
    },
    {
      img: '/testimonials/gabriele_linkedin.png',
      link: 'https://www.linkedin.com/posts/gabriele-raffaelli-67779576_hackbcn-ai-hackathon-activity-7207761310208389120-IYMv',
    },
    {
      img: '/testimonials/jessica_linkedin.png',
      link: 'https://www.linkedin.com/posts/jessica-arroyo-lebr%C3%B3n_hackbcn-hackathon-lewagon-activity-7213265618735681536-sIDu',
    },
    {
      img: '/testimonials/joan_linkedin.png',
      link: 'https://www.linkedin.com/posts/joanbr4_despu%C3%A9s-de-la-gran-experiencia-creo-que-activity-7210744680899108865-ijW3',
    },
    {
      img: '/testimonials/kristian_linkedin.png',
      link: 'https://www.linkedin.com/posts/kristian-gosvig_techlife-impostersyndrome-techconfidence-activity-7213604247806877696-1K_r',
    },
    {
      img: '/testimonials/lewagon_linkeidn.png',
      link: 'https://www.linkedin.com/posts/le-wagon-spain_hackbcn-lewagonspain-hackathon-activity-7213830417311830016-wb8y',
    },
    {
      img: '/testimonials/luken_linkedin.png',
      link: 'https://www.linkedin.com/posts/lukeniquintana_el-fin-de-semana-tuve-la-maravillosa-oportunidad-activity-7214212504313352194--RJW',
    },
    {
      img: '/testimonials/matias_linkedin.png',
      link: 'https://www.linkedin.com/posts/matiassebastianmartinez_during-the-last-weekend-i-participated-in-activity-7213465366092517376-cXw5',
    },
    {
      img: '/testimonials/pau_linkedin.png',
      link: 'https://www.linkedin.com/posts/paugarcia32_este-fin-de-semana-he-estado-junto-a-jose-activity-7213496788249436161-_3Sc',
    },
    {
      img: '/testimonials/pavel_linkeidn.png',
      link: 'https://www.linkedin.com/posts/akpratyush_ai-genai-ai-activity-7213620069900177409-G4h_',
    },
    {
      img: '/testimonials/rebeca_linkedin.png',
      link: 'https://www.linkedin.com/posts/rebeca-garcia-58149061_ya-descansada-puedo-contarles-un-poco-de-activity-7213663887844376577-oXt2',
    },
    {
      img: '/testimonials/romina_linkedin.png',
      link: 'https://www.linkedin.com/posts/mendezromina_ai-hackathon-barcelona-activity-7213464034547830785-Vxa5',
    },
    {
      img: '/testimonials/stefania_linkedin.png',
      link: 'https://www.linkedin.com/posts/stefania-georgescu-x_ai-activity-7213095112170434561-_3Rd',
    },
    {
      img: '/testimonials/tanya_linkedin.png',
      link: 'https://www.linkedin.com/posts/tanyavangastel_barcelonas-first-ai-hackathon-is-this-week-activity-7212055785965514752-eowb',
    },
    {
      img: '/testimonials/thetechnation_linkedin.png',
      link: 'https://www.linkedin.com/posts/the-technation_today-was-a-bit-of-a-milestone-for-the-tech-activity-7213289596493656064-tPRp',
    },
    {
      img: '/testimonials/valentina_linkedin.png',
      link: 'https://www.linkedin.com/posts/valentinatoni_hackathon-airquality-techforgood-activity-7213585380573376514-2Z8D',
    },
    {
      img: '/testimonials/vero_linkedin.png',
      link: 'https://www.linkedin.com/posts/veroagnolutto_ai-hackathon-barcelona-activity-7213530083985166336-pFyj',
    },
  ]

  const pressPosts = [
    {
      img: '/testimonials/parentesis_press.png',
      link: 'https://www.parentesis.media/programar-una-ia-en-24-horas-asi-sera-el-hackaton-de-barcelona/',
    },
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
            <h3 className="m-2 text-2xl">{intl.t('testimonials.press')}</h3>
            <div className="masonry sm:masonry-sm md:masonry-md gap-4">
              {pressPosts.map((post, index) => (
                <Linkedin
                  key={index}
                  title={`${index}`}
                  imgSrc={post.img}
                  link={post.link}
                />
              ))}
            </div>
            <h3 className="m-2 text-2xl">{intl.t('testimonials.linkedin_posts')}</h3>
            <div className="masonry sm:masonry-sm md:masonry-md gap-4">
              {linkedinPosts.map((post, index) => (
                <Linkedin
                  key={index}
                  title={`${index}`}
                  imgSrc={post.img}
                  link={post.link}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
