'use client'

import React, { Fragment } from 'react'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { Bars3Icon, XMarkIcon, GlobeAltIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useIntl } from '../Intl'
import { usePathname } from 'next/navigation'
import type { Event } from '@/types/events'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatEventDate(startDate: string, endDate: string) {
  const start = new Date(startDate)
  const end = new Date(endDate)
  return `${MONTHS[start.getUTCMonth()]} ${start.getUTCDate()}-${end.getUTCDate()}, ${end.getUTCFullYear()}`
}

// The featured ribbon is the next upcoming event. Parent pages (which can read
// MDX server-side) compute and pass it in. Pass `null` to suppress the ribbon.
export default function OrgNavbar({ featuredEvent }: { featuredEvent?: Event | null }) {
  const intl = useIntl()
  const pathname = usePathname()

  const navigation = [
    { name: intl.t('home.navbar.events'), href: `/${intl.locale}/events` },
    { name: intl.t('navbar.projects'), href: `/${intl.locale}/projects` },
    { name: intl.t('home.navbar.digest'), href: '#', soon: true },
  ]

  return (
    <>
      {featuredEvent && (
        <div className="bg-slate-900 text-white text-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-center gap-3 flex-wrap">
            <span className="bg-org-accent text-white text-xs font-bold px-2 py-0.5 rounded">NEW</span>
            <span>
              {featuredEvent.name} · {formatEventDate(featuredEvent.startDate, featuredEvent.endDate)}
            </span>
            <Link
              href={`/${intl.locale}/events/${featuredEvent.slug}`}
              className="bg-white text-slate-900 text-xs font-semibold px-3 py-1 rounded hover:bg-gray-100 transition-colors"
            >
              {intl.t('events.viewDetails')}
            </Link>
          </div>
        </div>
      )}

      <nav className="bg-white border-b border-gray-100">
        <Disclosure as="div">
          {({ open }) => (
            <>
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-14 justify-between items-center">
                  <div className="flex items-center">
                    <Link href={`/${intl.locale}`} className="flex items-center">
                      <img
                        className="h-7 w-auto"
                        src="/hackbcnlogo.png"
                        alt="HackBarna logo"
                      />
                      <span className="pl-2 text-slate-900 text-base font-medium font-mono">
                        {'{'}{intl.t('navbar.title')}{'}'}
                      </span>
                    </Link>
                  </div>

                  <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-6">
                    {navigation.map((item) =>
                      item.soon ? (
                        <span
                          key={item.name}
                          className="text-slate-400 text-sm font-medium cursor-default flex items-center gap-1.5"
                        >
                          {item.name}
                          <span className="text-[10px] font-semibold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full uppercase">soon</span>
                        </span>
                      ) : (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={`text-sm font-medium transition-colors ${
                            pathname.startsWith(item.href)
                              ? 'text-slate-900'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {item.name}
                        </Link>
                      )
                    )}

                    <Menu as="div" className="relative">
                      <Menu.Button className="inline-flex items-center p-1.5 rounded-md text-slate-500 hover:text-slate-700 hover:bg-gray-50 transition-colors">
                        <GlobeAltIcon className="h-5 w-5" />
                        <ChevronDownIcon className="h-3.5 w-3.5 ml-0.5" />
                      </Menu.Button>
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
                                      window.location.href = currentURL.replace(regex, `$1${locale}$3`)
                                    }}
                                    className={`${
                                      active ? 'bg-gray-50 text-gray-900' : 'text-gray-700'
                                    } ${
                                      locale === intl.locale ? 'font-medium text-slate-900' : ''
                                    } block w-full px-4 py-2 text-left text-sm transition-colors`}
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

                  <div className="-mr-2 flex items-center sm:hidden">
                    <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-slate-500 hover:text-slate-700 hover:bg-gray-50">
                      {open ? (
                        <XMarkIcon className="block h-6 w-6" />
                      ) : (
                        <Bars3Icon className="block h-6 w-6" />
                      )}
                    </Disclosure.Button>
                  </div>
                </div>
              </div>

              <Disclosure.Panel className="sm:hidden border-t border-gray-100">
                <div className="space-y-1 pb-3 pt-2">
                  {navigation.map((item) =>
                    item.soon ? (
                      <span
                        key={item.name}
                        className="block py-2 pl-6 pr-4 text-base font-medium text-slate-400 flex items-center gap-2"
                      >
                        {item.name}
                        <span className="text-[10px] font-semibold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full uppercase">soon</span>
                      </span>
                    ) : (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="block py-2 pl-6 pr-4 text-base font-medium text-slate-600"
                      >
                        {item.name}
                      </Link>
                    )
                  )}
                  <div className="pl-6 pr-4 py-2 border-t border-gray-100">
                    <div className="flex items-center space-x-2 text-slate-500 mb-2">
                      <GlobeAltIcon className="h-5 w-5" />
                      <span className="text-sm font-medium">{intl.t('home.navbar.language')}</span>
                    </div>
                    <div className="space-y-1">
                      {intl.locales.map((locale) => (
                        <button
                          key={locale}
                          onClick={() => {
                            const regex = /^(https?:\/\/[^\/]+\/)([a-z]{2})(\/|$)/
                            const currentURL = window.location.href
                            window.location.href = currentURL.replace(regex, `$1${locale}$3`)
                          }}
                          className={`${
                            locale === intl.locale
                              ? 'text-slate-900 font-medium'
                              : 'text-slate-500 hover:text-slate-700'
                          } block w-full text-left px-3 py-2 text-sm rounded-md transition-colors`}
                        >
                          {intl.t(`locale.${locale}`)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
      </nav>
    </>
  )
}
