'use client'

import { useIntl } from './Intl'

const features = (intl: ReturnType<typeof useIntl>) => [
  {
    name: intl.t('whyJoin.feature.0.name'),
    description: intl.t('whyJoin.feature.0.description'),
    // icon: TrophyIcon,
  },
  {
    name: intl.t('whyJoin.feature.1.name'),
    description: intl.t('whyJoin.feature.1.description'),
    // icon: BriefcaseIcon,
  },
  {
    name: intl.t('whyJoin.feature.2.name'),
    description: intl.t('whyJoin.feature.2.description'),
    // icon: CodeBracketIcon,
  },
]

export default function WhyJoin() {
  const intl = useIntl()
  return (
    <div id="why" className="bg-white py-10 sm:py-10">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="max-w-3xl">
          <h2 className="mt-2 text-3xl sm:text-5xl font-cal font-semibold text-indigo-600">
            {intl.t('whyJoin.title')}
          </h2>
        </div>
        <div className="mx-auto mt-16 max-w-2xl lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features(intl).map((feature) => (
              <div key={feature.name} className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-lg font-bold leading-7 text-gray-900">
                  {/* <feature.icon
                    className="h-5 w-5 flex-none text-indigo-600"
                    aria-hidden="true"
                  /> */}
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-lg leading-7 text-gray-800">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}
