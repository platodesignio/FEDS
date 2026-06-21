'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAudit } from '@/lib/auditContext'
import ScoreCard, { colorForPositive, colorForRisk } from '@/components/ScoreCard'
import RiskMatrix from '@/components/RiskMatrix'
import LayerMatrix from '@/components/LayerMatrix'
import ActorImpactMatrix from '@/components/ActorImpactMatrix'
import BurdenTransferMatrix from '@/components/BurdenTransferMatrix'
import WinnerLoserChart from '@/components/WinnerLoserChart'
import ScenarioComparison from '@/components/ScenarioComparison'
import ExportButtons from '@/components/ExportButtons'

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

const POSITIVE_CARDS = [
  { id: 'CFCS', desc: 'Creative Future-Challenge Score' },
  { id: 'DER',  desc: 'Dialectical Efficacy Rate' },
  { id: 'RCI',  desc: 'Return Capacity Index' },
  { id: 'BGR',  desc: 'Bodily Generation Rate' },
  { id: 'DRR',  desc: 'Democratic Re-Audit Rate' },
  { id: 'BDER', desc: 'Bio-Divisional Efficacy Rate' },
  { id: 'LSAR', desc: 'Lifeworld Subject Audit Rate' },
  { id: 'EGR',  desc: 'Ecological Generation Rate' },
  { id: 'HGR',  desc: 'Historical-Generational Responsibility Rate' },
  { id: 'IGR',  desc: 'Information Generation Rate' },
  { id: 'PDFS', desc: 'Pre-Differential Field Sensitivity' },
  { id: 'MGR',  desc: 'Meaning Generation Rate' },
  { id: 'TFGR', desc: 'Truth-Feeling Generation Rate' },
  { id: 'SRGR', desc: 'Social Responsibility Generation Rate' },
  { id: 'TIGR', desc: 'Temporal Integration Generation Rate' },
  { id: 'D-RGR',desc: 'Division-Relational Generation Rate' },
]

const RISK_CARDS = [
  { id: 'MSJR', desc: 'Managerial Self-Justification Risk' },
  { id: 'CFR',  desc: 'Classification Fixation Risk' },
  { id: 'RBR',  desc: 'Re-entry Blockage Risk' },
  { id: 'RDR',  desc: 'Responsibility Displacement Risk' },
  { id: 'BBI',  desc: 'Bodily Burden Index' },
  { id: 'TCR',  desc: 'Temporal Compression Risk' },
  { id: 'MTR',  desc: 'Metaphysical Transgression Risk' },
  { id: 'EER',  desc: 'Ecological Extraction Risk' },
  { id: 'EIR',  desc: 'Epistemic Injustice Risk' },
  { id: 'SRR',  desc: 'Securitization Risk Rate' },
  { id: 'FMR',  desc: 'Financialization / Marketization Risk' },
  { id: 'NPR',  desc: 'Narrative Polarization Risk' },
  { id: 'GSR',  desc: 'Geopolitical Security Risk' },
]

const GLOBAL_CARDS = [
  { id: 'BTR',  desc: 'Burden Transfer Risk',            type: 'risk'     as const },
  { id: 'CDR',  desc: 'Climate Displacement Risk',       type: 'risk'     as const },
  { id: 'SCDR', desc: 'Supply Chain Dependency Risk',    type: 'risk'     as const },
  { id: 'FGR',  desc: 'Future Generation Risk',          type: 'risk'     as const },
  { id: 'PPR',  desc: 'Platform Power Risk',             type: 'risk'     as const },
  { id: 'GDDR', desc: 'Global Democratic Deficit Risk',  type: 'risk'     as const },
  { id: 'CIR',  desc: 'Coloniality / Imperial Residue',  type: 'risk'     as const },
  { id: 'DCR',  desc: 'Data Colonialism Risk',           type: 'risk'     as const },
  { id: 'PRCI', desc: 'Planetary Return Capacity Index', type: 'positive' as const },
  { id: 'GDRR', desc: 'Global Democratic Re-Audit Rate', type: 'positive' as const },
  { id: 'CBRI', desc: 'Cross-Border Re-entry Index',     type: 'positive' as const },
  { id: 'SCTR', desc: 'Supply Chain Transparency Rate',  type: 'positive' as const },
  { id: 'PAI',  desc: 'Planetary Accountability Index',  type: 'positive' as const },
]

const IMPROVEMENT_RULES: { check: (ms: Record<string,number>, cat: string) => boolean; text: string }[] = [
  { check: (ms) => ms.RCI < 40,  text: 'Add appeal procedure, record expiration, and reclassification pathway to restore re-entry capacity (RCI).' },
  { check: (ms) => ms.MSJR > 65, text: 'Separate efficiency metrics from freedom-generation metrics. Add anti-managerial self-justification audit check (MSJR).' },
  { check: (ms) => ms.DRR < 40,  text: 'Add independent audit body, participatory review, and democratic legitimacy check (DRR).' },
  { check: (ms) => ms.CFR > 65,  text: 'Introduce record expiration, human review requirements, and reduce AI score persistence to reduce classification fixation (CFR).' },
  { check: (ms) => ms.BGR < 40,  text: 'Add bodily burden assessment and time-for-repair policy. Protect sleep, breath, and recovery (BGR).' },
  { check: (ms) => ms.EIR > 65,  text: 'Add epistemic injustice review and lifeworld testimony channel. Ensure affected subject voices are not erased in institutional translation (EIR).' },
  { check: (ms) => ms.BTR > 60,  text: 'Add cross-border accountability mechanism and burden transfer disclosure (BTR).' },
  { check: (ms) => ms.MTR > 65,  text: 'Prevent AI scores from becoming proxies for human worth. Add score context documentation and uncertainty disclosure (MTR).' },
  { check: (ms) => ms.EER > 65,  text: 'Add ecological cost visibility and institutional responsibility assignment for energy and compute burden (EER).' },
  { check: (ms) => ms.LSAR < 40, text: 'Add lifeworld testimony channel and affected-subject participation (LSAR).' },
  { check: (ms) => ms.BDER < 40, text: 'Strengthen living cooperation and care network support. Redistribute burden without exploitation (BDER).' },
  { check: (ms, cat) => ms.DRR < 30 && (cat === 'Public policy' || cat === 'Welfare'), text: 'For public policy and welfare systems with low DRR: mandate democratic re-audit cycle and legislative oversight.' },
]

const TABS = [
  { key: 'common.overview',      label: 'Case File Overview' },
  { key: 'common.metrics',       label: 'Full Metric Audit' },
  { key: 'common.actor_impact',  label: 'Actor Distribution' },
  { key: 'common.global',        label: 'Global / Planetary' },
  { key: 'common.scenarios',     label: 'Scenario Lab' },
  { key: 'common.export',        label: 'Export' },
]

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <h3 className="text-[9px] font-mono uppercase tracking-widest text-[#3a6a8a]">{children}</h3>
}

function MiniBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex-1 h-1 bg-[#0f1a2a]">
      <div className="h-1" style={{ width: `${value}%`, background: color }} />
    </div>
  )
}

function AxisSummaryTable({ ms }: { ms: Record<string, number> }) {
  const rows = [
    { id: 'CFCS', label: 'Creative Future-Challenge', type: 'pos' as const },
    { id: 'DER',  label: 'Dialectical Efficacy',      type: 'pos' as const },
    { id: 'RCI',  label: 'Re-entry Capacity',         type: 'pos' as const },
    { id: 'BGR',  label: 'Bodily Generation',          type: 'pos' as const },
    { id: 'DRR',  label: 'Democratic Re-Audit',        type: 'pos' as const },
    { id: 'MSJR', label: 'Managerial Self-Justification', type: 'risk' as const },
    { id: 'CFR',  label: 'Classification Fixation',   type: 'risk' as const },
    { id: 'RBR',  label: 'Re-entry Blockage',          type: 'risk' as const },
    { id: 'EIR',  label: 'Epistemic Injustice',        type: 'risk' as const },
    { id: 'BTR',  label: 'Burden Transfer',            type: 'risk' as const },
  ]
  return (
    <div className="border border-[#1e3a5a] divide-y divide-[#1e3a5a]">
      {rows.map(({ id, label, type }) => {
        const v = Math.round(ms[id] ?? 50)
        const color = type === 'pos' ? colorForPositive(v) : colorForRisk(v)
        return (
          <div key={id} className="flex items-center gap-3 px-4 py-2 bg-[#080e18]">
            <span className="font-mono text-[10px] font-bold text-[#7ac8f8] w-10 shrink-0">{id}</span>
            <span className="text-xs text-[#4a7a9a] w-40 shrink-0">{label}</span>
            <MiniBar value={v} color={color} />
            <span className="font-mono text-xs font-semibold w-8 text-right" style={{ color }}>{v}</span>
            <span
              className="text-[9px] font-mono px-1.5 py-0.5 shrink-0"
              style={{
                color: type === 'pos' ? (v >= 50 ? '#4ade80' : '#f87171') : (v >= 50 ? '#f87171' : '#4ade80'),
                background: type === 'pos' ? (v >= 50 ? '#061a0e' : '#1a0606') : (v >= 50 ? '#1a0606' : '#061a0e'),
              }}
            >
              {type === 'pos' ? (v >= 50 ? '↑' : '↓') : (v >= 50 ? '▲ RISK' : '✓')}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function FreedomBurdenDistribution({
  fdcr, gfdcr, metrics, t,
}: {
  fdcr: number; gfdcr: number; metrics: Record<string, number>; t: (k: string) => string
}) {
  const diff = Math.round(fdcr - gfdcr)
  const tcr  = metrics['TCR']  ?? 50
  const fgr  = metrics['FGR']  ?? 50
  const eer  = metrics['EER']  ?? 50
  const hgr  = metrics['HGR']  ?? 50
  const longTerm = Math.round(Math.max(0, fdcr - (tcr * 0.1) - (fgr * 0.08) - (eer * 0.07) + (hgr - 50) * 0.05))

  return (
    <div className="border border-[#1e3a5a]">
      <div className="grid grid-cols-3 divide-x divide-[#1e3a5a]">
        {[
          { label: 'Local FDCR', value: Math.round(fdcr), note: 'within-system' },
          { label: 'Global G-FDCR', value: Math.round(gfdcr), note: 'planetary scale' },
          { label: 'Long-Term Est.', value: longTerm, note: 'TCR + FGR + EER adjusted' },
        ].map(({ label, value, note }) => (
          <div key={label} className="p-4 space-y-1 bg-[#080e18]">
            <div className="text-[10px] font-mono uppercase tracking-wide text-[#3a6a8a]">{label}</div>
            <div className="font-mono text-3xl font-bold leading-none" style={{ color: colorForPositive(value) }}>
              {value}
            </div>
            <div className="text-[9px] text-[#3a6a8a]">{note}</div>
          </div>
        ))}
      </div>
      {diff > 20 && (
        <div className="border-t border-[#1e3a5a] px-4 py-2 bg-[#1a0e00]">
          <p className="text-[10px] text-[#f59e0b] font-mono">
            Δ +{diff} — Significant burden transfer gap. Local freedom-generation depends on planetary cost transfer.
          </p>
        </div>
      )}
      {fdcr > 70 && gfdcr < 45 && (
        <div className="border-t border-[#1e3a5a] px-4 py-2 bg-[#1a0e00]">
          <p className="text-[10px] text-[#f59e0b] font-mono">
            FLAG — Locally Freedom-Generative but Globally Burden-Transferring.
          </p>
        </div>
      )}
    </div>
  )
}

function TopFactorsPanel({ metrics, t }: { metrics: Record<string, number>; t: (k: string) => string }) {
  const topPos  = [...ALL_POSITIVE].sort((a, b) => (metrics[b] ?? 50) - (metrics[a] ?? 50)).slice(0, 3)
  const topRisk = [...ALL_RISK].sort((a, b) => (metrics[b] ?? 50) - (metrics[a] ?? 50)).slice(0, 3)

  return (
    <div className="grid gap-px bg-[#1e3a5a] md:grid-cols-2 border border-[#1e3a5a]">
      <div className="bg-[#080e18] p-4 space-y-3">
        <SectionLabel>{t('dashboard.top_generating')}</SectionLabel>
        <div className="space-y-2">
          {topPos.map((id, rank) => (
            <div key={id} className="flex items-center gap-3">
              <span className="font-mono text-[10px] text-[#2a5a7a] w-4 shrink-0">{rank + 1}</span>
              <MiniBar value={metrics[id] ?? 50} color="#4ade80" />
              <span className="font-mono text-xs font-semibold text-[#4ade80] w-8 text-right">{Math.round(metrics[id] ?? 50)}</span>
              <span className="text-[10px] text-[#4a7a9a] w-32 truncate">{METRIC_LABELS[id] ?? id}</span>
              <span className="font-mono text-[10px] font-bold text-[#7ac8f8] w-10 shrink-0">{id}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-[#080e18] p-4 space-y-3">
        <SectionLabel>{t('dashboard.top_closing')}</SectionLabel>
        <div className="space-y-2">
          {topRisk.map((id, rank) => (
            <div key={id} className="flex items-center gap-3">
              <span className="font-mono text-[10px] text-[#2a5a7a] w-4 shrink-0">{rank + 1}</span>
              <MiniBar value={metrics[id] ?? 50} color="#f87171" />
              <span className="font-mono text-xs font-semibold text-[#f87171] w-8 text-right">{Math.round(metrics[id] ?? 50)}</span>
              <span className="text-[10px] text-[#4a7a9a] w-32 truncate">{METRIC_LABELS[id] ?? id}</span>
              <span className="font-mono text-[10px] font-bold text-[#7ac8f8] w-10 shrink-0">{id}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ImprovementConditions({ metrics, fdcr, category, t }: { metrics: Record<string, number>; fdcr: number; category: string; t: (k: string) => string }) {
  const applicable = IMPROVEMENT_RULES.filter((r) => r.check(metrics, category))
  if (applicable.length === 0 && fdcr >= 70) return null
  return (
    <div className="border border-[#1e3a5a] p-4 space-y-3 bg-[#080e18]">
      <SectionLabel>{t('dashboard.improvement')}</SectionLabel>
      {applicable.length === 0 ? (
        <p className="text-xs text-[#3a6a8a] font-mono">No critical improvement conditions triggered at current thresholds.</p>
      ) : (
        <div className="space-y-2">
          {applicable.map((r, i) => (
            <div key={i} className="flex gap-3 text-xs text-[#94a3b8] leading-relaxed border-l-2 border-[#f59e0b] pl-3 py-0.5">
              {r.text}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ConsoleEmptyState({ t, locale, loadDemoCase, demoCases }: {
  t: (k: string) => string
  locale: string
  loadDemoCase: (id: string) => void
  demoCases: import('@/data/demoCases').DemoCase[]
}) {
  return (
    <div className="space-y-10">
      <header className="border-b border-[#1e3a5a] pb-8 space-y-2">
        <div className="text-[9px] uppercase tracking-widest text-[#3a6a8a]">FEDS Studio</div>
        <h1 className="text-3xl font-bold tracking-tight text-[#7ac8f8]">{t('console.title')}</h1>
        <p className="text-sm text-[#4a7a9a] max-w-2xl">{t('console.subtitle')}</p>
      </header>

      <section className="border border-[#1e3a5a] p-5 space-y-3 bg-[#0a1220]">
        <div className="text-[9px] font-mono uppercase tracking-widest text-[#3a6a8a]">Audit Axioms</div>
        <p className="text-xs leading-relaxed text-[#7a98b4]">{t('console.notice.no_persons')}</p>
        <p className="text-xs leading-relaxed text-[#7a98b4]">{t('console.notice.not_absolute')}</p>
      </section>

      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-[9px] font-mono uppercase tracking-widest text-[#3a6a8a] mb-1">{t('console.case_files')}</div>
            <p className="text-xs text-[#4a7a9a] max-w-2xl">{t('console.case_files.desc')}</p>
          </div>
          <Link
            href="/audit"
            className="shrink-0 text-[9px] font-mono border border-[#2a5a8a] px-3 py-1.5 text-[#4a8abb] hover:border-[#7ac8f8] hover:text-[#7ac8f8] transition-colors"
          >
            {t('app.begin_audit')} →
          </Link>
        </div>

        <div className="space-y-px border border-[#1e3a5a]">
          {demoCases.map((dc) => (
            <div key={dc.id} className="bg-[#080e18] border-b border-[#1e3a5a] last:border-0 p-5 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="text-[9px] font-mono uppercase tracking-widest text-[#3a6a8a]">
                    {t('console.case_file')} {dc.caseNumber}
                  </div>
                  <h3 className="text-sm font-bold text-[#7ac8f8]">
                    {locale === 'ja' ? dc.labelJa : dc.label}
                  </h3>
                </div>
                <button
                  onClick={() => loadDemoCase(dc.id)}
                  className="shrink-0 text-[9px] font-mono border border-[#4a8abb] px-4 py-2 text-[#4a8abb] hover:bg-[#0f2535] hover:text-[#7ac8f8] transition-colors"
                >
                  {t('console.open_case_file')}
                </button>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <div className="text-[9px] font-mono uppercase tracking-wide text-[#3a6a8a]">{t('console.central_tension')}</div>
                  <p className="text-xs text-[#7a98b4] leading-relaxed">
                    {locale === 'ja' ? dc.centralTensionJa : dc.centralTension}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="text-[9px] font-mono uppercase tracking-wide text-[#3a6a8a]">{t('console.primary_question')}</div>
                  <p className="text-xs text-[#7a98b4] leading-relaxed">
                    {locale === 'ja' ? dc.primaryQuestionJa : dc.primaryQuestion}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border border-[#1e3a5a] p-5 space-y-4 bg-[#080e18]">
        <div>
          <div className="text-[9px] font-mono uppercase tracking-widest text-[#3a6a8a] mb-1">{t('console.simulation.title')}</div>
          <p className="text-xs text-[#4a7a9a] max-w-2xl">{t('console.simulation.desc')}</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          {[
            { href: '/simulation?view=planetary',     key: 'console.simulation.planetary' },
            { href: '/simulation?view=urban',         key: 'console.simulation.urban' },
            { href: '/simulation?view=institutional', key: 'console.simulation.flow' },
          ].map(({ href, key }) => (
            <a
              key={key}
              href={href}
              className="border border-[#1e3a5a] px-4 py-3 text-[9px] font-mono text-[#4a8abb] hover:border-[#4a8abb] hover:text-[#7ac8f8] transition-colors block"
            >
              {t(key)} →
            </a>
          ))}
        </div>
      </section>

      <section className="border border-[#1e3a5a] p-5 space-y-3 bg-[#080e18]">
        <div className="text-[9px] font-mono uppercase tracking-widest text-[#3a6a8a]">{t('console.methodological_notes')}</div>
        <div className="space-y-2">
          {(['console.method_note.1', 'console.method_note.2', 'console.method_note.3'] as const).map((k, i) => (
            <div key={k} className="flex gap-3">
              <span className="font-mono text-[10px] text-[#2a5a7a] shrink-0 pt-0.5">{String(i + 1).padStart(2, '0')}</span>
              <p className="text-xs text-[#7a98b4] leading-relaxed">{t(k)}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default function ResearchConsolePage() {
  const { scoreResult, t, locale, loadDemoCase, demoCases, auditState } = useAudit()
  const [tab, setTab] = useState(0)

  useEffect(() => {
    if (!scoreResult) loadDemoCase('ai_hiring')
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!scoreResult) {
    return <ConsoleEmptyState t={t} locale={locale} loadDemoCase={loadDemoCase} demoCases={demoCases} />
  }

  const ms = scoreResult.metrics as unknown as Record<string, number>
  const activeCase = demoCases.find((dc) => dc.state.target === auditState.target)

  return (
    <div id="dashboard-capture" className="space-y-8">

      <header className="border-b border-[#1e3a5a] pb-6 space-y-2">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <div className="text-[9px] font-mono uppercase tracking-widest text-[#3a6a8a]">
              {activeCase
                ? `${t('console.case_file')} ${activeCase.caseNumber} — ${t('console.loaded.header')}`
                : `${t('console.loaded.custom')} — ${t('console.loaded.header')}`}
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#7ac8f8]">
              {locale === 'ja' && activeCase ? activeCase.labelJa : activeCase?.label ?? auditState.target}
            </h1>
            {auditState.category && (
              <p className="text-xs text-[#3a6a8a] font-mono">
                {auditState.category}
                {auditState.layers.length > 0 && ` · ${auditState.layers.length} layers`}
              </p>
            )}
          </div>
          <div className="flex gap-2 flex-wrap shrink-0">
            <Link
              href="/report"
              className="text-[9px] font-mono border border-[#2a5a8a] px-3 py-1.5 text-[#4a8abb] hover:border-[#7ac8f8] hover:text-[#7ac8f8] transition-colors"
            >
              {t('console.loaded.open_dossier')}
            </Link>
            <Link
              href="/scenarios"
              className="text-[9px] font-mono border border-[#1e3a5a] px-3 py-1.5 text-[#3a6a8a] hover:border-[#4a8abb] hover:text-[#7ac8f8] transition-colors"
            >
              {t('console.loaded.open_lab')}
            </Link>
            <Link
              href="/audit"
              className="text-[9px] font-mono border border-[#1e3a5a] px-3 py-1.5 text-[#3a6a8a] hover:border-[#4a8abb] hover:text-[#7ac8f8] transition-colors"
            >
              {t('console.loaded.new_audit')}
            </Link>
          </div>
        </div>

        {scoreResult.corrections.length > 0 && (
          <div className="border border-[#3a2a00] bg-[#1a1000] px-4 py-2 mt-2">
            <div className="text-[9px] font-mono uppercase tracking-wide text-[#f59e0b] mb-1">Correction Rules Applied</div>
            <ul className="space-y-0.5">
              {scoreResult.corrections.map((c, i) => (
                <li key={i} className="text-[10px] font-mono text-[#fbbf24]">▸ {c}</li>
              ))}
            </ul>
          </div>
        )}
      </header>

      {activeCase && (
        <section className="border border-[#1e3a5a] p-5 space-y-4 bg-[#080e18]">
          <div className="text-[9px] font-mono uppercase tracking-widest text-[#3a6a8a]">{t('console.loaded.audit_question')}</div>
          <p className="text-sm font-medium text-[#cbd5e1] leading-relaxed max-w-3xl">
            {locale === 'ja' ? activeCase.primaryQuestionJa : activeCase.primaryQuestion}
          </p>
          <div className="border-t border-[#1e3a5a] pt-3">
            <div className="text-[9px] font-mono uppercase tracking-wide text-[#3a6a8a] mb-1">{t('console.loaded.contradiction')}</div>
            <p className="text-xs text-[#7a98b4]">
              {locale === 'ja' ? activeCase.centralTensionJa : activeCase.centralTension}
            </p>
          </div>
        </section>
      )}

      <section className="space-y-3">
        <SectionLabel>{t('console.loaded.axis_summary')}</SectionLabel>
        <AxisSummaryTable ms={ms} />
      </section>

      <section className="space-y-3">
        <SectionLabel>{t('console.loaded.distribution')}</SectionLabel>
        <FreedomBurdenDistribution fdcr={scoreResult.fdcr} gfdcr={scoreResult.gfdcr} metrics={ms} t={t} />
      </section>

      <section className="space-y-3">
        <SectionLabel>{t('console.loaded.burden_pathways')}</SectionLabel>
        {scoreResult.burdenTransfers.length > 0 ? (
          <BurdenTransferMatrix />
        ) : (
          <p className="text-xs text-[#3a6a8a] font-mono border border-[#1e3a5a] px-4 py-3 bg-[#080e18]">
            {t('console.loaded.no_burden')}
          </p>
        )}
      </section>

      <section className="space-y-3">
        <SectionLabel>{t('console.loaded.indicators')}</SectionLabel>
        <div className="grid gap-px bg-[#1e3a5a] sm:grid-cols-3 border border-[#1e3a5a]">
          <div className="bg-[#080e18] p-5 space-y-1">
            <div className="text-[9px] font-mono uppercase tracking-wide text-[#3a6a8a]">FDCR</div>
            <div className="font-mono text-4xl font-bold leading-none" style={{ color: colorForPositive(scoreResult.fdcr) }}>
              {Math.round(scoreResult.fdcr)}
            </div>
            <div className="text-[9px] text-[#3a6a8a]">Freedom Dialectical Correctness Rate</div>
          </div>
          <div className="bg-[#080e18] p-5 space-y-1">
            <div className="text-[9px] font-mono uppercase tracking-wide text-[#3a6a8a]">G-FDCR</div>
            <div className="font-mono text-4xl font-bold leading-none" style={{ color: colorForPositive(scoreResult.gfdcr) }}>
              {Math.round(scoreResult.gfdcr)}
            </div>
            <div className="text-[9px] text-[#3a6a8a]">Global Freedom Dialectical Correctness Rate</div>
          </div>
          <div className="bg-[#080e18] p-5 space-y-2">
            <div className="text-[9px] font-mono uppercase tracking-wide text-[#3a6a8a]">{t('common.judgment')}</div>
            {scoreResult.judgments.map((j) => (
              <div key={j} className="border border-[#1e3a5a] bg-[#0a1220] px-2 py-1 text-[9px] font-mono text-[#7ac8f8]">
                {t(`judgment.${j}`)}
              </div>
            ))}
          </div>
        </div>
      </section>

      {scoreResult.ecoScores && (
        <section className="space-y-3">
          <SectionLabel>Ecological Research Indicators — EBDCR / EBDE / E-FDCR / EP-BTM</SectionLabel>
          <div className="grid gap-px bg-[#1e3a5a] sm:grid-cols-4 border border-[#1e3a5a]">
            {[
              { label: 'E-FDCR', value: scoreResult.ecoScores['E-FDCR'], full: t('eco.efdcr.full'), risk: false },
              { label: 'EBDCR',  value: scoreResult.ecoScores.EBDCR,     full: t('eco.ebdcr.full'), risk: false },
              { label: 'EBDE',   value: scoreResult.ecoScores.EBDE,      full: t('eco.ebde.full'),  risk: false },
              { label: 'EP-BTM', value: scoreResult.ecoScores['EP-BTM'], full: t('eco.epbtm.full'), risk: true  },
            ].map(({ label, value, full, risk }) => (
              <div key={label} className="bg-[#080e18] p-4 space-y-1">
                <div className="text-[9px] font-mono uppercase tracking-wide text-[#3a6a8a]">{label}</div>
                <div
                  className="font-mono text-3xl font-bold leading-none"
                  style={{ color: risk
                    ? (value > 65 ? '#f87171' : value > 45 ? '#fbbf24' : '#4ade80')
                    : (value > 60 ? '#4ade80' : value > 40 ? '#fbbf24' : '#f87171') }}
                >
                  {Math.round(value)}
                </div>
                <div className="text-[9px] text-[#3a6a8a]">{full}</div>
              </div>
            ))}
          </div>
          {scoreResult.ecoScores.ecoJudgments.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {scoreResult.ecoScores.ecoJudgments.map((j) => (
                <div key={j} className="text-[9px] font-mono border border-[#1e5a1e] bg-[#061a0e] px-2 py-1 text-[#4ade80]">
                  {t(`judgment.${j}`)}
                </div>
              ))}
            </div>
          )}
          {scoreResult.ecoScores.ecoCorrections.length > 0 && (
            <div className="border border-[#3a2a00] bg-[#1a1000] px-4 py-2">
              {scoreResult.ecoScores.ecoCorrections.map((c, i) => (
                <div key={i} className="text-[9px] font-mono text-[#fbbf24]">▸ {c}</div>
              ))}
            </div>
          )}
          <a
            href="/simulation"
            className="inline-block text-[9px] font-mono border border-[#1e3a5a] px-4 py-2 text-[#4a8abb] hover:border-[#4a8abb] hover:text-[#7ac8f8] transition-colors"
          >
            {t('sim.title')} →
          </a>
        </section>
      )}

      <TopFactorsPanel metrics={ms} t={t} />

      <ImprovementConditions metrics={ms} fdcr={scoreResult.fdcr} category={scoreResult.report.category} t={t} />

      <div className="border-b border-[#1e3a5a] flex flex-wrap gap-0">
        {TABS.map(({ key, label }, i) => (
          <button
            key={key}
            onClick={() => setTab(i)}
            className={`px-4 py-2.5 text-xs font-mono border-b-2 transition-colors ${
              i === tab
                ? 'border-[#4a8abb] text-[#7ac8f8]'
                : 'border-transparent text-[#3a6a8a] hover:text-[#7ac8f8]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 0 && (
        <div className="space-y-6">
          <div className="space-y-3">
            <SectionLabel>{t('dashboard.layer_matrix')}</SectionLabel>
            <LayerMatrix />
          </div>
        </div>
      )}

      {tab === 1 && (
        <div className="space-y-8">
          <div className="space-y-3">
            <SectionLabel>{t('dashboard.positive_metrics')}</SectionLabel>
            <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
              {POSITIVE_CARDS.map(({ id, desc }) => (
                <ScoreCard key={id} label={id} value={Math.round(ms[id] ?? 50)} description={desc} type="positive" />
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <SectionLabel>{t('dashboard.risk_metrics')}</SectionLabel>
            <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
              {RISK_CARDS.map(({ id, desc }) => (
                <ScoreCard key={id} label={id} value={Math.round(ms[id] ?? 50)} description={desc} type="risk" />
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 2 && (
        <div className="space-y-6">
          <div className="space-y-3">
            <SectionLabel>{t('dashboard.actor_matrix')}</SectionLabel>
            <ActorImpactMatrix />
          </div>
          <div className="space-y-3">
            <SectionLabel>{t('dashboard.winner_loser')}</SectionLabel>
            <WinnerLoserChart />
          </div>
        </div>
      )}

      {tab === 3 && (
        <div className="space-y-6">
          {scoreResult.globalFlags.length > 0 && (
            <div className="border border-[#3a2a00] bg-[#1a1000] p-4">
              <div className="text-[9px] font-mono uppercase tracking-wide text-[#f59e0b] mb-2">{t('dashboard.global_flags')}</div>
              <ul className="space-y-1">
                {scoreResult.globalFlags.map((g, i) => (
                  <li key={i} className="text-xs text-[#94a3b8] font-mono">▸ {g}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="space-y-3">
            <SectionLabel>{t('dashboard.global_metrics')}</SectionLabel>
            <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
              {GLOBAL_CARDS.map(({ id, desc, type }) => (
                <ScoreCard key={id} label={id} value={Math.round(ms[id] ?? 50)} description={desc} type={type} />
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <SectionLabel>{t('dashboard.burden_matrix')}</SectionLabel>
            <BurdenTransferMatrix />
          </div>
        </div>
      )}

      {tab === 4 && <ScenarioComparison />}

      {tab === 5 && (
        <div className="space-y-4">
          <ExportButtons captureId="dashboard-capture" />
          <Link href="/report" className="inline-block text-xs font-mono text-[#4a8abb] hover:text-[#7ac8f8] hover:underline">
            {t('dossier.title')} →
          </Link>
        </div>
      )}
    </div>
  )
}
