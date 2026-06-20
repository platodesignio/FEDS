'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAudit } from '@/lib/auditContext'
import PhilosophicalNotice from '@/components/PhilosophicalNotice'

const THEORIES = [
  { keyEn: 'theory.1.en', keyJa: 'theory.1.ja' },
  { keyEn: 'theory.2.en', keyJa: 'theory.2.ja' },
  { keyEn: 'theory.3.en', keyJa: 'theory.3.ja' },
  { keyEn: 'theory.4.en', keyJa: 'theory.4.ja' },
  { keyEn: 'theory.5.en', keyJa: 'theory.5.ja' },
]

export default function Home() {
  const { t, loadDemoCase, demoCases, locale } = useAudit()
  const router = useRouter()

  function handleLoadDemo(id: string) {
    loadDemoCase(id)
    router.push('/dashboard')
  }

  return (
    <div className="space-y-12">
      {/* Hero */}
      <header className="space-y-3 border-b border-[#e2e8f0] pb-8">
        <div className="text-xs uppercase tracking-widest text-gray-400">Research Audit Tool</div>
        <h1 className="text-4xl font-bold tracking-tight text-[#1a3a5c]">FEDS Studio</h1>
        <p className="text-xl font-medium text-gray-800">Freedom Dialectical Correctness Simulator</p>
        <p className="text-base text-gray-500">自由弁証法正答率シミュレーター</p>

        <div className="pt-2">
          <p className="max-w-3xl text-sm leading-relaxed text-gray-700">
            {t('app.research_positioning')}
          </p>
        </div>

        <p className="pt-1 text-sm font-medium text-[#1a3a5c]">
          {t('app.core_question')}
        </p>

        <div className="pt-2">
          <Link
            href="/audit"
            className="inline-block bg-[#1a3a5c] px-6 py-3 text-sm font-medium text-white hover:bg-[#0f2440] transition-colors"
          >
            {t('app.begin_audit')} →
          </Link>
        </div>
      </header>

      {/* Philosophical Notices */}
      <PhilosophicalNotice />

      {/* Theoretical Foundations */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[#1a3a5c]">{t('theory.section_title')}</h2>
        <div className="space-y-3">
          {THEORIES.map((th, i) => (
            <div key={i} className="border border-[#e2e8f0] p-4">
              <div className="text-xs font-mono text-gray-400 mb-1">{String(i + 1).padStart(2, '0')}</div>
              <p className="text-sm font-medium text-gray-800">{t(th.keyEn)}</p>
              <p className="mt-0.5 text-sm text-gray-500">{t(th.keyJa)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Demo Cases */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[#1a3a5c]">{t('demo.section_title')}</h2>
        <p className="text-sm text-gray-600">{t('demo.description')}</p>
        <div className="grid gap-4 md:grid-cols-3">
          {demoCases.map((dc) => (
            <div key={dc.id} className="border border-[#e2e8f0] p-4 space-y-3">
              <div className="text-xs uppercase tracking-wide text-gray-400">Demo</div>
              <h3 className="text-sm font-semibold text-[#1a3a5c]">
                {locale === 'ja' ? dc.labelJa : dc.label}
              </h3>
              <p className="text-xs leading-relaxed text-gray-600">
                {locale === 'ja' ? dc.descriptionJa : dc.description}
              </p>
              <button
                onClick={() => handleLoadDemo(dc.id)}
                className="inline-block border border-[#1a3a5c] px-3 py-1.5 text-xs font-medium text-[#1a3a5c] hover:bg-[#1a3a5c] hover:text-white transition-colors"
              >
                {t('demo.load')}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Primary score axis explainer */}
      <section className="border border-[#e2e8f0] p-6 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Primary Score Axis</h2>
        <div className="flex flex-col md:flex-row md:items-baseline gap-2">
          <span className="text-2xl font-mono font-bold text-[#1a3a5c]">FDCR</span>
          <span className="text-base text-gray-700">Freedom Dialectical Correctness Rate</span>
          <span className="text-base text-gray-500">自由弁証法正答率</span>
        </div>
        <p className="text-sm leading-relaxed text-gray-700 max-w-3xl">
          {t('app.description')}
        </p>
        <div className="pt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4 text-xs text-gray-600">
          {[
            ['CFCS', 'Creative Future-Challenge Score'],
            ['DER', 'Dialectical Efficacy Rate'],
            ['RCI', 'Return Capacity Index'],
            ['BGR', 'Bodily Generation Rate'],
            ['BDER', 'Bio-Divisional Efficacy Rate'],
            ['DRR', 'Democratic Re-Audit Rate'],
            ['MSJR', 'Managerial Self-Justification Risk'],
            ['CFR', 'Classification Fixation Risk'],
          ].map(([abbr, name]) => (
            <div key={abbr} className="border border-[#e2e8f0] px-3 py-2">
              <span className="font-mono font-semibold text-[#1a3a5c]">{abbr}</span>
              <span className="ml-2 text-gray-500">{name}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
