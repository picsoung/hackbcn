import { Disclosure } from '@headlessui/react'
import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline'
import { useIntl } from './Intl'

const schedule = (intl: ReturnType<typeof useIntl>) => [
  {
    title: intl.t('schedule.item.0.title'),
    content: (
      <>
        <small className="font-bold uppercase text-indigo-600">
          {intl.t('schedule.item.0.morning')}
        </small>
        <br />
        <time className="block font-medium text-gray-900">
          {intl.t('schedule.item.0.time.0')}
        </time>
        <time className="block font-medium text-gray-900">
          {intl.t('schedule.item.0.time.1')}
        </time>
        <time className="block font-medium text-gray-900">
          {intl.t('schedule.item.0.time.2')}
        </time>
        <br />
        <small className="font-bold uppercase text-indigo-600">
          {intl.t('schedule.item.0.hackTime')}
        </small>
        <br />
        <time className="block font-medium text-gray-900">
          {intl.t('schedule.item.0.time.3')}
        </time>
        <time className="block font-medium text-gray-900">
          {intl.t('schedule.item.0.time.4')}
        </time>
        <time className="block font-medium text-gray-900">
          {intl.t('schedule.item.0.time.5')}
        </time>
        <time className="block font-medium text-gray-900">
          {intl.t('schedule.item.0.time.6')}
        </time>
        <br />
        <small className="font-bold uppercase text-indigo-600">
          {intl.t('schedule.item.0.periodically')}
        </small>
        <br />
        <span className="font-medium text-gray-900">
          {intl.t('schedule.item.0.guestLectures')}
        </span>
        <br />
        <span className="font-medium text-gray-900">
          {intl.t('schedule.item.0.snacks')}
        </span>
      </>
    ),
  },
  {
    title: intl.t('schedule.item.1.title'),
    content: (
      <>
        <small className="font-bold uppercase text-indigo-600">
          {intl.t('schedule.item.1.morning')}
        </small>
        <br />
        <time className="block font-medium text-gray-900">
          {intl.t('schedule.item.1.time.0')}
        </time>
        <time className="block font-medium text-gray-900">
          {intl.t('schedule.item.1.time.1')}
        </time>
        <br />
        <small className="font-bold uppercase text-indigo-600">
          {intl.t('schedule.item.1.midday')}
        </small>
        <br />
        <time className="block font-medium text-gray-900">
          {intl.t('schedule.item.1.time.2')}
        </time>
        <time className="block font-medium text-gray-900">
          {intl.t('schedule.item.1.time.3')}
        </time>
        <br />
        <small className="font-bold uppercase text-indigo-600">
          {intl.t('schedule.item.1.afternoon')}
        </small>
        <time className="block font-medium text-gray-900">
          {intl.t('schedule.item.1.time.4')}
        </time>
        <br />
        <small className="font-bold uppercase text-indigo-600">
          {intl.t('schedule.item.1.wrapUp')}
        </small>
        <br />
        <time className="block font-medium text-gray-900">
          {intl.t('schedule.item.1.time.5')}
        </time>
      </>
    ),
  },
]

export default function Schedule() {
  const intl = useIntl()
  return (
    <div id="schedule" className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-10 sm:py-10 lg:px-8 lg:py-10">
        <div className="mx-auto max-w-7xl divide-y divide-orange-900/10">
          <h2 className="text-3xl sm:text-5xl font-cal font-semibold text-indigo-600">
            {intl.t('schedule.title')}
          </h2>
          <dl className="mt-10 space-y-6 divide-y divide-indigo-600/10">
            {schedule(intl).map((day, dayId) => (
              <Disclosure
                as="div"
                key={day.title}
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
                      <p className="text-gray-700">{day.content}</p>
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
