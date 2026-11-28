'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { accountMediaCopy } from '@/data/account-media'
import { accountWorkspaceCopy } from '@/data/account-workspace'
import { projectManagementCopy } from '@/data/project-management'
import {
  accountButton,
  accountSecondary,
  accountField,
} from './ProjectManagement'
import type { projectEditsForReview } from '@/lib/projects/edit-store'

export default function ProjectEditReview({
  edits,
  locale,
  selectedProject = '',
}: {
  edits: Awaited<ReturnType<typeof projectEditsForReview>>
  locale: string
  selectedProject?: string
}) {
  const ui = accountWorkspaceCopy(locale),
    copy = projectManagementCopy(locale),
    media = accountMediaCopy(locale),
    router = useRouter()
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState(''),
    [failed, setFailed] = useState(false)
  async function decide(
    event: FormEvent<HTMLFormElement>,
    key: string,
    revision: number,
  ) {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    setFailed(false)
    const form = new FormData(event.currentTarget),
      submitter = (event.nativeEvent as SubmitEvent)
        .submitter as HTMLButtonElement | null
    try {
      const response = await fetch('/api/account/projects/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project: key,
          revision,
          decision: submitter?.value,
          note: form.get('note'),
        }),
      })
      if (!response.ok) {
        const result = await response.json()
        throw new Error(
          result.error === 'conflict'
            ? copy.conflict
            : result.error === 'invalid'
              ? media.reviewFeedbackError
              : copy.error,
        )
      }
      setMessage(copy.success)
      router.refresh()
    } catch (error) {
      setFailed(true)
      setMessage(error instanceof Error ? error.message : copy.error)
    } finally {
      setBusy(false)
    }
  }
  return (
    <section
      id="project-review"
      aria-labelledby="edit-review-title"
      className="scroll-mt-24"
    >
      <h2 id="edit-review-title" className="text-2xl font-semibold">
        {ui.reviewEdits} ({edits.length})
      </h2>
      <p
        role={failed ? 'alert' : 'status'}
        className="mt-3 text-sm text-ink-dim"
      >
        {message}
      </p>
      {!edits.length && (
        <p className="mt-3 text-sm text-ink-dim">{ui.reviewEmpty}</p>
      )}
      {edits.map((edit) => (
        <details
          key={`${edit.key}:${edit.revision}`}
          open={edit.key === selectedProject}
          className="mt-4 border-y border-ink/15"
        >
          <summary className="cursor-pointer py-5 font-semibold">
            {edit.name}
            <span className="mt-1 block text-sm font-normal text-ink-dim">
              {edit.eventName}
            </span>
          </summary>
          <form
            onSubmit={(event) => decide(event, edit.key, edit.revision)}
            className="pb-6"
          >
            <div className="grid gap-6 sm:grid-cols-2">
              {(['current', 'proposed'] as const).map((version) => (
                <div key={version}>
                  <h3 className="mb-4 text-sm font-semibold">
                    {version === 'current' ? ui.current : ui.submitted}
                  </h3>
                  <p className="mb-2 text-xs text-ink-dim">
                    {media.projectPicture}
                  </p>
                  {edit[version].image ? (
                    <Image
                      unoptimized
                      src={edit[version].image}
                      width={640}
                      height={400}
                      alt={media.projectPicture}
                      className="mb-5 aspect-video w-full object-contain"
                    />
                  ) : (
                    <p className="mb-5 text-sm text-ink-dim">
                      {media.noPicture}
                    </p>
                  )}
                  <dl className="space-y-4">
                    {(['name', 'description', 'website', 'video'] as const).map(
                      (field) => (
                        <div key={field}>
                          <dt className="text-xs text-ink-dim">{ui[field]}</dt>
                          <dd className="mt-1 whitespace-pre-wrap break-words text-sm">
                            {edit[version][field] || ui.optional}
                          </dd>
                        </div>
                      ),
                    )}
                  </dl>
                </div>
              ))}
            </div>
            <label className="mt-5 block text-sm font-medium">
              {media.reviewNote}
              <textarea
                name="note"
                maxLength={2000}
                rows={2}
                aria-describedby={`review-note-${encodeURIComponent(edit.key)}`}
                className={accountField}
              />
            </label>
            <p
              id={`review-note-${encodeURIComponent(edit.key)}`}
              className="mt-2 max-w-2xl text-xs leading-relaxed text-ink-dim"
            >
              {media.reviewNoteHelp}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                name="decision"
                value="approve"
                type="submit"
                disabled={busy}
                className={accountButton}
              >
                {ui.publish}
              </button>
              <button
                name="decision"
                value="reject"
                type="submit"
                disabled={busy}
                className={accountSecondary}
              >
                {ui.rejectEdit}
              </button>
            </div>
          </form>
        </details>
      ))}
    </section>
  )
}
