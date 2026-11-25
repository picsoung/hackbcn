'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Pencil, Eye, EyeOff, FolderOpen } from 'lucide-react'
import { projectManagementCopy } from '@/data/project-management'
import { accountWorkspaceCopy } from '@/data/account-workspace'
import { projectReference } from '@/lib/projects/ownership'
import type { accountProjects } from '@/lib/projects/ownership-store'

type AccountData = Awaited<ReturnType<typeof accountProjects>>
export const accountButton =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-pixel bg-accent px-5 py-2.5 text-sm font-semibold text-ground transition-colors hover:bg-inversion disabled:cursor-wait disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent'
export const accountSecondary =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-pixel border border-ink/40 px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-ink/10 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent'
export const accountField =
  'mt-2 block min-h-11 w-full min-w-0 rounded-pixel border border-ink/40 bg-ground-raised px-3 py-2.5 font-normal text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-60'

export default function ProjectManagement({
  data,
  locale,
  initialProject = '',
  emailVerified,
}: {
  data: AccountData
  locale: string
  initialProject?: string
  emailVerified: boolean
}) {
  const router = useRouter(),
    copy = projectManagementCopy(locale),
    ui = accountWorkspaceCopy(locale)
  const [busy, setBusy] = useState<string | null>(null),
    [status, setStatus] = useState(''),
    [failed, setFailed] = useState(false),
    [confirmHide, setConfirmHide] = useState<string | null>(null)
  const visibilityButtons = useRef<Record<string, HTMLButtonElement | null>>({})
  const focusAfterChange = useRef<string | null>(null)
  useEffect(() => {
    if (busy === null && focusAfterChange.current) {
      visibilityButtons.current[focusAfterChange.current]?.focus()
      focusAfterChange.current = null
    }
  }, [busy])
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
      setStatus(result.status === 'verified' ? copy.claimed : success)
      setConfirmHide(null)
      router.refresh()
    } catch (error) {
      setFailed(true)
      setStatus(error instanceof Error ? error.message : copy.error)
    } finally {
      if (id !== 'claim') focusAfterChange.current = id
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
  const requests = data.claims.filter((claim) => claim.status !== 'verified')
  return (
    <div className="mt-7">
      <p
        role={failed ? 'alert' : 'status'}
        aria-live="polite"
        className={`${status ? 'mb-5' : 'sr-only'} text-sm ${failed ? 'text-red-300' : 'text-ink'}`}
      >
        {status}
      </p>
      {!emailVerified && (
        <p className="mb-6 border border-ink/20 p-4 text-sm text-ink-dim">
          {copy.verifyEmail}
        </p>
      )}
      {data.projects.length ? (
        <div className="border-t border-ink/15">
          {data.projects.map(
            ({ project, visibility, revision, editStatus }) => (
              <article
                key={project.key}
                className="border-b border-ink/15 py-6 sm:py-7"
              >
                <div className="flex items-start gap-4 sm:gap-6">
                  <div className="hidden h-20 w-28 shrink-0 items-center justify-center overflow-hidden rounded-pixel bg-band-2 sm:flex">
                    {project.image || project.eventImage ? (
                      <Image
                        unoptimized
                        width={112}
                        height={80}
                        src={project.image || project.eventImage!}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <FolderOpen
                        aria-hidden="true"
                        className="h-7 w-7 text-ink-dim"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs leading-relaxed text-ink-dim">
                      {project.eventName}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-2">
                      <h2 className="min-w-0 break-words text-xl font-semibold">
                        {project.name}
                      </h2>
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs ${visibility === 'private' ? 'text-ink-dim' : 'text-accent-alt'}`}
                      >
                        {visibility === 'private' ? (
                          <EyeOff size={14} aria-hidden="true" />
                        ) : (
                          <Eye size={14} aria-hidden="true" />
                        )}
                        {copy[visibility]}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-2 max-w-2xl text-sm leading-relaxed text-ink-dim">
                      {project.description}
                    </p>
                    {editStatus && editStatus !== 'approved' && (
                      <p className="mt-2 text-xs text-accent">
                        {ui[editStatus]}
                      </p>
                    )}
                    <div className="mt-4 flex flex-wrap items-center gap-2 sm:gap-3">
                      <Link
                        href={`/${locale}/account/projects/edit?project=${encodeURIComponent(project.key)}`}
                        className={accountButton}
                      >
                        <Pencil size={15} aria-hidden="true" />
                        {ui.edit}
                      </Link>
                      <button
                        type="button"
                        ref={(node) => {
                          visibilityButtons.current[project.key] = node
                        }}
                        aria-expanded={
                          visibility === 'public'
                            ? confirmHide === project.key
                            : undefined
                        }
                        aria-controls={
                          confirmHide === project.key
                            ? `hide-${project.key}`
                            : undefined
                        }
                        disabled={busy !== null || !emailVerified}
                        className={accountSecondary}
                        onClick={() =>
                          visibility === 'public'
                            ? setConfirmHide(project.key)
                            : change(
                                project.key,
                                '/api/account/projects/visibility',
                                'PATCH',
                                {
                                  project: project.key,
                                  visibility: 'public',
                                  revision,
                                },
                                copy.success,
                              )
                        }
                      >
                        {visibility === 'public' ? (
                          <EyeOff size={15} aria-hidden="true" />
                        ) : (
                          <Eye size={15} aria-hidden="true" />
                        )}
                        {busy === project.key
                          ? copy.working
                          : visibility === 'public'
                            ? copy.hide
                            : copy.show}
                      </button>
                      {visibility === 'public' && (
                        <Link
                          href={project.href}
                          className="inline-flex min-h-11 items-center px-2 text-sm text-ink-dim underline underline-offset-4 hover:text-ink"
                        >
                          {copy.view}
                        </Link>
                      )}
                    </div>
                    {confirmHide === project.key && (
                      <div
                        id={`hide-${project.key}`}
                        className="mt-4 max-w-xl border border-ink/20 bg-ground-raised p-4"
                      >
                        <p className="text-sm leading-relaxed text-ink-dim">
                          {ui.hideHelp}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-3">
                          <button
                            type="button"
                            disabled={busy !== null}
                            className={accountSecondary}
                            onClick={() =>
                              change(
                                project.key,
                                '/api/account/projects/visibility',
                                'PATCH',
                                {
                                  project: project.key,
                                  visibility: 'private',
                                  revision,
                                },
                                copy.success,
                              )
                            }
                          >
                            {busy === project.key
                              ? copy.working
                              : ui.hideConfirm}
                          </button>
                          <button
                            type="button"
                            disabled={busy !== null}
                            className={accountSecondary}
                            onClick={() => {
                              setConfirmHide(null)
                              visibilityButtons.current[project.key]?.focus()
                            }}
                          >
                            {ui.cancel}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ),
          )}
          <p className="mt-4 max-w-2xl text-xs leading-relaxed text-ink-dim">
            {ui.visibilityHelp} {ui.teamHelp}
          </p>
        </div>
      ) : (
        <div className="border-y border-ink/15 py-9">
          <FolderOpen className="mb-4 h-8 w-8 text-accent" aria-hidden="true" />
          <h2 className="text-xl font-semibold">{ui.emptyTitle}</h2>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-ink-dim">
            {ui.emptyHelp}
          </p>
        </div>
      )}
      {data.available.length > 0 && (
        <section className="mt-9" aria-labelledby="available-title">
          <h2 id="available-title" className="text-lg font-semibold">
            {copy.availableTitle}
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-dim">
            {copy.availableHelp}
          </p>
          <ul className="mt-3 divide-y divide-ink/15">
            {data.available.map((project) => (
              <li
                key={project.key}
                className="flex flex-wrap items-center justify-between gap-4 py-4"
              >
                <div>
                  <h3 className="font-semibold">{project.name}</h3>
                  <p className="mt-1 text-sm text-ink-dim">
                    {project.eventName}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={busy !== null || !emailVerified}
                  className={accountSecondary}
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
      <details
        key={initialProject}
        open={
          !!initialProject &&
          !data.projects.some((item) => item.project.key === initialProject)
        }
        className="group mt-9 border-y border-ink/15 py-2"
      >
        <summary className="cursor-pointer py-3 text-sm font-semibold text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent">
          {ui.claim}
        </summary>
        <div className="pb-6 pt-2">
          <p
            id="claim-help"
            className="max-w-xl text-sm leading-relaxed text-ink-dim"
          >
            {copy.claimHelp}
          </p>
          <form onSubmit={claim} className="mt-5 max-w-xl space-y-5">
            <label className="block text-sm font-medium">
              {copy.projectLabel}
              <input
                type="url"
                name="project"
                required
                maxLength={1000}
                defaultValue={projectInput}
                placeholder={`https://www.hackbarna.com/${locale}/projects/…`}
                aria-describedby="claim-help"
                className={accountField}
              />
            </label>
            <label className="block text-sm font-medium">
              {copy.messageLabel}
              <textarea
                name="message"
                required
                maxLength={2000}
                rows={3}
                className={accountField}
              />
            </label>
            <button
              type="submit"
              disabled={busy !== null || !emailVerified}
              className={accountButton}
            >
              {busy === 'claim' ? copy.working : copy.submit}
            </button>
          </form>
        </div>
      </details>
      {requests.length > 0 && (
        <section className="mt-8" aria-labelledby="requests-title">
          <h2 id="requests-title" className="text-lg font-semibold">
            {copy.yourRequests}
          </h2>
          <ul className="mt-3 divide-y divide-ink/15">
            {requests.map((item) => (
              <li key={item.id} className="py-3">
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
    </div>
  )
}
