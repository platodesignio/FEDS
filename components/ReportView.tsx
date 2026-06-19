'use client'

import { useAudit } from '@/lib/auditContext'

export default function ReportView() {
  const { scoreResult, locale, t } = useAudit()
  if (!scoreResult) return <p className="text-sm text-gray-500">{t('common.no_data')}</p>
  const r = scoreResult.report
  return (
    <article className="space-y-6">
      <header className="border-b border-[#e2e8f0] pb-4">
        <h1 className="text-2xl font-bold text-[#1a3a5c]">{r.target}</h1>
        <p className="text-sm text-gray-600">
          {t('metric.fdcr.name')} {r.fdcr} · {t('metric.gfdcr.name')} {r.gfdcr} · {r.judgment}
        </p>
        <p className="text-xs text-gray-400">Generated {new Date(r.generatedAt).toLocaleString()}</p>
      </header>
      {r.sections.map((s, i) => (
        <section key={i}>
          <h2 className="mb-1 text-base font-semibold text-[#1a3a5c]">{locale === 'ja' ? s.titleJa : s.title}</h2>
          <p className="text-sm leading-relaxed text-gray-700">{s.content}</p>
        </section>
      ))}
    </article>
  )
}
