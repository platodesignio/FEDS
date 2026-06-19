'use client'

import { useAudit } from '@/lib/auditContext'
import { AuditQuestion as AuditQuestionType } from '@/types/audit'

export default function AuditQuestion({ question }: { question: AuditQuestionType }) {
  const { auditState, setAuditState, locale } = useAudit()
  const value = auditState.questionValues[question.id] ?? 2
  const text = locale === 'ja' ? question.textJa : question.text
  return (
    <div className="border border-[#e2e8f0] p-4">
      <p className="mb-3 text-sm text-gray-800">{text}</p>
      <div className="flex items-center gap-2">
        {[0, 1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() =>
              setAuditState((s) => ({
                ...s,
                questionValues: { ...s.questionValues, [question.id]: n },
              }))
            }
            className={`h-8 w-8 border text-sm ${
              value === n ? 'border-[#1a3a5c] bg-[#1a3a5c] text-white' : 'border-[#e2e8f0] bg-white text-gray-700'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}
