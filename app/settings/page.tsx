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

const ASSUMPTIONS = [
  'Freedom-generation is directional, not absolute. FDCR measures direction, not a final state.',
  'A system with high FDCR must be creatively future-challenging, not merely order-preserving.',
  'The body, lifeworld, ecology, and future generations are audit subjects — not externalities.',
  'Managerial language (efficiency, safety, fairness, evidence) is audited for its directional function, not its surface content.',
  'Scores are provisional. All weights are calibratable through empirical case review.',
  'Democratic re-audit by affected subjects is a core requirement, not an optional feature.',
  'Global burden transfer is a primary audit axis. Local correctness does not override global cost.',
]

export default function SettingsPage() {
  const { t, auditState, locale } = useAudit()
  const [debugOpen, setDebugOpen] = useState(false)

  return (
    <div className="space-y-10 max-w-3xl">
      <h1 className="text-2xl font-bold text-[#1a3a5c]">{t('nav.settings')}</h1>

      {/* Language */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">{t('settings.language')}</h2>
        <LanguageSwitcher />
      </section>

      {/* Scoring Weights */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">{t('settings.weights')}</h2>
        <p className="text-xs text-gray-500">{t('settings.weights.note')}</p>
        <div className="space-y-4">
          <div>
            <h3 className="text-xs font-medium text-gray-700 mb-2">FDCR Positive Weights</h3>
            <div className="border border-[#e2e8f0] divide-y divide-[#e2e8f0]">
              {FDCR_WEIGHTS.map(({ metric, weight, label }) => (
                <div key={metric} className="flex items-center gap-3 px-4 py-2">
                  <span className="font-mono text-xs font-bold text-[#1a3a5c] w-12 shrink-0">{metric}</span>
                  <span className="font-mono text-xs text-gray-500 w-10 shrink-0">{weight}</span>
                  <span className="text-xs text-gray-600">{label}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xs font-medium text-gray-700 mb-2">Risk Penalty Weights</h3>
            <div className="border border-[#e2e8f0] divide-y divide-[#e2e8f0]">
              {RISK_WEIGHTS.map(({ metric, weight, label }) => (
                <div key={metric} className="flex items-center gap-3 px-4 py-2">
                  <span className="font-mono text-xs font-bold text-[#b91c1c] w-12 shrink-0">{metric}</span>
                  <span className="font-mono text-xs text-gray-500 w-10 shrink-0">{weight}</span>
                  <span className="text-xs text-gray-600">{label}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-gray-400 italic">
            Weight recalibration requires editing <code className="font-mono">/lib/scoring.ts</code> and <code className="font-mono">/lib/globalScoring.ts</code>.
            All changes take effect immediately on the next audit run.
          </p>
        </div>
      </section>

      {/* Research Assumptions */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">{t('settings.research_assumptions')}</h2>
        <p className="text-xs text-gray-500">{t('settings.research_assumptions.note')}</p>
        <div className="border border-[#e2e8f0] divide-y divide-[#e2e8f0]">
          {ASSUMPTIONS.map((a, i) => (
            <div key={i} className="flex gap-3 px-4 py-3">
              <span className="font-mono text-xs text-gray-300 shrink-0 pt-0.5">{String(i + 1).padStart(2, '0')}</span>
              <p className="text-xs text-gray-700 leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Export Settings */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">{t('settings.export')}</h2>
        <div className="border border-[#e2e8f0] p-4 space-y-2 text-xs text-gray-600">
          <div className="flex gap-2">
            <span className="font-mono text-[#1a3a5c] w-16 shrink-0">JSON</span>
            <span>Full audit state + all computed scores. Machine-readable for further analysis.</span>
          </div>
          <div className="flex gap-2">
            <span className="font-mono text-[#1a3a5c] w-16 shrink-0">PNG</span>
            <span>Dashboard screenshot. Captures the current visible tab.</span>
          </div>
          <div className="flex gap-2">
            <span className="font-mono text-[#1a3a5c] w-16 shrink-0">PDF</span>
            <span>Full report as PDF. Recommended for archiving and sharing.</span>
          </div>
        </div>
      </section>

      {/* Methodological Notes */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">{t('settings.methodological_notes')}</h2>
        <div className="border border-[#e2e8f0] p-4">
          <p className="text-xs leading-relaxed text-gray-600">{t('settings.methodological_notes.content')}</p>
        </div>
      </section>

      {/* Philosophical Notice */}
      <PhilosophicalNotice />

      {/* Debug — collapsible */}
      <section className="space-y-2">
        <button
          onClick={() => setDebugOpen((o) => !o)}
          className="text-xs text-gray-400 underline underline-offset-2"
        >
          {debugOpen ? '▾' : '▸'} {t('settings.debug')}
        </button>
        {debugOpen && (
          <pre className="overflow-x-auto border border-[#e2e8f0] bg-gray-50 p-3 text-xs text-gray-500">
            {JSON.stringify(
              {
                target: auditState.target,
                category: auditState.category,
                layers: auditState.layers,
                subjects: auditState.subjects,
                locale,
              },
              null,
              2
            )}
          </pre>
        )}
      </section>
    </div>
  )
}
