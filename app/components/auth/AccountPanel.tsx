'use client'

import Link from 'next/link'
import { useIntl } from '../Intl'
import { getDigestLocale } from '@/lib/auth/shared'
import type { IdentityUser } from '@/lib/auth/types'
import ProjectBuilderAvatar from '../projects/ProjectBuilderAvatar'

export default function AccountPanel({ user }: { user: IdentityUser }) {
  const intl = useIntl()
  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight">
        {intl.t('auth.account')}
      </h1>
      <p className="mt-3 leading-relaxed text-ink-dim">
        {intl.t('auth.sharedAccount')}
      </p>
      <div className="my-8 flex items-start gap-5 border-y border-band-2 py-6">
        <ProjectBuilderAvatar
          name={user.name || user.email || 'HackBarna'}
          src={user.avatarUrl ?? undefined}
        />
        <div className="min-w-0 space-y-2">
          {user.name && (
            <p className="break-words text-lg font-semibold">{user.name}</p>
          )}
          {user.email && (
            <p className="break-words text-ink-dim">{user.email}</p>
          )}
        </div>
      </div>
      <div className="space-y-4">
        <Link
          href={`/${intl.locale}/projects`}
          className="hb-px hb-px-sm flex min-h-11 items-center justify-center bg-accent px-5 py-3 font-semibold text-ground hover:bg-inversion focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ground"
        >
          {intl.t('auth.exploreProjects')}
        </Link>
        <a
          href={`https://digest.hackbarna.com/${getDigestLocale(intl.locale)}/account`}
          className="flex min-h-11 items-center justify-center rounded-pixel border border-band-2 px-4 text-center text-sm hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {intl.t('auth.manageDigest')}
        </a>
        <form action="/auth/signout" method="post">
          <input type="hidden" name="locale" value={intl.locale} />
          <button
            className="min-h-11 text-sm text-ink-dim underline underline-offset-4 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
            type="submit"
          >
            {intl.t('auth.signOutWebsite')}
          </button>
        </form>
      </div>
    </>
  )
}
