'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { projectManagementCopy } from '@/data/project-management'
import { projectReference } from '@/lib/projects/ownership'
import type {
  accountProjects,
  organiserProjectClaims,
} from '@/lib/projects/ownership-store'

type AccountData = Awaited<ReturnType<typeof accountProjects>>
type ReviewData = Awaited<ReturnType<typeof organiserProjectClaims>>
const button =
  'inline-flex min-h-11 items-center justify-center bg-accent px-5 py-2 font-semibold text-ground disabled:cursor-wait disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent'
const field =
  'mt-2 block min-h-11 w-full border border-band-2 bg-ground-raised px-4 py-3 text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent'

export default function ProjectManagement({
  data,
  review,
  locale,
  initialProject = '',
  emailVerified,
}: {
  data: AccountData
  review: ReviewData | null
  locale: string
  initialProject?: string
  emailVerified: boolean
}) {
  const router = useRouter(),
    copy = projectManagementCopy(locale)
  const [busy, setBusy] = useState<string | null>(null),
    [status, setStatus] = useState(''),
    [failed, setFailed] = useState(false)
  async function change(
    id: string,
    url: string,
    method: 'POST' | 'PATCH',
    body: unknown,
    success: string,
  ) {
    setBusy(id)
    setStatus('')
    setFailed(false)
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const result = await response.json()
      if (!response.ok) {
        const messages: Record<string, string> = {
          conflict: copy.conflict,
          forbidden: copy.forbidden,
          not_found: copy.missing,
          limit: copy.limit,
          invalid: copy.invalid,
        }
        throw new Error(messages[result.error] ?? copy.error)
      }
      setStatus(
        id === 'claim' && result.status === 'verified' ? copy.claimed : success,
      )
      router.refresh()
    } catch (error) {
      setFailed(true)
      setStatus(error instanceof Error ? error.message : copy.error)
    } finally {
      setBusy(null)
    }
  }
  async function claim(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    await change(
      'claim',
      '/api/account/projects/claims',
      'POST',
      { project: form.get('project'), message: form.get('message') },
      copy.requested,
    )
  }
  const initial = projectReference(initialProject)
  const projectInput = initial
    ? initial.kind === 'archive'
      ? `https://www.hackbarna.com/${locale}/projects/${initial.slug.map(encodeURIComponent).join('/')}`
      : `https://www.hackbarna.com/${locale}/events/${initial.event}/projects/${initial.slug}`
    : ''
  return (
    <div>
      <p
        role={failed ? 'alert' : 'status'}
        aria-live="polite"
        className={`mb-5 min-h-6 text-sm ${failed ? 'text-red-300' : 'text-ink-dim'}`}
      >
        {status}
      </p>
      {!emailVerified && (
        <p className="mb-8 border-l-2 border-accent pl-4 text-ink-dim">
          {copy.verifyEmail}
        </p>
      )}
      {data.available.length > 0 && (
        <section className="mb-10" aria-labelledby="available-title">
          <h2 id="available-title" className="text-2xl font-semibold">
            {copy.availableTitle}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-dim">
            {copy.availableHelp}
          </p>
          <ul className="mt-5 divide-y divide-band-2">
            {data.available.map((project) => (
              <li
                key={project.key}
                className="flex flex-wrap items-center justify-between gap-4 py-5"
              >
                <div>
                  <h3 className="font-semibold">{project.name}</h3>
                  <p className="mt-1 text-sm text-ink-dim">
                    {project.eventName}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={busy !== null}
                  className={button}
                  onClick={() =>
                    change(
                      'claim',
                      '/api/account/projects/claims',
                      'POST',
                      {
                        project: project.key,
                        message:
                          'Confirming my individual event registration match.',
                      },
                      copy.claimed,
                    )
                  }
                >
                  {busy === 'claim' ? copy.working : copy.claimNow}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
      <div className="space-y-5">
        {data.projects.map(({ project, visibility, revision }) => (
          <article
            key={project.key}
            className="border border-band-2 bg-ground-raised p-5 sm:p-6"
          >
            <p className="text-sm text-ink-dim">{project.eventName}</p>
            <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
              <h2 className="break-words text-xl font-semibold">
                {project.name}
              </h2>
              <span className="bg-band-2 px-3 py-1 text-sm">
                {copy[visibility]}
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink-dim">
              {project.description}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-5">
              <button
                type="button"
                disabled={busy !== null || !emailVerified}
                onClick={() =>
                  change(
                    project.key,
                    '/api/account/projects/visibility',
                    'PATCH',
                    {
                      project: project.key,
                      visibility:
                        visibility === 'public' ? 'private' : 'public',
                      revision,
                    },
                    copy.success,
                  )
                }
                className={button}
              >
                {busy === project.key
                  ? copy.working
                  : visibility === 'public'
                    ? copy.hide
                    : copy.show}
              </button>
              {visibility === 'public' && (
                <Link
                  href={project.href}
                  className="inline-flex min-h-11 items-center text-sm text-accent underline underline-offset-4"
                >
                  {copy.view}
                </Link>
              )}
            </div>
          </article>
        ))}
        {!data.projects.length && (
          <p className="border-y border-band-2 py-6 text-ink-dim">
            {copy.empty}
          </p>
        )}
      </div>
      <p className="mt-5 text-sm leading-relaxed text-ink-dim">
        {copy.teamNotice}
      </p>
      <section
        className="mt-12 border-t border-band-2 pt-8"
        aria-labelledby="claim-title"
      >
        <h2 id="claim-title" className="text-2xl font-semibold">
          {copy.claimTitle}
        </h2>
        <p
          id="claim-help"
          className="mt-3 max-w-prose text-sm leading-relaxed text-ink-dim"
        >
          {copy.claimHelp}
        </p>
        <form onSubmit={claim} className="mt-6 space-y-5">
          <label className="block text-sm font-semibold">
            {copy.projectLabel}
            <input
              type="url"
              name="project"
              required
              maxLength={1000}
              defaultValue={projectInput}
              placeholder={`https://www.hackbarna.com/${locale}/projects/…`}
              aria-describedby="claim-help"
              className={field}
            />
          </label>
          <label className="block text-sm font-semibold">
            {copy.messageLabel}
            <textarea
              name="message"
              required
              maxLength={2000}
              rows={3}
              className={field}
            />
          </label>
          <button
            type="submit"
            disabled={busy !== null || !emailVerified}
            className={button}
          >
            {busy === 'claim' ? copy.working : copy.submit}
          </button>
        </form>
      </section>
      {data.claims.length > 0 && (
        <section className="mt-10" aria-labelledby="requests-title">
          <h2 id="requests-title" className="text-xl font-semibold">
            {copy.yourRequests}
          </h2>
          <ul className="mt-4 divide-y divide-band-2">
            {data.claims.map((item) => (
              <li key={item.id} className="py-4">
                <p className="break-all text-sm text-ink-dim">
                  {item.projectKey
                    .replace(/^archive:/, '/projects/')
                    .replace(/^submitted:([^:]+):/, '/events/$1/projects/')}
                </p>
                <p className="mt-1 text-sm">{copy[item.status]}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
      {review !== null && (
        <section
          className="mt-14 border-t border-band-2 pt-8"
          aria-labelledby="review-title"
        >
          <h2 id="review-title" className="text-2xl font-semibold">
            {copy.reviewTitle}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-dim">
            {copy.reviewHelp}
          </p>
          {!review.length && (
            <p className="mt-5 text-ink-dim">{copy.noClaims}</p>
          )}
          <form
            className="mt-8 border border-band-2 p-5"
            onSubmit={async (event) => {
              event.preventDefault()
              const form = new FormData(event.currentTarget)
              const file = form.get('evidence')
              if (!(file instanceof File) || file.size > 131072) {
                setFailed(true)
                setStatus(copy.invalid)
                return
              }
              try {
                await change(
                  'import',
                  '/api/account/projects/evidence',
                  'POST',
                  JSON.parse(await file.text()),
                  copy.imported,
                )
              } catch {
                setFailed(true)
                setStatus(copy.invalid)
              }
            }}
          >
            <h3 className="font-semibold">{copy.importTitle}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-dim">
              {copy.importHelp}
            </p>
            <label className="mt-4 block text-sm font-semibold">
              {copy.importFile}
              <input
                name="evidence"
                type="file"
                accept="application/json,.json"
                required
                className="mt-2 block min-h-11 w-full text-sm text-ink-dim file:mr-4 file:border-0 file:bg-band-2 file:px-4 file:py-3 file:text-ink"
              />
            </label>
            <button
              type="submit"
              disabled={busy !== null}
              className={`${button} mt-4`}
            >
              {busy === 'import' ? copy.working : copy.importAction}
            </button>
          </form>
          {review.map((item) => (
            <form
              key={item.id}
              className="mt-6 border border-band-2 p-5"
              onSubmit={(event) => {
                event.preventDefault()
                const form = new FormData(event.currentTarget)
                const submitter = (event.nativeEvent as SubmitEvent)
                  .submitter as HTMLButtonElement | null
                change(
                  item.id,
                  `/api/account/projects/claims/${item.id}`,
                  'PATCH',
                  { decision: submitter?.value, note: form.get('note') },
                  copy.success,
                )
              }}
            >
              <h3 className="font-semibold">{item.projectName}</h3>
              <p className="mt-1 break-all text-sm text-ink-dim">
                {item.name} · {copy.email}: {item.email}
              </p>
              <p className="mt-3 whitespace-pre-wrap text-sm text-ink-dim">
                {item.message}
              </p>
              <label className="mt-4 block text-sm font-semibold">
                {copy.note}
                <textarea
                  name="note"
                  required
                  minLength={10}
                  maxLength={2000}
                  rows={2}
                  className={field}
                />
              </label>
              <div className="mt-4 flex flex-wrap gap-4">
                {(item.status === 'verified'
                  ? ['revoke']
                  : ['approve', 'reject']
                ).map((decision) => (
                  <button
                    key={decision}
                    type="submit"
                    name="decision"
                    value={decision}
                    disabled={
                      busy !== null ||
                      (decision === 'approve' && !item.emailVerified)
                    }
                    className={button}
                  >
                    {busy === item.id
                      ? copy.working
                      : copy[decision as 'approve' | 'reject' | 'revoke']}
                  </button>
                ))}
              </div>
            </form>
          ))}
        </section>
      )}
    </div>
  )
}
