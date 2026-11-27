'use client'
import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { organiserCopy } from '@/data/organiser'
import { projectManagementCopy } from '@/data/project-management'
import { accountWorkspaceCopy } from '@/data/account-workspace'
import { accountButton } from './account-styles'

export default function AdminCreatorPrivacy({
  initial,
  locale,
}: {
  initial: { subjectKey: string; hidden: boolean; revision: number }
  locale: string
}) {
  const [hidden, setHidden] = useState(initial.hidden),
    [saved, setSaved] = useState(initial.hidden),
    [revision, setRevision] = useState(initial.revision),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(''),
    [failed, setFailed] = useState(false)
  const copy = organiserCopy(locale),
    ui = accountWorkspaceCopy(locale),
    management = projectManagementCopy(locale),
    router = useRouter(),
    builder = initial.subjectKey.startsWith('builder:')
  async function save(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    setFailed(false)
    try {
      const response = await fetch('/api/admin/creator-privacy', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectKey: initial.subjectKey,
          hidden,
          revision,
        }),
      })
      const result = await response.json()
      if (!response.ok)
        throw Error(
          result.error === 'conflict' ? management.conflict : management.error,
        )
      setRevision(result.revision)
      setSaved(result.hidden)
      setMessage(copy.saved)
      router.refresh()
    } catch (error) {
      setFailed(true)
      setMessage(error instanceof Error ? error.message : management.error)
    } finally {
      setBusy(false)
    }
  }
  return (
    <section
      className="mt-12 max-w-2xl border-t border-ink/15 pt-6"
      data-creator-privacy={builder ? 'builder' : 'project'}
    >
      <h2 className="text-xl font-semibold">
        {builder ? copy.profileVisibility : copy.creatorCredits}
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-ink-dim">
        {builder ? copy.builderPrivacyHelp : copy.creditsHelp}
      </p>
      <form onSubmit={save} className="mt-5">
        <label className="flex min-h-11 cursor-pointer items-start gap-3 text-sm font-medium">
          <input
            type="checkbox"
            name="hide-creators"
            checked={hidden}
            disabled={busy}
            onChange={(event) => {
              setHidden(event.target.checked)
              setMessage('')
            }}
            className="mt-0.5 h-5 w-5 shrink-0 accent-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          />
          <span>{builder ? copy.hideBuilder : copy.hideCredits}</span>
        </label>
        <p className="mt-2 text-sm leading-relaxed text-ink-dim">
          {copy.privacyPrecedence}
        </p>
        <button
          type="submit"
          disabled={busy || hidden === saved}
          className={`${accountButton} mt-5`}
        >
          {busy ? ui.saving : copy.save}
        </button>
        <p
          role={failed ? 'alert' : 'status'}
          aria-live="polite"
          className={`mt-4 text-sm ${failed ? 'text-red-300' : 'text-ink-dim'}`}
        >
          {message}
        </p>
      </form>
      <p className="mt-4 text-sm leading-relaxed text-ink-dim">
        {copy.privacyScope}
      </p>
    </section>
  )
}
