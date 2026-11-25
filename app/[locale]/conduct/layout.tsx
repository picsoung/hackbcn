import Footer from '@/app/components/Footer'
import ClientNavbar from '@/app/components/ClientNavbar'
import { ThemeProvider } from '@/app/contexts/ThemeContext'
import { localizedPageMetadata } from '@/lib/page-seo'

export function generateMetadata({ params }: { params: { locale: string } }) {
  return localizedPageMetadata(params.locale, '/conduct', 'conduct.title')
}

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
