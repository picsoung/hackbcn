import type { ProjectBuilder } from '@/lib/project-detail'
import { projectPageCopy } from '@/data/project-page'
import ProjectBuilderAvatar from './ProjectBuilderAvatar'
import { FaGithub } from 'react-icons/fa6'

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
            <div className="min-w-0">
              <p className="break-words font-semibold">
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
              <div className="flex flex-wrap gap-x-4">
                {Object.entries(builder.links)
                  .filter(([type]) => type !== 'linkedin')
                  .map(([type, href]) => (
                    <a
                      key={type}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex min-h-11 items-center text-sm text-accent hover:text-inversion focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent ${
                        type === 'github'
                          ? 'min-w-11 justify-center'
                          : 'underline underline-offset-4'
                      }`}
                      aria-label={`${services[type] ?? type}: ${builder.name}`}
                      title={`${services[type] ?? type}: ${builder.name}`}
                    >
                      {type === 'github' ? (
                        <FaGithub aria-hidden="true" className="h-5 w-5" />
                      ) : (
                        (services[type] ?? type)
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
