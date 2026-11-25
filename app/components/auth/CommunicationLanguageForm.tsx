'use client'
import { useState } from 'react'
import type {
  CommunicationPreferences,
  CommunicationLanguage,
} from '@/lib/account/communications'
import { accountCommunicationCopy } from '@/data/account-communications'
import { accountButton, accountField } from './ProjectManagement'

export default function CommunicationLanguageForm({
  initial,
  locale,
}: {
  initial: CommunicationPreferences
  locale: string
}) {
  const [preferences, setPreferences] = useState(initial),
    [language, setLanguage] = useState<CommunicationLanguage>(
      initial.communicationLanguage,
    )
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState(''),
    [failed, setFailed] = useState(false)
  const copy = accountCommunicationCopy(locale)
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    setFailed(false)
    try {
      const response = await fetch('/api/account/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          communicationLanguage: language,
          revision: preferences.revision,
        }),
      })
      const body = await response.json()
      if (!response.ok) {
        setFailed(true)
        setMessage(response.status === 409 ? copy.conflict : copy.error)
        return
      }
      setPreferences(body.preferences)
      setMessage(
        body.preferences.contactSync === 'pending' ? copy.pending : copy.saved,
      )
    } catch {
      setFailed(true)
      setMessage(copy.error)
    } finally {
      setBusy(false)
    }
  }
  return (
    <section
      id="communication"
      aria-labelledby="communication-title"
      className="mt-10 scroll-mt-24 border-t border-ink/15 pt-7"
    >
      <h2 id="communication-title" className="text-2xl font-semibold">
        {copy.title}
      </h2>
      <p
        id="communication-help"
        className="mt-2 max-w-prose text-sm leading-relaxed text-ink-dim"
      >
        {copy.help}
      </p>
      <form onSubmit={save} className="mt-5 max-w-xl">
        <label htmlFor="communication-language" className="sr-only">
          {copy.title}
        </label>
        <select
          id="communication-language"
          aria-describedby="communication-help"
          className={accountField}
          disabled={busy}
          value={language ?? 'all'}
          onChange={(event) => {
            setLanguage(
              event.target.value === 'all'
                ? null
                : (event.target.value as CommunicationLanguage),
            )
            setMessage('')
          }}
        >
          <option value="all">{copy.all}</option>
          <option value="en">English</option>
          <option value="es">Castellano</option>
          <option value="ca">Català</option>
        </select>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <button type="submit" className={accountButton} disabled={busy}>
            {busy ? copy.saving : copy.save}
          </button>
          <p
            role={failed ? 'alert' : 'status'}
            aria-live="polite"
            className="text-sm text-ink-dim"
          >
            {message}
          </p>
        </div>
      </form>
    </section>
  )
}
