'use client'

import { useAudit } from '@/lib/auditContext'

export default function WinnerLoserChart() {
  const { scoreResult } = useAudit()
  if (!scoreResult) return null
  const sorted = [...scoreResult.actorImpacts].sort((a, b) => b.netImpact - a.netImpact)
  if (sorted.length === 0) return <p className="text-sm text-gray-500">No subjects selected.</p>
  const max = Math.max(1, ...sorted.map((a) => Math.abs(a.netImpact)))
  return (
    <div className="space-y-2">
      {sorted.map((a) => {
        const pct = (Math.abs(a.netImpact) / max) * 50
        const positive = a.netImpact >= 0
        return (
          <div key={a.actor} className="flex items-center gap-2 text-xs">
            <div className="w-28 truncate text-right">{a.actor}</div>
            <div className="relative h-4 flex-1 bg-gray-100">
              <div className="absolute left-1/2 top-0 h-full w-px bg-gray-400" />
              <div
                className="absolute top-0 h-full"
                style={{
                  left: positive ? '50%' : `${50 - pct}%`,
                  width: `${pct}%`,
                  backgroundColor: positive ? '#15803d' : '#b91c1c',
                }}
              />
            </div>
            <div className="w-8 font-mono" style={{ color: positive ? '#15803d' : '#b91c1c' }}>
              {a.netImpact}
            </div>
          </div>
        )
      })}
    </div>
  )
}
