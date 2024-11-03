'use client'

import Link from 'next/link'
import { useIntl } from './Intl'
import { FaSquareXTwitter, FaLinkedin, FaLink, FaMedium } from 'react-icons/fa6'
import { Person } from '../helpers/projects'

export default function Mentors({ mentors }: { mentors: Person[] }) {
  const intl = useIntl()
  return (
    <div id="mentors" className="py-10 sm:py-10">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="max-w-3xl">
          <h2 className="mt-2 text-3xl sm:text-5xl font-cal font-semibold text-indigo-600">
            {intl.t('mentors.title')}
          </h2>
        </div>
        <div className="mx-auto mt-16 max-w-2xl lg:max-w-none">
          <div className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {mentors.map((member) => (
              <div
                key={member.name}
                className="flex flex-col items-center gap-2"
              >
                <img
                  className="rounded-full aspect-square object-cover"
                  src={member.image.src}
                  alt={member.name}
                  width="120"
                  height="120"
                  // style={{ border: "2px" }}
                />
                <span className="text-neutral-100 mb-2 text-xl font-medium leading-tight">
                  {member.name}
                </span>
                <p className="text-neutral-200 dark:text-neutral-400">
                  {member.description}
                </p>
                <div className="flex flex-row gap-4">
                  {member.links &&
                    Object.keys(member.links).map((linkType: string, id) => {
                      const linkURL =
                        member.links[linkType as keyof typeof member.links]
                      return (
                        <Link key={id} href={linkURL || ''}>
                          {linkType === 'twitter' && (
                            <FaSquareXTwitter className="text-teal-400 text-3xl" />
                          )}
                          {linkType === 'linkedin' && (
                            <FaLinkedin className="text-blue-600 text-3xl" />
                          )}
                          {linkType === 'website' && (
                            <FaLink className="text-slate-100 text-3xl" />
                          )}
                          {linkType === 'medium' && (
                            <FaMedium className="text-slate-100 text-3xl" />
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
