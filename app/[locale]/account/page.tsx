import { redirect } from 'next/navigation'
import Link from 'next/link'
import AuthShell from '@/app/components/auth/AuthShell'
import AccountPanel from '@/app/components/auth/AccountPanel'
import { getCurrentIdentity } from '@/lib/auth/identity-server'
import { getAuthLocale } from '@/lib/auth/shared'
import { accountUnavailableCopy } from '@/data/account-page'

export const metadata = {
  title: 'Your HackBarna account',
  robots: { index: false, follow: false },
}
export const dynamic = 'force-dynamic'

export default async function AccountPage({
  params,
}: {
  params: { locale: string }
}) {
  const locale = getAuthLocale(params.locale)
  let user
  try {
    user = await getCurrentIdentity()
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
  return (
    <AuthShell>
      <AccountPanel user={user} />
    </AuthShell>
  )
}
