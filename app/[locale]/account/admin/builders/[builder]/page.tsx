import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import AccountWorkspace from '@/app/components/auth/AccountWorkspace'
import CommunityProfileForm from '@/app/components/auth/CommunityProfileForm'
import AdminCreatorPrivacy from '@/app/components/auth/AdminCreatorPrivacy'
import { getCurrentIdentity } from '@/lib/auth/identity-server'
import { getAuthLocale } from '@/lib/auth/shared'
import {
  isProjectOrganiser,
  ProjectAccessError,
} from '@/lib/projects/ownership'
import { organiserBuilderEditor } from '@/lib/admin/profiles'
import { organiserCopy } from '@/data/organiser'

export const dynamic = 'force-dynamic'
export function generateMetadata({ params }: { params: { locale: string } }) {
  return {
    title: `${organiserCopy(getAuthLocale(params.locale)).editBuilder} · HackBarna`,
    robots: { index: false, follow: false },
  }
}
export default async function BuilderEditor({
  params,
}: {
  params: { locale: string; builder: string }
}) {
  const locale = getAuthLocale(params.locale),
    user = await getCurrentIdentity(),
    copy = organiserCopy(locale)
  if (!user)
    redirect(
      `/${locale}/auth?next=${encodeURIComponent(`/${locale}/account/admin/builders/${params.builder}`)}`,
    )
  if (!isProjectOrganiser(user)) notFound()
  let data
  try {
    data = await organiserBuilderEditor(user, params.builder, locale)
  } catch (error) {
    if (
      error instanceof ProjectAccessError &&
      [404, 422].includes(error.status)
    )
      notFound()
    throw error
  }
  return (
    <AccountWorkspace locale={locale} active="organiser" organiser>
      <Link
        href={`/${locale}/account/admin?tab=builders`}
        className="inline-flex min-h-11 items-center text-sm text-ink-dim underline underline-offset-4"
      >
        {copy.back}
      </Link>
      <header className="mb-8 mt-4 max-w-2xl">
        <p className="text-sm text-ink-dim">{copy.editBuilder}</p>
        <h1 className="mt-2 break-words text-3xl font-bold tracking-tight">
          {data.builder.name}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-dim">
          {copy.profileHelp}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-ink-dim">
          {data.builder.claimed ? copy.claimedHelp : copy.unclaimedHelp}
        </p>
      </header>
      <CommunityProfileForm
        key={params.builder}
        initial={data.profile}
        admin={{ builder: params.builder, version: data.version }}
      />
      <AdminCreatorPrivacy
        initial={data.builder.creatorPrivacy}
        locale={locale}
      />
      <section className="mt-12 border-t border-ink/15 pt-6">
        <h2 className="text-xl font-semibold">{copy.profileProjects}</h2>
        <ul className="mt-3 divide-y divide-ink/15">
          {data.projects.map(({ project, visibility }) => (
            <li key={project.key} className="py-4">
              <Link
                className="inline-flex min-h-11 items-center font-medium underline underline-offset-4"
                href={`/${locale}/account/projects/edit?project=${encodeURIComponent(project.key)}`}
              >
                {project.name}
              </Link>
              <p className="text-sm text-ink-dim">
                {project.eventName} · {copy[visibility]}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </AccountWorkspace>
  )
}
