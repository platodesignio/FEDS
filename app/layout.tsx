import type { Metadata } from 'next'
import './globals.css'
import { AuditProvider } from '@/lib/auditContext'
import Navigation from '@/components/Navigation'

export const metadata: Metadata = {
  title: 'FEDS Studio — Freedom Dialectical Correctness Simulator',
  description: 'An operational, philosophical instrument for auditing freedom generativity across layers.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#05080f] text-white">
        <AuditProvider>
          <Navigation />
          <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
        </AuditProvider>
      </body>
    </html>
  )
}
