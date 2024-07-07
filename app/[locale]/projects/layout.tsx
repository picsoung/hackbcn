'use client'
import Footer from '@/app/components/Footer'
import GradientHero from '@/app/components/GradientHero'
import { useIntl } from '@/app/components/Intl'
import Navbar from '@/app/components/Navbar'
import { useState } from 'react'
export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const intl = useIntl()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigationOptions = [
    { name: intl.t('navbar.sponsors'), href: '#sponsors' },
    { name: intl.t('navbar.why-should-i-join'), href: '#why' },
    { name: intl.t('navbar.schedule'), href: '#schedule' },
    { name: intl.t('navbar.faq'), href: '#faq' },
    { name: intl.t('navbar.team'), href: '#about' },
    { name: intl.t('navbar.judges'), href: '#judges' },
    { name: intl.t('navbar.coc'), href: `${intl.locale}/conduct` },
  ]
  return (
    <div>
      <Navbar
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        navigationOptions={navigationOptions}
      />
      <main className="flex min-h-screen flex-col">
        <GradientHero />
        {children}
      </main>
      <Footer />
    </div>
  )
}
