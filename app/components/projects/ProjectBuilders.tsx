import type { ProjectBuilder } from '@/lib/project-detail'
import { projectPageCopy } from '@/data/project-page'
import ProjectBuilderAvatar from './ProjectBuilderAvatar'
import { FaGithub, FaLinkedin } from 'react-icons/fa6'

export default function ProjectBuilders({
  builders,
  locale,
}: {
  builders: ProjectBuilder[]
  locale: string
}) {
  const copy = projectPageCopy(locale)
  if (!builders.length) return null
  const services: Record<string, string> = {
    linkedin: 'LinkedIn',
    github: 'GitHub',
    twitter: 'Twitter',
    website: copy.website,
    medium: 'Medium',
    gitlab: 'GitLab',
    bluesky: 'Bluesky',
    mastodon: 'Mastodon',
  }
  return (
    <section aria-labelledby="project-builders-heading">
      <h2 id="project-builders-heading" className="mb-5 text-xl font-semibold">
        {copy.builders}
      </h2>
      <ul className="space-y-6">
        {builders.map((builder, index) => (
          <li
            key={`${builder.name}-${index}`}
            className="flex items-start gap-4"
            data-project-builder
          >
            <ProjectBuilderAvatar
              key={`${builder.name}:${builder.image ?? ''}`}
              name={builder.name}
              src={builder.image}
            />
            <div className="min-w-0 flex-1">
              <p className="break-words font-semibold leading-6">
                {builder.links.linkedin ? (
                  <a
                    href={builder.links.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-4 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                  >
                    {builder.name}
                  </a>
                ) : (
                  builder.name
                )}
              </p>
              {builder.role && (
                <p className="mt-1 text-sm leading-relaxed text-ink-dim">
                  {builder.role}
                </p>
              )}
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
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
