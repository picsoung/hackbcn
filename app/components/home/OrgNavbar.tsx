'use client'

import React, { Fragment } from 'react'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { Bars3Icon, XMarkIcon, GlobeAltIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useIntl } from '../Intl'
import { usePathname } from 'next/navigation'
import type { Event } from '@/types/events'
import { getDigestHref } from '@/app/helpers/digest'
import { Wordmark } from '../brand/Mark'

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
    { name: intl.t('home.navbar.digest'), href: getDigestHref(intl.locale), external: true },
  ]

  return (
    <>
      {/* The ribbon is the loudest thing above the fold, and the site's one
          arrival glitch: the NEW badge tears on mount, then settles. */}
      {featuredEvent && (
        <div className="bg-ground text-ink text-sm border-b border-band-2">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-center gap-3 flex-wrap">
            <span className="hb-tear bg-accent text-ground text-xs font-bold px-2 py-0.5 rounded-pixel">
              NEW
              <span aria-hidden="true" className="hb-tear-layer bg-accent rounded-pixel">
                NEW
              </span>
              <span aria-hidden="true" className="hb-tear-layer bg-accent rounded-pixel">
                NEW
              </span>
            </span>
            <span>
              {featuredEvent.name} · {formatEventDate(featuredEvent.startDate, featuredEvent.endDate)}
            </span>
            <Link
              href={`/${intl.locale}/events/${featuredEvent.slug}`}
              className="hb-px hb-px-sm bg-screen text-ground text-xs font-semibold px-3 py-1 hover:bg-inversion transition-colors focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-ground"
            >
              {intl.t('events.viewDetails')}
            </Link>
          </div>
        </div>
      )}

      <nav className="bg-ground-raised border-b border-band-2">
        <Disclosure as="div">
          {({ open }) => (
            <>
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-14 justify-between items-center">
                  <div className="flex items-center">
                    {/* The lockup IS the wordmark, so the old {HackBarna}
                        brace text is gone: keeping both was redundant, and the
                        pixel letterforms carry builder-coded better than the
                        braces did. */}
                    <Link
                      href={`/${intl.locale}`}
                      className="flex items-center rounded-pixel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-ground-raised"
                    >
                      <Wordmark
                        tone="bone"
                        split
                        alt="HackBarna"
                        className="h-5 w-auto sm:h-6"
                      />
                    </Link>
                  </div>

                  <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-6">
                    {navigation.map((item) =>
                      item.external ? (
                        <a
                          key={item.name}
                          href={item.href}
                          className="text-sm font-medium text-ink-dim hover:text-ink transition-colors"
                        >
                          {item.name}
                        </a>
                      ) : (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={`text-sm font-medium transition-colors ${
                            pathname.startsWith(item.href)
                              ? 'text-ink'
                              : 'text-ink-dim hover:text-ink'
                          }`}
                        >
                          {item.name}
                        </Link>
                      )
                    )}

                    <Menu as="div" className="relative">
                      <Menu.Button className="inline-flex items-center p-1.5 rounded-pixel text-ink-dim hover:text-ink hover:bg-band-2 transition-colors">
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
                        <Menu.Items className="hb-px hb-px-shadow absolute right-0 z-10 mt-2 w-32 origin-top-right bg-band-2 p-px focus:outline-none">
                          <div className="hb-px bg-ground-raised py-1">
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
                                      active ? 'bg-band-2 text-ink' : 'text-ink-dim'
                                    } ${
                                      locale === intl.locale ? 'font-medium text-ink' : ''
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
                    <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-pixel text-ink-dim hover:text-ink hover:bg-band-2">
                      {open ? (
                        <XMarkIcon className="block h-6 w-6" />
                      ) : (
                        <Bars3Icon className="block h-6 w-6" />
                      )}
                    </Disclosure.Button>
                  </div>
                </div>
              </div>

              <Disclosure.Panel className="sm:hidden border-t border-band-2">
                <div className="space-y-1 pb-3 pt-2">
                  {navigation.map((item) =>
                    item.external ? (
                      <a
                        key={item.name}
                        href={item.href}
                        className="block py-2 pl-6 pr-4 text-base font-medium text-ink-dim hover:text-ink"
                      >
                        {item.name}
                      </a>
                    ) : (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="block py-2 pl-6 pr-4 text-base font-medium text-ink-dim hover:text-ink"
                      >
                        {item.name}
                      </Link>
                    )
                  )}
                  <div className="pl-6 pr-4 py-2 border-t border-band-2">
                    <div className="flex items-center space-x-2 text-ink-dim mb-2">
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
                              ? 'text-ink font-medium'
                              : 'text-ink-dim hover:text-ink'
                          } block w-full text-left px-3 py-2 text-sm rounded-pixel transition-colors`}
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
