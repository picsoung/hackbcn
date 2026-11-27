'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { organiserCopy } from '@/data/organiser'
import { accountWorkspaceCopy } from '@/data/account-workspace'
import { projectManagementCopy } from '@/data/project-management'
import { accountSecondary } from './account-styles'
import type { projectEditor } from '@/lib/projects/edit-store'

export default function AdminProjectVisibility({
  data,
  locale,
}: {
  data: Awaited<ReturnType<typeof projectEditor>>
  locale: string
}) {
  const [visibility, setVisibility] = useState(data.visibility),
    [revision, setRevision] = useState(data.visibilityRevision),
    [confirm, setConfirm] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('')
  const copy = organiserCopy(locale),
    ui = accountWorkspaceCopy(locale),
    management = projectManagementCopy(locale),
    router = useRouter()
  async function change() {
    setBusy(true)
    setError('')
    try {
      const response = await fetch('/api/account/projects/visibility', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project: data.project.key,
          visibility: visibility === 'public' ? 'private' : 'public',
          revision,
        }),
      })
      const result = await response.json()
      if (!response.ok)
        throw Error(
          result.error === 'conflict' ? management.conflict : management.error,
        )
      setVisibility(result.visibility)
      setRevision(result.revision)
      setConfirm(false)
      router.refresh()
    } catch (error) {
      setError(error instanceof Error ? error.message : management.error)
    } finally {
      setBusy(false)
    }
  }
  return (
    <section className="mt-12 max-w-2xl border-t border-ink/15 pt-6">
      <h2 className="text-xl font-semibold">{copy.visibility}</h2>
      <p className="mt-3 text-sm text-ink-dim" role="status">
        {copy[visibility]} · {ui.visibilityHelp}
      </p>
      {confirm ? (
        <div className="mt-4">
          <p className="mb-3 max-w-prose text-sm">{ui.hideHelp}</p>
          <div className="flex flex-wrap gap-3">
            <button
              autoFocus
              className={accountSecondary}
              disabled={busy}
              onClick={change}
            >
              {busy ? ui.saving : ui.hideConfirm}
            </button>
            <button
              className={accountSecondary}
              disabled={busy}
              onClick={() => setConfirm(false)}
            >
              {ui.cancel}
            </button>
          </div>
        </div>
      ) : (
        <button
          className={`${accountSecondary} mt-4`}
          disabled={busy}
          onClick={() =>
            visibility === 'public' ? setConfirm(true) : change()
          }
        >
          {busy ? ui.saving : visibility === 'public' ? copy.hide : copy.show}
        </button>
      )}
      {error && (
        <p role="alert" className="mt-4 text-sm text-red-300">
          {error}
        </p>
      )}
    </section>
  )
}
