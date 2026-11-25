import { redirect } from 'next/navigation'
import AuthShell from '@/app/components/auth/AuthShell'
import AuthForm from '@/app/components/auth/AuthForm'
import { getIdentityConfig } from '@/lib/auth/identity-config'
import { getCurrentIdentity } from '@/lib/auth/identity-server'
import { getAuthLocale, getSafeReturnPath } from '@/lib/auth/shared'
import { accountWorkspaceCopy } from '@/data/account-workspace'

export function generateMetadata({ params }: { params: { locale: string } }) {
  return {
    title: `${accountWorkspaceCopy(getAuthLocale(params.locale)).account} · HackBarna`,
    robots: { index: false, follow: false },
  }
}
export const dynamic = 'force-dynamic'

export default async function AuthPage({
  params,
  searchParams,
}: {
  params: { locale: string }
  searchParams: { next?: string; error?: string }
}) {
  const locale = getAuthLocale(params.locale)
  let configured = false
  let signedIn = false
  try {
    configured = !!getIdentityConfig()
    signedIn = !!(await getCurrentIdentity())
  } catch {}
  if (signedIn)
    redirect(getSafeReturnPath(searchParams.next, `/${locale}/account`))
  return (
    <AuthShell>
      <AuthForm
        configured={configured}
        returnPath={searchParams.next}
        failed={!!searchParams.error}
      />
    </AuthShell>
  )
}
