'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAudit } from '@/lib/auditContext'
import PhilosophicalNotice from '@/components/PhilosophicalNotice'
import ScoreCard from '@/components/ScoreCard'
import RiskMatrix from '@/components/RiskMatrix'
import LayerMatrix from '@/components/LayerMatrix'
import ActorImpactMatrix from '@/components/ActorImpactMatrix'
import BurdenTransferMatrix from '@/components/BurdenTransferMatrix'
import WinnerLoserChart from '@/components/WinnerLoserChart'
import ScenarioComparison from '@/components/ScenarioComparison'
import ExportButtons from '@/components/ExportButtons'

const TABS = ['common.overview', 'common.metrics', 'common.actor_impact', 'common.global', 'common.scenarios', 'common.export']

export default function DashboardPage() {
  const { scoreResult, t } = useAudit()
  const [tab, setTab] = useState(0)

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

  return (
    <div id="dashboard-capture" className="space-y-6">
      <PhilosophicalNotice />

      <div className="grid gap-3 md:grid-cols-3">
        <ScoreCard
          label={t('metric.fdcr.name')}
          value={Math.round(scoreResult.fdcr)}
          description={t('metric.fdcr.description')}
          size="large"
          type="positive"
        />
        <ScoreCard
          label={t('metric.gfdcr.name')}
          value={Math.round(scoreResult.gfdcr)}
          description={t('metric.gfdcr.description')}
          size="large"
          type="positive"
        />
        <ScoreCard label={t('common.judgment')} value={t(`judgment.${scoreResult.judgments[0]}`)} />
      </div>

      <div className="flex flex-wrap gap-2 border-b border-[#e2e8f0]">
        {TABS.map((tk, i) => (
          <button
            key={tk}
            onClick={() => setTab(i)}
            className={`px-3 py-2 text-sm ${i === tab ? 'border-b-2 border-[#1a3a5c] font-medium text-[#1a3a5c]' : 'text-gray-600'}`}
          >
            {t(tk)}
          </button>
        ))}
      </div>

      {tab === 0 && (
        <div className="space-y-6">
          {scoreResult.corrections.length > 0 && (
            <div className="border border-[#e2e8f0] bg-amber-50 p-4 text-sm text-gray-800">
              <h3 className="mb-2 font-medium">Corrections applied</h3>
              <ul className="list-disc pl-5">
                {scoreResult.corrections.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <h3 className="mb-2 font-medium text-[#1a3a5c]">Judgments</h3>
            <div className="flex flex-wrap gap-2">
              {scoreResult.judgments.map((j) => (
                <span key={j} className="border border-[#e2e8f0] bg-gray-50 px-2 py-1 text-xs">
                  {t(`judgment.${j}`)}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-2 font-medium text-[#1a3a5c]">Layer Matrix</h3>
            <LayerMatrix />
          </div>
        </div>
      )}

      {tab === 1 && <RiskMatrix />}

      {tab === 2 && (
        <div className="space-y-6">
          <div>
            <h3 className="mb-2 font-medium text-[#1a3a5c]">Actor Impact Matrix</h3>
            <ActorImpactMatrix />
          </div>
          <div>
            <h3 className="mb-2 font-medium text-[#1a3a5c]">Winners / Losers</h3>
            <WinnerLoserChart />
          </div>
        </div>
      )}

      {tab === 3 && (
        <div className="space-y-6">
          {scoreResult.globalFlags.length > 0 && (
            <div className="border border-[#e2e8f0] bg-amber-50 p-4 text-sm">
              <ul className="list-disc pl-5">
                {scoreResult.globalFlags.map((g, i) => (
                  <li key={i}>{g}</li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <h3 className="mb-2 font-medium text-[#1a3a5c]">Burden Transfer Matrix</h3>
            <BurdenTransferMatrix />
          </div>
        </div>
      )}

      {tab === 4 && <ScenarioComparison />}

      {tab === 5 && (
        <div className="space-y-4">
          <ExportButtons captureId="dashboard-capture" />
          <Link href="/report" className="inline-block text-sm text-[#1a3a5c] underline">
            {t('nav.report')} →
          </Link>
        </div>
      )}
    </div>
  )
}
