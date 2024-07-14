'use client'

import Link from 'next/link'
import { useIntl } from './Intl'
import { createRef, useState } from 'react'
import { PopupButton } from '@typeform/embed-react'

export const EMAIL_REGEX = /^[\w.+-]+@[a-zA-Z\d-]+\.[a-zA-Z]{2,}$/

export default function ApplyButton() {
  const intl = useIntl()
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

  return (
    <>
      {/* <h3 className="inline-flex items-center px-3 py-2 border border-transparent text-lg font-medium rounded-md text-gray-200 bg-amber-500 hover:bg-indigo-700 hover:text-white">
        Stay up to day for next event
      </h3> */}
      <div className="flex flex-col w-2/3 p-6">
        <p className="text-white">{intl.t('applybutton.dontmiss')}</p>
        <div className="flex flex-row items-start mt-1">
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
              <div className="text-red-500">{errorMessages}</div>
            )}{' '}
          </div>
          <button
            onClick={handleSubmit}
            className="h-10 px-4 text-sm bg-amber-500 border border-l-0 border-amber-500 rounded-r shadow-sm text-blue-50 hover:text-white hover:bg-blue-400 hover:border-blue-400 focus:outline-none"
          >
            {intl.t('applybutton.subscribe')}
          </button>
        </div>
        {/* <PopupButton
          id={'vXoAfRLT'}
          ref={sidetabRef}
          medium="hackbarna"
          hidden={{ email: email }}
        /> */}
      </div>
      {/* https://picsoung.typeform.com/to/vXoAfRLT#email=xxxxx */}
      {/* <Link
        className="inline-flex items-center px-3 py-2 border border-transparent text-lg font-medium rounded-md text-gray-200 bg-green-800 hover:bg-geen-700 hover:text-white"
        href="https://lu.ma/10wnz112"
      >
        Attend final demos
      </Link> */}
      {/* <button
      onClick={handleClick}
        className="inline-flex items-center px-3 py-2 border border-transparent text-lg font-medium rounded-md text-gray-200 bg-amber-500 hover:bg-indigo-700 hover:text-white"
      >
        {intl.t("action.apply")}
      </button> */}
    </>
  )
}
