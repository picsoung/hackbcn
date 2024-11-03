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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  return (
    <div>
      <Navbar
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      <main className="flex min-h-screen flex-col">
        {/* <GradientHero /> */}
        {children}
      </main>
      <Footer />
    </div>
  )
}
