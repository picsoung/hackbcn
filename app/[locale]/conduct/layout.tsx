'use client'
import Footer from '@/app/components/Footer'
import GradientHero from '@/app/components/GradientHero'
import { useIntl } from '@/app/components/Intl'
import ClientNavbar from '@/app/components/ClientNavbar'
import { ThemeProvider } from '@/app/contexts/ThemeContext'
import { useState } from 'react'
export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider eventSlug={null}>
      <div>
        <ClientNavbar />
        <main className="flex min-h-screen flex-col">
          {/* <GradientHero /> */}
          {children}
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  )
}
