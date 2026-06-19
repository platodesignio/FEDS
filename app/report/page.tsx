'use client'

import Link from 'next/link'
import { useAudit } from '@/lib/auditContext'
import ReportView from '@/components/ReportView'
import ExportButtons from '@/components/ExportButtons'

export default function ReportPage() {
  const { scoreResult, t } = useAudit()
  if (!scoreResult) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-gray-600">{t('common.no_data')}</p>
        <Link href="/audit" className="inline-block bg-[#1a3a5c] px-4 py-2 text-sm text-white">
          {t('app.begin_audit')}
        </Link>
      </div>
    )
  }
  return (
    <div className="space-y-6">
      <ExportButtons captureId="report-capture" />
      <div id="report-capture" className="bg-white">
        <ReportView />
      </div>
    </div>
  )
}
