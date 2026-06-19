'use client'

import { useAudit } from '@/lib/auditContext'
import { ALL_METRICS, RISK_METRIC_IDS } from '@/data/metrics'
import { colorForPositive, colorForRisk } from './ScoreCard'

const RISK = new Set(RISK_METRIC_IDS)

export default function RiskMatrix() {
  const { scoreResult, locale } = useAudit()
  if (!scoreResult) return null
  const ms = scoreResult.metrics as unknown as Record<string, number>
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {ALL_METRICS.map((m) => {
        const v = Math.round(ms[m.id] ?? 50)
        const isRisk = RISK.has(m.id)
        const color = isRisk ? colorForRisk(v) : colorForPositive(v)
        return (
          <div key={m.id} className="flex items-center justify-between border border-[#e2e8f0] px-3 py-2 text-sm">
            <div>
              <span className="font-mono font-medium text-[#1a3a5c]">{m.id}</span>
              <span className="ml-2 text-xs text-gray-500">{locale === 'ja' ? m.nameJa : m.name}</span>
            </div>
            <span className="font-mono font-bold" style={{ color }}>
              {v}
            </span>
          </div>
        )
      })}
    </div>
  )
}
