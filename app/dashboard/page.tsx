'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAudit } from '@/lib/auditContext'
import PhilosophicalNotice from '@/components/PhilosophicalNotice'
import ScoreCard, { colorForPositive, colorForRisk } from '@/components/ScoreCard'
import RiskMatrix from '@/components/RiskMatrix'
import LayerMatrix from '@/components/LayerMatrix'
import ActorImpactMatrix from '@/components/ActorImpactMatrix'
import BurdenTransferMatrix from '@/components/BurdenTransferMatrix'
import WinnerLoserChart from '@/components/WinnerLoserChart'
import ScenarioComparison from '@/components/ScenarioComparison'
import ExportButtons from '@/components/ExportButtons'

const TABS = [
  'common.overview',
  'common.metrics',
  'common.actor_impact',
  'common.global',
  'common.scenarios',
  'common.export',
]

const POSITIVE_CARDS = [
  { id: 'CFCS', label: 'CFCS', desc: 'Creative Future-Challenge Score' },
  { id: 'DER',  label: 'DER',  desc: 'Dialectical Efficacy Rate' },
  { id: 'RCI',  label: 'RCI',  desc: 'Return Capacity Index' },
  { id: 'BGR',  label: 'BGR',  desc: 'Bodily Generation Rate' },
  { id: 'DRR',  label: 'DRR',  desc: 'Democratic Re-Audit Rate' },
  { id: 'BDER', label: 'BDER', desc: 'Bio-Divisional Efficacy Rate' },
  { id: 'LSAR', label: 'LSAR', desc: 'Lifeworld Subject Audit Rate' },
  { id: 'EGR',  label: 'EGR',  desc: 'Ecological Generation Rate' },
  { id: 'HGR',  label: 'HGR',  desc: 'Historical-Generational Responsibility Rate' },
  { id: 'IGR',  label: 'IGR',  desc: 'Information Generation Rate' },
  { id: 'PDFS', label: 'PDFS', desc: 'Pre-Differential Field Sensitivity' },
  { id: 'MGR',  label: 'MGR',  desc: 'Meaning Generation Rate' },
  { id: 'TFGR', label: 'TFGR', desc: 'Truth-Feeling Generation Rate' },
  { id: 'SRGR', label: 'SRGR', desc: 'Social Responsibility Generation Rate' },
  { id: 'TIGR', label: 'TIGR', desc: 'Temporal Integration Generation Rate' },
  { id: 'D-RGR',label: 'D-RGR',desc: 'Division-Relational Generation Rate' },
]

const RISK_CARDS = [
  { id: 'MSJR', label: 'MSJR', desc: 'Managerial Self-Justification Risk' },
  { id: 'CFR',  label: 'CFR',  desc: 'Classification Fixation Risk' },
  { id: 'RBR',  label: 'RBR',  desc: 'Re-entry Blockage Risk' },
  { id: 'RDR',  label: 'RDR',  desc: 'Responsibility Displacement Risk' },
  { id: 'BBI',  label: 'BBI',  desc: 'Bodily Burden Index' },
  { id: 'TCR',  label: 'TCR',  desc: 'Temporal Compression Risk' },
  { id: 'MTR',  label: 'MTR',  desc: 'Metaphysical Transgression Risk' },
  { id: 'EER',  label: 'EER',  desc: 'Ecological Extraction Risk' },
  { id: 'EIR',  label: 'EIR',  desc: 'Epistemic Injustice Risk' },
  { id: 'SRR',  label: 'SRR',  desc: 'Securitization Risk Rate' },
  { id: 'FMR',  label: 'FMR',  desc: 'Financialization / Marketization Risk' },
  { id: 'NPR',  label: 'NPR',  desc: 'Narrative Polarization Risk' },
  { id: 'GSR',  label: 'GSR',  desc: 'Geopolitical Security Risk' },
]

const GLOBAL_CARDS = [
  { id: 'BTR',  label: 'BTR',  desc: 'Burden Transfer Risk', type: 'risk' as const },
  { id: 'CDR',  label: 'CDR',  desc: 'Climate Displacement Risk', type: 'risk' as const },
  { id: 'SCDR', label: 'SCDR', desc: 'Supply Chain Dependency Risk', type: 'risk' as const },
  { id: 'FGR',  label: 'FGR',  desc: 'Future Generation Risk', type: 'risk' as const },
  { id: 'PPR',  label: 'PPR',  desc: 'Platform Power Risk', type: 'risk' as const },
  { id: 'GDDR', label: 'GDDR', desc: 'Global Democratic Deficit Risk', type: 'risk' as const },
  { id: 'CIR',  label: 'CIR',  desc: 'Coloniality / Imperial Residue Risk', type: 'risk' as const },
  { id: 'DCR',  label: 'DCR',  desc: 'Data Colonialism Risk', type: 'risk' as const },
  { id: 'PRCI', label: 'PRCI', desc: 'Planetary Return Capacity Index', type: 'positive' as const },
  { id: 'GDRR', label: 'GDRR', desc: 'Global Democratic Re-Audit Rate', type: 'positive' as const },
  { id: 'CBRI', label: 'CBRI', desc: 'Cross-Border Re-entry Index', type: 'positive' as const },
  { id: 'SCTR', label: 'SCTR', desc: 'Supply Chain Transparency Rate', type: 'positive' as const },
  { id: 'PAI',  label: 'PAI',  desc: 'Planetary Accountability Index', type: 'positive' as const },
]

function LocalVsGlobalPanel({ fdcr, gfdcr, t }: { fdcr: number; gfdcr: number; t: (k: string) => string }) {
  const diff = Math.round(fdcr - gfdcr)
  const flag =
    fdcr > 70 && gfdcr < 45
      ? 'Locally Freedom-Generative but Globally Burden-Transferring'
      : diff > 20
      ? 'Significant burden transfer gap detected'
      : null
  return (
    <div className="border border-[#e2e8f0] p-4 space-y-3">
      <h3 className="text-sm font-semibold text-[#1a3a5c]">{t('dashboard.local_vs_global')}</h3>
      <div className="flex gap-6 items-end">
        <div>
          <div className="text-xs uppercase tracking-wide text-gray-400">Local FDCR</div>
          <div className="font-mono text-3xl font-bold" style={{ color: colorForPositive(fdcr) }}>
            {Math.round(fdcr)}
          </div>
        </div>
        <div className="text-gray-300 text-xl pb-1">→</div>
        <div>
          <div className="text-xs uppercase tracking-wide text-gray-400">Global G-FDCR</div>
          <div className="font-mono text-3xl font-bold" style={{ color: colorForPositive(gfdcr) }}>
            {Math.round(gfdcr)}
          </div>
        </div>
        <div className="pb-1">
          <span
            className="text-xs px-2 py-1 font-mono"
            style={{ color: diff > 0 ? '#b91c1c' : '#15803d', background: diff > 0 ? '#fef2f2' : '#f0fdf4' }}
          >
            Δ {diff > 0 ? '+' : ''}{diff}
          </span>
        </div>
      </div>
      {flag && (
        <p className="text-xs text-amber-700 border border-amber-200 bg-amber-50 px-3 py-2">{flag}</p>
      )}
      <p className="text-xs text-gray-500">
        A negative gap indicates that local freedom depends on burden transferred to other regions, generations, or ecosystems.
      </p>
    </div>
  )
}

function ShortLongPanel({ fdcr, metrics, t }: { fdcr: number; metrics: Record<string, number>; t: (k: string) => string }) {
  const shortTermScore = Math.round(fdcr)
  // Long-term penalized by temporal compression, future generation risk, and ecological extraction
  const tcr  = metrics['TCR']  ?? 50
  const fgr  = metrics['FGR']  ?? 50
  const eer  = metrics['EER']  ?? 50
  const hgr  = metrics['HGR']  ?? 50
  const longTermScore = Math.round(Math.max(0, fdcr - (tcr * 0.1) - (fgr * 0.08) - (eer * 0.07) + (hgr - 50) * 0.05))
  const diff = longTermScore - shortTermScore
  return (
    <div className="border border-[#e2e8f0] p-4 space-y-3">
      <h3 className="text-sm font-semibold text-[#1a3a5c]">{t('dashboard.short_vs_long')}</h3>
      <div className="flex gap-6 items-end">
        <div>
          <div className="text-xs uppercase tracking-wide text-gray-400">Short-Term</div>
          <div className="font-mono text-3xl font-bold" style={{ color: colorForPositive(shortTermScore) }}>
            {shortTermScore}
          </div>
        </div>
        <div className="text-gray-300 text-xl pb-1">→</div>
        <div>
          <div className="text-xs uppercase tracking-wide text-gray-400">Long-Term (est.)</div>
          <div className="font-mono text-3xl font-bold" style={{ color: colorForPositive(longTermScore) }}>
            {longTermScore}
          </div>
        </div>
        <div className="pb-1">
          <span
            className="text-xs px-2 py-1 font-mono"
            style={{ color: diff < 0 ? '#b91c1c' : '#15803d', background: diff < 0 ? '#fef2f2' : '#f0fdf4' }}
          >
            Δ {diff > 0 ? '+' : ''}{diff}
          </span>
        </div>
      </div>
      <p className="text-xs text-gray-500">
        Long-term estimate penalizes temporal compression (TCR), future generation risk (FGR), and ecological extraction (EER).
        It rewards historical learning (HGR).
      </p>
    </div>
  )
}

export default function DashboardPage() {
  const { scoreResult, t, loadDemoCase, demoCases, locale } = useAudit()
  const [tab, setTab] = useState(0)
  const router = useRouter()

  function handleLoadDemo(id: string) {
    loadDemoCase(id)
  }

  if (!scoreResult) {
    return (
      <div className="space-y-8">
        <div className="border border-[#e2e8f0] p-6 space-y-3">
          <h2 className="text-lg font-semibold text-[#1a3a5c]">{t('dashboard.empty.title')}</h2>
          <p className="text-sm text-gray-600 max-w-2xl">{t('dashboard.empty.body')}</p>
          <div className="flex gap-3 pt-2 flex-wrap">
            <Link
              href="/audit"
              className="inline-block bg-[#1a3a5c] px-4 py-2 text-sm font-medium text-white hover:bg-[#0f2440] transition-colors"
            >
              {t('app.begin_audit')} →
            </Link>
          </div>
        </div>
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
                <p className="text-xs text-gray-500 leading-relaxed">
                  {locale === 'ja' ? dc.descriptionJa : dc.description}
                </p>
                <button
                  onClick={() => handleLoadDemo(dc.id)}
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

  const ms = scoreResult.metrics as unknown as Record<string, number>

  return (
    <div id="dashboard-capture" className="space-y-6">
      <PhilosophicalNotice />

      {/* Top score row */}
      <div className="grid gap-3 md:grid-cols-3">
        <ScoreCard
          label={t('metric.fdcr.name')}
          value={Math.round(scoreResult.fdcr)}
          description={t('metric.fdcr.description')}
          size="large"
          type="positive"
        />
        <ScoreCard
          label={t('metric.gfdcr.name')}
          value={Math.round(scoreResult.gfdcr)}
          description={t('metric.gfdcr.description')}
          size="large"
          type="positive"
        />
        <div className="border border-[#e2e8f0] bg-white p-4 space-y-2">
          <div className="text-xs uppercase tracking-wide text-gray-500">{t('common.judgment')}</div>
          {scoreResult.judgments.map((j) => (
            <div key={j} className="border border-[#e2e8f0] bg-gray-50 px-2 py-1 text-xs font-medium text-[#1a3a5c]">
              {t(`judgment.${j}`)}
            </div>
          ))}
        </div>
      </div>

      {/* Key metric summary row */}
      <div className="grid gap-2 grid-cols-2 sm:grid-cols-4 lg:grid-cols-6">
        {[
          { id: 'CFCS', type: 'positive' as const },
          { id: 'DER',  type: 'positive' as const },
          { id: 'RCI',  type: 'positive' as const },
          { id: 'BGR',  type: 'positive' as const },
          { id: 'DRR',  type: 'positive' as const },
          { id: 'MSJR', type: 'risk' as const },
          { id: 'CFR',  type: 'risk' as const },
          { id: 'RBR',  type: 'risk' as const },
          { id: 'EIR',  type: 'risk' as const },
          { id: 'BTR',  type: 'risk' as const },
          { id: 'BDER', type: 'positive' as const },
          { id: 'EGR',  type: 'positive' as const },
        ].map(({ id, type }) => (
          <ScoreCard key={id} label={id} value={Math.round(ms[id] ?? 50)} type={type} />
        ))}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-0 border-b border-[#e2e8f0]">
        {TABS.map((tk, i) => (
          <button
            key={tk}
            onClick={() => setTab(i)}
            className={`px-4 py-2 text-sm border-b-2 transition-colors ${
              i === tab
                ? 'border-[#1a3a5c] font-medium text-[#1a3a5c]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {t(tk)}
          </button>
        ))}
      </div>

      {/* Tab 0: Overview */}
      {tab === 0 && (
        <div className="space-y-6">
          {scoreResult.corrections.length > 0 && (
            <div className="border border-amber-200 bg-amber-50 p-4 text-sm text-gray-800">
              <h3 className="mb-2 font-medium text-amber-800">{t('dashboard.corrections')}</h3>
              <ul className="list-disc pl-5 space-y-1">
                {scoreResult.corrections.map((c, i) => (
                  <li key={i} className="text-xs">{c}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            <LocalVsGlobalPanel fdcr={scoreResult.fdcr} gfdcr={scoreResult.gfdcr} t={t} />
            <ShortLongPanel fdcr={scoreResult.fdcr} metrics={ms} t={t} />
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold text-[#1a3a5c]">{t('dashboard.layer_matrix')}</h3>
            <LayerMatrix />
          </div>
        </div>
      )}

      {/* Tab 1: Metrics */}
      {tab === 1 && (
        <div className="space-y-8">
          <div>
            <h3 className="mb-3 text-sm font-semibold text-[#1a3a5c]">{t('dashboard.positive_metrics')}</h3>
            <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
              {POSITIVE_CARDS.map(({ id, label, desc }) => (
                <ScoreCard key={id} label={label} value={Math.round(ms[id] ?? 50)} description={desc} type="positive" />
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold text-[#1a3a5c]">{t('dashboard.risk_metrics')}</h3>
            <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
              {RISK_CARDS.map(({ id, label, desc }) => (
                <ScoreCard key={id} label={label} value={Math.round(ms[id] ?? 50)} description={desc} type="risk" />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Actor Impact */}
      {tab === 2 && (
        <div className="space-y-6">
          <div>
            <h3 className="mb-3 text-sm font-semibold text-[#1a3a5c]">{t('dashboard.actor_matrix')}</h3>
            <ActorImpactMatrix />
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold text-[#1a3a5c]">{t('dashboard.winner_loser')}</h3>
            <WinnerLoserChart />
          </div>
        </div>
      )}

      {/* Tab 3: Global */}
      {tab === 3 && (
        <div className="space-y-6">
          {scoreResult.globalFlags.length > 0 && (
            <div className="border border-amber-200 bg-amber-50 p-4">
              <h3 className="mb-2 text-sm font-medium text-amber-800">{t('dashboard.global_flags')}</h3>
              <ul className="list-disc pl-5 space-y-1">
                {scoreResult.globalFlags.map((g, i) => (
                  <li key={i} className="text-xs text-gray-700">{g}</li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-[#1a3a5c]">{t('dashboard.global_metrics')}</h3>
            <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
              {GLOBAL_CARDS.map(({ id, label, desc, type }) => (
                <ScoreCard key={id} label={label} value={Math.round(ms[id] ?? 50)} description={desc} type={type} />
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold text-[#1a3a5c]">{t('dashboard.burden_matrix')}</h3>
            <BurdenTransferMatrix />
          </div>
        </div>
      )}

      {/* Tab 4: Scenarios */}
      {tab === 4 && <ScenarioComparison />}

      {/* Tab 5: Export */}
      {tab === 5 && (
        <div className="space-y-4">
          <ExportButtons captureId="dashboard-capture" />
          <Link href="/report" className="inline-block text-sm text-[#1a3a5c] underline">
            {t('nav.report')} →
          </Link>
        </div>
      )}
    </div>
  )
}
