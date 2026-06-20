'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAudit } from '@/lib/auditContext'
import PlanetaryView from '@/components/simulation/PlanetaryView'
import UrbanSystemsView from '@/components/simulation/UrbanSystemsView'
import InstitutionalFlowView from '@/components/simulation/InstitutionalFlowView'

type SimView = 'planetary' | 'urban' | 'institutional'
type ScenarioId = 'current' | 'reform' | 'managerial'

const TIME_LABELS = ['Immediate', '1 Year', '5 Years', '10 Years', '25 Years', 'Future Generations']
const TIME_LABELS_JA = ['即時', '1年', '5年', '10年', '25年', '将来世代']

const PLANETARY_LAYERS = [
  { id: 'E-FDCR', label: 'E-FDCR — Eco-Freedom Rate' },
  { id: 'EBDCR',  label: 'EBDCR — Eco Bio-Div Correctness' },
  { id: 'BTR',    label: 'BTR — Burden Transfer' },
  { id: 'FDCR',   label: 'FDCR — Freedom Rate' },
  { id: 'CDR',    label: 'CDR — Climate Displacement' },
  { id: 'SCDR',   label: 'SCDR — Supply Chain Dep' },
]

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-[9px] font-mono uppercase tracking-widest text-[#2a5a8a]">{children}</div>
}

export default function SimulationTheaterPage() {
  const { scoreResult, t, locale, demoCases, loadDemoCase } = useAudit()
  const [view, setView] = useState<SimView>('planetary')

  useEffect(() => {
    if (!scoreResult) loadDemoCase('ai_hiring')
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const [scenario, setScenario] = useState<ScenarioId>('current')
  const [timeHorizon, setTimeHorizon] = useState(0)
  const [planetaryLayer, setPlanetaryLayer] = useState('E-FDCR')

  const ms = scoreResult
    ? (scoreResult.metrics as unknown as Record<string, number>)
    : {}
  const ecoScores = scoreResult?.ecoScores
  const ecoMs: Record<string, number> = ecoScores
    ? { 'E-FDCR': ecoScores['E-FDCR'], EBDCR: ecoScores.EBDCR, 'EP-BTM': ecoScores['EP-BTM'], EBDE: ecoScores.EBDE }
    : {}

  // Apply time horizon decay/growth to metric values
  const timeAdjusted = Object.fromEntries(
    Object.entries(ms).map(([k, v]) => {
      const isRisk = ['MSJR','CFR','RBR','EER','BTR','CDR','FGR','CIR','SCDR','MTR','EIR','BBI','ILBR','GDDR','PPR','DCR'].includes(k)
      const delta = timeHorizon * (isRisk ? 3 : -2)
      return [k, Math.max(0, Math.min(100, v + delta))]
    })
  )

  const timeEco: Record<string, number> = {
    'E-FDCR': Math.max(0, Math.min(100, (ecoMs['E-FDCR'] ?? 50) - timeHorizon * 3)),
    EBDCR:    Math.max(0, Math.min(100, (ecoMs.EBDCR ?? 50) - timeHorizon * 2.5)),
    'EP-BTM': Math.max(0, Math.min(100, (ecoMs['EP-BTM'] ?? 50) + timeHorizon * 4)),
    EBDE:     Math.max(0, Math.min(100, (ecoMs.EBDE ?? 50) - timeHorizon * 2)),
  }

  const VIEW_TABS: { id: SimView; label: string; labelJa: string }[] = [
    { id: 'planetary',     label: 'Planetary View',       labelJa: '惑星ビュー' },
    { id: 'urban',         label: 'Urban Systems View',   labelJa: '都市システムビュー' },
    { id: 'institutional', label: 'Institutional Flow',   labelJa: '制度フロービュー' },
  ]

  const timeLabel = locale === 'ja' ? TIME_LABELS_JA[timeHorizon] : TIME_LABELS[timeHorizon]

  // Empty state
  if (!scoreResult) {
    return (
      <div className="bg-[#060c14] min-h-screen text-white">
        <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
          <header className="border-b border-[#1e3a5a] pb-6 space-y-2">
            <div className="text-[9px] font-mono uppercase tracking-widest text-[#2a5a8a]">FEDS Studio</div>
            <h1 className="text-3xl font-bold tracking-tight text-[#7ac8f8]">
              {t('sim.title')}
            </h1>
            <p className="text-sm text-[#4a7fa5] max-w-2xl">{t('sim.subtitle')}</p>
          </header>

          <div className="grid gap-px bg-[#1e3a5a] md:grid-cols-3 border border-[#1e3a5a]">
            {VIEW_TABS.map((v) => (
              <div key={v.id} className="bg-[#080e18] p-5 space-y-2">
                <div className="text-[9px] font-mono uppercase tracking-widest text-[#2a5a8a]">View Mode</div>
                <h3 className="text-sm font-bold text-[#7ac8f8]">
                  {locale === 'ja' ? v.labelJa : v.label}
                </h3>
                <p className="text-[10px] text-[#3a6a8a] leading-relaxed">
                  {v.id === 'planetary' && (locale === 'ja'
                    ? '地球規模の負担転嫁経路、気候的変位帯、供給連鎖フロー、E-FDCR地域分布を可視化。'
                    : 'Visualizes global burden transfer pathways, climate displacement zones, supply chain flows, and E-FDCR distribution by region.')}
                  {v.id === 'urban' && (locale === 'ja'
                    ? '都市システム内のFDCR・生体生成率・空間分類リスク・監視密度を8×6グリッドで表示。'
                    : 'Maps FDCR, bodily generation, spatial classification risk, and surveillance density across city districts in an 8×6 grid.')}
                  {v.id === 'institutional' && (locale === 'ja'
                    ? '申請から排除・再参入までの制度フローを可視化。分類固定・再参入阻止・生活世界の消去・民主的再監査を追跡。'
                    : 'Traces subject pathways from application through classification, AI scoring, rejection, appeal, re-entry, and exclusion. Highlights classification fixation and burden transfer.')}
                </p>
              </div>
            ))}
          </div>

          <div className="border border-[#1e3a5a] bg-[#080e18] p-5 space-y-4">
            <SectionLabel>Open Case File to Begin Simulation</SectionLabel>
            <div className="space-y-2">
              {demoCases.map((dc) => (
                <div key={dc.id} className="flex items-start justify-between gap-4 border border-[#1e3a5a] p-3">
                  <div>
                    <div className="text-[9px] font-mono text-[#2a5a8a] uppercase tracking-wide">
                      Case File {dc.caseNumber}
                    </div>
                    <div className="text-xs font-semibold text-[#7ac8f8] mt-0.5">
                      {locale === 'ja' ? dc.labelJa : dc.label}
                    </div>
                    <div className="text-[9px] text-[#3a6a8a] mt-0.5">
                      {locale === 'ja' ? dc.centralTensionJa : dc.centralTension}
                    </div>
                  </div>
                  <button
                    onClick={() => loadDemoCase(dc.id)}
                    className="shrink-0 text-[9px] font-mono border border-[#4a8abb] px-3 py-1.5 text-[#4a8abb] hover:bg-[#0f2535] transition-colors"
                  >
                    Open Case File
                  </button>
                </div>
              ))}
            </div>
            <Link
              href="/audit"
              className="inline-block text-[9px] font-mono border border-[#2a5a8a] px-4 py-2 text-[#3a8abb] hover:border-[#4a8abb] hover:text-[#7ac8f8] transition-colors"
            >
              {t('workbench.title')} →
            </Link>
          </div>

          {/* Architecture note */}
          <div className="border border-[#1e3a2a] bg-[#060e08] p-4 space-y-2">
            <SectionLabel>Simulation Architecture Note</SectionLabel>
            <p className="text-[10px] text-[#3a6a4a] leading-relaxed max-w-3xl">
              {t('sim.arch_note')}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#060c14] min-h-screen text-white">
      <div className="max-w-6xl mx-auto px-6 py-6 space-y-5">

        {/* Header */}
        <header className="border-b border-[#1e3a5a] pb-4 flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <div className="text-[9px] font-mono uppercase tracking-widest text-[#2a5a8a]">FEDS Studio — 3D Simulation Theater</div>
            <h1 className="text-xl font-bold tracking-tight text-[#7ac8f8]">{t('sim.title')}</h1>
            <p className="text-[10px] text-[#3a6a8a]">{scoreResult.report.target} · {scoreResult.report.category}</p>
          </div>
          <div className="flex gap-2 flex-wrap shrink-0">
            <Link href="/dashboard" className="text-[9px] font-mono border border-[#1e3a5a] px-3 py-1.5 text-[#3a6a8a] hover:border-[#4a8abb] hover:text-[#7ac8f8] transition-colors">
              ← {t('nav.dashboard')}
            </Link>
            <Link href="/scenarios" className="text-[9px] font-mono border border-[#1e3a5a] px-3 py-1.5 text-[#3a6a8a] hover:border-[#4a8abb] hover:text-[#7ac8f8] transition-colors">
              {t('nav.scenarios')}
            </Link>
          </div>
        </header>

        {/* Control strip */}
        <div className="grid gap-px bg-[#1e3a5a] md:grid-cols-3 border border-[#1e3a5a]">
          {/* View selector */}
          <div className="bg-[#080e18] p-3 space-y-2">
            <SectionLabel>View Mode</SectionLabel>
            <div className="flex flex-col gap-1">
              {VIEW_TABS.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setView(v.id)}
                  className={`text-left text-[9px] font-mono px-2 py-1.5 border transition-colors ${
                    view === v.id
                      ? 'border-[#4a8abb] bg-[#0f2535] text-[#7ac8f8]'
                      : 'border-[#1e3a5a] text-[#3a6a8a] hover:border-[#2a5a8a] hover:text-[#5a9aba]'
                  }`}
                >
                  {locale === 'ja' ? v.labelJa : v.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scenario selector */}
          <div className="bg-[#080e18] p-3 space-y-2">
            <SectionLabel>Scenario Overlay</SectionLabel>
            <div className="flex flex-col gap-1">
              {(['current', 'reform', 'managerial'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setScenario(s)}
                  className={`text-left text-[9px] font-mono px-2 py-1.5 border transition-colors ${
                    scenario === s
                      ? 'border-[#4a8abb] bg-[#0f2535] text-[#7ac8f8]'
                      : 'border-[#1e3a5a] text-[#3a6a8a] hover:border-[#2a5a8a] hover:text-[#5a9aba]'
                  }`}
                >
                  {s === 'current' ? (locale === 'ja' ? 'A — 現在システム' : 'A — Current System')
                    : s === 'reform' ? (locale === 'ja' ? 'B — 自由生成的改革' : 'B — Freedom-Generative Reform')
                    : (locale === 'ja' ? 'C — 管理的強化' : 'C — Managerial Intensification')}
                </button>
              ))}
            </div>
          </div>

          {/* Time horizon */}
          <div className="bg-[#080e18] p-3 space-y-2">
            <SectionLabel>Time Horizon — {timeLabel}</SectionLabel>
            <input
              type="range"
              min={0} max={5} step={1}
              value={timeHorizon}
              onChange={(e) => setTimeHorizon(Number(e.target.value))}
              className="w-full accent-[#4a8abb]"
            />
            <div className="flex justify-between">
              {TIME_LABELS.map((l, i) => (
                <span
                  key={i}
                  className="text-[7px] font-mono"
                  style={{ color: i === timeHorizon ? '#7ac8f8' : '#2a5a8a' }}
                >
                  {i === 0 ? 'Now' : i === 5 ? 'Future' : l.replace(' Years', 'yr').replace(' Year', 'yr')}
                </span>
              ))}
            </div>

            {/* Key indicators for current time */}
            <div className="mt-2 space-y-1">
              {[
                { label: 'FDCR',   value: Math.round(Math.max(0, scoreResult.fdcr - timeHorizon * 2.5)) },
                { label: 'E-FDCR', value: Math.round(Math.max(0, (ecoMs['E-FDCR'] ?? 50) - timeHorizon * 3)) },
                { label: 'BTR',    value: Math.round(Math.min(100, (ms.BTR ?? 50) + timeHorizon * 4)) },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="text-[8px] font-mono text-[#2a5a8a] w-12 shrink-0">{label}</span>
                  <div className="flex-1 h-1 bg-[#0f1a2a]">
                    <div
                      className="h-1 transition-all"
                      style={{
                        width: `${value}%`,
                        background: label === 'BTR'
                          ? (value > 65 ? '#ef4444' : '#fbbf24')
                          : (value > 60 ? '#4ade80' : value > 40 ? '#fbbf24' : '#f87171'),
                      }}
                    />
                  </div>
                  <span className="text-[8px] font-mono text-[#4a8abb] w-6 text-right">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Planetary layer selector */}
        {view === 'planetary' && (
          <div className="flex flex-wrap gap-1">
            <SectionLabel>Overlay Layer:</SectionLabel>
            {PLANETARY_LAYERS.map((l) => (
              <button
                key={l.id}
                onClick={() => setPlanetaryLayer(l.id)}
                className={`text-[9px] font-mono px-2 py-1 border transition-colors ${
                  planetaryLayer === l.id
                    ? 'border-[#4a8abb] bg-[#0f2535] text-[#7ac8f8]'
                    : 'border-[#1e3a5a] text-[#2a5a8a] hover:border-[#3a6a8a]'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        )}

        {/* Main view */}
        <div>
          {view === 'planetary' && (
            <PlanetaryView
              ecoScores={ecoScores}
              metrics={timeAdjusted}
              scenario={scenario}
              timeHorizon={timeHorizon}
              activeLayer={planetaryLayer}
              t={t}
            />
          )}
          {view === 'urban' && (
            <UrbanSystemsView
              metrics={timeAdjusted}
              ecoMetrics={timeEco}
              scenario={scenario}
              timeHorizon={timeHorizon}
              t={t}
            />
          )}
          {view === 'institutional' && (
            <InstitutionalFlowView
              metrics={timeAdjusted}
              scenario={scenario}
              timeHorizon={timeHorizon}
              locale={locale}
              t={t}
            />
          )}
        </div>

        {/* Eco scores panel */}
        {ecoScores && (
          <div className="grid gap-px bg-[#1e3a5a] grid-cols-2 sm:grid-cols-4 border border-[#1e3a5a]">
            {[
              { label: 'E-FDCR', value: timeEco['E-FDCR'], desc: 'Ecological Freedom-Evolution Rate' },
              { label: 'EBDCR',  value: timeEco['EBDCR'],  desc: 'Eco Bio-Divisional Correctness' },
              { label: 'EBDE',   value: timeEco['EBDE'],   desc: 'Eco Bio-Divisional Efficacy' },
              { label: 'EP-BTM', value: timeEco['EP-BTM'], desc: 'Eco-Planetary Burden Transfer', risk: true },
            ].map(({ label, value, desc, risk }) => {
              const v = Math.round(value ?? 50)
              const color = risk
                ? (v > 65 ? '#f87171' : v > 45 ? '#fbbf24' : '#4ade80')
                : (v > 60 ? '#4ade80' : v > 40 ? '#fbbf24' : '#f87171')
              return (
                <div key={label} className="bg-[#080e18] p-3 space-y-0.5">
                  <div className="text-[8px] font-mono uppercase tracking-widest text-[#2a5a8a]">{label}</div>
                  <div className="font-mono text-2xl font-bold leading-none" style={{ color }}>{v}</div>
                  <div className="text-[8px] text-[#2a5a8a]">{desc}</div>
                </div>
              )
            })}
          </div>
        )}

        {/* Ecological judgments */}
        {ecoScores && ecoScores.ecoJudgments.length > 0 && (
          <div className="border border-[#1e3a2a] bg-[#060e08] p-3 space-y-2">
            <SectionLabel>Ecological Audit Judgments</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {ecoScores.ecoJudgments.map((j) => (
                <div key={j} className="text-[9px] font-mono border border-[#1e5a1e] bg-[#060e06] px-2 py-1 text-[#4aaa4a]">
                  {t(`judgment.${j}`)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Methodological note */}
        <div className="border border-[#1e3a2a] bg-[#060e08] p-3">
          <SectionLabel>Methodological Note</SectionLabel>
          <p className="text-[10px] text-[#3a6a4a] leading-relaxed mt-1 max-w-3xl">
            {t('sim.method_note')}
          </p>
        </div>
      </div>
    </div>
  )
}
