'use client'

import { useAudit } from '@/lib/auditContext'
import { VariableSchema } from '@/types/audit'

export default function VariableSlider({ variable }: { variable: VariableSchema }) {
  const { auditState, setAuditState, locale } = useAudit()
  const value = auditState.variableValues[variable.id] ?? variable.defaultValue
  const label = locale === 'ja' ? variable.labelJa : variable.label
  return (
    <div className="py-2">
      <div className="flex items-center justify-between">
        <label className="text-sm text-gray-800">
          {label}
          <span className="ml-2 text-xs text-gray-400">{variable.polarity === 'negative' ? '(risk)' : ''}</span>
        </label>
        <span className="font-mono text-sm text-[#1a3a5c]">{value}</span>
      </div>
      <input
        type="range"
        min={variable.min}
        max={variable.max}
        value={value}
        onChange={(e) =>
          setAuditState((s) => ({
            ...s,
            variableValues: { ...s.variableValues, [variable.id]: Number(e.target.value) },
          }))
        }
        className="w-full accent-[#1a3a5c]"
      />
    </div>
  )
}
