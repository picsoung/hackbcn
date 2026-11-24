import { redirect } from 'next/navigation'
import Link from 'next/link'
import OrgNavbar from '@/app/components/home/OrgNavbar'
import OrgFooter from '@/app/components/home/OrgFooter'
import ProjectManagement from '@/app/components/auth/ProjectManagement'
import { getCurrentIdentity } from '@/lib/auth/identity-server'
import { getAuthLocale } from '@/lib/auth/shared'
import {
  accountProjects,
  organiserProjectClaims,
} from '@/lib/projects/ownership-store'
import { isProjectOrganiser, projectReference } from '@/lib/projects/ownership'
import { projectManagementCopy } from '@/data/project-management'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'My projects · HackBarna',
  robots: { index: false, follow: false },
}

export default async function ManageProjects({
  params,
  searchParams,
}: {
  params: { locale: string }
  searchParams: { project?: string }
}) {
  const locale = getAuthLocale(params.locale),
    copy = projectManagementCopy(locale)
  const user = await getCurrentIdentity()
  const project = projectReference(searchParams.project)?.key ?? ''
  const path = `/${locale}/account/projects${project ? `?project=${encodeURIComponent(project)}` : ''}`
  if (!user) redirect(`/${locale}/auth?next=${encodeURIComponent(path)}`)
  const [data, review] = await Promise.all([
    user.emailVerified && user.email
      ? accountProjects(user, locale)
      : Promise.resolve({ projects: [], claims: [], available: [] }),
    isProjectOrganiser(user)
      ? organiserProjectClaims(user, locale)
      : Promise.resolve(null),
  ])
  return (
    <div data-register="night" className="min-h-screen bg-ground text-ink">
      <OrgNavbar featuredEvent={null} />
      <main className="mx-auto max-w-4xl px-6 py-10 sm:py-16 lg:px-8">
        <Link
          href={`/${locale}/account`}
          className="inline-flex min-h-11 items-center text-sm text-accent underline underline-offset-4"
        >
          {copy.back}
        </Link>
        <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-5xl">
          {copy.title}
        </h1>
        <p className="mt-4 max-w-3xl leading-relaxed text-ink-dim">
          {copy.intro}
        </p>
        <ProjectManagement
          data={data}
          review={review}
          locale={locale}
          initialProject={project}
          emailVerified={user.emailVerified && !!user.email}
        />
      </main>
      <OrgFooter />
    </div>
  )
}
