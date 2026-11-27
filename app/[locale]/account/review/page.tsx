import { notFound, redirect } from 'next/navigation'
import AccountWorkspace from '@/app/components/auth/AccountWorkspace'
import ProjectReview from '@/app/components/auth/ProjectReview'
import ProjectEditReview from '@/app/components/auth/ProjectEditReview'
import { getCurrentIdentity } from '@/lib/auth/identity-server'
import { getAuthLocale } from '@/lib/auth/shared'
import { isProjectOrganiser, projectReference } from '@/lib/projects/ownership'
import { organiserProjectClaims } from '@/lib/projects/ownership-store'
import { projectEditsForReview } from '@/lib/projects/edit-store'
import { accountWorkspaceCopy } from '@/data/account-workspace'
import Link from 'next/link'
import { organiserCopy } from '@/data/organiser'

export const dynamic = 'force-dynamic'
export function generateMetadata({ params }: { params: { locale: string } }) {
  return {
    title: `${accountWorkspaceCopy(getAuthLocale(params.locale)).organiser} · HackBarna`,
    robots: { index: false, follow: false },
  }
}
export default async function ReviewPage({
  params,
  searchParams,
}: {
  params: { locale: string }
  searchParams: { project?: string; claim?: string }
}) {
  const locale = getAuthLocale(params.locale),
    user = await getCurrentIdentity()
  const selected = projectReference(searchParams.project)?.key ?? ''
  const selectedClaim = /^[0-9a-f-]{36}$/i.test(searchParams.claim ?? '')
    ? searchParams.claim!
    : ''
  const query = new URLSearchParams({
    ...(selected ? { project: selected } : {}),
    ...(selectedClaim ? { claim: selectedClaim } : {}),
  })
  const returnPath = `/${locale}/account/review${query.size ? `?${query}` : ''}${selected ? '#project-review' : selectedClaim ? '#ownership-review' : ''}`
  if (!user) redirect(`/${locale}/auth?next=${encodeURIComponent(returnPath)}`)
  if (!isProjectOrganiser(user)) notFound()
  const [claims, edits] = await Promise.all([
    organiserProjectClaims(user, locale),
    projectEditsForReview(user, locale),
  ])
  if (selected)
    edits.sort(
      (a, b) => Number(b.key === selected) - Number(a.key === selected),
    )
  if (selectedClaim)
    claims.sort(
      (a, b) => Number(b.id === selectedClaim) - Number(a.id === selectedClaim),
    )
  return (
    <AccountWorkspace locale={locale} active="organiser" organiser>
      <Link
        href={`/${locale}/account/admin`}
        className="mb-5 inline-flex min-h-11 items-center text-sm text-ink-dim underline underline-offset-4"
      >
        {organiserCopy(locale).back}
      </Link>
      <h1 className="mb-8 text-3xl font-bold tracking-tight">
        {accountWorkspaceCopy(locale).organiser}
      </h1>
      <ProjectEditReview
        edits={edits}
        locale={locale}
        selectedProject={selected}
      />
      <ProjectReview review={claims} locale={locale} />
    </AccountWorkspace>
  )
}
