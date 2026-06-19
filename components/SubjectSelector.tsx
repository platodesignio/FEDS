'use client'

import { useAudit } from '@/lib/auditContext'
import { ACTOR_TYPES } from '@/data/actors'

export default function SubjectSelector() {
  const { auditState, setAuditState } = useAudit()
  const toggle = (id: string) =>
    setAuditState((s) => ({
      ...s,
      subjects: s.subjects.includes(id) ? s.subjects.filter((x) => x !== id) : [...s.subjects, id],
    }))
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {ACTOR_TYPES.map((a) => {
        const selected = auditState.subjects.includes(a)
        return (
          <label
            key={a}
            className={`flex cursor-pointer items-center gap-2 border p-2 text-sm ${
              selected ? 'border-[#1a3a5c]' : 'border-[#e2e8f0]'
            }`}
          >
            <input type="checkbox" checked={selected} onChange={() => toggle(a)} className="accent-[#1a3a5c]" />
            {a}
          </label>
        )
      })}
    </div>
  )
}
