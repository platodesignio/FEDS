'use client'

import Link from 'next/link'
import { useAudit } from '@/lib/auditContext'
import { ScenarioId } from '@/types/scenario'
import ScenarioComparison from '@/components/ScenarioComparison'
import ScoreCard from '@/components/ScoreCard'

export default function ScenariosPage() {
  const { scoreResult, t, locale } = useAudit()
  if (!scoreResult) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-gray-600">{t('common.no_data')}</p>
        <Link href="/audit" className="inline-block bg-[#1a3a5c] px-4 py-2 text-sm text-white">
          {t('app.begin_audit')}
        </Link>
      </div>
    )
  }
  const order: ScenarioId[] = ['current', 'reform', 'managerial']
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#1a3a5c]">{t('common.scenarios')}</h1>
      <div className="grid gap-3 md:grid-cols-3">
        {order.map((id) => {
          const s = scoreResult.scenarios[id]
          return (
            <div key={id} className="space-y-2 border border-[#e2e8f0] p-3">
              <h2 className="font-medium text-[#1a3a5c]">{locale === 'ja' ? s.labelJa : s.label}</h2>
              <ScoreCard label="FDCR" value={s.fdcr} type="positive" />
              <ScoreCard label="G-FDCR" value={s.gfdcr} type="positive" />
              <p className="text-xs text-gray-600">{t(`judgment.${s.judgment}`)}</p>
            </div>
          )
        })}
      </div>
      <ScenarioComparison />
    </div>
  )
}
