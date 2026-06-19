'use client'

import { useAudit } from '@/lib/auditContext'
import { colorForRisk } from './ScoreCard'

const DIMS: { key: keyof import('@/types/actor').ActorImpact; label: string }[] = [
  { key: 'freedomGain', label: 'Freedom Gain' },
  { key: 'freedomLoss', label: 'Freedom Loss' },
  { key: 'bodilyBurden', label: 'Bodily Burden' },
  { key: 'reEntryCapacity', label: 'Re-entry' },
  { key: 'democraticVoice', label: 'Voice' },
  { key: 'responsibilityBurden', label: 'Resp. Burden' },
  { key: 'classificationExposure', label: 'Classification' },
  { key: 'temporalBurden', label: 'Temporal' },
  { key: 'epistemicInjusticeExposure', label: 'Epistemic' },
  { key: 'ecologicalBurden', label: 'Ecological' },
]

const RISK_DIMS = new Set([
  'freedomLoss',
  'bodilyBurden',
  'responsibilityBurden',
  'classificationExposure',
  'temporalBurden',
  'epistemicInjusticeExposure',
  'ecologicalBurden',
])

export default function ActorImpactMatrix() {
  const { scoreResult } = useAudit()
  if (!scoreResult) return null
  if (scoreResult.actorImpacts.length === 0)
    return <p className="text-sm text-gray-500">No subjects selected.</p>
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="border-b border-[#e2e8f0] text-left">
            <th className="py-2 pr-3">Actor</th>
            {DIMS.map((d) => (
              <th key={d.key} className="py-2 pr-2">
                {d.label}
              </th>
            ))}
            <th className="py-2 pr-2">Net</th>
            <th className="py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {scoreResult.actorImpacts.map((a) => (
            <tr key={a.actor} className="border-b border-[#f1f5f9]">
              <td className="py-2 pr-3 font-medium">{a.actor}</td>
              {DIMS.map((d) => {
                const v = a[d.key] as number
                const color = RISK_DIMS.has(d.key as string)
                  ? colorForRisk(v)
                  : v >= 60
                    ? '#15803d'
                    : v >= 35
                      ? '#b45309'
                      : '#b91c1c'
                return (
                  <td key={d.key} className="py-2 pr-2 font-mono" style={{ color }}>
                    {v}
                  </td>
                )
              })}
              <td className="py-2 pr-2 font-mono font-bold" style={{ color: a.netImpact >= 0 ? '#15803d' : '#b91c1c' }}>
                {a.netImpact}
              </td>
              <td className="py-2">
                <span className="inline-block border border-[#e2e8f0] bg-gray-50 px-2 py-0.5">{a.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
