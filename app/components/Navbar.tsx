'use client'
import React, { Dispatch, SetStateAction, Fragment, useState } from 'react'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { Bars3Icon, XMarkIcon, GlobeAltIcon, ChevronDownIcon, CalendarIcon } from '@heroicons/react/24/outline'
import ApplyButton from './ApplyButton'

import Link from 'next/link'
import { useIntl } from './Intl'
import { events } from '@/lib/events'
import { usePathname } from 'next/navigation'
interface NavbarProps {
  mobileMenuOpen: boolean
  setMobileMenuOpen: Dispatch<SetStateAction<boolean>>
}

const Navbar: React.FC<NavbarProps> = ({
  mobileMenuOpen,
  setMobileMenuOpen,
  // navigationOptions,
}) => {
  const intl = useIntl()
  const pathname = usePathname()
  
  // Extract current event slug from pathname
  const pathParts = pathname.split('/')
  const currentEventSlug = pathParts.length >= 3 ? pathParts[2] : null
  
  const navigationOptions = [
    { name: intl.t('navbar.sponsors'), href: currentEventSlug ? `/${intl.locale}/${currentEventSlug}#sponsors` : '/#sponsors' },
    { name: intl.t('navbar.why-should-i-join'), href: currentEventSlug ? `/${intl.locale}/${currentEventSlug}#why` : '/#why' },
    { name: intl.t('navbar.schedule'), href: currentEventSlug ? `/${intl.locale}/${currentEventSlug}#schedule` : '/#schedule' },
    { name: intl.t('navbar.faq'), href: currentEventSlug ? `/${intl.locale}/${currentEventSlug}#faq` : '/#faq' },
    { name: intl.t('navbar.team'), href: currentEventSlug ? `/${intl.locale}/${currentEventSlug}#about` : '/#about' },
    { name: intl.t('navbar.judges'), href: currentEventSlug ? `/${intl.locale}/${currentEventSlug}#judges` : '/#judges' },
    { name: intl.t('navbar.coc'), href: `/${intl.locale}/conduct` },
    { name: intl.t('navbar.testimonials'), href: `/${intl.locale}/testimonials` },
    { name: intl.t('navbar.projects'), href: `/${intl.locale}/projects` },
  ]

  return (
    <Disclosure as="nav">
      {({ open }) => {
        // if (open !== mobileMenuOpen) setMobileMenuOpen(open)
        return (
          <>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-white">
              <div className="flex h-16 justify-between items-center">
                {/* Left side - Logo and HackBarna title */}
                <div className="flex items-center">
                  {renderBrandWithEventSwitcher(intl)}
                </div>

                {/* Center - Navigation Links */}
                <div className="hidden sm:ml-6 sm:flex sm:space-x-5">
                  {navigationOptions.map((option) => (
                    <Link
                      key={option.name}
                      href={option.href}
                      className="inline-flex items-center text-lg font-medium text-black-200 hover:text-indigo-700"
                    >
                      <p>{option.name}</p>
                    </Link>
                  ))}
                </div>

                {/* Right side - Locale switcher and Mobile menu button */}
                <div className="flex items-center">
                  {/* Locale switcher for desktop */}
                  <div className="hidden sm:block">
                    <Menu as="div" className="relative inline-block text-left">
                      <div>
                        <Menu.Button className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-gray-300 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white/20 transition-colors duration-200">
                          <GlobeAltIcon className="h-5 w-5" aria-hidden="true" />
                          <ChevronDownIcon className="h-4 w-4 ml-1" aria-hidden="true" />
                        </Menu.Button>
                      </div>

                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute right-0 z-10 mt-2 w-32 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <div className="py-1">
                            {intl.locales.map((locale) => (
                              <Menu.Item key={locale}>
                                {({ active }) => (
                                  <button
                                    onClick={() => {
                                      const regex = /^(https?:\/\/[^\/]+\/)([a-z]{2})(\/|$)/
                                      const currentURL = window.location.href
                                      window.location.href = currentURL.replace(
                                        regex,
                                        `$1${locale}$3`,
                                      )
                                    }}
                                    className={`${
                                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                    } ${
                                      locale === intl.locale ? 'bg-indigo-50 text-indigo-700 font-medium' : ''
                                    } block w-full px-4 py-2 text-left text-sm transition-colors duration-150`}
                                  >
                                    {intl.t(`locale.${locale}`)}
                                  </button>
                                )}
                              </Menu.Item>
                            ))}
                          </div>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </div>
                  
                  {/* Mobile menu button */}
                  <div className="-mr-2 flex items-center sm:hidden">
                    <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                      {open ? (
                        <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                      ) : (
                        <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                      )}
                    </Disclosure.Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile menu */}
            <Disclosure.Panel className="sm:hidden">
              <div className="space-y-1 pb-3 pt-2">
                {navigationOptions.map((option) => (
                  <Link
                    key={option.name}
                    href={option.href}
                    className="block py-1.5 pl-10 pr-4 text-lg font-medium text-black-200 hover:text-indigo-700"
                  >
                    {option.name}
                  </Link>
                ))}
                {/* Locale switcher for mobile */}
                <div className="pl-10 pr-4 py-2 border-t border-gray-200">
                  <div className="flex items-center space-x-2 text-white mb-2">
                    <GlobeAltIcon className="h-5 w-5" />
                    <span className="text-sm font-medium">Language:</span>
                  </div>
                  <div className="space-y-1">
                    {intl.locales.map((locale) => (
                      <button
                        key={locale}
                        onClick={() => {
                          const regex = /^(https?:\/\/[^\/]+\/)([a-z]{2})(\/|$)/
                          const currentURL = window.location.href
                          window.location.href = currentURL.replace(
                            regex,
                            `$1${locale}$3`,
                          )
                        }}
                        className={`${
                          locale === intl.locale 
                            ? 'bg-indigo-50 text-indigo-700 font-medium' 
                            : 'text-gray-200 hover:text-white hover:bg-white/10'
                        } block w-full text-left px-3 py-2 text-sm rounded-md transition-colors duration-150`}
                      >
                        {intl.t(`locale.${locale}`)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Disclosure.Panel>
          </>
        )
      }}
    </Disclosure>
  )

  function renderBrandWithEventSwitcher(intl: ReturnType<typeof useIntl>) {
    return (
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <Menu.Button className="inline-flex items-center mr-5 p-1 rounded-md hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white/20 transition-colors duration-200">
            <img
              className="h-8 w-auto"
              src="/hackbcnlogo.png"
              alt="HackBarna logo"
            />
            <h3 className="pl-2 text-white text-lg font-medium">
              {intl.t('navbar.title')}
            </h3>
            <ChevronDownIcon className="h-4 w-4 ml-2 text-white" aria-hidden="true" />
          </Menu.Button>
        </div>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute left-0 z-10 mt-2 w-64 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1">
              <div className="px-4 py-3 bg-gray-50">
                <p className="text-sm font-medium text-gray-900">Select Event</p>
                <p className="text-xs text-gray-500">Choose which event to view</p>
              </div>
              {[...events].reverse().map((event) => (
                <Menu.Item key={event.slug}>
                  {({ active }) => (
                    <button
                      onClick={() => {
                        const selectedEventSlug = event.slug
                        const locale = intl.locale
                        const newURL = `${window.location.origin}/${locale}/${selectedEventSlug}`
                        window.location.href = newURL
                      }}
                      className={`${
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                      } ${
                        event.slug === currentEventSlug ? 'bg-indigo-50 text-indigo-700 font-medium' : ''
                      } block w-full px-4 py-3 text-left text-sm transition-colors duration-150`}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{event.name}</span>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-gray-500">{event.year}</span>
                          {event.active && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Latest
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  )}
                </Menu.Item>
              ))}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    )
  }

}
export default Navbar
