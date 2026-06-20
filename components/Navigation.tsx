'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAudit } from '@/lib/auditContext'
import LanguageSwitcher from './LanguageSwitcher'

export default function Navigation() {
  const { t } = useAudit()
  const pathname = usePathname()
  const links = [
    { href: '/dashboard',   key: 'nav.dashboard' },
    { href: '/audit',       key: 'nav.audit' },
    { href: '/scenarios',   key: 'nav.scenarios' },
    { href: '/simulation',  key: 'nav.simulation' },
    { href: '/report',      key: 'nav.report' },
    { href: '/settings',    key: 'nav.settings' },
  ]
  return (
    <nav className="sticky top-0 z-50 border-b border-[#e2e8f0] bg-white">
      <div className="mx-auto max-w-6xl px-6 flex items-center justify-between py-3">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex flex-col leading-none">
            <span className="text-sm font-bold tracking-tight text-[#1a3a5c]">FEDS Studio</span>
            <span className="text-[10px] text-gray-400 tracking-wide uppercase">Freedom Dialectical Correctness</span>
          </Link>
          <div className="hidden gap-1 md:flex">
            {links.map((l) => {
              const active = pathname === l.href || pathname.startsWith(l.href + '/')
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                    active
                      ? 'bg-[#f0f4f8] text-[#1a3a5c]'
                      : 'text-gray-500 hover:text-[#1a3a5c]'
                  }`}
                >
                  {t(l.key)}
                </Link>
              )
            })}
          </div>
        </div>
        <LanguageSwitcher />
      </div>
    </nav>
  )
}
