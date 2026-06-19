'use client'

import Link from 'next/link'
import { useAudit } from '@/lib/auditContext'
import LanguageSwitcher from './LanguageSwitcher'

export default function Navigation() {
  const { t } = useAudit()
  const links = [
    { href: '/', key: 'nav.home' },
    { href: '/audit', key: 'nav.audit' },
    { href: '/dashboard', key: 'nav.dashboard' },
    { href: '/scenarios', key: 'nav.scenarios' },
    { href: '/report', key: 'nav.report' },
    { href: '/settings', key: 'nav.settings' },
  ]
  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-[#e2e8f0] bg-white px-6 py-3">
      <div className="flex items-center gap-6">
        <Link href="/" className="text-lg font-semibold text-[#1a3a5c]">
          {t('app.name')}
        </Link>
        <div className="hidden gap-4 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm text-gray-700 hover:text-[#1a3a5c]">
              {t(l.key)}
            </Link>
          ))}
        </div>
      </div>
      <LanguageSwitcher />
    </nav>
  )
}
