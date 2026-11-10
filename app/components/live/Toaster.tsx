'use client'

import { useEffect, useState } from 'react'

const EVENT = 'hb-live-toast'

export function toast(message: string) {
  window.dispatchEvent(new CustomEvent(EVENT, { detail: message }))
}

export default function Toaster() {
  const [msg, setMsg] = useState<string | null>(null)
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const onToast = (e: Event) => {
      setMsg((e as CustomEvent<string>).detail)
      clearTimeout(timer)
      timer = setTimeout(() => setMsg(null), 2600)
    }
    window.addEventListener(EVENT, onToast)
    return () => {
      window.removeEventListener(EVENT, onToast)
      clearTimeout(timer)
    }
  }, [])
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4"
    >
      {msg && (
        <p className="hb-px hb-px-sm bg-neon-cyan px-4 py-2 text-sm font-semibold text-night-ink">
          {msg}
        </p>
      )}
    </div>
  )
}
