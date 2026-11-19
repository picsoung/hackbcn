'use client'

import Link from 'next/link'
import { useAuth } from './AuthProvider'
import { useIntl } from '../Intl'

export default function AuthNav() {
  const { user, loading } = useAuth()
  const intl = useIntl()
  if (loading)
    return (
      <span className="inline-block h-8 w-20 bg-band-2" aria-hidden="true" />
    )
  return (
    <Link
      href={`/${intl.locale}/${user ? 'account' : 'auth'}`}
      className="inline-flex min-h-10 items-center rounded-pixel px-2 text-sm font-semibold text-ink hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      {intl.t(user ? 'auth.navAccount' : 'auth.signIn')}
    </Link>
  )
}
