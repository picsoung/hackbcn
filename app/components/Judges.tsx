'use client'

import Link from 'next/link'
import { useIntl } from './Intl'
import { useTheme } from '@/app/contexts/ThemeContext'
import { FaSquareXTwitter, FaLinkedin, FaLink, FaMedium } from 'react-icons/fa6'
import { Person } from '../helpers/projects'

export default function Judges({ judges }: { judges: Person[] }) {
  const intl = useIntl()
  const { theme } = useTheme()
  
  return (
    <div id="judges" className="bg-white py-10 sm:py-10">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="max-w-3xl">
          <h2 className={`mt-2 text-3xl sm:text-5xl font-cal font-semibold ${theme.colors.accentOnWhite}`}>
            {intl.t('judges.title')}
          </h2>
        </div>
        <div className="mx-auto mt-16 max-w-2xl lg:max-w-none">
          <div className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-4">
            {judges.map((member) => (
              <div
                key={member.name}
                className="flex flex-col items-center gap-2"
              >
                <img
                  className="rounded-full aspect-square object-cover"
                  src={member.image.src}
                  alt={member.name}
                  width="230"
                  height="230"
                  // style={{ border: "2px" }}
                />
                <span className="mb-2 text-xl font-medium leading-tight">
                  {member.name}
                </span>
                <p className="text-neutral-500 dark:text-neutral-400">
                  {member.description}
                </p>
                <div className="flex flex-row gap-4">
                  {member.links &&
                    Object.keys(member.links).map((linkType: string, id) => {
                      const linkURL =
                        member.links[linkType as keyof typeof member.links]
                      return (
                        <Link key={id} href={linkURL || ''} className=''>
                          {linkType === 'twitter' && (
                            <FaSquareXTwitter className="text-3xl text-black" />
                          )}
                          {linkType === 'linkedin' && (
                            <FaLinkedin className="text-3xl text-black" />
                          )}
                          {linkType === 'website' && (
                            <FaLink className="text-3xl text-black" />
                          )}
                          {linkType === 'medium' && (
                            <FaMedium className="text-3xl text-black" />
                          )}
                        </Link>
                      )
                    })}
                </div>
                {/* <dt className="flex items-center gap-x-3 text-xl sm:text-2xl font-bold leading-7 text-gray-900">
                  <span
                    className="h-5 w-12 flex-none text-indigo-600"
                    aria-hidden="true"
                  />
                  {member.name}
                </dt>
                <dd className="mt-2">
                  <div>
                    <img
                      className="rounded-full aspect-square object-cover"
                      src={member.image.src}
                      alt={member.name}
                      width="230"
                      height="230"
                      style={{ border: "2px solid black" }}
                    />
                  </div>
                  <div className="mt-4 flex flex-auto flex-col text-lg leading-7 text-gray-800">
                    <p className="flex-auto">{member.description}</p>
                  </div>
                  <div></div>
                </dd> */}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
