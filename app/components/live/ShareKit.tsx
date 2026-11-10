'use client'

import { useEffect, useState } from 'react'
import { toast } from './Toaster'
import { btnSecondary, btnSm, labelMono } from './ui'

export default function ShareKit({
  eventSlug,
  eventName,
  hashtag,
  slug,
  name,
  tagline,
  link,
}: {
  eventSlug: string
  eventName: string
  hashtag: string
  slug: string
  name: string
  tagline: string
  link: string
}) {
  const [canNativeShare, setCanNativeShare] = useState(false)
  useEffect(
    () =>
      setCanNativeShare(typeof navigator !== 'undefined' && !!navigator.share),
    [],
  )

  const text = `I built "${name}" at ${eventName} by @HackBarna. ${tagline} Vote for it here:`
  const post = `${text} ${link} #${hashtag}`
  const enc = encodeURIComponent
  const channels = [
    {
      id: 'linkedin',
      label: 'LinkedIn',
      href: `https://www.linkedin.com/feed/?shareActive=true&text=${enc(post)}`,
    },
    {
      id: 'x',
      label: 'X',
      href: `https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(link)}&hashtags=${hashtag}`,
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      href: `https://wa.me/?text=${enc(`${text} ${link}`)}`,
    },
    {
      id: 'telegram',
      label: 'Telegram',
      href: `https://t.me/share/url?url=${enc(link)}&text=${enc(text)}`,
    },
  ]

  function track(channel: string) {
    const url = `/api/live/${eventSlug}/projects/${encodeURIComponent(slug)}/share`
    const body = JSON.stringify({ channel })
    if (navigator.sendBeacon)
      navigator.sendBeacon(url, new Blob([body], { type: 'application/json' }))
    else
      fetch(url, {
        method: 'POST',
        body,
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
      })
  }

  async function copy(value: string, channel: string) {
    try {
      await navigator.clipboard.writeText(value)
      toast('Copied. Paste it everywhere.')
    } catch {
      toast('Copy failed. Select the text and copy it manually.')
    }
    track(channel)
  }

  return (
    <div className="mt-4 space-y-4">
      <div className="flex flex-wrap gap-2">
        {channels.map((c) => (
          <a
            key={c.id}
            href={c.href}
            target="_blank"
            rel="noopener"
            onClick={() => track(c.id)}
            className={`${btnSecondary} ${btnSm}`}
          >
            {c.label}
          </a>
        ))}
        <button
          type="button"
          onClick={() => copy(link, 'copy')}
          className={`${btnSecondary} ${btnSm}`}
        >
          Copy link
        </button>
        {canNativeShare && (
          <button
            type="button"
            className={`${btnSecondary} ${btnSm}`}
            onClick={async () => {
              try {
                await navigator.share({ title: name, text, url: link })
                track('native')
              } catch {}
            }}
          >
            More…
          </button>
        )}
      </div>
      <div>
        <label htmlFor="share-copy" className={labelMono}>
          Ready-made post
        </label>
        <textarea
          id="share-copy"
          readOnly
          rows={3}
          value={post}
          className="w-full bg-night-ink p-3 text-sm text-screen-dim outline outline-1 outline-night-violet"
        />
        <button
          type="button"
          onClick={() => copy(post, 'copy-post')}
          className="mt-1 text-sm text-neon-cyan underline underline-offset-4"
        >
          Copy post
        </button>
      </div>
    </div>
  )
}
