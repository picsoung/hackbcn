import ApplyButton from './ApplyButton'
import { useIntl } from './Intl'

export default function SignupCTA() {
  const intl = useIntl()
  return (
    <div className="py-12">
      <div className="flex max-w-7xl mx-auto px-8">
        <div className="w-2/3">
          <h3 className="mt-2 text-3xl sm:text-5xl font-cal font-semibold text-white">
            {intl.t('signupCTA.title')}
          </h3>
          <p className="mt-4 text-xl text-gray-200">
            {intl.t('signupCTA.description')}
          </p>
        </div>
        <div className="pt-6 w-1/3 relative">
          <ApplyButton />
        </div>
      </div>
    </div>
  )
}
