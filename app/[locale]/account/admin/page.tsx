import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import AccountWorkspace from '@/app/components/auth/AccountWorkspace'
import {
  accountButton,
  accountField,
  accountSecondary,
} from '@/app/components/auth/account-styles'
import { getCurrentIdentity } from '@/lib/auth/identity-server'
import { getAuthLocale } from '@/lib/auth/shared'
import { isProjectOrganiser } from '@/lib/projects/ownership'
import { organiserCatalog } from '@/lib/admin/catalog'
import { organiserCopy } from '@/data/organiser'
import { accountWorkspaceCopy } from '@/data/account-workspace'
import ProjectBuilderAvatar from '@/app/components/projects/ProjectBuilderAvatar'
import PendingReviews, {
  type PendingReviewItem,
} from '@/app/components/auth/PendingReviews'

export const dynamic = 'force-dynamic'
export function generateMetadata({ params }: { params: { locale: string } }) {
  return {
    title: `${accountWorkspaceCopy(getAuthLocale(params.locale)).organiser} · HackBarna`,
    robots: { index: false, follow: false },
  }
}
export default async function OrganiserPage({
  params,
  searchParams,
}: {
  params: { locale: string }
  searchParams: {
    tab?: string
    q?: string
    event?: string
    status?: string
    page?: string
  }
}) {
  const locale = getAuthLocale(params.locale),
    user = await getCurrentIdentity()
  if (!user)
    redirect(
      `/${locale}/auth?next=${encodeURIComponent(`/${locale}/account/admin`)}`,
    )
  if (!isProjectOrganiser(user)) notFound()
  const { projects, profiles, pendingClaims } = await organiserCatalog(
    user,
    locale,
  )
  const projectByKey = new Map(
    projects.map((row) => [row.project.key, row.project]),
  )
  const pendingItems: PendingReviewItem[] = [
    ...projects
      .filter((row) => row.editStatus === 'pending')
      .map(({ project }) => ({
        id: project.key,
        name: project.name,
        eventName: project.eventName,
        href: `/${locale}/account/review?project=${encodeURIComponent(project.key)}#project-review`,
        kind: 'projectEdit' as const,
      })),
    ...pendingClaims.map((claim) => ({
      id: claim.id,
      name: projectByKey.get(claim.projectKey)?.name ?? claim.projectKey,
      eventName: projectByKey.get(claim.projectKey)?.eventName ?? '',
      href: `/${locale}/account/review?claim=${claim.id}#ownership-review`,
      kind: 'ownershipRequest' as const,
    })),
  ]
  const copy = organiserCopy(locale),
    builders = searchParams.tab === 'builders',
    q = (searchParams.q ?? '').slice(0, 200),
    event = searchParams.event ?? '',
    status = searchParams.status ?? ''
  const match = (text: string) =>
    text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .includes(
        q
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase(),
      )
  const eventProjects = projects.filter(
    (row) => !event || row.project.eventSlug === event,
  )
  const projectRows = eventProjects.filter(
    (row) =>
      match(
        `${row.project.name} ${row.project.description} ${row.project.creator} ${row.project.eventName}`,
      ) &&
      (!status ||
        (status === 'pending'
          ? row.editStatus === 'pending'
          : status === 'claimed'
            ? row.claimCount > 0
            : status === 'unclaimed'
              ? row.claimCount === 0
              : status === 'creators-hidden'
                ? row.hasHiddenCreators
                : row.visibility === status)),
  )
  const builderRows = profiles.filter((builder) => {
    const credits = eventProjects.filter((row) =>
      builder.projectKeys.includes(row.project.key),
    )
    return (
      credits.length > 0 &&
      match(
        `${builder.name} ${builder.bio ?? ''} ${Object.values(builder.links).join(' ')} ${credits.map(({ project }) => `${project.name} ${project.description} ${project.eventName}`).join(' ')}`,
      ) &&
      (!status ||
        (status === 'pending'
          ? credits.some((row) => row.editStatus === 'pending')
          : status === 'claimed'
            ? builder.claimed
            : status === 'unclaimed'
              ? !builder.claimed
              : status === 'creators-hidden'
                ? builder.creatorPrivacy.hidden
                : credits.some((row) => row.visibility === status)))
    )
  })
  const count = builders ? builderRows.length : projectRows.length
  const pages = Math.max(1, Math.ceil(count / 25)),
    page = Math.min(
      pages,
      Math.max(1, Number.parseInt(searchParams.page ?? '', 10) || 1),
    ),
    offset = (page - 1) * 25
  const url = (values: Record<string, string>) =>
    `/${locale}/account/admin?${new URLSearchParams({ tab: builders ? 'builders' : 'projects', q, event, status, ...values })}`
  const events = Array.from(
    new Map(
      projects.map(({ project }) => [
        project.eventSlug ?? '',
        project.eventName,
      ]),
    ).entries(),
  )
  const linkClass =
    'inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent'
  return (
    <AccountWorkspace locale={locale} active="organiser" organiser>
      <header className="mb-8 flex flex-wrap items-start justify-between gap-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {accountWorkspaceCopy(locale).organiser}
          </h1>
          <p className="mt-3 max-w-prose text-sm leading-relaxed text-ink-dim">
            {copy.intro}
          </p>
        </div>
        <Link href={`/${locale}/account/review`} className={accountSecondary}>
          {copy.review} ({pendingItems.length})
        </Link>
      </header>
      <PendingReviews locale={locale} items={pendingItems} />
      <nav
        aria-label={accountWorkspaceCopy(locale).organiser}
        className="mb-6 flex flex-wrap gap-2"
      >
        {(['projects', 'builders'] as const).map((tab) => (
          <Link
            key={tab}
            href={url({ tab, page: '1' })}
            aria-current={
              (tab === 'builders') === builders ? 'page' : undefined
            }
            className={
              (tab === 'builders') === builders
                ? accountButton
                : accountSecondary
            }
          >
            {copy[tab]}{' '}
            <span className="text-xs">
              ({tab === 'projects' ? projects.length : profiles.length})
            </span>
          </Link>
        ))}
      </nav>
      <form className="mb-8 grid items-end gap-4 border-y border-ink/15 py-5 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_auto]">
        <input
          type="hidden"
          name="tab"
          value={builders ? 'builders' : 'projects'}
        />
        <label className="text-sm font-medium">
          {copy.search}
          <input
            type="search"
            name="q"
            maxLength={200}
            defaultValue={q}
            className={accountField}
          />
        </label>
        <label className="text-sm font-medium">
          {copy.event}
          <select name="event" defaultValue={event} className={accountField}>
            <option value="">{copy.allEvents}</option>
            {events
              .filter(([key]) => key)
              .map(([key, name]) => (
                <option key={key} value={key}>
                  {name}
                </option>
              ))}
          </select>
        </label>
        <label className="text-sm font-medium">
          {copy.status}
          <select name="status" defaultValue={status} className={accountField}>
            <option value="">{copy.all}</option>
            <option value="pending">{copy.pendingEdits}</option>
            <option value="creators-hidden">
              {builders ? copy.builderHidden : copy.creatorsHidden}
            </option>
            {(['claimed', 'unclaimed', 'public', 'private'] as const).map(
              (key) => (
                <option key={key} value={key}>
                  {copy[key]}
                </option>
              ),
            )}
          </select>
        </label>
        <button className={accountButton}>{copy.searchAction}</button>
      </form>
      <p className="mb-3 text-sm text-ink-dim" role="status">
        {copy.results}: {count}
      </p>
      {count === 0 && <p className="py-10 text-ink-dim">{copy.noResults}</p>}
      <ul aria-label={copy.results} className="divide-y divide-ink/15">
        {builders
          ? builderRows.slice(offset, offset + 25).map((builder) => (
              <li
                key={builder.slug}
                className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-5"
              >
                <ProjectBuilderAvatar name={builder.name} src={builder.image} />
                <div className="min-w-0 flex-1 basis-48">
                  <h2 className="break-words font-semibold">{builder.name}</h2>
                  <p className="mt-1 text-sm text-ink-dim">
                    {copy[builder.claimed ? 'claimed' : 'unclaimed']} ·{' '}
                    {builder.projectKeys.length} {copy.projectCount}
                    {builder.creatorPrivacy.hidden && (
                      <> · {copy.builderHidden}</>
                    )}
                  </p>
                </div>
                <Link
                  href={`/${locale}/account/admin/builders/${builder.slug}`}
                  className={linkClass}
                >
                  {copy.edit}
                  <span className="sr-only"> {builder.name}</span>
                </Link>
              </li>
            ))
          : projectRows.slice(offset, offset + 25).map((row) => (
              <li
                key={row.project.key}
                className="grid items-center gap-x-6 gap-y-3 py-5 sm:grid-cols-[minmax(0,1fr)_auto_auto]"
              >
                <div className="min-w-0">
                  <h2 className="break-words font-semibold">
                    {row.project.name}
                  </h2>
                  <p className="mt-1 break-words text-sm text-ink-dim">
                    {row.project.eventName} · {row.project.creator}
                  </p>
                  {row.editStatus === 'pending' && (
                    <Link
                      className={`${linkClass} text-accent`}
                      href={`/${locale}/account/review?project=${encodeURIComponent(row.project.key)}`}
                    >
                      {copy.pending}
                    </Link>
                  )}
                </div>
                <p className="text-sm text-ink-dim">
                  {copy[row.visibility]} ·{' '}
                  {copy[row.claimCount ? 'claimed' : 'unclaimed']}
                  {row.hasHiddenCreators && (
                    <span className="mt-1 block">{copy.creatorsHidden}</span>
                  )}
                </p>
                <Link
                  href={`/${locale}/account/projects/edit?project=${encodeURIComponent(row.project.key)}`}
                  className={linkClass}
                >
                  {copy.edit}
                  <span className="sr-only"> {row.project.name}</span>
                </Link>
              </li>
            ))}
      </ul>
      {pages > 1 && (
        <nav
          aria-label={copy.results}
          className="mt-8 flex items-center justify-between gap-4"
        >
          {page > 1 ? (
            <Link
              href={url({ page: String(page - 1) })}
              className={accountSecondary}
            >
              {copy.previous}
            </Link>
          ) : (
            <span />
          )}
          <span className="text-sm text-ink-dim">
            {page} / {pages}
          </span>
          {page < pages ? (
            <Link
              href={url({ page: String(page + 1) })}
              className={accountSecondary}
            >
              {copy.next}
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </AccountWorkspace>
  )
}
