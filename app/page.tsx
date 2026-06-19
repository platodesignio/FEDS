'use client'

import Link from 'next/link'
import { useAudit } from '@/lib/auditContext'
import PhilosophicalNotice from '@/components/PhilosophicalNotice'

export default function Home() {
  const { t } = useAudit()
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-4xl font-bold text-[#1a3a5c]">FEDS Studio</h1>
        <p className="text-lg text-gray-700">Freedom Dialectical Correctness Simulator</p>
        <p className="text-base text-gray-500">自由弁証法正答率シミュレーター</p>
      </header>

      <PhilosophicalNotice />

      <p className="max-w-3xl text-sm leading-relaxed text-gray-700">{t('app.description')}</p>

      <Link
        href="/audit"
        className="inline-block bg-[#1a3a5c] px-6 py-3 text-sm font-medium text-white"
      >
        {t('app.begin_audit')}
      </Link>
    </div>
  )
}
