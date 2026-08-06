'use client'

import { useState } from 'react'
import { useIntl } from '../Intl'

const EMAIL_REGEX = /^[\w.+-]+@[a-zA-Z\d-]+\.[a-zA-Z]{2,}$/

export default function SubscribeForm() {
  const intl = useIntl()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!EMAIL_REGEX.test(email)) {
      setError(intl.t('error.notvalidemail'))
      return
    }
    setError('')
    window.open(`https://form.typeform.com/to/vXoAfRLT#email=${email}`)
  }

  return (
    <div>
      <p className="text-sm text-ink-dim mb-2">{intl.t('applybutton.dontmiss')}</p>
      <form onSubmit={handleSubmit} className="hb-px hb-px-sm flex">
        <input
          type="email"
          /* Inset, like the button: the pair is clipped as one unit, so an
             outward ring would lose its corners to the staircase. */
          className="flex-1 h-10 px-3 text-sm text-ink bg-ground-raised placeholder:text-ink-dim border border-band-2 border-r-0 focus:outline-none focus:ring-inset focus:ring-1 focus:ring-accent focus:border-accent"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setError('')
            setEmail(e.target.value)
          }}
        />
        <button
          type="submit"
          className="h-10 px-5 text-sm font-semibold bg-accent text-ground hover:bg-inversion transition-colors focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-ground"
        >
          {intl.t('applybutton.subscribe')}
        </button>
      </form>
      {error && <p className="text-inversion text-xs mt-1">{error}</p>}
    </div>
  )
}
