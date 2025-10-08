'use client'

import Link from 'next/link'
import { useIntl } from './Intl'
import { useTheme } from '@/app/contexts/ThemeContext'
import { FaSquareXTwitter, FaLinkedin, FaLink, FaMedium } from 'react-icons/fa6'
import { Person } from '../helpers/projects'

export default function Mentors({ mentors }: { mentors: Person[] }) {
  const intl = useIntl()
  const { theme } = useTheme()
  
  return (
    <div id="mentors" className="py-10 sm:py-10">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="max-w-3xl">
          <h2 className={`mt-2 text-3xl sm:text-5xl font-cal font-semibold text-white`}>
            {intl.t('mentors.title')}
          </h2>
        </div>
        <div className="mx-auto mt-16">
          <div className="grid max-w-none grid-cols-1 gap-x-4 gap-y-8
                          sm:grid-cols-2
                          md:grid-cols-3
                          lg:grid-cols-4
                          xl:grid-cols-5
                          2xl:grid-cols-6">
            {mentors.map((member) => (
              <div
                key={member.name}
                className="flex flex-col items-center gap-1"
              >
                <img
                  className="rounded-full aspect-square object-cover"
                  src={member.image.src}
                  alt={member.name}
                  width="80"
                  height="80"
                />
                <span className="text-neutral-100 text-lg font-medium leading-tight text-center">
                  {member.name}
                </span>
                <p className="text-neutral-200 dark:text-neutral-400 text-sm text-center leading-relaxed">
                  {member.description}
                </p>
                <div className="flex flex-row gap-2">
                  {member.links &&
                    Object.keys(member.links).map((linkType: string, id) => {
                      const linkURL =
                        member.links[linkType as keyof typeof member.links]
                      return (
                        <Link key={id} href={linkURL || ''}>
                          {linkType === 'twitter' && (
                            <FaSquareXTwitter className="text-teal-400 text-2xl" />
                          )}
                          {linkType === 'linkedin' && (
                            <FaLinkedin className="text-blue-600 text-2xl" />
                          )}
                          {linkType === 'website' && (
                            <FaLink className="text-slate-100 text-2xl" />
                          )}
                          {linkType === 'medium' && (
                            <FaMedium className="text-slate-100 text-2xl" />
                          )}
                        </Link>
                      )
                    })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
