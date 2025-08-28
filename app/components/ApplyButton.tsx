'use client'

import Link from 'next/link'
import { useIntl } from './Intl'
import { useTheme } from '@/app/contexts/ThemeContext'
import { createRef, useState } from 'react'
import { PopupButton } from '@typeform/embed-react'

export const EMAIL_REGEX = /^[\w.+-]+@[a-zA-Z\d-]+\.[a-zA-Z]{2,}$/

export default function ApplyButton() {
  const intl = useIntl()
  const { theme, currentEventSlug } = useTheme()
  const [email, setEmail] = useState('')
  const [isValidEmail, setIsValidEmail] = useState(false)
  const [errorMessages, setErrorMessages] = useState('')

  const sidetabRef = createRef()

  function handleClick(): void {
    const formless = document.querySelector(
      '.formless-trigger',
    ) as HTMLElement | null
    if (formless) {
      formless.click()
      formless.style.display = 'block'
    }
  }

  const checkEmail = (email: string) => {
    console.log('test',EMAIL_REGEX.test(email))
    if (EMAIL_REGEX.test(email)) {
      setIsValidEmail(true)
      setErrorMessages('') // Clear error messages if the email is valid
    } else {
      setIsValidEmail(false)
      setErrorMessages(intl.t('error.notvalidemail')) // Set an error message
    }
  }

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault()
    checkEmail(email)
    console.log('eeeeeemail', email)
    if (isValidEmail) {
      // Handle invalid email case
      // console.error('Invalid email')
      // sidetabRef.current?.open()
      window.open(`https://form.typeform.com/to/vXoAfRLT#email=${email}`)
      return
    }
  }

  // Get the appropriate apply URL based on the event
  const getApplyUrl = () => {
    if (currentEventSlug === 'aisummit25') {
      return 'https://aisummitbarcelona.com/hackathon'
    }
    // Default to typeform for other events
    return 'https://form.typeform.com/to/vXoAfRLT'
  }

  return (
    <>
      <div className="flex flex-col w-full p-6 space-y-4">
        {/* Email Signup Section */}
        <div>
          <p className="text-white mb-2">{intl.t('applybutton.dontmiss')}</p>
          <div className="flex flex-row items-start">
            <div className="flex flex-col w-full">
              <input
                type="email"
                id="input-9"
                className="w-full h-10 px-3 text-sm text-gray-700 border border-r-0 rounded-r-none border-blue-500 focus:outline-none rounded shadow-sm"
                placeholder="batman@wayne.com"
                onChange={(e) => {
                  setErrorMessages('')
                  setEmail(e.target.value)
                }}
              />
              {errorMessages && (
                <div className="text-red-500 text-xs mt-1">{errorMessages}</div>
              )}
            </div>
            <button
              onClick={handleSubmit}
              className="h-10 px-4 text-sm bg-amber-500 border border-l-0 border-amber-500 rounded-r shadow-sm text-blue-50 hover:text-white hover:bg-blue-400 hover:border-blue-400 focus:outline-none"
            >
              {intl.t('applybutton.subscribe')}
            </button>
          </div>
        </div>

        {/* Apply Button Section */}
        <div className="pt-2">
          <Link
            href={getApplyUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center justify-center px-6 py-3 text-lg font-semibold rounded-lg transition-all duration-200 ${theme.colors.button} ${theme.colors.buttonHover} w-full sm:w-auto`}
          >
            {intl.t('action.apply')}
            <svg 
              className="ml-2 h-5 w-5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2M14 4h6m0 0v6m0-6L10 14" 
              />
            </svg>
          </Link>
        </div>
      </div>
    </>
  )
}
