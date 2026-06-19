'use client'

import { useAudit } from '@/lib/auditContext'

export default function TargetInput() {
  const { auditState, setAuditState, t } = useAudit()
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-800">{t('step.target_prompt')}</label>
      <input
        type="text"
        value={auditState.target}
        onChange={(e) => setAuditState((s) => ({ ...s, target: e.target.value }))}
        placeholder="e.g. AI hiring system"
        className="w-full border border-[#e2e8f0] px-3 py-2 text-sm"
      />
    </div>
  )
}
