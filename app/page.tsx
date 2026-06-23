'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAudit } from '@/lib/auditContext'

export default function Home() {
  const { t, loadDemoCase, demoCases, locale } = useAudit()
  const router = useRouter()

  function handleLoadDemo(id: string) {
    loadDemoCase(id)
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#05080f] text-white -mx-6 -mt-6 px-6 pt-6">

      {/* Hero */}
      <header className="max-w-4xl mx-auto pt-20 pb-16 space-y-8">
        <div className="space-y-2">
          <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#2a5a8a]">
            Research Audit Tool — Freedom Dialectical Correctness
          </div>
          <h1 className="text-6xl font-bold tracking-tight text-white leading-none">
            FEDS Studio
          </h1>
          <p className="text-xl font-light text-[#4a8abb] tracking-wide">
            Freedom Dialectical Correctness Simulator
          </p>
          <p className="text-base text-[#2a5a8a]">自由弁証法正答率シミュレーター</p>
        </div>

        <p className="text-sm leading-relaxed text-[#6a9aba] max-w-2xl">
          {t('app.research_positioning')}
        </p>

        <div className="border-l-2 border-[#1e3a5a] pl-4">
          <p className="text-sm font-medium text-[#7ac8f8]">
            {t('app.core_question')}
          </p>
        </div>

        <div className="flex gap-3 flex-wrap">
          <Link
            href="/dashboard"
            className="bg-[#7ac8f8] text-[#05080f] px-6 py-3 text-sm font-bold hover:bg-white transition-colors"
          >
            {t('nav.dashboard')} →
          </Link>
          <Link
            href="/audit"
            className="border border-[#2a5a8a] px-6 py-3 text-sm font-medium text-[#4a8abb] hover:border-[#7ac8f8] hover:text-[#7ac8f8] transition-colors"
          >
            {t('workbench.title')} →
          </Link>
          <Link
            href="/simulation"
            className="border border-[#1e3a5a] px-6 py-3 text-sm font-medium text-[#2a5a8a] hover:border-[#4a8abb] hover:text-[#4a8abb] transition-colors"
          >
            {t('sim.title')} →
          </Link>
        </div>
      </header>

      {/* FDCR axis */}
      <section className="border-t border-[#0f1e30] py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#2a5a8a]">Primary Score Axis</div>
          <div className="flex items-baseline gap-4 flex-wrap">
            <span className="text-5xl font-mono font-bold text-[#7ac8f8]">FDCR</span>
            <div>
              <div className="text-lg text-white font-light">Freedom Dialectical Correctness Rate</div>
              <div className="text-sm text-[#2a5a8a]">自由弁証法正答率</div>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-[#6a9aba] max-w-2xl">{t('app.description')}</p>

          <div className="grid gap-px bg-[#0f1e30] sm:grid-cols-2 lg:grid-cols-4 border border-[#0f1e30]">
            {[
              ['CFCS', 'Creative Future-Challenge Score',    'pos'],
              ['DER',  'Dialectical Efficacy Rate',          'pos'],
              ['RCI',  'Return Capacity Index',              'pos'],
              ['BGR',  'Bodily Generation Rate',             'pos'],
              ['MSJR', 'Managerial Self-Justification Risk', 'risk'],
              ['CFR',  'Classification Fixation Risk',       'risk'],
              ['RBR',  'Re-entry Blockage Risk',             'risk'],
              ['BTR',  'Burden Transfer Risk',               'risk'],
            ].map(([abbr, name, type]) => (
              <div key={abbr} className="bg-[#080e18] px-4 py-3 space-y-0.5">
                <div className={`font-mono text-xs font-bold ${type === 'pos' ? 'text-[#4ade80]' : 'text-[#f87171]'}`}>
                  {abbr}
                </div>
                <div className="text-[10px] text-[#3a6a8a]">{name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ecological extension */}
      <section className="border-t border-[#0f1e30] py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#2a5a8a]">Ecological Extension Metrics</div>
          <div className="grid gap-px bg-[#0f1e30] sm:grid-cols-2 lg:grid-cols-4 border border-[#0f1e30]">
            {[
              { id: 'E-FDCR',  full: 'Ecological Freedom-Evolution Dialectical Correctness Rate', color: '#4ade80' },
              { id: 'EBDCR',   full: 'Ecological Bio-Divisional Correctness Rate',                color: '#34d399' },
              { id: 'EBDE',    full: 'Ecological Bio-Divisional Efficacy',                        color: '#6ee7b7' },
              { id: 'EP-BTM',  full: 'Eco-Planetary Burden Transfer Matrix',                     color: '#f87171' },
            ].map(({ id, full, color }) => (
              <div key={id} className="bg-[#080e18] px-4 py-3 space-y-1">
                <div className="font-mono text-xs font-bold" style={{ color }}>{id}</div>
                <div className="text-[10px] text-[#3a6a8a] leading-snug">{full}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Canonical Case Files */}
      <section className="border-t border-[#0f1e30] py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#2a5a8a]">Canonical Case Files</div>
          <div className="space-y-px border border-[#0f1e30]">
            {demoCases.map((dc) => (
              <div key={dc.id} className="bg-[#080e18] border-b border-[#0f1e30] last:border-0 p-5 flex items-start justify-between gap-4">
                <div className="space-y-1.5 min-w-0">
                  <div className="text-[9px] font-mono text-[#2a5a8a] uppercase tracking-widest">
                    Case File {dc.caseNumber}
                  </div>
                  <h3 className="text-sm font-bold text-[#7ac8f8]">
                    {locale === 'ja' ? dc.labelJa : dc.label}
                  </h3>
                  <p className="text-[10px] text-[#3a6a8a] leading-relaxed max-w-xl">
                    {locale === 'ja' ? dc.centralTensionJa : dc.centralTension}
                  </p>
                </div>
                <button
                  onClick={() => handleLoadDemo(dc.id)}
                  className="shrink-0 text-[10px] font-mono border border-[#2a5a8a] px-4 py-2 text-[#4a8abb] hover:border-[#7ac8f8] hover:text-[#7ac8f8] transition-colors"
                >
                  Open Case File →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Methodological axioms */}
      <section className="border-t border-[#0f1e30] py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#2a5a8a]">Methodological Axioms</div>
          <div className="space-y-px border border-[#0f1e30]">
            {[
              { en: t('theory.1.en'), ja: t('theory.1.ja') },
              { en: t('theory.2.en'), ja: t('theory.2.ja') },
              { en: t('theory.3.en'), ja: t('theory.3.ja') },
              { en: t('theory.4.en'), ja: t('theory.4.ja') },
              { en: t('theory.5.en'), ja: t('theory.5.ja') },
            ].map((th, i) => (
              <div key={i} className="bg-[#080e18] border-b border-[#0f1e30] last:border-0 px-5 py-4 flex gap-4">
                <span className="font-mono text-[10px] text-[#1e3a5a] shrink-0 pt-0.5 w-5">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <p className="text-xs text-[#7ac8f8] leading-relaxed">{th.en}</p>
                  <p className="text-[10px] text-[#2a5a8a] mt-0.5 leading-relaxed">{th.ja}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related Instrument */}
      <section className="border-t border-[#0f1e30] py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#2a5a8a] mb-6">Related Instrument</div>
          <div className="border border-[#1e3a5a] bg-[#080e18] p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-6 max-w-xl">
            <div className="space-y-2">
              <p className="text-xs font-bold text-[#7ac8f8] tracking-wide">Proper Paper Audit</p>
              <p className="text-[11px] text-[#3a6a8a] leading-relaxed max-w-sm">
                Audit whether a research text generates concepts, survives public reason, and avoids becoming a scoring apparatus.
              </p>
              <p className="text-[10px] font-mono text-[#1e3a5a]">
                Separate product · Same audit philosophy family
              </p>
            </div>
            <a
              href="http://localhost:3001"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-[10px] font-mono border border-[#2a5a8a] px-4 py-2 text-[#4a8abb] hover:border-[#7ac8f8] hover:text-[#7ac8f8] transition-colors self-start"
            >
              Open Proper Paper Audit →
            </a>
          </div>
        </div>
      </section>

      {/* Footer notice */}
      <footer className="border-t border-[#0f1e30] py-8">
        <div className="max-w-4xl mx-auto space-y-3">
          <p className="text-[10px] font-mono text-[#1e3a5a] leading-relaxed max-w-2xl">
            {t('console.notice.no_persons')} {t('console.notice.not_absolute')}
          </p>
          <p className="text-[10px] font-mono text-[#131f2e] leading-relaxed">
            Part of an independent audit philosophy tool family.
          </p>
        </div>
      </footer>
    </div>
  )
}
