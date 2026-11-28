'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useIntl } from '../Intl'
import ImageUpload from './ImageUpload'
import { accountMediaCopy } from '@/data/account-media'
import { accountWorkspaceCopy } from '@/data/account-workspace'
import { organiserCopy } from '@/data/organiser'
import { accountButton, accountField } from './ProjectManagement'
import {
  personalProfileLink,
  type CommunityProfile,
} from '@/lib/community/profile'

export default function CommunityProfileForm({
  initial,
  admin,
}: {
  initial: CommunityProfile
  admin?: { builder: string; version: string }
}) {
  const [profile, setProfile] = useState(initial)
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [failed, setFailed] = useState(false)
  const [version, setVersion] = useState(admin?.version)
  const intl = useIntl(),
    router = useRouter()
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    try {
      const response = await fetch(
        admin ? '/api/admin/builders' : '/api/account/profile',
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(
            admin ? { builder: admin.builder, version, profile } : profile,
          ),
        },
      )
      const result = await response.json()
      if (!response.ok) {
        setFailed(true)
        setMessage(
          intl.t(
            response.status === 409 ? 'profile.conflict' : 'profile.error',
          ),
        )
        return
      }
      setProfile(result.profile)
      if (admin) setVersion(result.version)
      setFailed(false)
      setMessage(
        admin ? organiserCopy(intl.locale).saved : intl.t('profile.saved'),
      )
      router.refresh()
    } catch {
      setFailed(true)
      setMessage(intl.t('profile.error'))
    } finally {
      setBusy(false)
    }
  }
  let githubPhoto = ''
  try {
    const link = personalProfileLink(profile.githubUrl, 'github')
    if (link) githubPhoto = link + '.png?size=160'
  } catch {}
  const ui = accountWorkspaceCopy(intl.locale),
    media = accountMediaCopy(intl.locale)
  const field = (
    key: 'displayName' | 'avatarUrl' | 'linkedinUrl' | 'githubUrl',
    placeholder?: string,
  ) => (
    <label className="block text-sm font-medium">
      {intl.t('profile.' + key)}
      <input
        id={key}
        name={key}
        type={key === 'displayName' ? 'text' : 'url'}
        maxLength={key === 'displayName' ? 120 : 2048}
        disabled={busy || uploading}
        required={key === 'displayName'}
        autoComplete={key === 'displayName' ? 'name' : 'off'}
        placeholder={placeholder}
        value={profile[key]}
        onChange={(event) => {
          setMessage('')
          setProfile({ ...profile, [key]: event.target.value })
        }}
        className={accountField}
      />
    </label>
  )
  return (
    <form onSubmit={save} className="mt-7 max-w-2xl">
      <fieldset>
        <legend className="mb-5 text-base font-semibold">
          {admin ? ui.publicProfile : ui.basics}
        </legend>
        <div className="space-y-5">
          {field('displayName')}
          <label className="block text-sm font-medium">
            {intl.t('profile.bio')}
            <textarea
              id="bio"
              name="bio"
              maxLength={600}
              rows={3}
              disabled={busy || uploading}
              value={profile.bio}
              onChange={(event) => {
                setMessage('')
                setProfile({ ...profile, bio: event.target.value })
              }}
              className={`${accountField} leading-relaxed`}
            />
          </label>
        </div>
      </fieldset>
      <fieldset className="mt-8 border-t border-ink/15 pt-6">
        <legend className="pr-4 text-base font-semibold">{ui.links}</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          {field('linkedinUrl', 'https://linkedin.com/in/…')}
          {field('githubUrl', 'https://github.com/…')}
        </div>
      </fieldset>
      <fieldset className="mt-8 border-t border-ink/15 pt-6">
        <legend className="pr-4 text-base font-semibold">{ui.photo}</legend>
        <ImageUpload
          value={profile.avatarUrl}
          locale={intl.locale}
          purpose="avatar"
          disabled={busy}
          onBusyChange={setUploading}
          onChange={(avatarUrl) => {
            setProfile({ ...profile, avatarUrl })
            setMessage('')
          }}
        />
        {githubPhoto && (
          <button
            type="button"
            disabled={busy || uploading}
            className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-accent underline underline-offset-4"
            onClick={() => {
              setProfile({ ...profile, avatarUrl: githubPhoto })
              setMessage('')
            }}
          >
            {intl.t('profile.githubPhoto')}
          </button>
        )}
        <details className="mt-3">
          <summary className="cursor-pointer py-3 text-sm text-ink-dim">
            {media.useUrl}
          </summary>
          <div className="pb-2">{field('avatarUrl', 'https://')}</div>
        </details>
      </fieldset>
      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={busy || uploading}
          className={accountButton}
        >
          {busy
            ? intl.t('profile.saving')
            : admin
              ? organiserCopy(intl.locale).save
              : intl.t('profile.save')}
        </button>
        <p
          role={failed ? 'alert' : 'status'}
          aria-live="polite"
          className="max-w-prose text-sm text-ink-dim"
        >
          {message}
        </p>
      </div>
    </form>
  )
}
