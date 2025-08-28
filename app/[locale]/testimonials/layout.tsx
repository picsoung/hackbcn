'use client'
import Footer from '@/app/components/Footer'
import GradientHero from '@/app/components/GradientHero'
import ClientNavbar from '@/app/components/ClientNavbar'
import { useState } from 'react'
export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div>
      <ClientNavbar />
      <main className="flex min-h-screen flex-col">
        {/* <GradientHero /> */}
        {children}
      </main>
      <Footer />
    </div>
  )
}
