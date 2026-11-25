import type { ReactNode } from 'react'
import OrgNavbar from '../home/OrgNavbar'
import OrgFooter from '../home/OrgFooter'

export default function AuthShell({
  children,
  wide = false,
}: {
  children: ReactNode
  wide?: boolean
}) {
  return (
    <div data-register="night" className="min-h-screen bg-ground text-ink">
      <OrgNavbar featuredEvent={null} />
      <main
        className={`mx-auto w-full ${wide ? 'max-w-6xl' : 'max-w-lg'} px-6 py-12 sm:py-20`}
      >
        {children}
      </main>
      <OrgFooter />
    </div>
  )
}
