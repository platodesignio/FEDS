'use client'

import { useAudit } from '@/lib/auditContext'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import PhilosophicalNotice from '@/components/PhilosophicalNotice'

export default function SettingsPage() {
  const { t, auditState } = useAudit()
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#1a3a5c]">{t('nav.settings')}</h1>
      <div className="space-y-2">
        <h2 className="text-sm font-medium text-gray-800">Language / 言語</h2>
        <LanguageSwitcher />
      </div>
      <div className="space-y-2">
        <h2 className="text-sm font-medium text-gray-800">Current audit state</h2>
        <pre className="overflow-x-auto border border-[#e2e8f0] bg-gray-50 p-3 text-xs">
          {JSON.stringify(
            { target: auditState.target, category: auditState.category, layers: auditState.layers, subjects: auditState.subjects },
            null,
            2
          )}
        </pre>
      </div>
      <PhilosophicalNotice />
    </div>
  )
}
