'use client'

import { useIntl } from '../Intl'
import { getSafeReturnPath } from '@/lib/auth/shared'

export default function AuthForm({
  configured,
  returnPath,
  failed,
}: {
  configured: boolean
  returnPath?: string
  failed: boolean
}) {
  const intl = useIntl()
  const next = getSafeReturnPath(returnPath, `/${intl.locale}/account`)
  const start = `/auth/start?${new URLSearchParams({ locale: intl.locale, next })}`
  return (
    <div className="space-y-7">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {intl.t('auth.account')}
        </h1>
        <p className="max-w-prose leading-relaxed text-ink-dim">
          {intl.t('auth.sharedAccount')}
        </p>
      </div>
      {failed && (
        <p
          role="alert"
          className="border border-band-2 px-4 py-3 text-sm leading-relaxed"
        >
          {intl.t('auth.signInFailed')}
        </p>
      )}
      {configured ? (
        <>
          <a
            href={start}
            className="hb-px hb-px-sm flex min-h-12 items-center justify-center bg-accent px-5 py-3 text-center font-semibold text-ground hover:bg-inversion focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ground"
          >
            {intl.t('auth.continueWithHackBarna')}
          </a>
          <p className="text-sm leading-relaxed text-ink-dim">
            {intl.t('auth.existingLogin')}
          </p>
        </>
      ) : (
        <p
          role="status"
          className="border-y border-band-2 py-5 leading-relaxed text-ink-dim"
        >
          {intl.t('auth.temporarilyUnavailable')}
        </p>
      )}
    </div>
  )
}
