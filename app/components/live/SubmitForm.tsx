'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, type FormEvent } from 'react'
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
  autoFocus,
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
  autoFocus?: boolean
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
        autoFocus={autoFocus}
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
  const [hackerIds, setHackerIds] = useState([0])
  const nextHackerId = useRef(1)
  const focusAfterRemove = useRef<number | null>(null)
  useEffect(() => {
    if (focusAfterRemove.current == null) return
    const index = hackerIds.indexOf(focusAfterRemove.current)
    document.getElementById(`f-hackers.${index}.name`)?.focus()
    focusAfterRemove.current = null
  }, [hackerIds])

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    setErrors({})
    setBusy(true)
    const fd = new FormData(form)
    const body: Record<string, unknown> = Object.fromEntries(fd.entries())
    body.shareConsent = fd.get('shareConsent') === 'on'
    body.hackers = hackerIds.map((_, index) => {
      const name = `hackers.${index}.name`
      const linkedinUrl = `hackers.${index}.linkedinUrl`
      delete body[name]
      delete body[linkedinUrl]
      return { name: fd.get(name), linkedinUrl: fd.get(linkedinUrl) }
    })

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
          hint="Show your project in action."
          errors={errors}
        />
      </fieldset>
      <fieldset className="mb-6">
        <legend className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-neon-cyan">
          Hackers
        </legend>
        <p className="mb-5 text-sm text-screen-dim">
          Credit everyone who built the project. Each name can link to their
          LinkedIn profile.
        </p>
        {hackerIds.map((id, index) => (
          <fieldset key={id} className="mb-6 border-b border-night-indigo pb-2">
            <legend className="mb-3 text-sm font-semibold">
              Hacker {index + 1}
            </legend>
            <Field
              name={`hackers.${index}.name`}
              label="Name"
              autoComplete={`section-hacker-${id} name`}
              maxLength={80}
              autoFocus={id > 0 && index === hackerIds.length - 1}
              errors={errors}
            />
            <Field
              name={`hackers.${index}.linkedinUrl`}
              type="url"
              label="LinkedIn profile"
              optional
              maxLength={500}
              placeholder="https://linkedin.com/in/…"
              errors={errors}
            />
            {hackerIds.length > 1 && (
              <button
                type="button"
                disabled={busy}
                aria-label={`Remove hacker ${index + 1}`}
                className="mb-3 text-sm text-screen-dim underline underline-offset-4 hover:text-screen focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
                onClick={() => {
                  const remaining = hackerIds.filter(
                    (memberId) => memberId !== id,
                  )
                  focusAfterRemove.current =
                    remaining[Math.min(index, remaining.length - 1)]
                  setHackerIds(remaining)
                  setErrors({})
                }}
              >
                Remove hacker
              </button>
            )}
          </fieldset>
        ))}
        <p role="alert" className="mb-3 text-sm text-neon-pink">
          {errors.hackers}
        </p>
        <button
          type="button"
          disabled={busy || hackerIds.length >= 20}
          className="text-sm font-semibold text-neon-cyan underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => {
            const id = nextHackerId.current++
            setHackerIds((ids) => [...ids, id])
          }}
        >
          Add another hacker
        </button>
      </fieldset>
      <fieldset className="mb-6">
        <legend className="mb-4 text-sm font-semibold">
          Organiser contact
        </legend>
        <Field
          name="creatorEmail"
          type="email"
          label="Contact email"
          autoComplete="email"
          hint="Only organisers see this. Never shown publicly."
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
        {busy ? 'Submitting… Jev is reading your pitch' : 'Publish project'}
      </button>
    </form>
  )
}
