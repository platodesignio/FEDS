'use client'

import { useEffect, useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { useAudit } from '@/lib/auditContext'
import { useSimulationStore } from '@/lib/simulation/simulationStore'
import type { BaseMetrics, EcoMetrics, ScenarioId, TimeHorizon } from '@/lib/simulation/types'

// Only the R3F canvas is dynamic — all UI panels render immediately
const SimulationCanvas = dynamic(
  () => import('@/components/simulation/three/SimulationTheater'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-[#04080e] flex items-center justify-center">
        <div className="w-24 h-px bg-[#1e3a5a] animate-pulse" />
      </div>
    ),
  }
)

const LAYER_MODES = [
  { id: 'planetary',          label: 'Planetary View',     short: 'Planetary' },
  { id: 'urban_nature',       label: 'Urban-Nature',       short: 'Urban' },
  { id: 'body_lifeworld',     label: 'Body-Lifeworld',     short: 'Body' },
  { id: 'institutional_flow', label: 'Institutional Flow', short: 'Institutional' },
] as const

const SCENARIO_OPTIONS: { id: ScenarioId; label: string; short: string; color: string }[] = [
  { id: 'current',    label: 'Current System',               short: 'Current',    color: '#fbbf24' },
  { id: 'reform',     label: 'Freedom-Generative Reform',    short: 'Reform',     color: '#4ade80' },
  { id: 'managerial', label: 'Managerial Intensification',   short: 'Managerial', color: '#ef4444' },
]

const TIME_LABELS = ['Immediate', '1 year', '5 years', '10 years', '25 years', 'Future generations']

const OVERLAY_GROUPS = [
  {
    id: 'metrics',
    label: 'Metrics',
    items: [
      { id: 'FDCR',    label: 'FDCR',    desc: 'Freedom Dialectical Correctness Rate',     color: '#4ade80' },
      { id: 'GFDCR',   label: 'G-FDCR',  desc: 'Global FDCR',                              color: '#4ade80' },
      { id: 'EFDCR',   label: 'E-FDCR',  desc: 'Ecological Freedom-Evolution Rate',        color: '#34d399' },
      { id: 'EBDCR',   label: 'EBDCR',   desc: 'Eco Bio-Div Correctness Rate',             color: '#34d399' },
      { id: 'BGR',     label: 'BGR',     desc: 'Bodily Generation Rate',                   color: '#60a5fa' },
      { id: 'RCI',     label: 'RCI',     desc: 'Re-entry Condition Index',                 color: '#60a5fa' },
    ],
  },
  {
    id: 'risk',
    label: 'Risk',
    items: [
      { id: 'MSJR',    label: 'MSJR',    desc: 'Managerial Self-Justification Risk',       color: '#ef4444' },
      { id: 'CFR',     label: 'CFR',     desc: 'Classification Fixation Risk',             color: '#ef4444' },
      { id: 'RBR',     label: 'RBR',     desc: 'Re-entry Blockage Risk',                   color: '#f97316' },
      { id: 'BTR',     label: 'BTR',     desc: 'Burden Transfer Risk',                     color: '#f97316' },
      { id: 'EER',     label: 'EER',     desc: 'Exclusion Escalation Rate',               color: '#fbbf24' },
      { id: 'EPBTM',   label: 'EP-BTM',  desc: 'Eco-Planetary Burden Transfer Matrix',    color: '#fbbf24' },
    ],
  },
  {
    id: 'thematic',
    label: 'Thematic',
    items: [
      { id: 'urban_body',    label: 'Urban bodily burden',      desc: 'Urban bodily burden layer',            color: '#f97316' },
      { id: 'spatial_class', label: 'Spatial classification',   desc: 'Spatial surveillance density overlay', color: '#ef4444' },
      { id: 'eco_extract',   label: 'Ecological extraction',    desc: 'Extraction zones and flow arcs',       color: '#f97316' },
      { id: 'reentry',       label: 'Re-entry access',          desc: 'Re-entry pathway visibility',          color: '#fbbf24' },
      { id: 'future_gen',    label: 'Future-generation burden', desc: 'Intergenerational burden projection',  color: '#a78bfa' },
    ],
  },
]

function metricColor(key: string, value: number): string {
  const isRisk = ['BTR', 'MSJR', 'CFR', 'RBR', 'EPBTM', 'EER', 'EP-BTM'].includes(key)
  if (isRisk) return value > 65 ? '#ef4444' : value > 45 ? '#fbbf24' : '#4ade80'
  return value > 60 ? '#4ade80' : value > 40 ? '#fbbf24' : '#ef4444'
}

function getBurdenTransfer(id: string): string {
  const m: Record<string, string> = {
    IF_AI:       'Transfers classification risk downward. Responsibility displacement to automated system. Democratic accountability gap remains.',
    IF_CLASS:    'Classification output persists across re-evaluation cycles. Subjects bear accumulated burden from prior decisions.',
    BL_CLASS:    'Bodily surveillance data → institutional scoring → classification fixation. Burden accumulates on subject.',
    AF:          'Compounded ecological, economic, and freedom-suppressive transfers from Global North. EP-BTM = 82.',
    LA:          'Resource extraction burden from North American and European supply chains.',
    IF_EXCLUSION:'Terminal burden sink. Subject exits formal system. Re-entry pathway severely constrained.',
    BL_SURV:     'Surveillance capture → classification data feed → AI scoring amplification loop.',
    IF_REJECT:   'Rejection record feeds classification pipeline for future applications.',
  }
  return m[id] ?? 'Burden transfer pathway: Click adjacent nodes to trace the full flow across this layer.'
}

function getReentryCondition(id: string): string {
  const m: Record<string, string> = {
    IF_AI:       'Democratic review gate must be activated. Currently bypassed in majority of cases under this scenario.',
    IF_EXCLUSION:'Re-entry blocked without successful appeal. Appeal success rate: ~30%. Classification record must be corrected upstream.',
    BL_CLASS:    'Requires classification record expungement or democratic audit override at IF_AI node.',
    AF:          'Requires debt cancellation, technology transfer, and ecological reparation mechanisms at global level.',
    IF_REJECT:   'Subject must initiate appeal process (IF_APPEAL). Success rate inversely correlated with prior classification score.',
    BL_SURV:     'Subject must be removed from surveillance data pool. Currently no mechanism available.',
  }
  return m[id] ?? 'Re-entry condition: requires democratic audit and classification correction at upstream node.'
}

function getCorrectionMechanism(id: string): string {
  const m: Record<string, string> = {
    IF_AI:       'Activate democratic review gate for all AI-scored cases. Mandate explainability and introduce subject appeal channel with public support.',
    IF_CLASS:    'Classification record expiry. Subject right to audit and rebut. Democratic override authority at IF_DEMO.',
    IF_EXCLUSION:'Mandatory appeal access with public defender. Time-limited classification expiry. Automatic democratic review trigger.',
    BL_SURV:     'Data minimisation mandate. Subject right to audit and correct surveillance record. Independent oversight body.',
    AF:          'Global FDCR rebalancing: debt cancellation, extraction reparations, climate adaptation funding, technology transfer.',
    BL_CLASS:    'Replace classification gate with dialectical assessment. Subject agency in rebuttal. Transparency in scoring criteria.',
  }
  return m[id] ?? 'Freedom-generative correction: introduce democratic oversight, subject agency, and transparent appeal pathway.'
}

export default function SimulationTheaterPage() {
  const { scoreResult, locale, loadDemoCase } = useAudit()
  const {
    activeLayer, scenario, timeHorizon, inspectorOpen, inspectorData,
    setActiveLayer, setScenario, setTimeHorizon, closeInspector,
  } = useSimulationStore()

  const [activeOverlays, setActiveOverlays] = useState<Set<string>>(
    () => new Set(['FDCR', 'GFDCR', 'BTR', 'MSJR', 'CFR', 'eco_extract', 'spatial_class'])
  )

  useEffect(() => {
    if (!scoreResult) loadDemoCase('ai_hiring')
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const toggleOverlay = (id: string) => {
    setActiveOverlays((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const baseMetrics = useMemo<BaseMetrics>(() => {
    if (!scoreResult) return {
      FDCR: 47, GFDCR: 44, BTR: 58, MSJR: 62, CFR: 55, RBR: 51,
      BGR: 42, DER: 48, CFCS: 45, RCI: 38,
    }
    return {
      FDCR:  scoreResult.fdcr,
      GFDCR: scoreResult.gfdcr,
      ...(scoreResult.metrics as unknown as Record<string, number>),
    } as BaseMetrics
  }, [scoreResult])

  const ecoMetrics = useMemo<EcoMetrics>(() => {
    if (!scoreResult?.ecoScores) return { 'E-FDCR': 42, EBDCR: 39, EBDE: 37, 'EP-BTM': 61 }
    return {
      'E-FDCR': scoreResult.ecoScores['E-FDCR'],
      EBDCR:    scoreResult.ecoScores.EBDCR,
      EBDE:     scoreResult.ecoScores.EBDE,
      'EP-BTM': scoreResult.ecoScores['EP-BTM'],
    }
  }, [scoreResult])

  const scenarioOption = SCENARIO_OPTIONS.find((s) => s.id === scenario)!
  const caseLabel = scoreResult
    ? (scoreResult.report as any).caseNumber
      ? `Case ${(scoreResult.report as any).caseNumber} — ${scoreResult.report.target}`
      : scoreResult.report.target
    : 'Case 001 — AI Hiring System (Demo)'

  // Strip metrics for the bottom status bar
  const statusMetrics: { k: string; v: number; risk: boolean }[] = [
    { k: 'FDCR',  v: Math.round(baseMetrics.FDCR),       risk: false },
    { k: 'G-FDCR',v: Math.round(baseMetrics.GFDCR ?? 44), risk: false },
    { k: 'E-FDCR',v: Math.round(ecoMetrics['E-FDCR']),   risk: false },
    { k: 'BTR',   v: Math.round(baseMetrics.BTR  ?? 58), risk: true },
    { k: 'MSJR',  v: Math.round(baseMetrics.MSJR ?? 62), risk: true },
    { k: 'CFR',   v: Math.round(baseMetrics.CFR  ?? 55), risk: true },
    { k: 'RBR',   v: Math.round(baseMetrics.RBR  ?? 51), risk: true },
    { k: 'BGR',   v: Math.round(baseMetrics.BGR  ?? 42), risk: false },
  ]

  return (
    <div
      className="bg-[#05080f] flex flex-col -mx-6 -mt-8 overflow-hidden"
      style={{ height: 'calc(100vh - 0px)' }}
    >

      {/* ── TOP CONTROL BAR ─────────────────────────────────────────── */}
      <div
        className="flex items-stretch border-b border-[#1e3a5a] bg-[#060c14] flex-shrink-0 overflow-x-auto"
        style={{ height: '44px', minHeight: '44px' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 border-r border-[#1e3a5a] flex-shrink-0">
          <span className="text-[7px] font-mono uppercase tracking-[0.2em] text-[#1e3a5a]">FEDS</span>
          <div className="w-px h-3 bg-[#1e3a5a]" />
          <span className="text-[7px] font-mono uppercase tracking-wider text-[#2a5a8a]">Simulation Theater</span>
        </div>

        {/* Mode tabs */}
        <div className="flex items-stretch border-r border-[#1e3a5a] flex-shrink-0">
          <div className="flex items-center px-2 border-r border-[#0f1e2e]">
            <span className="text-[7px] font-mono uppercase tracking-widest text-[#1e3a5a]">Mode</span>
          </div>
          {LAYER_MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setActiveLayer(m.id as any)}
              className={`flex items-center px-3 text-[9px] font-mono border-r border-[#0f1e2e] transition-colors whitespace-nowrap h-full ${
                activeLayer === m.id
                  ? 'text-[#7ac8f8] bg-[#0a1825] border-b-2 border-b-[#4a8abb]'
                  : 'text-[#2a5a8a] hover:text-[#4a8abb] hover:bg-[#07101a]'
              }`}
            >
              {m.short}
            </button>
          ))}
        </div>

        {/* Scenario tabs */}
        <div className="flex items-stretch border-r border-[#1e3a5a] flex-shrink-0">
          <div className="flex items-center px-2 border-r border-[#0f1e2e]">
            <span className="text-[7px] font-mono uppercase tracking-widest text-[#1e3a5a]">Scenario</span>
          </div>
          {SCENARIO_OPTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setScenario(s.id)}
              className={`flex items-center gap-1.5 px-3 text-[9px] font-mono border-r border-[#0f1e2e] transition-colors whitespace-nowrap h-full ${
                scenario === s.id ? 'bg-[#0a1825]' : 'hover:bg-[#07101a]'
              }`}
              style={{ color: scenario === s.id ? s.color : '#2a5a8a' }}
            >
              {scenario === s.id && (
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
              )}
              {s.short}
            </button>
          ))}
        </div>

        {/* Time horizon */}
        <div className="flex items-stretch flex-1">
          <div className="flex items-center px-2 border-r border-[#0f1e2e] flex-shrink-0">
            <span className="text-[7px] font-mono uppercase tracking-widest text-[#1e3a5a]">T</span>
          </div>
          {TIME_LABELS.map((label, i) => (
            <button
              key={i}
              onClick={() => setTimeHorizon(i as TimeHorizon)}
              className={`flex items-center px-3 text-[9px] font-mono border-r border-[#0f1e2e] transition-colors whitespace-nowrap h-full ${
                timeHorizon === i
                  ? 'text-[#7ac8f8] bg-[#0a1825]'
                  : 'text-[#2a5a8a] hover:text-[#4a8abb] hover:bg-[#07101a]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── MAIN AREA ───────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT PANEL — Layer Overlay Toggles */}
        <div className="w-44 flex-shrink-0 border-r border-[#1e3a5a] bg-[#060c14] overflow-y-auto flex flex-col">
          <div className="flex-1">
            {OVERLAY_GROUPS.map((group) => (
              <div key={group.id}>
                <div className="text-[7px] font-mono uppercase tracking-widest text-[#1e3a5a] px-3 py-1.5 border-b border-[#0f1e2e] bg-[#060c14] sticky top-0 z-10">
                  {group.label}
                </div>
                {group.items.map((item) => {
                  const active = activeOverlays.has(item.id)
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleOverlay(item.id)}
                      title={item.desc}
                      className={`w-full flex items-center gap-2 px-3 py-1.5 text-left border-b border-[#07101a] transition-colors group ${
                        active ? 'bg-[#07111d]' : 'hover:bg-[#070e18]'
                      }`}
                    >
                      <div
                        className="w-2 h-2 flex-shrink-0 border transition-colors"
                        style={{
                          borderColor: active ? item.color : '#1e3a5a',
                          background:  active ? item.color : 'transparent',
                          opacity: active ? 1 : 0.6,
                        }}
                      />
                      <span
                        className="text-[9px] font-mono transition-colors"
                        style={{ color: active ? item.color : '#2a5a8a' }}
                      >
                        {item.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            ))}
          </div>

          {/* Animate button at bottom of left panel */}
          <div className="border-t border-[#1e3a5a] p-2">
            <button
              onClick={() => useSimulationStore.getState().setAnimating(!useSimulationStore.getState().animating)}
              className="w-full text-[8px] font-mono border border-[#1e3a5a] py-1.5 text-[#2a5a8a] hover:text-[#7ac8f8] hover:border-[#4a8abb] transition-colors"
            >
              ▶ Animate Stars
            </button>
          </div>
        </div>

        {/* CENTER — Simulation Canvas */}
        <div className="flex-1 relative bg-[#04080e] overflow-hidden">
          <div className="absolute inset-0 bottom-7">
            <SimulationCanvas
              baseMetrics={baseMetrics}
              ecoMetrics={ecoMetrics}
              scenario={scenario}
              timeHorizon={timeHorizon}
              activeOverlays={activeOverlays}
            />
          </div>

          {/* Canvas bottom status strip */}
          <div
            className="absolute bottom-0 left-0 right-0 flex items-center bg-[#04080e]/95 border-t border-[#1e3a5a]"
            style={{ height: '28px' }}
          >
            {statusMetrics.map(({ k, v, risk }) => {
              const finalColor = risk
                ? (v > 65 ? '#ef4444' : v > 45 ? '#fbbf24' : '#4ade80')
                : (v > 60 ? '#4ade80' : v > 40 ? '#fbbf24' : '#ef4444')
              return (
                <div key={k} className="flex items-center gap-1.5 px-3 border-r border-[#1e3a5a] h-full">
                  <span className="text-[7px] font-mono text-[#2a5a8a]">{k}</span>
                  <span className="text-[9px] font-mono font-bold" style={{ color: finalColor }}>{v}</span>
                </div>
              )
            })}
            <div className="flex-1" />
            <span className="text-[7px] font-mono text-[#1e3a5a] px-3">
              {scenarioOption.short} · {TIME_LABELS[timeHorizon]}
            </span>
          </div>
        </div>

        {/* RIGHT PANEL — Inspector */}
        <div className="w-60 flex-shrink-0 border-l border-[#1e3a5a] bg-[#060c14] overflow-y-auto text-[9px]">
          {!inspectorOpen ? (
            /* ── Empty state: case summary ── */
            <div>
              <div className="px-3 py-2 border-b border-[#1e3a5a]">
                <div className="text-[7px] font-mono uppercase tracking-widest text-[#1e3a5a] mb-1">Active Case File</div>
                <div className="font-mono text-[#7ac8f8] leading-tight">{caseLabel}</div>
              </div>

              <div className="px-3 py-2 border-b border-[#1e3a5a]">
                <div className="text-[7px] font-mono uppercase tracking-widest text-[#1e3a5a] mb-1.5">Scenario</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: scenarioOption.color }} />
                  <span className="font-mono" style={{ color: scenarioOption.color }}>{scenarioOption.label}</span>
                </div>
              </div>

              <div className="px-3 py-2 border-b border-[#1e3a5a]">
                <div className="text-[7px] font-mono uppercase tracking-widest text-[#1e3a5a] mb-1.5">Time Horizon</div>
                <div className="font-mono text-[#4a8abb]">{TIME_LABELS[timeHorizon]}</div>
              </div>

              <div className="px-3 py-2 border-b border-[#1e3a5a]">
                <div className="text-[7px] font-mono uppercase tracking-widest text-[#1e3a5a] mb-2">Core Metrics</div>
                <div className="space-y-2">
                  {[
                    { key: 'FDCR',   v: baseMetrics.FDCR,           risk: false },
                    { key: 'G-FDCR', v: baseMetrics.GFDCR ?? 44,    risk: false },
                    { key: 'E-FDCR', v: ecoMetrics['E-FDCR'],       risk: false },
                    { key: 'EBDCR',  v: ecoMetrics.EBDCR,           risk: false },
                    { key: 'BTR',    v: baseMetrics.BTR  ?? 58,     risk: true },
                    { key: 'MSJR',   v: baseMetrics.MSJR ?? 62,     risk: true },
                    { key: 'CFR',    v: baseMetrics.CFR  ?? 55,     risk: true },
                    { key: 'RBR',    v: baseMetrics.RBR  ?? 51,     risk: true },
                    { key: 'BGR',    v: baseMetrics.BGR  ?? 42,     risk: false },
                  ].map(({ key, v, risk }) => {
                    const val = Math.round(v)
                    const color = risk
                      ? (val > 65 ? '#ef4444' : val > 45 ? '#fbbf24' : '#4ade80')
                      : (val > 60 ? '#4ade80' : val > 40 ? '#fbbf24' : '#ef4444')
                    return (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-mono text-[#2a5a8a]">{key}</span>
                          <span className="font-mono font-bold" style={{ color }}>{val}</span>
                        </div>
                        <div className="h-px bg-[#0f1a2a]">
                          <div className="h-px" style={{ width: `${val}%`, background: color }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="px-3 py-2 border-b border-[#1e3a5a]">
                <div className="text-[7px] font-mono uppercase tracking-widest text-[#1e3a5a] mb-1.5">Primary Burden Pathway</div>
                <div className="font-mono text-[#ef4444] leading-relaxed">
                  AI Scoring → Classification Gate → Exclusion Zone
                </div>
              </div>

              <div className="px-3 py-2 border-b border-[#1e3a5a]">
                <div className="text-[7px] font-mono uppercase tracking-widest text-[#1e3a5a] mb-1.5">Main Correction Mechanism</div>
                <div className="font-mono text-[#4ade80] leading-relaxed">
                  Democratic Review Gate → Appeal Process
                </div>
              </div>

              <div className="px-3 py-2">
                <div className="text-[7px] font-mono uppercase tracking-widest text-[#1e3a5a] mb-1.5">Interaction</div>
                <div className="text-[8px] text-[#1e3a5a] leading-relaxed">
                  Click any node, region, or district in the canvas to inspect its metrics, burden transfer pathway, and correction conditions.
                </div>
              </div>
            </div>
          ) : (
            /* ── Object detail ── */
            <div>
              <div className="flex items-start justify-between gap-2 px-3 py-2 border-b border-[#1e3a5a]">
                <div>
                  <div className="text-[7px] font-mono uppercase tracking-widest text-[#1e3a5a] mb-0.5">
                    Inspector · {inspectorData?.layer.replace(/_/g, ' ')}
                  </div>
                  <h3 className="font-bold text-[#7ac8f8] leading-tight text-[10px]">{inspectorData?.label}</h3>
                </div>
                <button
                  onClick={closeInspector}
                  className="text-[#2a5a8a] hover:text-[#7ac8f8] font-mono text-[10px] shrink-0 mt-0.5"
                >
                  ✕
                </button>
              </div>

              {inspectorData && (
                <>
                  <div className="px-3 py-2 border-b border-[#1e3a5a]">
                    <div className="text-[7px] font-mono uppercase tracking-widest text-[#1e3a5a] mb-2">Metrics</div>
                    <div className="space-y-2">
                      {Object.entries(inspectorData.metrics).map(([key, value]) => {
                        const val = Math.round(value as number)
                        const color = metricColor(key, val)
                        return (
                          <div key={key}>
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="font-mono text-[#2a5a8a]">{key}</span>
                              <span className="font-mono font-bold" style={{ color }}>{val}</span>
                            </div>
                            <div className="h-px bg-[#0f1a2a]">
                              <div className="h-px" style={{ width: `${Math.min(100, val)}%`, background: color }} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="px-3 py-2 border-b border-[#1e3a5a]">
                    <div className="text-[7px] font-mono uppercase tracking-widest text-[#1e3a5a] mb-1.5">Analysis</div>
                    <p className="text-[8px] text-[#3a6a8a] leading-relaxed">{inspectorData.description}</p>
                  </div>

                  <div className="px-3 py-2 border-b border-[#1e3a5a]">
                    <div className="text-[7px] font-mono uppercase tracking-widest text-[#1e3a5a] mb-1.5">Burden Transfer</div>
                    <p className="text-[8px] text-[#f97316] leading-relaxed">{getBurdenTransfer(inspectorData.id)}</p>
                  </div>

                  <div className="px-3 py-2 border-b border-[#1e3a5a]">
                    <div className="text-[7px] font-mono uppercase tracking-widest text-[#1e3a5a] mb-1.5">Re-entry Condition</div>
                    <p className="text-[8px] text-[#4a8abb] leading-relaxed">{getReentryCondition(inspectorData.id)}</p>
                  </div>

                  <div className="px-3 py-2">
                    <div className="text-[7px] font-mono uppercase tracking-widest text-[#1e3a5a] mb-1.5">Correction Mechanism</div>
                    <p className="text-[8px] text-[#4ade80] leading-relaxed">{getCorrectionMechanism(inspectorData.id)}</p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── LEGEND ──────────────────────────────────────────────────── */}
      <div
        className="flex-shrink-0 border-t border-[#1e3a5a] bg-[#060c14] flex items-center overflow-x-auto"
        style={{ height: '32px', minHeight: '32px' }}
      >
        {[
          { sym: '●', symColor: '#4ade80',  label: 'Node size',         desc: '→ metric magnitude' },
          { sym: '—', symColor: '#ef4444',  label: 'Arc thickness',     desc: '→ transfer weight'  },
          { sym: '●', symColor: '#4ade80',  label: 'Green',             desc: '→ freedom / positive' },
          { sym: '●', symColor: '#ef4444',  label: 'Red',               desc: '→ risk / burden'   },
          { sym: '●', symColor: '#fbbf24',  label: 'Yellow',            desc: '→ moderate'        },
          { sym: '░', symColor: '#2a5a8a',  label: 'Opacity',           desc: '→ confidence'      },
          { sym: '▬', symColor: '#4a8abb',  label: 'Elevation (urban)', desc: '→ FDCR density'    },
          { sym: '◈', symColor: '#a78bfa',  label: 'Gateway / AI',      desc: '→ entry · compute' },
          { sym: '⬡', symColor: '#f97316',  label: 'Extraction zone',   desc: '→ resource burden' },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-1.5 px-3 border-r border-[#1e3a5a] h-full flex-shrink-0">
            <span className="text-[9px] font-bold" style={{ color: item.symColor }}>{item.sym}</span>
            <span className="text-[7px] font-mono text-[#2a5a8a]">{item.label}</span>
            <span className="text-[7px] font-mono text-[#1e3a5a]">{item.desc}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
