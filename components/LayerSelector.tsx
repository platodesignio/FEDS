'use client'

import { useAudit } from '@/lib/auditContext'
import { LAYERS } from '@/data/layers'

export default function LayerSelector() {
  const { auditState, setAuditState, locale } = useAudit()
  const toggle = (id: string) =>
    setAuditState((s) => ({
      ...s,
      layers: s.layers.includes(id) ? s.layers.filter((x) => x !== id) : [...s.layers, id],
    }))
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {LAYERS.map((l) => {
        const selected = auditState.layers.includes(l.id)
        return (
          <label
            key={l.id}
            className={`flex cursor-pointer items-center gap-2 border p-2 text-sm ${
              selected ? 'border-[#1a3a5c]' : 'border-[#e2e8f0]'
            }`}
          >
            <input type="checkbox" checked={selected} onChange={() => toggle(l.id)} className="accent-[#1a3a5c]" />
            {locale === 'ja' ? l.labelJa : l.label}
          </label>
        )
      })}
    </div>
  )
}
