'use client'

import { useAudit } from '@/lib/auditContext'
import { LAYERS } from '@/data/layers'
import { VARIABLES } from '@/data/variables'
import { colorForPositive } from './ScoreCard'

export default function LayerMatrix() {
  const { auditState, scoreResult, locale } = useAudit()
  if (!scoreResult) return null
  const ms = scoreResult.metrics as unknown as Record<string, number>

  function layerScore(layerId: string): number {
    // Estimate from variables mapped to layer + selection
    const vars = VARIABLES.filter((v) => v.affectedLayers.includes(layerId))
    let acc = scoreResult!.fdcr
    if (vars.length) {
      let sum = 0
      for (const v of vars) {
        for (const ref of v.affectedMetrics) {
          const val = ms[ref.metric] ?? 50
          sum += ref.polarity === 'positive' ? val : 100 - val
        }
      }
      acc = sum / vars.reduce((n, v) => n + v.affectedMetrics.length, 0)
    }
    const cap = scoreResult!.layerCaps[layerId]
    if (cap !== undefined) acc = Math.min(acc, cap)
    return Math.round(acc)
  }

  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b border-[#e2e8f0] text-left">
          <th className="py-2">Layer</th>
          <th className="py-2">Selected</th>
          <th className="py-2">Est. Contribution</th>
        </tr>
      </thead>
      <tbody>
        {LAYERS.map((l) => {
          const score = layerScore(l.id)
          const sel = auditState.layers.includes(l.id)
          return (
            <tr key={l.id} className="border-b border-[#f1f5f9]">
              <td className="py-2">{locale === 'ja' ? l.labelJa : l.label}</td>
              <td className="py-2">{sel ? '●' : '—'}</td>
              <td className="py-2 font-mono" style={{ color: colorForPositive(score) }}>
                {score}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
