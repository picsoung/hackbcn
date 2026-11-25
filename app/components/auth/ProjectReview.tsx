'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { projectManagementCopy } from '@/data/project-management'
import type { organiserProjectClaims } from '@/lib/projects/ownership-store'

type ReviewData = Awaited<ReturnType<typeof organiserProjectClaims>>
import {
  accountButton as button,
  accountField as field,
  accountSecondary,
} from './ProjectManagement'

export default function ProjectReview({
  review,
  locale,
}: {
  review: ReviewData
  locale: string
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
  return (
    <div>
      <p
        role={failed ? 'alert' : 'status'}
        className="my-4 text-sm text-ink-dim"
      >
        {status}
      </p>
      {
        <section
          id="ownership-review"
          className="mt-10 scroll-mt-24"
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
          {review.map((item) => (
            <details
              key={item.id}
              open={item.status === 'pending'}
              className="mt-5 border-y border-ink/15"
            >
              <summary className="cursor-pointer py-4 font-semibold">
                {item.projectName}
                <span className="mt-1 block text-sm font-normal text-ink-dim">
                  {item.name} · {copy[item.status]}
                </span>
              </summary>
              <form
                className="pb-5"
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
                      className={
                        decision === 'revoke' ? accountSecondary : button
                      }
                    >
                      {busy === item.id
                        ? copy.working
                        : copy[decision as 'approve' | 'reject' | 'revoke']}
                    </button>
                  ))}
                </div>
              </form>
            </details>
          ))}
          <details className="mt-10 border-t border-ink/15 pt-5">
            <summary className="min-h-11 cursor-pointer text-sm font-semibold">
              {copy.importTitle}
            </summary>{' '}
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
          </details>
        </section>
      }
    </div>
  )
}
