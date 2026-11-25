'use client'

import { useEffect, useId, useRef, useState } from 'react'
import Image from 'next/image'
import { ImageIcon, Upload } from 'lucide-react'
import { accountMediaCopy } from '@/data/account-media'
import {
  MAX_IMAGE_BYTES,
  IMAGE_TYPES,
  managedImageId,
} from '@/lib/media/shared'
import { accountSecondary } from './ProjectManagement'

export default function ImageUpload({
  value,
  onChange,
  onBusyChange,
  purpose,
  project,
  locale,
  disabled = false,
}: {
  value: string
  onChange: (url: string) => void
  onBusyChange: (busy: boolean) => void
  purpose: 'avatar' | 'project'
  project?: string
  locale: string
  disabled?: boolean
}) {
  const copy = accountMediaCopy(locale),
    input = useRef<HTMLInputElement>(null),
    id = useId()
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState(''),
    [failed, setFailed] = useState(false),
    [broken, setBroken] = useState(false)
  useEffect(() => setBroken(false), [value])
  function discard(url: string) {
    const id = managedImageId(url)
    if (id)
      void fetch(`/api/account/media?asset=${id}`, { method: 'DELETE' }).catch(
        () => {},
      )
  }
  async function upload(file: File) {
    setFailed(false)
    setMessage('')
    if (!IMAGE_TYPES.includes(file.type) || file.size > MAX_IMAGE_BYTES) {
      setFailed(true)
      if (input.current) input.current.value = ''
      setMessage(file.size > MAX_IMAGE_BYTES ? copy.tooLarge : copy.invalid)
      return
    }
    setBusy(true)
    onBusyChange(true)
    try {
      const query = new URLSearchParams({
        purpose,
        ...(project ? { project } : {}),
      })
      const response = await fetch(`/api/account/media?${query}`, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      })
      const result = await response.json()
      if (!response.ok) {
        const messages: Record<string, string> = {
          invalid_image: copy.invalid,
          too_large: copy.tooLarge,
          limit: copy.limit,
        }
        throw new Error(messages[result.error] ?? copy.error)
      }
      if (result.url !== value) discard(value)
      onChange(result.url)
      setMessage(purpose === 'avatar' ? copy.ready : copy.projectReady)
    } catch (error) {
      setFailed(true)
      setMessage(error instanceof Error ? error.message : copy.error)
    } finally {
      setBusy(false)
      onBusyChange(false)
      if (input.current) input.current.value = ''
    }
  }
  return (
    <div>
      <div
        className={`mb-4 flex items-center justify-center overflow-hidden rounded-pixel border border-ink/20 bg-ground-raised ${purpose === 'avatar' ? 'h-24 w-24' : 'aspect-video max-w-xl'}`}
      >
        {value && !broken ? (
          <Image
            unoptimized
            width={purpose === 'avatar' ? 96 : 960}
            height={purpose === 'avatar' ? 96 : 540}
            key={value}
            src={value}
            alt={purpose === 'avatar' ? '' : copy.projectPicture}
            className={`h-full w-full ${purpose === 'avatar' ? 'object-cover' : 'object-contain'}`}
            referrerPolicy="no-referrer"
            onError={() => setBroken(true)}
          />
        ) : (
          <ImageIcon
            aria-label={copy.noPicture}
            className="h-7 w-7 text-ink-dim"
          />
        )}
      </div>
      <input
        ref={input}
        type="file"
        accept={IMAGE_TYPES.join(',')}
        tabIndex={-1}
        className="hidden"
        aria-label={copy.upload}
        disabled={disabled || busy}
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) void upload(file)
        }}
      />
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className={accountSecondary}
          disabled={disabled || busy}
          aria-describedby={`${id}-help`}
          onClick={() => input.current?.click()}
        >
          <Upload size={16} aria-hidden="true" />
          {busy ? copy.uploading : value ? copy.replace : copy.upload}
        </button>
        {value && (
          <button
            type="button"
            className="min-h-11 text-sm text-ink-dim underline underline-offset-4 hover:text-ink disabled:opacity-50"
            disabled={disabled || busy}
            onClick={() => {
              discard(value)
              onChange('')
              setMessage('')
            }}
          >
            {copy.remove}
          </button>
        )}
      </div>
      <p
        id={`${id}-help`}
        className="mt-3 max-w-xl text-xs leading-relaxed text-ink-dim"
      >
        {copy.help}
      </p>
      <p
        role={failed ? 'alert' : 'status'}
        aria-live="polite"
        className={`${message ? 'mt-2' : 'sr-only'} max-w-xl text-sm leading-relaxed ${failed ? 'text-red-300' : 'text-ink-dim'}`}
      >
        {message}
      </p>
    </div>
  )
}
