'use client'

import { useAudit } from '@/lib/auditContext'
import { CATEGORIES } from '@/data/categories'

export default function CategorySelector() {
  const { auditState, setAuditState, locale } = useAudit()
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {CATEGORIES.map((c) => {
        const selected = auditState.category === c.id
        return (
          <button
            key={c.id}
            onClick={() => setAuditState((s) => ({ ...s, category: c.id }))}
            className={`border p-3 text-left text-sm ${
              selected ? 'border-[#1a3a5c] bg-[#1a3a5c] text-white' : 'border-[#e2e8f0] bg-white text-gray-800'
            }`}
          >
            {locale === 'ja' ? c.labelJa : c.label}
          </button>
        )
      })}
    </div>
  )
}
