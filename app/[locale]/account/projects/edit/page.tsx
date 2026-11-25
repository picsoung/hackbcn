import { notFound, redirect } from 'next/navigation'
import AccountWorkspace from '@/app/components/auth/AccountWorkspace'
import ProjectEditor from '@/app/components/auth/ProjectEditor'
import { getCurrentIdentity } from '@/lib/auth/identity-server'
import { getAuthLocale } from '@/lib/auth/shared'
import { accountWorkspaceCopy } from '@/data/account-workspace'
import { projectEditor } from '@/lib/projects/edit-store'
import {
  isProjectOrganiser,
  projectReference,
  ProjectAccessError,
} from '@/lib/projects/ownership'

export const dynamic = 'force-dynamic'
export function generateMetadata({ params }: { params: { locale: string } }) {
  return {
    title: `${accountWorkspaceCopy(getAuthLocale(params.locale)).edit} · HackBarna`,
    robots: { index: false, follow: false },
  }
}
export default async function EditProjectPage({
  params,
  searchParams,
}: {
  params: { locale: string }
  searchParams: { project?: string }
}) {
  const locale = getAuthLocale(params.locale),
    reference = projectReference(searchParams.project),
    user = await getCurrentIdentity()
  if (!reference) redirect(`/${locale}/account/projects`)
  if (!user)
    redirect(
      `/${locale}/auth?next=${encodeURIComponent(`/${locale}/account/projects/edit?project=${encodeURIComponent(reference.key)}`)}`,
    )
  let data
  try {
    data = await projectEditor(user, reference.key, locale)
  } catch (error) {
    if (
      error instanceof ProjectAccessError &&
      [403, 404].includes(error.status)
    )
      notFound()
    throw error
  }
  return (
    <AccountWorkspace
      locale={locale}
      active="projects"
      organiser={isProjectOrganiser(user)}
    >
      <ProjectEditor key={reference.key} data={data} locale={locale} />
    </AccountWorkspace>
  )
}
