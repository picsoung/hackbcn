import { Inter } from 'next/font/google'
import './globals.css'
import SiteDocument from './components/SiteDocument'
import { CSPostHogProvider } from './providers'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SiteDocument className={inter.className}>
      <CSPostHogProvider>{children}</CSPostHogProvider>
    </SiteDocument>
  )
}
