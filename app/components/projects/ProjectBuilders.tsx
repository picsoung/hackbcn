import Link from 'next/link'
import type { ProjectBuilder } from '@/lib/project-detail'
import { projectPageCopy } from '@/data/project-page'
import ProjectBuilderAvatar from './ProjectBuilderAvatar'
import BuilderSocialLinks from './BuilderSocialLinks'

export default function ProjectBuilders({
  builders,
  locale,
}: {
  builders: ProjectBuilder[]
  locale: string
}) {
  const copy = projectPageCopy(locale)
  if (!builders.length) return null
  return (
    <section aria-labelledby="project-builders-heading">
      <h2 id="project-builders-heading" className="mb-5 text-xl font-semibold">
        {copy.builders}
      </h2>
      <ul className="space-y-6">
        {builders.map((builder, index) => (
          <li
            key={`${builder.name}-${index}`}
            className="relative min-h-14 pl-[4.5rem]"
            data-project-builder
          >
            <div className="min-w-0 flex-1">
              <div className="break-words font-semibold leading-6">
                {builder.href ? (
                  <Link
                    href={builder.href}
                    className="underline underline-offset-4 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                  >
                    <div className="absolute left-0 top-0">
                      <ProjectBuilderAvatar
                        key={`${builder.name}:${builder.image ?? ''}`}
                        name={builder.name}
                        src={builder.image}
                      />
                    </div>
                    {builder.name}
                  </Link>
                ) : (
                  <>
                    <div className="absolute left-0 top-0">
                      <ProjectBuilderAvatar
                        key={`${builder.name}:${builder.image ?? ''}`}
                        name={builder.name}
                        src={builder.image}
                      />
                    </div>
                    {builder.name}
                  </>
                )}
              </div>
              {builder.role && (
                <p className="mt-1 text-sm leading-relaxed text-ink-dim">
                  {builder.role}
                </p>
              )}
              <BuilderSocialLinks builder={builder} locale={locale} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
