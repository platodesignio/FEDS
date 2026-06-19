'use client'

import { useAudit } from '@/lib/auditContext'

export default function PhilosophicalNotice() {
  const { t } = useAudit()
  const keys = ['notice.no_persons', 'notice.not_absolute', 'notice.operational']
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {keys.map((k) => (
        <div key={k} className="border border-[#e2e8f0] bg-white p-4 text-sm text-gray-700">
          {t(k)}
        </div>
      ))}
    </div>
  )
}
