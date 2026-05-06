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
      <p className="text-sm text-slate-500 mb-2">{intl.t('applybutton.dontmiss')}</p>
      <form onSubmit={handleSubmit} className="flex">
        <input
          type="email"
          className="flex-1 h-10 px-3 text-sm text-slate-700 border border-gray-300 border-r-0 rounded-l-md focus:outline-none focus:ring-1 focus:ring-org-accent focus:border-org-accent"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setError('')
            setEmail(e.target.value)
          }}
        />
        <button
          type="submit"
          className="h-10 px-5 text-sm font-semibold bg-org-accent text-white rounded-r-md hover:bg-org-accent-dark transition-colors"
        >
          {intl.t('applybutton.subscribe')}
        </button>
      </form>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}
