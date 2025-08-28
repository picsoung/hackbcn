// import { redirect } from 'next/navigation'

// export default async function Home(props: { params: { locale: string } }) {
//   const supportedLocales = [
//     i18nConfig.locale.source,
//     ...i18nConfig.locale.targets,
//   ]
//   const isValidLocale = supportedLocales.includes(props.params.locale)
//   if (!isValidLocale) {
//     return redirect(`/${i18nConfig.locale.source}`)
//   }
//   return <HomeContent />
// }

import { getCurrentEvent } from '@/lib/events'
import { redirect } from 'next/navigation'

export default function HomePage( {params }: { params: { locale: string } }) {
  const currentEvent = getCurrentEvent()

  if (currentEvent) {
    redirect(`/${params.locale}/${currentEvent.slug}`)
  }

  // Fallback content if no active event
  return <div>No active event</div>
}
