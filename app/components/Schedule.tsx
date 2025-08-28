'use client'

import { Disclosure } from '@headlessui/react'
import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline'
import { useIntl } from './Intl'
import { useTheme } from '@/app/contexts/ThemeContext'
import { getEventBySlug } from '@/lib/events'

export default function Schedule() {
  const intl = useIntl()
  const { currentEventSlug, theme } = useTheme()
  const currentEvent = currentEventSlug ? getEventBySlug(currentEventSlug) : null

  if (!currentEvent || !currentEvent.schedule[intl.locale]) {
    return null
  }

  const scheduleData = currentEvent.schedule[intl.locale] || currentEvent.schedule['en'] || []

  return (
    <div id="schedule" className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-10 sm:py-10 lg:px-8 lg:py-10">
        <div className="mx-auto max-w-7xl divide-y divide-orange-900/10">
          <h2 className="text-3xl sm:text-5xl font-cal font-semibold text-indigo-600">
            {intl.t('schedule.title')}
          </h2>
          <dl className="mt-10 space-y-6 divide-y divide-indigo-600/10">
            {scheduleData.map((day, dayId) => (
              <Disclosure
                as="div"
                key={dayId}
                className="pt-6"
                defaultOpen={false}
              >
                {({ open }) => (
                  <>
                    <dt>
                      <Disclosure.Button className="flex w-full items-start justify-between text-left text-gray-900">
                        <span className="text-lg font-bold leading-7">
                          {day.title}
                        </span>
                        <span className="ml-6 flex h-7 items-center">
                          {open ? (
                            <MinusIcon className="h-6 w-6" aria-hidden="true" />
                          ) : (
                            <PlusIcon className="h-6 w-6" aria-hidden="true" />
                          )}
                        </span>
                      </Disclosure.Button>
                    </dt>
                    <Disclosure.Panel
                      as="dd"
                      className="mt-2 pr-12 animate-in fade-in"
                    >
                      <div className="text-gray-700">
                        {day.sections.map((section, sectionId) => (
                          <div key={sectionId} className="mb-4">
                            <small className="font-bold uppercase text-indigo-600">
                              {section.name}
                            </small>
                            <br />
                            {section.items.map((item, itemId) => (
                              <time key={itemId} className="block font-medium text-gray-900">
                                {item}
                              </time>
                            ))}
                            {sectionId < day.sections.length - 1 && <br />}
                          </div>
                        ))}
                      </div>
                    </Disclosure.Panel>
                  </>
                )}
              </Disclosure>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}
