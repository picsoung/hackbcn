'use client'

import { useIntl } from '../Intl'
import { getDigestLocale } from '@/lib/auth/shared'
import type { IdentityUser } from '@/lib/auth/types'
import type { CommunityProfile } from '@/lib/community/profile'
import ProjectBuilderAvatar from '../projects/ProjectBuilderAvatar'
import CommunityProfileForm from './CommunityProfileForm'
import { accountWorkspaceCopy } from '@/data/account-workspace'
import CommunicationLanguageForm from './CommunicationLanguageForm'
import type { CommunicationPreferences } from '@/lib/account/communications'

export default function AccountPanel({
  user,
  profile,
  communications,
}: {
  user: IdentityUser
  profile: CommunityProfile
  communications: CommunicationPreferences
}) {
  const intl = useIntl(),
    copy = accountWorkspaceCopy(intl.locale)
  return (
    <>
      <header className="flex flex-wrap items-start justify-between gap-6">
        <div className="flex min-w-0 items-center gap-4">
          <ProjectBuilderAvatar
            name={profile.displayName}
            src={profile.avatarUrl || undefined}
          />
          <div className="min-w-0">
            <h1 className="break-words text-2xl font-bold tracking-tight sm:text-3xl">
              {profile.displayName}
            </h1>
            <p className="mt-1 text-sm text-ink-dim">
              {intl.t('auth.sharedAccount')}
            </p>
            {user.email && (
              <p className="mt-2 break-all text-sm text-ink-dim">
                {user.email}
              </p>
            )}
          </div>
        </div>
      </header>
      <section
        id="profile"
        aria-labelledby="account-profile-title"
        className="mt-8 border-t border-ink/15 pt-7"
      >
        <h2 id="account-profile-title" className="text-2xl font-semibold">
          {copy.publicProfile}
        </h2>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-ink-dim">
          {copy.settingsIntro}
        </p>
        <CommunityProfileForm initial={profile} />
      </section>
      <CommunicationLanguageForm
        initial={communications}
        locale={intl.locale}
      />
      <section className="mt-10 flex flex-wrap items-start justify-between gap-4 border-t border-ink/15 pt-6">
        <div>
          <h2 className="font-semibold">{copy.signIn}</h2>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-ink-dim">
            {copy.digestHelp}
          </p>
          <a
            href={`https://digest.hackbarna.com/${getDigestLocale(intl.locale)}/account`}
            className="mt-2 inline-flex min-h-11 items-center text-sm text-accent underline underline-offset-4"
          >
            {intl.t('profile.digestSettings')}
          </a>
        </div>
        <form action="/auth/signout" method="post">
          <input type="hidden" name="locale" value={intl.locale} />
          <button
            type="submit"
            className="min-h-11 text-sm text-ink-dim underline underline-offset-4 hover:text-ink"
          >
            {intl.t('auth.signOutWebsite')}
          </button>
        </form>
      </section>
    </>
  )
}
