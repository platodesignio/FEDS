'use client'

import { useAudit } from '@/lib/auditContext'

export default function ReportView() {
  const { scoreResult, locale, t } = useAudit()
  if (!scoreResult) return <p className="text-xs font-mono text-gray-400">{t('common.no_data')}</p>
  const r = scoreResult.report
  return (
    <article className="space-y-0 border border-[#e2e8f0]">
      {/* Dossier cover */}
      <header className="border-b border-[#e2e8f0] p-6 space-y-3 bg-[#f8fafc]">
        <div className="text-[10px] font-mono uppercase tracking-widest text-gray-400">
          FEDS Studio — {t('dossier.title')}
        </div>
        <h1 className="text-xl font-bold text-[#1a3a5c]">{r.target}</h1>
        <div className="flex flex-wrap gap-4 text-[10px] font-mono text-gray-500">
          <span>FDCR <span className="font-bold text-[#1a3a5c]">{r.fdcr}</span></span>
          <span>G-FDCR <span className="font-bold text-[#1a3a5c]">{r.gfdcr}</span></span>
          <span>Judgment <span className="font-bold text-[#1a3a5c]">{r.judgment}</span></span>
          <span>Category <span className="text-gray-600">{r.category}</span></span>
          <span>Generated <span className="text-gray-600">{new Date(r.generatedAt).toLocaleString()}</span></span>
        </div>
        {r.layers.length > 0 && (
          <div className="text-[10px] font-mono text-gray-400">
            Layers: {r.layers.join(' · ')}
          </div>
        )}
        {r.subjects.length > 0 && (
          <div className="text-[10px] font-mono text-gray-400">
            Subjects: {r.subjects.join(' · ')}
          </div>
        )}
      </header>

      {/* Sections */}
      {r.sections.map((s, i) => (
        <section key={i} className="border-b border-[#e2e8f0] last:border-0 px-6 py-5 space-y-2">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-[10px] text-gray-300 shrink-0 w-5">{String(i + 1).padStart(2, '0')}</span>
            <h2 className="text-xs font-bold uppercase tracking-wide text-[#1a3a5c]">
              {locale === 'ja' ? s.titleJa : s.title}
            </h2>
            {locale === 'en' && (
              <span className="text-[10px] text-gray-400 font-mono">{s.titleJa}</span>
            )}
          </div>
          <p className="text-xs leading-relaxed text-gray-700 pl-8">{s.content}</p>
        </section>
      ))}
    </article>
  )
}
