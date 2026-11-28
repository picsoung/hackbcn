import Link from 'next/link'
import AuthShell from '@/app/components/auth/AuthShell'
import { getAuthLocale } from '@/lib/auth/shared'
import {
  validInvitationTokenShape,
  verifyInvitationOptOutToken,
} from '@/lib/email/invitation-opt-out'
import { invitationOptOutCopy } from '@/data/invitation-opt-out'

export const dynamic = 'force-dynamic'
export function generateMetadata({ params }: { params: { locale: string } }) {
  return {
    title: `${invitationOptOutCopy(getAuthLocale(params.locale)).title} · HackBarna`,
    robots: { index: false, follow: false },
    referrer: 'no-referrer',
  }
}

/** GET never changes preferences, including when email scanners follow this link. */
export default function InvitationUnsubscribe({
  params,
  searchParams,
}: {
  params: { locale: string }
  searchParams: { token?: string; done?: string; error?: string }
}) {
  const locale = getAuthLocale(params.locale),
    copy = invitationOptOutCopy(locale)
  let token = ''
  if (validInvitationTokenShape(searchParams.token)) {
    try {
      if (verifyInvitationOptOutToken(searchParams.token))
        token = searchParams.token
    } catch {}
  }
  const done = searchParams.done === '1'
  return (
    <AuthShell>
      <h1 className="mb-5 text-3xl font-bold tracking-tight">
        {done ? copy.done : copy.heading}
      </h1>
      <p className="mb-7 leading-relaxed text-ink-dim">
        {done ? copy.confirmation : token ? copy.help : copy.invalid}
      </p>
      {!done && token && (
        <form action="/api/invitations/unsubscribe" method="post">
          <input type="hidden" name="token" value={token} />
          <input type="hidden" name="locale" value={locale} />
          {searchParams.error === '1' && (
            <p role="alert" className="mb-5 text-sm text-ink">
              {copy.error}
            </p>
          )}
          <button
            type="submit"
            className="mb-8 inline-flex min-h-11 w-full items-center justify-center rounded-pixel bg-accent px-5 py-3 text-sm font-semibold text-ground transition-colors hover:bg-inversion focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            {copy.action}
          </button>
        </form>
      )}
      <Link
        href={`/${locale}`}
        className="text-sm underline underline-offset-4"
      >
        {copy.back}
      </Link>
    </AuthShell>
  )
}
