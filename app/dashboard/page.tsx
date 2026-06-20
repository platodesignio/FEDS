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

const ALL_POSITIVE = ['CFCS','DER','RCI','BGR','DRR','BDER','LSAR','EGR','HGR','IGR','PDFS','MGR','SRGR','TIGR','D-RGR','PRCI','GDRR','CBRI','SCTR','PAI']
const ALL_RISK     = ['MSJR','CFR','RBR','RDR','BBI','TCR','MTR','EER','EIR','SRR','FMR','NPR','GSR','BTR','CDR','SCDR','CIR','FGR','PPR','GDDR','DCR']

const METRIC_LABELS: Record<string, string> = {
  CFCS:'Creative Future-Challenge Score', DER:'Dialectical Efficacy Rate', RCI:'Return Capacity Index',
  BGR:'Bodily Generation Rate', DRR:'Democratic Re-Audit Rate', BDER:'Bio-Divisional Efficacy Rate',
  LSAR:'Lifeworld Subject Audit Rate', EGR:'Ecological Generation Rate', HGR:'Historical-Generational Responsibility',
  MSJR:'Managerial Self-Justification Risk', CFR:'Classification Fixation Risk', RBR:'Re-entry Blockage Risk',
  RDR:'Responsibility Displacement Risk', BBI:'Bodily Burden Index', TCR:'Temporal Compression Risk',
  MTR:'Metaphysical Transgression Risk', EER:'Ecological Extraction Risk', EIR:'Epistemic Injustice Risk',
  SRR:'Securitization Risk', FMR:'Financialization Risk', BTR:'Burden Transfer Risk',
  CDR:'Climate Displacement Risk', SCDR:'Supply Chain Dependency Risk', FGR:'Future Generation Risk',
}

const IMPROVEMENT_RULES: { check: (ms: Record<string,number>, cat: string) => boolean; text: string }[] = [
  { check: (ms) => ms.RCI < 40,  text: 'Add appeal procedure, record expiration, and reclassification pathway to restore re-entry capacity (RCI).' },
  { check: (ms) => ms.MSJR > 65, text: 'Separate efficiency metrics from freedom-generation metrics. Add anti-managerial self-justification audit check (MSJR).' },
  { check: (ms) => ms.DRR < 40,  text: 'Add independent audit body, participatory review, and democratic legitimacy check (DRR).' },
  { check: (ms) => ms.CFR > 65,  text: 'Introduce record expiration, human review requirements, and reduce AI score persistence to reduce classification fixation (CFR).' },
  { check: (ms) => ms.BGR < 40,  text: 'Add bodily burden assessment and time-for-repair policy. Protect sleep, breath, and recovery (BGR).' },
  { check: (ms) => ms.EIR > 65,  text: 'Add epistemic injustice review and lifeworld testimony channel. Ensure affected subject voices are not erased in institutional translation (EIR).' },
  { check: (ms) => ms.BTR > 60,  text: 'Add cross-border accountability mechanism and burden transfer disclosure. Make hidden burden transfers visible (BTR).' },
  { check: (ms) => ms.MTR > 65,  text: 'Prevent AI scores from becoming proxies for human worth. Add score context documentation and uncertainty disclosure (MTR).' },
  { check: (ms) => ms.EER > 65,  text: 'Add ecological cost visibility and institutional responsibility assignment for energy and compute burden (EER).' },
  { check: (ms) => ms.LSAR < 40, text: 'Add lifeworld testimony channel and affected-subject participation to improve institutional translation quality (LSAR).' },
  { check: (ms) => ms.BDER < 40, text: 'Strengthen living cooperation and care network support. Redistribute burden without exploitation (BDER).' },
  { check: (ms, cat) => ms.DRR < 30 && (cat === 'Public policy' || cat === 'Welfare'), text: 'For public policy and welfare systems with low DRR: mandate democratic re-audit cycle and legislative oversight.' },
]

function TopFactorsPanel({ metrics, t }: { metrics: Record<string, number>; t: (k: string) => string }) {
  const topGenerating = [...ALL_POSITIVE]
    .sort((a, b) => (metrics[b] ?? 50) - (metrics[a] ?? 50))
    .slice(0, 3)
  const topClosing = [...ALL_RISK]
    .sort((a, b) => (metrics[b] ?? 50) - (metrics[a] ?? 50))
    .slice(0, 3)

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="border border-[#e2e8f0] p-4 space-y-3">
        <h3 className="text-sm font-semibold text-[#1a3a5c]">{t('dashboard.top_generating')}</h3>
        <div className="space-y-2">
          {topGenerating.map((id, rank) => (
            <div key={id} className="flex items-center gap-3">
              <span className="font-mono text-xs text-gray-300 w-4 shrink-0">{rank + 1}</span>
              <div className="flex-1 bg-[#e2e8f0] h-2 rounded-none">
                <div className="bg-[#15803d] h-2" style={{ width: `${metrics[id] ?? 50}%` }} />
              </div>
              <span className="font-mono text-xs font-semibold text-[#15803d] w-8 text-right">{Math.round(metrics[id] ?? 50)}</span>
              <span className="text-xs text-gray-600 w-36 truncate">{METRIC_LABELS[id] ?? id}</span>
              <span className="font-mono text-xs font-bold text-[#1a3a5c] w-12 shrink-0">{id}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="border border-[#e2e8f0] p-4 space-y-3">
        <h3 className="text-sm font-semibold text-[#1a3a5c]">{t('dashboard.top_closing')}</h3>
        <div className="space-y-2">
          {topClosing.map((id, rank) => (
            <div key={id} className="flex items-center gap-3">
              <span className="font-mono text-xs text-gray-300 w-4 shrink-0">{rank + 1}</span>
              <div className="flex-1 bg-[#e2e8f0] h-2 rounded-none">
                <div className="bg-[#b91c1c] h-2" style={{ width: `${metrics[id] ?? 50}%` }} />
              </div>
              <span className="font-mono text-xs font-semibold text-[#b91c1c] w-8 text-right">{Math.round(metrics[id] ?? 50)}</span>
              <span className="text-xs text-gray-600 w-36 truncate">{METRIC_LABELS[id] ?? id}</span>
              <span className="font-mono text-xs font-bold text-[#1a3a5c] w-12 shrink-0">{id}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ImprovementPanel({ metrics, fdcr, category, t }: { metrics: Record<string, number>; fdcr: number; category: string; t: (k: string) => string }) {
  const applicable = IMPROVEMENT_RULES.filter((r) => r.check(metrics, category))
  if (applicable.length === 0 && fdcr >= 70) return null
  return (
    <div className="border border-[#e2e8f0] p-4 space-y-3">
      <h3 className="text-sm font-semibold text-[#1a3a5c]">{t('dashboard.improvement')}</h3>
      {applicable.length === 0 ? (
        <p className="text-xs text-gray-500">No critical improvement conditions identified at current thresholds.</p>
      ) : (
        <ul className="space-y-2">
          {applicable.map((r, i) => (
            <li key={i} className="flex gap-3 text-xs text-gray-700 leading-relaxed">
              <span className="text-amber-500 shrink-0 mt-0.5">▸</span>
              {r.text}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

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
          {/* Top generating / closing factors */}
          <TopFactorsPanel metrics={ms} t={t} />

          {/* Improvement conditions */}
          <ImprovementPanel metrics={ms} fdcr={scoreResult.fdcr} category={scoreResult.report.category} t={t} />

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
