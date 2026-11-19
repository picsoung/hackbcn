import type { ReactNode } from 'react'
import OrgNavbar from '../home/OrgNavbar'
import OrgFooter from '../home/OrgFooter'

export default function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div data-register="night" className="min-h-screen bg-ground text-ink">
      <OrgNavbar featuredEvent={null} />
      <main className="mx-auto w-full max-w-lg px-6 py-12 sm:py-20">
        {children}
      </main>
      <OrgFooter />
    </div>
  )
}
