'use client'

import { useState } from 'react'
import { useAudit } from '@/lib/auditContext'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import PhilosophicalNotice from '@/components/PhilosophicalNotice'

const FDCR_WEIGHTS = [
  { metric: 'CFCS', weight: '0.18', label: 'Creative Future-Challenge Score' },
  { metric: 'DER',  weight: '0.16', label: 'Dialectical Efficacy Rate' },
  { metric: 'RCI',  weight: '0.14', label: 'Return Capacity Index' },
  { metric: 'BGR',  weight: '0.12', label: 'Bodily Generation Rate' },
  { metric: 'SRGR', weight: '0.12', label: 'Social Responsibility Generation Rate' },
  { metric: 'TIGR', weight: '0.10', label: 'Temporal Integration Generation Rate' },
  { metric: 'DRR',  weight: '0.08', label: 'Democratic Re-Audit Rate' },
  { metric: 'BDER', weight: '0.06', label: 'Bio-Divisional Efficacy Rate' },
  { metric: 'EGR',  weight: '0.04', label: 'Ecological Generation Rate' },
]

const RISK_WEIGHTS = [
  { metric: 'MSJR', weight: '0.20', label: 'Managerial Self-Justification Risk' },
  { metric: 'CFR',  weight: '0.18', label: 'Classification Fixation Risk' },
  { metric: 'RBR',  weight: '0.18', label: 'Re-entry Blockage Risk' },
  { metric: 'RDR',  weight: '0.14', label: 'Responsibility Displacement Risk' },
  { metric: 'BBI',  weight: '0.10', label: 'Bodily Burden Index' },
  { metric: 'TCR',  weight: '0.08', label: 'Temporal Compression Risk' },
  { metric: 'MTR',  weight: '0.07', label: 'Metaphysical Transgression Risk' },
  { metric: 'EER',  weight: '0.05', label: 'Ecological Extraction Risk' },
]

const ECO_WEIGHTS = [
  { metric: 'EBDCR',              weight: '0.35', label: 'Ecological Bio-Divisional Correctness Rate', risk: false },
  { metric: 'EBDE',               weight: '0.25', label: 'Ecological Bio-Dialectical Efficacy', risk: false },
  { metric: 'E-FDCR',             weight: '0.25', label: 'Ecological Freedom Dialectical Correctness Rate', risk: false },
  { metric: 'EP-BTM',             weight: '0.15', label: 'Eco-Planetary Burden Transfer Matrix', risk: true  },
  { metric: 'ecoRiskPenalty',     weight: '0.60', label: 'Ecological Risk Penalty (applied to EBDCR)', risk: true },
  { metric: 'ecoPlanetaryRisk',   weight: '0.50', label: 'Ecological Planetary Risk Penalty (applied to E-FDCR)', risk: true },
]

const ASSUMPTIONS = [
  'Freedom-generation is directional, not absolute. FDCR measures direction, not a final state.',
  'A system with high FDCR must be creatively future-challenging, not merely order-preserving.',
  'The body, lifeworld, ecology, and future generations are audit subjects — not externalities.',
  'Managerial language (efficiency, safety, fairness, evidence) is audited for its directional function, not its surface content.',
  'Scores are provisional. All weights are calibratable through empirical case review.',
  'Democratic re-audit by affected subjects is a core requirement, not an optional feature.',
  'Global burden transfer is a primary audit axis. Local correctness does not override global cost.',
]

function SectionHead({ label }: { label: string }) {
  return <h2 className="text-[10px] font-mono uppercase tracking-widest text-gray-400">{label}</h2>
}

export default function MethodSettingsPage() {
  const { t, auditState, locale } = useAudit()
  const [debugOpen, setDebugOpen] = useState(false)

  return (
    <div className="space-y-10 max-w-3xl">
      <header className="border-b border-[#e2e8f0] pb-6 space-y-1">
        <div className="text-[10px] uppercase tracking-widest text-gray-400">FEDS Studio</div>
        <h1 className="text-2xl font-bold tracking-tight text-[#1a3a5c]">{t('method.title')}</h1>
        <p className="text-sm text-gray-500 max-w-2xl">{t('method.subtitle')}</p>
      </header>

      {/* Language */}
      <section className="space-y-3">
        <SectionHead label={t('settings.language')} />
        <LanguageSwitcher />
      </section>

      {/* Scoring Weights */}
      <section className="space-y-4">
        <SectionHead label={t('settings.weights')} />
        <p className="text-xs text-gray-500">{t('settings.weights.note')}</p>
        <div className="space-y-4">
          <div>
            <div className="text-[10px] font-mono text-gray-400 mb-2">FDCR — Positive Metric Weights</div>
            <div className="border border-[#e2e8f0] divide-y divide-[#e2e8f0]">
              {FDCR_WEIGHTS.map(({ metric, weight, label }) => (
                <div key={metric} className="flex items-center gap-3 px-4 py-2">
                  <span className="font-mono text-[10px] font-bold text-[#1a3a5c] w-12 shrink-0">{metric}</span>
                  <span className="font-mono text-[10px] text-gray-400 w-10 shrink-0">{weight}</span>
                  <span className="text-xs text-gray-600">{label}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-mono text-gray-400 mb-2">FDCR — Risk Penalty Weights</div>
            <div className="border border-[#e2e8f0] divide-y divide-[#e2e8f0]">
              {RISK_WEIGHTS.map(({ metric, weight, label }) => (
                <div key={metric} className="flex items-center gap-3 px-4 py-2">
                  <span className="font-mono text-[10px] font-bold text-[#b91c1c] w-12 shrink-0">{metric}</span>
                  <span className="font-mono text-[10px] text-gray-400 w-10 shrink-0">{weight}</span>
                  <span className="text-xs text-gray-600">{label}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-mono text-gray-400 mb-2">Ecological Superscores — Composite Weights</div>
            <div className="border border-[#e2e8f0] divide-y divide-[#e2e8f0]">
              {ECO_WEIGHTS.map(({ metric, weight, label, risk }) => (
                <div key={metric} className="flex items-center gap-3 px-4 py-2">
                  <span className={`font-mono text-[10px] font-bold w-36 shrink-0 ${risk ? 'text-[#b91c1c]' : 'text-[#15803d]'}`}>{metric}</span>
                  <span className="font-mono text-[10px] text-gray-400 w-10 shrink-0">{weight}</span>
                  <span className="text-xs text-gray-600">{label}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[10px] font-mono text-gray-400">
            Recalibration requires editing <code>/lib/scoring.ts</code>, <code>/lib/globalScoring.ts</code>, and <code>/lib/ecologicalScoring.ts</code>.
            Changes take effect on next audit run.
          </p>
        </div>
      </section>

      {/* Research Assumptions */}
      <section className="space-y-3">
        <SectionHead label={t('settings.research_assumptions')} />
        <p className="text-xs text-gray-500">{t('settings.research_assumptions.note')}</p>
        <div className="border border-[#e2e8f0] divide-y divide-[#e2e8f0]">
          {ASSUMPTIONS.map((a, i) => (
            <div key={i} className="flex gap-4 px-4 py-3">
              <span className="font-mono text-[10px] text-gray-300 shrink-0 pt-0.5 w-5">{String(i + 1).padStart(2, '0')}</span>
              <p className="text-xs text-gray-700 leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Export Settings */}
      <section className="space-y-3">
        <SectionHead label={t('settings.export')} />
        <div className="border border-[#e2e8f0] divide-y divide-[#e2e8f0]">
          {[
            { fmt: 'JSON', desc: 'Full audit state + all computed scores. Machine-readable for downstream analysis.' },
            { fmt: 'PNG',  desc: 'Console screenshot. Captures the currently visible tab.' },
            { fmt: 'PDF',  desc: 'Full Report Dossier as PDF. Recommended for archiving and institutional sharing.' },
          ].map(({ fmt, desc }) => (
            <div key={fmt} className="flex gap-4 px-4 py-3">
              <span className="font-mono text-[10px] font-bold text-[#1a3a5c] w-10 shrink-0">{fmt}</span>
              <span className="text-xs text-gray-600">{desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Methodological Notes */}
      <section className="space-y-3">
        <SectionHead label={t('settings.methodological_notes')} />
        <div className="border border-[#e2e8f0] p-4">
          <p className="text-xs leading-relaxed text-gray-600">{t('settings.methodological_notes.content')}</p>
        </div>
      </section>

      {/* Philosophical Notice */}
      <PhilosophicalNotice />

      {/* Debug */}
      <section className="space-y-2">
        <button
          onClick={() => setDebugOpen((o) => !o)}
          className="text-[10px] font-mono text-gray-400 hover:text-[#1a3a5c] transition-colors"
        >
          {debugOpen ? '▾' : '▸'} {t('settings.debug')}
        </button>
        {debugOpen && (
          <pre className="overflow-x-auto border border-[#e2e8f0] bg-[#f8fafc] p-4 text-[10px] font-mono text-gray-500 leading-relaxed">
            {JSON.stringify({ target: auditState.target, category: auditState.category, layers: auditState.layers, subjects: auditState.subjects, locale }, null, 2)}
          </pre>
        )}
      </section>
    </div>
  )
}
