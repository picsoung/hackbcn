'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ImageUpload from './ImageUpload'
import { accountMediaCopy } from '@/data/account-media'
import { accountWorkspaceCopy } from '@/data/account-workspace'
import { projectManagementCopy } from '@/data/project-management'
import {
  accountButton,
  accountSecondary,
  accountField,
} from './ProjectManagement'
import type { projectEditor } from '@/lib/projects/edit-store'
import { organiserCopy } from '@/data/organiser'
import AdminProjectVisibility from './AdminProjectVisibility'
import CreatorPrivacyControls from './CreatorPrivacyControls'
import { privacyCopy } from '@/data/privacy-controls'

export default function ProjectEditor({
  data,
  locale,
}: {
  data: Awaited<ReturnType<typeof projectEditor>>
  locale: string
}) {
  const ui = accountWorkspaceCopy(locale),
    copy = projectManagementCopy(locale),
    media = accountMediaCopy(locale),
    router = useRouter()
  const admin = organiserCopy(locale),
    back = data.organiser
      ? `/${locale}/account/admin`
      : `/${locale}/account/projects`
  const [content, setContent] = useState(data.content),
    [revision, setRevision] = useState(data.revision),
    [busy, setBusy] = useState(false),
    [uploading, setUploading] = useState(false),
    [message, setMessage] = useState(''),
    [failed, setFailed] = useState(false),
    [saved, setSaved] = useState(data.content)
  const dirty = JSON.stringify(content) !== JSON.stringify(saved)
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    setFailed(false)
    try {
      const response = await fetch('/api/account/projects/content', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project: data.project.key, revision, content }),
      })
      const result = await response.json()
      if (!response.ok)
        throw new Error(
          result.error === 'conflict'
            ? copy.conflict
            : result.error === 'invalid'
              ? copy.invalid
              : result.error === 'forbidden'
                ? copy.forbidden
                : copy.error,
        )
      setRevision(result.revision)
      setSaved(content)
      setMessage(data.organiser ? admin.saved : ui.saved)
      router.refresh()
    } catch (error) {
      setFailed(true)
      setMessage(error instanceof Error ? error.message : copy.error)
    } finally {
      setBusy(false)
    }
  }
  return (
    <>
      <Link
        href={back}
        className="inline-flex min-h-11 items-center text-sm text-ink-dim underline underline-offset-4 hover:text-ink"
      >
        {data.organiser ? admin.back : ui.back}
      </Link>
      <header className="mb-8 mt-4">
        <p className="text-sm text-ink-dim">{data.project.eventName}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">{ui.edit}</h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-dim">
          {data.organiser ? admin.projectHelp : ui.editHelp}
        </p>
      </header>
      <form onSubmit={save} className="max-w-2xl border-t border-ink/15 pt-7">
        {data.status && !data.organiser && (
          <p className="mb-5 text-sm font-medium text-accent">
            {ui[data.status]}
          </p>
        )}
        {data.status === 'pending' && !data.organiser && (
          <p className="mb-5 max-w-xl text-sm leading-relaxed text-ink-dim">
            {media.pendingHelp}
          </p>
        )}
        {data.status === 'rejected' && data.reviewNote && (
          <div className="mb-6 border border-ink/20 bg-ground-raised p-4">
            <h2 className="text-sm font-semibold">{media.feedback}</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink-dim">
              {data.reviewNote}
            </p>
          </div>
        )}
        <div className="space-y-6">
          <label className="block text-sm font-medium">
            {ui.name}
            <input
              name="name"
              required
              maxLength={160}
              disabled={busy || uploading}
              value={content.name}
              onChange={(e) => {
                setContent({ ...content, name: e.target.value })
                setMessage('')
              }}
              className={accountField}
            />
          </label>
          <label className="block text-sm font-medium">
            {ui.description}
            <textarea
              name="description"
              required
              rows={5}
              maxLength={2000}
              disabled={busy || uploading}
              value={content.description}
              onChange={(e) => {
                setContent({ ...content, description: e.target.value })
                setMessage('')
              }}
              className={`${accountField} leading-relaxed`}
            />
          </label>
          <fieldset className="border-t border-ink/15 pt-6">
            <legend className="pr-4 text-base font-semibold">
              {media.projectPicture}
            </legend>
            <ImageUpload
              value={content.image ?? ''}
              purpose="project"
              project={data.project.key}
              locale={locale}
              disabled={busy}
              onBusyChange={setUploading}
              onChange={(image) => {
                setContent({ ...content, image })
                setMessage('')
              }}
            />
          </fieldset>
          <fieldset className="border-t border-ink/15 pt-6">
            <legend className="pr-4 text-base font-semibold">
              {ui.projectLinks}
            </legend>
            <div className="grid gap-6 sm:grid-cols-2">
              {(['website', 'video'] as const).map((key) => (
                <label key={key} className="block text-sm font-medium">
                  {ui[key]}{' '}
                  <span className="font-normal text-ink-dim">
                    ({ui.optional})
                  </span>
                  <input
                    name={key}
                    type="url"
                    maxLength={2048}
                    disabled={busy || uploading}
                    value={content[key]}
                    placeholder="https://"
                    onChange={(e) => {
                      setContent({ ...content, [key]: e.target.value })
                      setMessage('')
                    }}
                    className={accountField}
                  />
                </label>
              ))}
            </div>
          </fieldset>
        </div>
        {!data.organiser && (
          <details className="mt-7 border-y border-ink/15 py-1">
            <summary className="cursor-pointer py-3 text-sm font-medium text-ink-dim">
              {media.reviewTitle}
            </summary>
            <div
              id="review-help"
              className="max-w-xl space-y-3 pb-4 text-sm leading-relaxed text-ink-dim"
            >
              <p>{media.reviewDetails}</p>
              <p>{media.visibilityDetails}</p>
            </div>
          </details>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={busy || uploading || !dirty}
            className={accountButton}
          >
            {busy ? ui.saving : data.organiser ? admin.save : ui.save}
          </button>
          <Link href={back} className={accountSecondary}>
            {ui.cancel}
          </Link>
        </div>
        <p
          role={failed ? 'alert' : 'status'}
          aria-live="polite"
          className={`mt-5 text-sm leading-relaxed ${failed ? 'text-red-300' : 'text-ink'}`}
        >
          {message}
        </p>
      </form>
      <AdminProjectVisibility data={data} locale={locale} />
      <CreatorPrivacyControls
        initial={data.privacyOptions.project}
        locale={locale}
      />
      <details className="mt-8 max-w-2xl border-t border-ink/15 pt-5">
        <summary className="min-h-11 cursor-pointer text-base font-semibold">
          {privacyCopy(locale).individual} ({data.privacyOptions.credits.length}
          )
        </summary>
        <p className="mt-2 text-sm leading-relaxed text-ink-dim">
          {privacyCopy(locale).individualHelp}
        </p>
        {data.privacyOptions.credits.map((credit) => (
          <CreatorPrivacyControls
            key={credit.setting.subjectKey}
            initial={credit.setting}
            locale={locale}
            name={credit.name}
          />
        ))}
      </details>
    </>
  )
}
