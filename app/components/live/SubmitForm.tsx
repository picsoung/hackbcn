'use client'

import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { btnPrimary, card, input } from './ui'

type Errors = Record<string, string>

function Field({
  name,
  label,
  errors,
  type = 'text',
  hint,
  placeholder,
  optional,
  autoComplete,
  maxLength,
}: {
  name: string
  label: string
  errors: Errors
  type?: string
  hint?: string
  placeholder?: string
  optional?: boolean
  autoComplete?: string
  maxLength?: number
}) {
  const id = `f-${name}`
  return (
    <div className="mb-5">
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-semibold text-screen"
      >
        {label}{' '}
        {optional && (
          <span className="font-normal text-screen-dim">optional</span>
        )}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required={!optional}
        placeholder={placeholder}
        autoComplete={autoComplete}
        maxLength={maxLength}
        aria-invalid={errors[name] ? true : undefined}
        aria-describedby={`e-${name}${hint ? ` h-${name}` : ''}`}
        className={input}
      />
      {hint && (
        <p id={`h-${name}`} className="mt-1 text-xs text-screen-dim">
          {hint}
        </p>
      )}
      <p id={`e-${name}`} className="mt-1 text-sm text-neon-pink">
        {errors[name]}
      </p>
    </div>
  )
}

export default function SubmitForm({
  eventSlug,
  wallBase,
}: {
  eventSlug: string
  wallBase: string
}) {
  const router = useRouter()
  const [errors, setErrors] = useState<Errors>({})
  const [busy, setBusy] = useState(false)
  const [chars, setChars] = useState(0)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    setErrors({})
    setBusy(true)
    const fd = new FormData(form)
    const body: Record<string, unknown> = Object.fromEntries(fd.entries())
    body.shareConsent = fd.get('shareConsent') === 'on'

    let data: { slug?: string | null; errors?: Errors } = {}
    let ok = false
    try {
      const res = await fetch(`/api/live/${eventSlug}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      ok = res.ok
      data = await res.json().catch(() => ({}))
    } catch {}

    if (ok) {
      router.push(
        data.slug
          ? `${wallBase}/${encodeURIComponent(data.slug)}?new=1`
          : wallBase,
      )
      return
    }
    setBusy(false)
    const errs = data.errors ?? { form: 'Something went wrong. Try again.' }
    setErrors(errs)
    const first = Object.keys(errs).find((k) => form.elements.namedItem(k))
    ;(first ? (form.elements.namedItem(first) as HTMLElement) : null)?.focus()
  }

  return (
    <form onSubmit={onSubmit} noValidate className={card}>
      <fieldset className="mb-6">
        <legend className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-neon-cyan">
          The project
        </legend>
        <Field
          name="name"
          label="Project name"
          placeholder="e.g. RouteRadar"
          maxLength={80}
          errors={errors}
        />
        <div className="mb-5">
          <label
            htmlFor="f-tagline"
            className="mb-1.5 block text-sm font-semibold text-screen"
          >
            What does it do?
          </label>
          <textarea
            id="f-tagline"
            name="tagline"
            required
            maxLength={280}
            rows={3}
            onChange={(e) => setChars(e.target.value.length)}
            placeholder="One or two sentences. Jev uses this to categorize your project."
            aria-invalid={errors.tagline ? true : undefined}
            aria-describedby="h-tagline e-tagline"
            className={input}
          />
          <p id="h-tagline" className="mt-1 text-xs text-screen-dim">
            {chars}/280
          </p>
          <p id="e-tagline" className="mt-1 text-sm text-neon-pink">
            {errors.tagline}
          </p>
        </div>
        <Field
          name="url"
          type="url"
          label="Project link"
          placeholder="https://…lovable.app"
          hint="Live demo, repo or Lovable link."
          errors={errors}
        />
        <Field
          name="videoUrl"
          type="url"
          label="Demo video"
          optional
          placeholder="YouTube, Loom or Vimeo link"
          hint="A 30 second video gets far more votes than a link alone."
          errors={errors}
        />
      </fieldset>
      <fieldset className="mb-6">
        <legend className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-neon-cyan">
          You
        </legend>
        <Field
          name="creatorName"
          label="Your name"
          autoComplete="name"
          maxLength={80}
          errors={errors}
        />
        <Field
          name="creatorEmail"
          type="email"
          label="Email"
          autoComplete="email"
          hint="Only organisers see this. Never shown publicly."
          errors={errors}
        />
        <Field
          name="linkedinUrl"
          type="url"
          label="LinkedIn profile"
          placeholder="https://linkedin.com/in/…"
          hint="Shown on your project page so people can connect."
          errors={errors}
        />
      </fieldset>
      <label className="mb-6 flex cursor-pointer items-start gap-3 text-sm text-screen">
        <input
          type="checkbox"
          name="shareConsent"
          className="mt-1 h-4 w-4 accent-neon-pink"
        />
        <span>
          HackBarna can feature my project, name and video on the hackbarna.com
          website and socials.
        </span>
      </label>
      {/* Honeypot */}
      <div aria-hidden="true" className="absolute -left-[9999px]">
        <label>
          Leave empty <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <p role="alert" className="mb-3 text-sm text-neon-pink">
        {errors.form}
      </p>
      <button type="submit" disabled={busy} className={`${btnPrimary} w-full`}>
        {busy
          ? 'Submitting… Jev is reading your pitch'
          : 'Submit and get my share link'}
      </button>
    </form>
  )
}
