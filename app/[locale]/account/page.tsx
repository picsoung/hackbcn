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
import { accountPrivacyOptions } from '@/lib/projects/privacy-store'
import CreatorPrivacyControls from '@/app/components/auth/CreatorPrivacyControls'
import { privacyCopy } from '@/data/privacy-controls'

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
  let privacy: Awaited<ReturnType<typeof accountPrivacyOptions>> = []
  try {
    user = await getCurrentIdentity()
    if (user)
      [profile, communications, privacy] = await Promise.all([
        getCommunityProfile(user),
        getCommunicationPreferences(user.id),
        accountPrivacyOptions(user),
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
      <section className="mt-12">
        <h2 className="text-xl font-semibold">{privacyCopy(locale).account}</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-dim">
          {privacyCopy(locale).accountHelp}
        </p>
        {privacy.map((item) => (
          <CreatorPrivacyControls
            key={item.setting.subjectKey}
            initial={item.setting}
            locale={locale}
            name={item.name}
          />
        ))}
        {privacy.length === 0 && (
          <div className="mt-5 max-w-2xl text-sm leading-relaxed text-ink-dim">
            <p>{privacyCopy(locale).accountEmpty}</p>
            <Link
              href={`/${locale}/account/projects`}
              className="mt-3 inline-flex min-h-11 items-center font-semibold text-accent underline underline-offset-4"
            >
              {accountWorkspaceCopy(locale).claimAction}
            </Link>
          </div>
        )}
      </section>
    </AccountWorkspace>
  )
}
