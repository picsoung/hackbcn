import Link from 'next/link'
import React from 'react'
import {
  FaSquareXTwitter,
  FaLinkedin,
  FaLink,
  FaMedium,
  FaGithub,
} from 'react-icons/fa6'
import { Person } from '../helpers/projects'

type AvatarProps = {
  person: Person
}

const Avatar: React.FC<AvatarProps> = ({ person }) => {
  const initials = person.name
    .split(' ')
    .map((name) => name[0])
    .join('')

  return (
    <div key={person.name} className="flex flex-col items-center gap-2">
      {person.image?.src ? (
        <img
          className="m-0 rounded-full aspect-square object-cover"
          src={
            person.image?.src ||
            'https://pbs.twimg.com/profile_images/1784295597228335104/dQY2N4zt_400x400.jpg'
          }
          alt={person.name}
          width="100"
          height="100"
          style={{ padding: '0' }}
        />
      ) : (
        <div className="relative inline-flex items-center justify-center w-24 h-24 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600">
          <span className="font-medium text-xl text-gray-600 dark:text-gray-300">
            {initials}
          </span>
        </div>
      )}

      <span className="text-base font-medium leading-tight">{person.name}</span>
      {person.description && (
        <span className="text-neutral-500 dark:text-neutral-400">
          {person.description}
        </span>
      )}
      <div className="flex flex-row gap-4">
        {person.links &&
          Object.keys(person.links).map((linkType: string, id) => {
            const linkURL =
              person.links?.[linkType as keyof typeof person.links] ?? ''
            if (linkURL) {
              return (
                <Link key={id} href={linkURL}>
                  {linkType === 'twitter' && (
                    <FaSquareXTwitter className="text-3xl" />
                  )}
                  {linkType === 'linkedin' && (
                    <FaLinkedin className="text-3xl" />
                  )}
                  {linkType === 'website' && <FaLink className="text-3xl" />}
                  {linkType === 'github' && <FaGithub className="text-3xl" />}
                  {linkType === 'medium' && <FaMedium className="text-3xl" />}
                </Link>
              )
            }
            return null
          })}
      </div>
    </div>
  )
}

export default Avatar
