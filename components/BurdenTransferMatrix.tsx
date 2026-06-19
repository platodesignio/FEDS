'use client'

import { useAudit } from '@/lib/auditContext'
import { colorForRisk } from './ScoreCard'

export default function BurdenTransferMatrix() {
  const { scoreResult } = useAudit()
  if (!scoreResult) return null
  if (scoreResult.burdenTransfers.length === 0)
    return <p className="text-sm text-gray-500">No significant burden transfers detected.</p>
  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b border-[#e2e8f0] text-left">
          <th className="py-2">From → To</th>
          <th className="py-2">Type</th>
          <th className="py-2">Magnitude</th>
          <th className="py-2">Visibility</th>
        </tr>
      </thead>
      <tbody>
        {scoreResult.burdenTransfers.map((b, i) => (
          <tr key={i} className="border-b border-[#f1f5f9]">
            <td className="py-2">
              {b.from} → {b.to}
            </td>
            <td className="py-2">{b.burdenType}</td>
            <td className="py-2 font-mono" style={{ color: colorForRisk(b.magnitude) }}>
              {b.magnitude}
            </td>
            <td className="py-2">{b.visibility}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
