'use client'

import Link from 'next/link'
import { useAudit } from '@/lib/auditContext'
import ReportView from '@/components/ReportView'
import ExportButtons from '@/components/ExportButtons'

const REPORT_SECTIONS_PREVIEW = [
  { n: '01', en: 'Audit Target', ja: '監査対象' },
  { n: '05', en: 'Overall FDCR Judgment', ja: 'FDCR総合判定' },
  { n: '06', en: 'Global FDCR Judgment', ja: 'グローバルFDCR判定' },
  { n: '15', en: 'Managerial Self-Justification Risk Analysis', ja: '管理的自己正当化リスク分析' },
  { n: '16', en: 'Classification and Re-entry Risk Analysis', ja: '分類・再参入リスク分析' },
  { n: '13', en: 'Lifeworld Translation Analysis', ja: '生活世界翻訳分析' },
  { n: '12', en: 'Bio-Divisional Efficacy Analysis', ja: '生命分業的効力分析' },
  { n: '21', en: 'Who Wins, Who Loses, and Who Receives the Burden?', ja: '誰が勝ち、誰が負け、誰が負担を受けるか?' },
  { n: '24', en: 'Improvement Conditions', ja: '改善条件' },
  { n: '25', en: 'Final Audit Conclusion', ja: '最終監査結論' },
]

export default function ReportPage() {
  const { scoreResult, t, locale, loadDemoCase, demoCases } = useAudit()

  if (!scoreResult) {
    return (
      <div className="space-y-8">
        <div className="border border-[#e2e8f0] p-6 space-y-3">
          <h2 className="text-lg font-semibold text-[#1a3a5c]">{t('report.empty.title')}</h2>
          <p className="text-sm text-gray-600 max-w-2xl">{t('report.empty.body')}</p>
          <div className="flex gap-3 flex-wrap pt-2">
            <Link
              href="/audit"
              className="inline-block bg-[#1a3a5c] px-4 py-2 text-sm font-medium text-white hover:bg-[#0f2440] transition-colors"
            >
              {t('app.begin_audit')} →
            </Link>
          </div>
        </div>

        {/* Report structure preview */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-[#1a3a5c]">Report Structure Preview</h3>
          <p className="text-xs text-gray-500">
            A completed audit generates a full written report with 25 sections. Key sections include:
          </p>
          <div className="border border-[#e2e8f0] divide-y divide-[#e2e8f0]">
            {REPORT_SECTIONS_PREVIEW.map((s) => (
              <div key={s.n} className="flex items-baseline gap-3 px-4 py-2">
                <span className="font-mono text-xs text-gray-400 w-6 shrink-0">{s.n}</span>
                <span className="text-sm text-gray-700">{locale === 'ja' ? s.ja : s.en}</span>
                {locale === 'en' && <span className="text-xs text-gray-400">{s.ja}</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Load demo */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-[#1a3a5c]">{t('demo.section_title')}</h3>
          <p className="text-xs text-gray-500">{t('demo.description')}</p>
          <div className="grid gap-3 md:grid-cols-3">
            {demoCases.map((dc) => (
              <div key={dc.id} className="border border-[#e2e8f0] p-4 space-y-2">
                <div className="text-xs uppercase tracking-wide text-gray-400">Demo</div>
                <h4 className="text-sm font-medium text-gray-800">
                  {locale === 'ja' ? dc.labelJa : dc.label}
                </h4>
                <button
                  onClick={() => loadDemoCase(dc.id)}
                  className="text-xs border border-[#1a3a5c] px-3 py-1 text-[#1a3a5c] hover:bg-[#1a3a5c] hover:text-white transition-colors"
                >
                  {t('demo.load')}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <ExportButtons captureId="report-capture" />
        <Link href="/dashboard" className="text-sm text-[#1a3a5c] underline">
          ← {t('nav.dashboard')}
        </Link>
      </div>
      <div id="report-capture" className="bg-white">
        <ReportView />
      </div>
    </div>
  )
}
