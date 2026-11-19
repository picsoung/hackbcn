import type { ProjectBuilder } from '@/lib/project-detail'
import { projectPageCopy } from '@/data/project-page'
import { FaGithub, FaLinkedin } from 'react-icons/fa6'

export default function BuilderSocialLinks({
  builder,
  locale,
}: {
  builder: Pick<ProjectBuilder, 'name' | 'links'>
  locale: string
}) {
  const services: Record<string, string> = {
    linkedin: 'LinkedIn',
    github: 'GitHub',
    twitter: 'Twitter',
    website: projectPageCopy(locale).website,
    medium: 'Medium',
    gitlab: 'GitLab',
    bluesky: 'Bluesky',
    mastodon: 'Mastodon',
  }
  return (
    <div className="-ml-3 flex flex-wrap items-center gap-x-1">
      {Object.entries(services)
        .filter(([type]) => builder.links[type])
        .map(([type, label]) => (
          <a
            key={type}
            href={builder.links[type]}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex min-h-11 items-center text-sm text-accent hover:text-inversion focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent ${
              type === 'github' || type === 'linkedin'
                ? 'h-11 w-11 shrink-0 justify-center'
                : 'px-3 underline underline-offset-4'
            }`}
            aria-label={`${label}: ${builder.name}`}
            title={`${label}: ${builder.name}`}
          >
            {type === 'linkedin' ? (
              <FaLinkedin aria-hidden="true" className="h-5 w-5" />
            ) : type === 'github' ? (
              <FaGithub aria-hidden="true" className="h-5 w-5" />
            ) : (
              label
            )}
          </a>
        ))}
    </div>
  )
}
