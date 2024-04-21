import { Disclosure } from "@headlessui/react";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";

const schedule = [
  {
    title: "Saturday - June 29th",
    content: (
      <>
        <small className="font-bold uppercase text-indigo-600">Morning</small>
        <br />
        <time className="block font-medium text-gray-900">
          8:30 AM | Networking + Breakfast
        </time>
        <time className="block font-medium text-gray-900">
          10:00 AM | Opening Speeches
        </time>
        <time className="block font-medium text-gray-900">
          10:30 AM | Hacking solo or in teams, supported by mentors
        </time>
        <br />
        <small className="font-bold uppercase text-indigo-600">Hack Time</small>
        <br />
        <time className="block font-medium text-gray-900">
          12:00 PM | Lunch
        </time>
        <time className="block font-medium text-gray-900">
          01:00 PM | More hacking
        </time>
        <time className="block font-medium text-gray-900">
          06:00 PM | Dinner
        </time>
        <time className="block font-medium text-gray-900">
          07:00 PM | Even more hacking
        </time>
        <br />
        <small className="font-bold uppercase text-indigo-600">
          Periodically
        </small>
        <br />
        <span className="font-medium text-gray-900">
          Guest lectures by mentors and sponsors
        </span>
        <br />
        <span className="font-medium text-gray-900">Snacks and surprises</span>
      </>
    ),
  },
  {
    title: "Sunday - June 30th",
    content: (
      <>
        <small className="font-bold uppercase text-indigo-600">Morning</small>
        <br />
        <time className="block font-medium text-gray-900">
          09:00 AM | Breakfast
        </time>
        <time className="block font-medium text-gray-900">
          10:00 AM | Keep pushing
        </time>
        <br />
        <small className="font-bold uppercase text-indigo-600">Midday</small>
        <br />
        <time className="block font-medium text-gray-900">
          12:00 PM | Lunch
        </time>
        <time className="block font-medium text-gray-900">
          04:00 PM | Submit repos and prepare for final presentations
        </time>
        <br />
        <small className="font-bold uppercase text-indigo-600">Afternoon</small>
        {/* <br />
        <time className="block font-medium text-gray-900">
          03:45 PM | Hackfair - Teams do their final pitches
        </time> */}
        <time className="block font-medium text-gray-900">
          05:30 PM | Final Demos
        </time>
        <br />
        <small className="font-bold uppercase text-indigo-600">Wrap-up</small>
        <br />
        <time className="block font-medium text-gray-900">
          06:30 PM | Deliberation &amp; Awards
        </time>
      </>
    ),
  },
];

export default function Schedule() {
  return (
    <div id="schedule" className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-10 sm:py-10 lg:px-8 lg:py-10">
        <div className="mx-auto max-w-7xl divide-y divide-orange-900/10">
          <h2 className="text-3xl sm:text-5xl font-cal font-semibold text-indigo-600">
            Schedule
          </h2>
          <dl className="mt-10 space-y-6 divide-y divide-indigo-600/10">
            {schedule.map((day, dayId) => (
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
  );
}
