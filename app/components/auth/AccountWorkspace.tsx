import Link from 'next/link'
import type { ReactNode } from 'react'
import AuthShell from './AuthShell'
import { accountWorkspaceCopy } from '@/data/account-workspace'
import { organiserCopy } from '@/data/organiser'

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
  const organiserUi = organiserCopy(locale)
  // Netlify's build context is unavailable in SSR functions. SITE_ORIGIN is
  // inlined at build time and stays a preview origin even if a preview is promoted.
  const environment =
    process.env.NODE_ENV === 'development'
      ? 'development'
      : process.env.SITE_ORIGIN?.includes('.netlify.app')
        ? 'preview'
        : null
  const items = [
    ['profile', `/${locale}/account`],
    ['projects', `/${locale}/account/projects`],
    ...(organiser ? [['organiser', `/${locale}/account/admin`]] : []),
  ]
  return (
    <AuthShell wide>
      <p className="mb-5 text-sm font-medium text-ink-dim">{copy.account}</p>
      {organiser && environment && (
        <p
          data-admin-environment={environment}
          className="mb-6 rounded-pixel border border-ink/20 bg-ground-raised px-4 py-3 text-sm text-ink-dim"
        >
          <strong className="font-semibold text-ink">
            {environment === 'preview'
              ? organiserUi.previewWorkspace
              : organiserUi.localWorkspace}
          </strong>{' '}
          {environment === 'preview'
            ? organiserUi.previewWorkspaceHelp
            : organiserUi.localWorkspaceHelp}
        </p>
      )}
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
