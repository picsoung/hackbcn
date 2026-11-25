import { redirect } from 'next/navigation'
import Link from 'next/link'
import AuthShell from '@/app/components/auth/AuthShell'
import AccountPanel from '@/app/components/auth/AccountPanel'
import AccountWorkspace from '@/app/components/auth/AccountWorkspace'
import { isProjectOrganiser } from '@/lib/projects/ownership'
import { getCurrentIdentity } from '@/lib/auth/identity-server'
import { getAuthLocale } from '@/lib/auth/shared'
import { accountUnavailableCopy } from '@/data/account-page'
import { getCommunityProfile } from '@/lib/community/profile-store'
import { getCommunicationPreferences } from '@/lib/account/communication-store'
import { accountWorkspaceCopy } from '@/data/account-workspace'

export function generateMetadata({ params }: { params: { locale: string } }) {
  return {
    title: `${accountWorkspaceCopy(getAuthLocale(params.locale)).account} · HackBarna`,
    robots: { index: false, follow: false },
  }
}
export const dynamic = 'force-dynamic'

export default async function AccountPage({
  params,
}: {
  params: { locale: string }
}) {
  const locale = getAuthLocale(params.locale)
  let user
  let profile
  let communications
  try {
    user = await getCurrentIdentity()
    if (user)
      [profile, communications] = await Promise.all([
        getCommunityProfile(user),
        getCommunicationPreferences(user.id),
      ])
  } catch {
    const copy = accountUnavailableCopy(locale)
    return (
      <AuthShell>
        <h1 className="text-3xl font-bold tracking-tight">{copy.title}</h1>
        <p role="status" className="my-6 leading-relaxed text-ink-dim">
          {copy.description}
        </p>
        <Link
          href={`/${locale}/account`}
          className="inline-flex min-h-11 items-center font-semibold text-accent underline underline-offset-4"
        >
          {copy.retry}
        </Link>
      </AuthShell>
    )
  }
  if (!user)
    redirect(`/${locale}/auth?next=${encodeURIComponent(`/${locale}/account`)}`)
  if (!profile || !communications) throw new Error('Profile unavailable')
  return (
    <AccountWorkspace
      locale={locale}
      active="profile"
      organiser={isProjectOrganiser(user)}
    >
      <AccountPanel
        user={user}
        profile={profile}
        communications={communications}
      />
    </AccountWorkspace>
  )
}
