'use client'
import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { organiserCopy } from '@/data/organiser'
import { privacyCopy } from '@/data/privacy-controls'
import { projectManagementCopy } from '@/data/project-management'
import { accountWorkspaceCopy } from '@/data/account-workspace'
import {
  PRIVACY_FIELDS,
  type PrivacySetting,
} from '@/lib/projects/privacy-model'
import { accountButton } from './account-styles'

export default function CreatorPrivacyControls({
  initial,
  locale,
  name,
}: {
  initial: PrivacySetting
  locale: string
  name?: string
}) {
  const initialFields = PRIVACY_FIELDS.filter((field) =>
    initial.hiddenFields?.includes(field),
  )
  const [hidden, setHidden] = useState(initial.hidden),
    [fields, setFields] = useState(initialFields),
    [saved, setSaved] = useState({
      hidden: initial.hidden,
      fields: initialFields,
    }),
    [revision, setRevision] = useState(initial.revision),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(''),
    [failed, setFailed] = useState(false)
  const copy = privacyCopy(locale),
    ui = accountWorkspaceCopy(locale),
    management = projectManagementCopy(locale),
    router = useRouter()
  const scope = initial.subjectKey.startsWith('builder:')
    ? 'builder'
    : initial.subjectKey.startsWith('credit:')
      ? 'credit'
      : 'project'
  const Heading = scope === 'credit' ? 'h3' : 'h2'
  const dirty =
    hidden !== saved.hidden || fields.join(',') !== saved.fields.join(',')
  async function save(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    setFailed(false)
    try {
      const response = await fetch('/api/account/privacy', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectKey: initial.subjectKey,
          hidden,
          hiddenFields: fields,
          revision,
        }),
      })
      const result = await response.json()
      if (!response.ok)
        throw Error(
          result.error === 'conflict'
            ? management.conflict
            : result.error === 'forbidden'
              ? management.forbidden
              : management.error,
        )
      setRevision(result.revision)
      setSaved({ hidden: result.hidden, fields: result.hiddenFields })
      setMessage(copy.saved)
      router.refresh()
    } catch (error) {
      setFailed(true)
      setMessage(error instanceof Error ? error.message : management.error)
    } finally {
      setBusy(false)
    }
  }
  const checkbox =
    'mt-0.5 h-5 w-5 shrink-0 accent-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'
  return (
    <section
      className={`${scope === 'credit' ? 'mt-6' : 'mt-12'} max-w-2xl border-t border-ink/15 pt-6`}
      data-creator-privacy={scope}
    >
      <Heading
        className={
          scope === 'credit'
            ? 'text-base font-semibold'
            : 'text-xl font-semibold'
        }
      >
        {copy[scope]}
        {name ? `: ${name}` : ''}
      </Heading>
      <p className="mt-3 text-sm leading-relaxed text-ink-dim">
        {scope === 'builder'
          ? copy.builderHelp
          : scope === 'credit'
            ? copy.creditHelp
            : copy.projectHelp}
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
            className={checkbox}
          />
          <span>
            {scope === 'builder'
              ? copy.hideBuilder
              : scope === 'credit'
                ? copy.hideCredit
                : copy.hideProjectCreators}
          </span>
        </label>
        <fieldset className="mt-4" disabled={busy}>
          <legend className="mb-3 text-sm font-semibold">{copy.fields}</legend>
          <div className="grid gap-x-6 sm:grid-cols-2">
            {PRIVACY_FIELDS.map((field) => (
              <label
                key={field}
                className="flex min-h-11 cursor-pointer items-start gap-3 text-sm"
              >
                <input
                  type="checkbox"
                  name={`hide-${field}`}
                  checked={fields.includes(field)}
                  onChange={(event) => {
                    setFields(
                      PRIVACY_FIELDS.filter((candidate) =>
                        candidate === field
                          ? event.target.checked
                          : fields.includes(candidate),
                      ),
                    )
                    setMessage('')
                  }}
                  className={checkbox}
                />
                <span>{copy[field]}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <p className="mt-3 text-sm leading-relaxed text-ink-dim">
          {copy.precedence}
        </p>
        <button
          type="submit"
          disabled={busy || !dirty}
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
      {scope === 'project' && (
        <p className="mt-4 text-sm leading-relaxed text-ink-dim">
          {organiserCopy(locale).privacyScope}
        </p>
      )}
    </section>
  )
}
