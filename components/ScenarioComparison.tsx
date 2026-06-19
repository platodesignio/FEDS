'use client'

import { useAudit } from '@/lib/auditContext'
import { ScenarioId } from '@/types/scenario'

const KEY_METRICS = ['CFCS', 'DER', 'RCI', 'DRR', 'MSJR', 'CFR', 'RBR', 'BTR', 'EER']

export default function ScenarioComparison() {
  const { scoreResult, locale } = useAudit()
  if (!scoreResult) return null
  const order: ScenarioId[] = ['current', 'reform', 'managerial']
  const scenarios = order.map((id) => scoreResult.scenarios[id])
  const current = scoreResult.scenarios.current

  const delta = (v: number, base: number) => {
    const d = v - base
    if (d === 0) return ''
    return d > 0 ? ` ↑${d}` : ` ↓${Math.abs(d)}`
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-[#e2e8f0] text-left">
            <th className="py-2">Metric</th>
            {scenarios.map((s) => (
              <th key={s.id} className="py-2">
                {locale === 'ja' ? s.labelJa : s.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-[#f1f5f9] font-bold">
            <td className="py-2">FDCR</td>
            {scenarios.map((s) => (
              <td key={s.id} className="py-2 font-mono">
                {s.fdcr}
                {s.id !== 'current' && delta(s.fdcr, current.fdcr)}
              </td>
            ))}
          </tr>
          <tr className="border-b border-[#f1f5f9] font-bold">
            <td className="py-2">G-FDCR</td>
            {scenarios.map((s) => (
              <td key={s.id} className="py-2 font-mono">
                {s.gfdcr}
                {s.id !== 'current' && delta(s.gfdcr, current.gfdcr)}
              </td>
            ))}
          </tr>
          {KEY_METRICS.map((mk) => (
            <tr key={mk} className="border-b border-[#f1f5f9]">
              <td className="py-2">{mk}</td>
              {scenarios.map((s) => {
                const v = Math.round((s.metrics as unknown as Record<string, number>)[mk])
                const base = Math.round((current.metrics as unknown as Record<string, number>)[mk])
                return (
                  <td key={s.id} className="py-2 font-mono">
                    {v}
                    {s.id !== 'current' && delta(v, base)}
                  </td>
                )
              })}
            </tr>
          ))}
          <tr>
            <td className="py-2">Judgment</td>
            {scenarios.map((s) => (
              <td key={s.id} className="py-2 text-xs">
                {s.judgment}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  )
}
