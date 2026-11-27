import Link from 'next/link'
import type { ReactNode } from 'react'
import AuthShell from './AuthShell'
import { accountWorkspaceCopy } from '@/data/account-workspace'

export default function AccountWorkspace({
  locale,
  active,
  organiser = false,
  children,
}: {
  locale: string
  active: 'profile' | 'projects' | 'organiser'
  organiser?: boolean
  children: ReactNode
}) {
  const copy = accountWorkspaceCopy(locale)
  const items = [
    ['profile', `/${locale}/account`],
    ['projects', `/${locale}/account/projects`],
    ...(organiser ? [['organiser', `/${locale}/account/admin`]] : []),
  ]
  return (
    <AuthShell wide>
      <p className="mb-5 text-sm font-medium text-ink-dim">{copy.account}</p>
      <nav
        aria-label={copy.account}
        className="mb-9 flex gap-6 overflow-x-auto border-b border-ink/15 sm:mb-12 sm:gap-8"
      >
        {items.map(([key, href]) => (
          <Link
            key={key}
            href={href}
            aria-current={key === active ? 'page' : undefined}
            className={`shrink-0 border-b-2 px-1 pb-3 pt-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${key === active ? 'border-accent text-ink' : 'border-transparent text-ink-dim hover:text-ink'}`}
          >
            {copy[key as 'profile' | 'projects' | 'organiser']}
          </Link>
        ))}
      </nav>
      {children}
    </AuthShell>
  )
}
