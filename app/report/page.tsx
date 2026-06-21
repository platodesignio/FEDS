'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useAudit } from '@/lib/auditContext'
import ReportView from '@/components/ReportView'
import ExportButtons from '@/components/ExportButtons'

const DOSSIER_SECTIONS = [
  { n: '01', en: 'Audit Target',                          ja: '監査対象' },
  { n: '02', en: 'Scope and Methodological Notice',       ja: '範囲と方法論的注記' },
  { n: '03', en: 'Overall FDCR Judgment',                 ja: 'FDCR総合判定' },
  { n: '04', en: 'Global FDCR Judgment',                  ja: 'グローバルFDCR判定' },
  { n: '05', en: 'Creative Future-Challenge Analysis',    ja: '創造的未来挑戦分析' },
  { n: '06', en: 'Managerial Self-Justification Risk',    ja: '管理的自己正当化リスク' },
  { n: '07', en: 'Classification and Re-entry Risk',      ja: '分類・再参入リスク' },
  { n: '08', en: 'Lifeworld Translation Analysis',        ja: '生活世界翻訳分析' },
  { n: '09', en: 'Bio-Divisional Efficacy Analysis',      ja: '生命分業的効力分析' },
  { n: '10', en: 'Democratic Re-Audit Conditions',        ja: '民主的再監査条件' },
  { n: '14', en: 'Who Wins, Who Loses, Who Bears Burden', ja: '誰が勝ち、誰が負け、誰が負担を受けるか' },
  { n: '15', en: 'Actor Impact Matrix',                   ja: '当事者影響マトリクス' },
  { n: '24', en: 'Improvement Conditions',                ja: '改善条件' },
  { n: '25', en: 'Final Audit Conclusion',                ja: '最終監査結論' },
]

export default function ReportDossierPage() {
  const { scoreResult, t, locale, loadDemoCase, demoCases } = useAudit()

  useEffect(() => {
    if (!scoreResult) loadDemoCase('ai_hiring')
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!scoreResult) {
    return (
      <div className="space-y-8">
        <header className="border-b border-[#1e3a5a] pb-6 space-y-1">
          <div className="text-[9px] uppercase tracking-widest text-[#3a6a8a]">FEDS Studio</div>
          <h1 className="text-2xl font-bold tracking-tight text-[#7ac8f8]">{t('dossier.title')}</h1>
          <p className="text-sm text-[#4a7a9a] max-w-2xl">{t('dossier.subtitle')}</p>
        </header>

        <div className="border border-[#1e3a5a] p-6 space-y-4 bg-[#080e18]">
          <h2 className="text-sm font-semibold text-[#7ac8f8]">{t('dossier.empty.title')}</h2>
          <p className="text-sm text-[#7a98b4] max-w-2xl">{t('dossier.empty.body')}</p>
          <div className="flex gap-3 flex-wrap pt-1">
            <Link
              href="/audit"
              className="inline-block border border-[#4a8abb] px-4 py-2 text-xs font-medium text-[#7ac8f8] hover:bg-[#0f2535] transition-colors"
            >
              {t('workbench.title')} →
            </Link>
            <Link
              href="/dashboard"
              className="inline-block border border-[#1e3a5a] px-4 py-2 text-xs text-[#4a7a9a] hover:border-[#4a8abb] hover:text-[#7ac8f8] transition-colors"
            >
              {t('nav.dashboard')}
            </Link>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-[9px] font-mono uppercase tracking-widest text-[#3a6a8a]">{t('dossier.section_preview')}</h3>
          <div className="border border-[#1e3a5a] divide-y divide-[#1e3a5a]">
            {DOSSIER_SECTIONS.map((s) => (
              <div key={s.n} className="flex items-baseline gap-4 px-4 py-2.5 bg-[#080e18]">
                <span className="font-mono text-[10px] text-[#2a5a7a] w-6 shrink-0">{s.n}</span>
                <span className="text-xs text-[#94a3b8]">{locale === 'ja' ? s.ja : s.en}</span>
                {locale === 'en' && <span className="text-[10px] text-[#3a6a8a]">{s.ja}</span>}
              </div>
            ))}
            <div className="px-4 py-2.5 text-[9px] font-mono text-[#2a5a7a] bg-[#080e18]">
              + 11 additional sections (Ecological, Global, Historical, Temporal, Daoist Corrective, Scenarios…)
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-[9px] font-mono uppercase tracking-widest text-[#3a6a8a]">{t('console.case_files')}</h3>
          <div className="border border-[#1e3a5a] divide-y divide-[#1e3a5a]">
            {demoCases.map((dc) => (
              <div key={dc.id} className="flex items-start justify-between gap-4 px-4 py-3 bg-[#080e18]">
                <div>
                  <div className="text-[9px] font-mono text-[#3a6a8a] uppercase tracking-wide mb-0.5">
                    {t('console.case_file')} {dc.caseNumber}
                  </div>
                  <div className="text-xs font-semibold text-[#7ac8f8]">
                    {locale === 'ja' ? dc.labelJa : dc.label}
                  </div>
                </div>
                <button
                  onClick={() => loadDemoCase(dc.id)}
                  className="shrink-0 text-[9px] border border-[#2a5a8a] px-3 py-1 text-[#4a8abb] hover:border-[#7ac8f8] hover:text-[#7ac8f8] transition-colors"
                >
                  {t('console.open_case_file')}
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
      <header className="border-b border-[#1e3a5a] pb-6 space-y-1">
        <div className="text-[9px] uppercase tracking-widest text-[#3a6a8a]">FEDS Studio</div>
        <h1 className="text-2xl font-bold tracking-tight text-[#7ac8f8]">{t('dossier.title')}</h1>
        <p className="text-sm text-[#4a7a9a] max-w-2xl">{t('dossier.subtitle')}</p>
      </header>

      <div className="flex flex-wrap gap-3 items-center justify-between">
        <ExportButtons captureId="report-capture" />
        <Link href="/dashboard" className="text-xs font-mono text-[#3a6a8a] hover:text-[#7ac8f8] transition-colors">
          ← {t('nav.dashboard')}
        </Link>
      </div>

      <div id="report-capture" className="bg-[#080e18]">
        <ReportView />
      </div>
    </div>
  )
}
