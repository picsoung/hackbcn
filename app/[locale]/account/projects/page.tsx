import { redirect } from 'next/navigation'
import AccountWorkspace from '@/app/components/auth/AccountWorkspace'
import { accountWorkspaceCopy } from '@/data/account-workspace'
import ProjectManagement from '@/app/components/auth/ProjectManagement'
import { getCurrentIdentity } from '@/lib/auth/identity-server'
import { getAuthLocale } from '@/lib/auth/shared'
import { accountProjects } from '@/lib/projects/ownership-store'
import { isProjectOrganiser, projectReference } from '@/lib/projects/ownership'
import { projectManagementCopy } from '@/data/project-management'

export const dynamic = 'force-dynamic'
export function generateMetadata({ params }: { params: { locale: string } }) {
  return {
    title: `${projectManagementCopy(getAuthLocale(params.locale)).title} · HackBarna`,
    robots: { index: false, follow: false },
  }
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
  const data =
    user.emailVerified && user.email
      ? await accountProjects(user, locale)
      : { projects: [], claims: [], available: [] }
  const ui = accountWorkspaceCopy(locale)
  return (
    <AccountWorkspace
      locale={locale}
      active="projects"
      organiser={isProjectOrganiser(user)}
    >
      <header>
        <h1 className="text-3xl font-bold tracking-tight">{copy.title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-dim">
          {ui.projectsIntro}
        </p>
      </header>
      <ProjectManagement
        data={data}
        locale={locale}
        initialProject={project}
        emailVerified={user.emailVerified && !!user.email}
      />
    </AccountWorkspace>
  )
}
