'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { useAudit } from '@/lib/auditContext'

// ── Types ────────────────────────────────────────────────────────
type LayerId   = 'planetary' | 'urban_nature' | 'body_lifeworld' | 'institutional_flow'
type ScenarioId = 'current' | 'reform' | 'managerial'
type THorizon  = 0 | 1 | 2 | 3 | 4 | 5

interface SelectedNode {
  id: string
  label: string
  layer: LayerId
  metrics: Record<string, number>
  analysis: string
  burdenPath: string
  correction: string
}

// ── Constants ────────────────────────────────────────────────────
const LAYER_MODES: { id: LayerId; label: string }[] = [
  { id: 'planetary',          label: 'Planetary View'     },
  { id: 'urban_nature',       label: 'Urban-Nature'       },
  { id: 'body_lifeworld',     label: 'Body-Lifeworld'     },
  { id: 'institutional_flow', label: 'Institutional Flow' },
]

const SCENARIOS: { id: ScenarioId; label: string; color: string }[] = [
  { id: 'current',    label: 'Current System',             color: '#fbbf24' },
  { id: 'reform',     label: 'Freedom-Generative Reform',  color: '#4ade80' },
  { id: 'managerial', label: 'Managerial Intensification', color: '#ef4444' },
]

const TIME_LABELS = ['Immediate', '1 year', '5 years', '10 years', '25 years', 'Future gen.']

const OVERLAY_GROUPS = [
  { label: 'Metrics', items: [
    { id: 'FDCR',  label: 'FDCR',   color: '#4ade80' },
    { id: 'GFDCR', label: 'G-FDCR', color: '#4ade80' },
    { id: 'EFDCR', label: 'E-FDCR', color: '#34d399' },
    { id: 'EBDCR', label: 'EBDCR',  color: '#34d399' },
    { id: 'BGR',   label: 'BGR',    color: '#60a5fa' },
    { id: 'RCI',   label: 'RCI',    color: '#60a5fa' },
  ]},
  { label: 'Risk', items: [
    { id: 'MSJR',  label: 'MSJR',   color: '#ef4444' },
    { id: 'CFR',   label: 'CFR',    color: '#ef4444' },
    { id: 'RBR',   label: 'RBR',    color: '#f97316' },
    { id: 'BTR',   label: 'BTR',    color: '#f97316' },
    { id: 'EER',   label: 'EER',    color: '#fbbf24' },
    { id: 'EPBTM', label: 'EP-BTM', color: '#fbbf24' },
  ]},
  { label: 'Thematic', items: [
    { id: 'urban_body',    label: 'Urban bodily burden',      color: '#f97316' },
    { id: 'spatial_class', label: 'Spatial classification',   color: '#ef4444' },
    { id: 'eco_extract',   label: 'Ecological extraction',    color: '#f97316' },
    { id: 'reentry',       label: 'Re-entry access',          color: '#fbbf24' },
    { id: 'future_gen',    label: 'Future-generation burden', color: '#a78bfa' },
  ]},
]

// ── Globe helpers ─────────────────────────────────────────────────
const GCX = 350; const GCY = 240; const GR = 175; const GLON0 = 20

function ortho(lat: number, lon: number): { x: number; y: number; vis: boolean } {
  const φ = lat * Math.PI / 180
  const λ = (lon - GLON0) * Math.PI / 180
  return {
    x: GCX + GR * Math.cos(φ) * Math.sin(λ),
    y: GCY - GR * Math.sin(φ),
    vis: Math.cos(φ) * Math.cos(λ) >= -0.1,
  }
}

const REGIONS = [
  { id: 'NA', label: 'North America', lat: 40,  lon: -100, fdcr: 62 },
  { id: 'EU', label: 'Europe',        lat: 52,  lon: 10,   fdcr: 58 },
  { id: 'AS', label: 'Asia-Pacific',  lat: 25,  lon: 105,  fdcr: 44 },
  { id: 'LA', label: 'Latin America', lat: -15, lon: -65,  fdcr: 38 },
  { id: 'AF', label: 'Africa',        lat: -5,  lon: 22,   fdcr: 29 },
  { id: 'ME', label: 'Middle East',   lat: 28,  lon: 45,   fdcr: 33 },
  { id: 'SA', label: 'South Asia',    lat: 22,  lon: 80,   fdcr: 35 },
]

const BURDEN_ARCS = [
  { from: 'NA', to: 'AF', w: 3 }, { from: 'EU', to: 'AF', w: 2.5 },
  { from: 'EU', to: 'LA', w: 2 }, { from: 'NA', to: 'LA', w: 1.5 },
  { from: 'AS', to: 'SA', w: 1.5 }, { from: 'ME', to: 'AF', w: 1.5 },
]

function fdcrColor(v: number): string {
  if (v >= 60) return '#4ade80'
  if (v >= 45) return '#fbbf24'
  if (v >= 30) return '#f97316'
  return '#ef4444'
}

// ── Isometric urban helpers ───────────────────────────────────────
const ISO_OX = 350; const ISO_OY = 155
const ISO_SX = 22; const ISO_SY = 11

function isoFront(col: number, row: number) {
  return {
    x: ISO_OX + (col - row) * ISO_SX,
    y: ISO_OY + (col + row) * ISO_SY,
  }
}

function cellValue(col: number, row: number, sc: ScenarioId): number {
  const dist = Math.sqrt((col - 3.5) ** 2 + (row - 2.5) ** 2)
  const hash = ((col * 7 + row * 13) % 17) / 17
  const base = Math.max(8, Math.min(92, 68 - dist * 9 + hash * 18 - 4))
  const adj  = sc === 'reform' ? 10 : sc === 'managerial' ? -14 : 0
  return Math.max(8, Math.min(92, base + adj))
}

function isoBlockColor(v: number): { top: string; left: string; right: string } {
  if (v >= 70) return { top: '#1a5228', left: '#113818', right: '#0b2410' }
  if (v >= 55) return { top: '#284818', left: '#1c3010', right: '#11200a' }
  if (v >= 40) return { top: '#483010', left: '#302008', right: '#1e1404' }
  if (v >= 25) return { top: '#481c10', left: '#301208', right: '#1e0c04' }
  return { top: '#380e0e', left: '#260808', right: '#160404' }
}

const GREEN_CELLS = new Set([7, 14, 21, 28, 35, 42, 32, 33, 34])
const SPECIAL_URBAN: Record<string, { type: string; color: string; sym: string }> = {
  '1_1': { type: 'Hospital',     color: '#34d399', sym: 'H' },
  '5_1': { type: 'School',       color: '#60a5fa', sym: 'S' },
  '3_3': { type: 'Welfare',      color: '#a78bfa', sym: 'W' },
  '6_4': { type: 'Re-entry',     color: '#fbbf24', sym: 'R' },
  '2_4': { type: 'Surveillance', color: '#ef4444', sym: '⬡' },
  '4_5': { type: 'Data Hub',     color: '#ef4444', sym: '⬡' },
}

// ── Body nodes ────────────────────────────────────────────────────
const BODY_NODES = [
  { id: 'SUBJECT',  label: 'Subject Body',        x: 350, y: 240, r: 14, color: '#7ac8f8', type: 'actor'   },
  { id: 'SLEEP',    label: 'Sleep / Recovery',    x: 210, y: 150, r: 9,  color: '#4a7a9a', type: 'zone'    },
  { id: 'COMMUTE',  label: 'Commute / Transit',   x: 490, y: 150, r: 9,  color: '#6a5a3a', type: 'zone'    },
  { id: 'WORK',     label: 'Work',                x: 195, y: 220, r: 10, color: '#3a6a8a', type: 'zone'    },
  { id: 'CARE',     label: 'Care Labour',         x: 505, y: 220, r: 9,  color: '#5a4a8a', type: 'zone'    },
  { id: 'HEALTH',   label: 'Health',              x: 350, y: 120, r: 9,  color: '#2a7a6a', type: 'zone'    },
  { id: 'WAIT',     label: 'Waiting / Queue',     x: 260, y: 310, r: 8,  color: '#7a4a1a', type: 'zone'    },
  { id: 'APPEAL',   label: 'Appeal',              x: 440, y: 310, r: 8,  color: '#4ade80', type: 'zone'    },
  { id: 'SURV',     label: 'Surveillance',        x: 240, y: 365, r: 11, color: '#ef4444', type: 'barrier' },
  { id: 'CLASS',    label: 'Classification Gate', x: 460, y: 365, r: 11, color: '#f97316', type: 'barrier' },
  { id: 'FREE',     label: 'Freedom Space',       x: 350, y: 420, r: 10, color: '#4ade80', type: 'zone'    },
  { id: 'RECOV',    label: 'Recovery Window',     x: 520, y: 300, r: 7,  color: '#34d399', type: 'zone'    },
]

const BODY_EDGES = [
  { from: 'SUBJECT', to: 'SLEEP',   type: 'neutral', w: 1.5 },
  { from: 'SUBJECT', to: 'COMMUTE', type: 'burden',  w: 1.5 },
  { from: 'SUBJECT', to: 'WORK',    type: 'neutral', w: 2   },
  { from: 'SUBJECT', to: 'CARE',    type: 'burden',  w: 1.5 },
  { from: 'SUBJECT', to: 'HEALTH',  type: 'neutral', w: 1.5 },
  { from: 'SUBJECT', to: 'WAIT',    type: 'burden',  w: 1.5 },
  { from: 'SUBJECT', to: 'APPEAL',  type: 'freedom', w: 1   },
  { from: 'SURV',    to: 'SUBJECT', type: 'barrier', w: 2   },
  { from: 'CLASS',   to: 'SUBJECT', type: 'barrier', w: 2   },
  { from: 'SUBJECT', to: 'FREE',    type: 'freedom', w: 1   },
  { from: 'APPEAL',  to: 'FREE',    type: 'freedom', w: 1   },
  { from: 'SLEEP',   to: 'RECOV',   type: 'freedom', w: 1   },
  { from: 'SURV',    to: 'CLASS',   type: 'barrier', w: 2   },
  { from: 'WAIT',    to: 'APPEAL',  type: 'neutral', w: 1   },
]

const EDGE_COLORS: Record<string, string> = {
  freedom: '#4ade80', burden: '#ef4444', barrier: '#f97316', neutral: '#2a5a8a',
}

// ── Institutional flow nodes ──────────────────────────────────────
const FLOW_NODES = [
  { id: 'ENTRY',    label: 'Entry Point',           x: 350, y:  45, shape: 'diamond', color: '#a78bfa' },
  { id: 'APP',      label: 'Application Screening', x: 350, y: 100, shape: 'rect',    color: '#4a8abb' },
  { id: 'DATA',     label: 'Data Intake',           x: 350, y: 160, shape: 'rect',    color: '#4a8abb' },
  { id: 'AI',       label: 'AI Scoring Engine',     x: 350, y: 225, shape: 'circle',  color: '#ef4444' },
  { id: 'CLASS',    label: 'Classification Output', x: 350, y: 295, shape: 'rect',    color: '#f97316' },
  { id: 'DEMO',     label: 'Democratic Review',     x: 190, y: 225, shape: 'circle',  color: '#4ade80' },
  { id: 'APPROVE',  label: 'Approval',              x: 190, y: 365, shape: 'diamond', color: '#4ade80' },
  { id: 'REJECT',   label: 'Rejection',             x: 490, y: 365, shape: 'rect',    color: '#ef4444' },
  { id: 'APPEAL',   label: 'Appeal Process',        x: 540, y: 225, shape: 'circle',  color: '#4a8abb' },
  { id: 'REENTRY',  label: 'Re-entry Gate',         x: 190, y: 440, shape: 'rect',    color: '#fbbf24' },
  { id: 'EXCL',     label: 'Exclusion Zone',        x: 490, y: 440, shape: 'rect',    color: '#ef4444' },
]

const FLOW_EDGES = [
  { from: 'ENTRY',   to: 'APP',     type: 'neutral', label: '' },
  { from: 'APP',     to: 'DATA',    type: 'neutral', label: '' },
  { from: 'DATA',    to: 'AI',      type: 'neutral', label: '' },
  { from: 'AI',      to: 'CLASS',   type: 'neutral', label: '' },
  { from: 'AI',      to: 'DEMO',    type: 'freedom', label: '25%' },
  { from: 'CLASS',   to: 'APPROVE', type: 'freedom', label: '35%' },
  { from: 'CLASS',   to: 'REJECT',  type: 'burden',  label: '65%' },
  { from: 'DEMO',    to: 'APPROVE', type: 'freedom', label: '' },
  { from: 'REJECT',  to: 'APPEAL',  type: 'neutral', label: '25%' },
  { from: 'APPEAL',  to: 'APPROVE', type: 'freedom', label: '30%' },
  { from: 'APPEAL',  to: 'EXCL',    type: 'barrier', label: '70%' },
  { from: 'APPROVE', to: 'REENTRY', type: 'neutral', label: '' },
  { from: 'REJECT',  to: 'EXCL',    type: 'barrier', label: '75%' },
]

// ── Inspector presets ─────────────────────────────────────────────
const NODE_DETAIL: Record<string, Omit<SelectedNode, 'id' | 'label' | 'layer'>> = {
  'flow-AI': {
    metrics: { CFR: 75, MSJR: 80, RBR: 65, BTR: 70, FDCR: 22 },
    analysis: 'Automated classification system. High Classification Fixation Risk (CFR=75) and severe Managerial Self-Justification Risk (MSJR=80). Primary burden transfer node.',
    burdenPath: 'AI Scoring → Classification Output → Rejection → Exclusion Zone',
    correction: 'Activate Democratic Review Gate for all AI-scored cases. Mandate explainability. Introduce subject appeal channel.',
  },
  'flow-DEMO': {
    metrics: { FDCR: 72, RBR: 25, CFR: 20, MSJR: 30 },
    analysis: 'Primary correction mechanism. Currently bypassed in 75% of cases under Current System scenario. Activation requires explicit policy mandate.',
    burdenPath: 'Bypassed in majority of cases → burden falls to Classification Output path.',
    correction: 'Make democratic review mandatory for all AI-scored cases above risk threshold.',
  },
  'flow-EXCL': {
    metrics: { FDCR: 8, RBR: 90, CFR: 85, BTR: 88, MSJR: 80 },
    analysis: 'Terminal exclusion zone. Classification record locks subject out of formal system. No automatic expiry.',
    burdenPath: 'Terminal burden sink — all burden pathways terminate here without correction.',
    correction: 'Mandatory appeal access with public defender. Time-limited classification expiry. Automatic democratic review trigger.',
  },
  'body-SURV': {
    metrics: { CFR: 72, BTR: 68, MSJR: 75, FDCR: 20 },
    analysis: 'Surveillance data feeds directly into AI classification pipeline. Subject has no audit access.',
    burdenPath: 'Surveillance Capture → Classification Gate → AI Scoring amplification loop',
    correction: 'Data minimisation mandate. Subject right to audit and correct surveillance record.',
  },
  'body-CLASS': {
    metrics: { CFR: 65, RBR: 60, BGR: 25, FDCR: 31 },
    analysis: 'Intersection of bodily surveillance and institutional classification. High re-entry blockage. Low BGR indicates lifeworld suppression.',
    burdenPath: 'Surveillance Capture → Classification Gate → Subject Body (barrier)',
    correction: 'Replace classification gate with dialectical assessment. Subject agency in rebuttal.',
  },
  'body-FREE': {
    metrics: { FDCR: 78, BGR: 72, RBR: 15, CFR: 10 },
    analysis: 'Target state for freedom-generative reform. Currently accessible to ~25% of subject population. Primary goal of reform scenario.',
    burdenPath: 'No outgoing burden — this is the correction destination.',
    correction: 'Remove surveillance and classification barriers upstream to expand Freedom Space access.',
  },
  'globe-AF': {
    metrics: { 'E-FDCR': 21, EBDCR: 18, 'EP-BTM': 82, BTR: 78, FDCR: 29 },
    analysis: 'Highest EP-BTM burden reception globally. Receives compounded ecological, economic, and freedom-suppressive transfers from Global North.',
    burdenPath: 'NA → AF (primary), EU → AF (secondary), ME → AF (tertiary)',
    correction: 'Global FDCR rebalancing: debt cancellation, extraction reparations, climate adaptation funding.',
  },
  'globe-NA': {
    metrics: { FDCR: 62, 'E-FDCR': 48, 'EP-BTM': 22, BTR: 35, EBDCR: 44 },
    analysis: 'Highest formal FDCR score, but largest AI compute exporter. Carbon and extraction burden transferred south via supply chains.',
    burdenPath: 'NA exports burden to: AF (primary arc), LA (secondary arc)',
    correction: 'Reduce EP-BTM via supply chain accountability, carbon pricing, technology transfer obligation.',
  },
}

// ── Component ─────────────────────────────────────────────────────
export default function SimulationPage() {
  const { scoreResult, loadDemoCase } = useAudit()

  const [activeLayer, setActiveLayer] = useState<LayerId>('planetary')
  const [scenario,    setScenario]    = useState<ScenarioId>('current')
  const [timeHorizon, setTimeHorizon] = useState<THorizon>(0)
  const [overlays,    setOverlays]    = useState(() => new Set(['FDCR', 'BTR', 'MSJR', 'eco_extract', 'spatial_class']))
  const [selected,    setSelected]    = useState<SelectedNode | null>(null)

  useEffect(() => {
    if (!scoreResult) loadDemoCase('ai_hiring')
  }, []) // eslint-disable-line

  const toggleOverlay = (id: string) => setOverlays(prev => {
    const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n
  })

  const m = useMemo(() => {
    if (!scoreResult) return { FDCR: 47, GFDCR: 44, BTR: 58, MSJR: 62, CFR: 55, RBR: 51, BGR: 42, RCI: 38, 'E-FDCR': 42, EBDCR: 39, 'EP-BTM': 61 }
    return {
      FDCR:   scoreResult.fdcr,
      GFDCR:  scoreResult.gfdcr,
      'E-FDCR': scoreResult.ecoScores?.['E-FDCR'] ?? 42,
      EBDCR:  scoreResult.ecoScores?.EBDCR ?? 39,
      'EP-BTM': scoreResult.ecoScores?.['EP-BTM'] ?? 61,
      BTR:    (scoreResult.metrics as any)?.BTR  ?? 58,
      MSJR:   (scoreResult.metrics as any)?.MSJR ?? 62,
      CFR:    (scoreResult.metrics as any)?.CFR  ?? 55,
      RBR:    (scoreResult.metrics as any)?.RBR  ?? 51,
      BGR:    (scoreResult.metrics as any)?.BGR  ?? 42,
      RCI:    (scoreResult.metrics as any)?.RCI  ?? 38,
    }
  }, [scoreResult])

  const scOpt     = SCENARIOS.find(s => s.id === scenario)!
  const caseLabel = scoreResult
    ? scoreResult.report.target
    : 'Case 001 — AI Hiring System (Demo)'

  const scMod = scenario === 'reform' ? 8 : scenario === 'managerial' ? -10 : 0
  const tMod  = timeHorizon * (scenario === 'reform' ? 2 : scenario === 'managerial' ? -2 : -0.5)

  // ── SVG Planetary ─────────────────────────────────────────────
  const PlanetaryCanvas = useCallback(() => {
    const lats = [-60, -30, 0, 30, 60]
    const lons = [-120, -60, 0, 60, 120]
    const regions = REGIONS.map(r => ({
      ...r,
      adjusted: Math.max(5, Math.min(95, r.fdcr + scMod + tMod)),
      ...ortho(r.lat, r.lon),
    }))
    return (
      <svg viewBox="0 0 700 480" className="w-full h-full" style={{ background: '#04080e' }}>
        <defs>
          <radialGradient id="globeG" cx="40%" cy="35%">
            <stop offset="0%"   stopColor="#0e2040" />
            <stop offset="65%"  stopColor="#071425" />
            <stop offset="100%" stopColor="#030810" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="atmo">
            <feGaussianBlur stdDeviation="14"/>
          </filter>
          <clipPath id="globeClip">
            <circle cx={GCX} cy={GCY} r={GR}/>
          </clipPath>
          <style>{`.da{stroke-dasharray:8 5;animation:df 1.8s linear infinite}@keyframes df{to{stroke-dashoffset:-26}}`}</style>
        </defs>

        {/* Atmosphere */}
        <circle cx={GCX} cy={GCY} r={GR + 28} fill="#0a3060" opacity="0.18" filter="url(#atmo)"/>
        {/* Globe sphere */}
        <circle cx={GCX} cy={GCY} r={GR} fill="url(#globeG)"/>

        {/* Latitude grid lines (horizontal segments) */}
        {lats.map(lat => {
          const φ = lat * Math.PI / 180
          const y = GCY - GR * Math.sin(φ)
          const hw = GR * Math.cos(φ)
          return <line key={lat} x1={GCX-hw} y1={y} x2={GCX+hw} y2={y} stroke="#0f2840" strokeWidth="0.6" opacity="0.7"/>
        })}

        {/* Longitude grid lines (ellipses clipped to globe) */}
        {lons.map(lon => {
          const λ = (lon - GLON0) * Math.PI / 180
          const rx = Math.abs(GR * Math.sin(λ))
          return rx > 2 ? (
            <ellipse key={lon} cx={GCX} cy={GCY} rx={rx} ry={GR} fill="none" stroke="#0f2840" strokeWidth="0.6" opacity="0.7" clipPath="url(#globeClip)"/>
          ) : null
        })}

        {/* Equator */}
        <line x1={GCX-GR} y1={GCY} x2={GCX+GR} y2={GCY} stroke="#1e3a5a" strokeWidth="1" opacity="0.5"/>

        {/* Burden arcs */}
        {BURDEN_ARCS.map((arc, i) => {
          const A = regions.find(r => r.id === arc.from)!
          const B = regions.find(r => r.id === arc.to)!
          if (!A.vis || !B.vis) return null
          const mx = (A.x + B.x) / 2
          const my = (A.y + B.y) / 2 - 65
          return (
            <path key={i} d={`M${A.x},${A.y} Q${mx},${my} ${B.x},${B.y}`}
              fill="none" stroke="#ef4444" strokeWidth={arc.w} opacity="0.5"
              className="da"/>
          )
        })}

        {/* Extraction zones (if overlay on) */}
        {overlays.has('eco_extract') && [
          { lat: -3, lon: 23,  label: 'Congo' },
          { lat: -5, lon: -60, label: 'Amazon' },
          { lat: 25, lon: 50,  label: 'Gulf' },
        ].map((z, i) => {
          const p = ortho(z.lat, z.lon)
          return p.vis ? (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="6" fill="#f97316" opacity="0.7" filter="url(#glow)"/>
              <text x={p.x+9} y={p.y+3} fontSize="8" fill="#f97316" fontFamily="monospace" opacity="0.85">⬡ {z.label}</text>
            </g>
          ) : null
        })}

        {/* AI compute nodes */}
        {overlays.has('FDCR') && [
          { lat: 37, lon: -122, label: 'AI/US' },
          { lat: 35, lon: 110,  label: 'AI/CN' },
          { lat: 53, lon: 10,   label: 'AI/EU' },
        ].map((n, i) => {
          const p = ortho(n.lat, n.lon)
          return p.vis ? (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="5" fill="#a78bfa" opacity="0.8" filter="url(#glow)"/>
              <text x={p.x+7} y={p.y+3} fontSize="7" fill="#a78bfa" fontFamily="monospace">◈ {n.label}</text>
            </g>
          ) : null
        })}

        {/* Regional nodes */}
        {regions.map(r => {
          if (!r.vis) return null
          const color = fdcrColor(r.adjusted)
          const nr = 6 + (r.adjusted / 100) * 7
          return (
            <g key={r.id} style={{ cursor: 'pointer' }} onClick={() => {
              const preset = NODE_DETAIL[`globe-${r.id}`]
              setSelected({
                id: `globe-${r.id}`, label: r.label, layer: 'planetary',
                metrics: preset?.metrics ?? { FDCR: r.adjusted, BTR: 60 - r.adjusted * 0.3, 'E-FDCR': r.adjusted * 0.85 },
                analysis: preset?.analysis ?? `${r.label}: FDCR proxy ${Math.round(r.adjusted)}.`,
                burdenPath: preset?.burdenPath ?? 'Burden transfer under analysis.',
                correction: preset?.correction ?? 'Freedom-generative reform required.',
              })
            }}>
              <circle cx={r.x} cy={r.y} r={nr + 4} fill={color} opacity="0.15"/>
              <circle cx={r.x} cy={r.y} r={nr}     fill={color} opacity="0.9" filter="url(#glow)"/>
              <text x={r.x} y={r.y - nr - 4} textAnchor="middle" fontSize="8" fill={color} fontFamily="monospace" fontWeight="700">
                {r.id} {Math.round(r.adjusted)}
              </text>
            </g>
          )
        })}

        {/* Globe rim */}
        <circle cx={GCX} cy={GCY} r={GR} fill="none" stroke="#1e3a5a" strokeWidth="1.5" opacity="0.6"/>

        {/* Legend */}
        <text x="30" y="440" fontSize="8" fill="#1e3a5a" fontFamily="monospace">● Node size → FDCR magnitude</text>
        <text x="30" y="454" fontSize="8" fill="#1e3a5a" fontFamily="monospace">— Red arc → burden transfer</text>
        <text x="230" y="440" fontSize="8" fill="#1e3a5a" fontFamily="monospace">⬡ Orange → extraction zone</text>
        <text x="230" y="454" fontSize="8" fill="#1e3a5a" fontFamily="monospace">◈ Purple → AI compute node</text>
      </svg>
    )
  }, [scenario, timeHorizon, overlays, scMod, tMod])

  // ── SVG Urban-Nature ──────────────────────────────────────────
  const UrbanCanvas = useCallback(() => {
    const cells = []
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 8; col++) {
        cells.push({ col, row, idx: row * 8 + col })
      }
    }
    // Sort back-to-front
    cells.sort((a, b) => (a.col + a.row) - (b.col + b.row))

    return (
      <svg viewBox="0 0 700 480" className="w-full h-full" style={{ background: '#04080e' }}>
        <defs>
          <filter id="bld-glow"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>

        {/* Ground grid */}
        {Array.from({ length: 10 }, (_, i) => (
          <line key={i} x1={180 + i * 40} y1={120} x2={100 + i * 40} y2={320} stroke="#0d2040" strokeWidth="0.5" opacity="0.4"/>
        ))}
        {Array.from({ length: 7 }, (_, i) => {
          const col = i; const row = 0
          const x1 = ISO_OX + (col - 0) * ISO_SX
          const y1 = ISO_OY + col * ISO_SY
          const x2 = ISO_OX + (col - 5) * ISO_SX
          const y2 = ISO_OY + (col + 5) * ISO_SY
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#0d2040" strokeWidth="0.5" opacity="0.4"/>
        })}

        {cells.map(({ col, row, idx }) => {
          const v  = cellValue(col, row, scenario)
          const h  = 8 + (v / 100) * 55
          const f  = isoFront(col, row)
          const isGreen = GREEN_CELLS.has(idx)
          const sp  = SPECIAL_URBAN[`${col}_${row}`]
          const clr = isGreen
            ? { top: '#1a5228', left: '#113818', right: '#0b2410' }
            : isoBlockColor(v)

          // Isometric block points
          // Front corner (base): f.x, f.y
          // Top face corners (lifted by h):
          const tN = { x: f.x,         y: f.y - 2 * ISO_SY - h } // north
          const tE = { x: f.x + ISO_SX, y: f.y - ISO_SY - h     } // east
          const tS = { x: f.x,         y: f.y - h                } // south (front)
          const tW = { x: f.x - ISO_SX, y: f.y - ISO_SY - h     } // west
          // Ground corners:
          const gN = { x: f.x,         y: f.y - 2 * ISO_SY      }
          const gE = { x: f.x + ISO_SX, y: f.y - ISO_SY         }
          const gS = { x: f.x,         y: f.y                    }
          const gW = { x: f.x - ISO_SX, y: f.y - ISO_SY         }

          const pts = (arr: {x:number,y:number}[]) => arr.map(p => `${p.x},${p.y}`).join(' ')

          return (
            <g key={idx} style={{ cursor: 'pointer' }} onClick={() => {
              setSelected({
                id: `urban-${col}-${row}`, label: sp ? sp.type : `District ${col},${row}`,
                layer: 'urban_nature',
                metrics: { FDCR: v, CFR: Math.max(5, 100 - v), BTR: m.BTR, 'E-FDCR': v * 0.88 },
                analysis: sp
                  ? `${sp.type}: urban institution node. FDCR=${Math.round(v)}. Spatial classification risk inversely correlates with freedom density.`
                  : isGreen
                    ? `Green corridor cell. Ecological buffer zone. FDCR proxy=${Math.round(v)}.`
                    : `Urban district FDCR proxy=${Math.round(v)}. Elevation = freedom density.`,
                burdenPath: v < 40 ? 'Low-FDCR district → surveillance density high → subject classification burden' : 'Moderate burden pathway.',
                correction: v < 40 ? 'Urban FDCR uplift via welfare access, school investment, re-entry office.' : 'Maintain and extend green corridors and civic institutions.',
              })
            }}>
              {/* Left face */}
              <polygon points={pts([tW, tS, gS, gW])} fill={clr.left} stroke="#04080e" strokeWidth="0.3"/>
              {/* Right face */}
              <polygon points={pts([tE, tS, gS, gE])} fill={clr.right} stroke="#04080e" strokeWidth="0.3"/>
              {/* Top face */}
              <polygon points={pts([tN, tE, tS, tW])} fill={clr.top} stroke="#04080e" strokeWidth="0.3"/>

              {/* Surveillance overlay */}
              {overlays.has('spatial_class') && sp?.type === 'Surveillance' && (
                <polygon points={pts([tN, tE, tS, tW])} fill="#ef4444" opacity="0.5"/>
              )}
              {/* Heat burden overlay */}
              {overlays.has('urban_body') && v < 35 && (
                <polygon points={pts([tN, tE, tS, tW])} fill="#f97316" opacity="0.3"/>
              )}

              {/* Special node marker */}
              {sp && (
                <text x={tN.x} y={tN.y - 8} textAnchor="middle" fontSize="9"
                  fill={sp.color} fontFamily="monospace" fontWeight="700"
                  filter="url(#bld-glow)">{sp.sym}</text>
              )}
            </g>
          )
        })}

        {/* Labels */}
        <text x="30" y="440" fontSize="8" fill="#1e3a5a" fontFamily="monospace">▬ Height → FDCR density</text>
        <text x="30" y="454" fontSize="8" fill="#1e3a5a" fontFamily="monospace">■ Green → ecological corridor</text>
        <text x="230" y="440" fontSize="8" fill="#1e3a5a" fontFamily="monospace">⬡ Red → surveillance node</text>
        <text x="230" y="454" fontSize="8" fill="#1e3a5a" fontFamily="monospace">H/S/W/R → civic institutions</text>
      </svg>
    )
  }, [scenario, overlays, m.BTR])

  // ── SVG Body-Lifeworld ────────────────────────────────────────
  const BodyCanvas = useCallback(() => {
    const nodeMap = Object.fromEntries(BODY_NODES.map(n => [n.id, n]))
    return (
      <svg viewBox="0 0 700 480" className="w-full h-full" style={{ background: '#04080e' }}>
        <defs>
          <filter id="nglow"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <style>{`.bda{stroke-dasharray:6 4;animation:bf 1.5s linear infinite}@keyframes bf{to{stroke-dashoffset:-20}}`}</style>
          <marker id="arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="#2a5a8a" opacity="0.6"/>
          </marker>
          <marker id="arr-f" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="#4ade80" opacity="0.7"/>
          </marker>
          <marker id="arr-b" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="#ef4444" opacity="0.7"/>
          </marker>
          <marker id="arr-br" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="#f97316" opacity="0.7"/>
          </marker>
        </defs>

        {/* Axis guides */}
        <line x1="120" y1="240" x2="580" y2="240" stroke="#0d2040" strokeWidth="0.5" opacity="0.5"/>
        <line x1="350" y1="80"  x2="350" y2="460" stroke="#0d2040" strokeWidth="0.5" opacity="0.5"/>
        <text x="350" y="76"  textAnchor="middle" fontSize="7" fill="#2a5a8a" fontFamily="monospace">↑ health / reproduction</text>
        <text x="350" y="470" textAnchor="middle" fontSize="7" fill="#2a5a8a" fontFamily="monospace">↓ classification / exclusion</text>
        <text x="118" y="243" textAnchor="end"    fontSize="7" fill="#2a5a8a" fontFamily="monospace">work / institutional →</text>
        <text x="582" y="243" textAnchor="start"  fontSize="7" fill="#2a5a8a" fontFamily="monospace">← recovery / appeal</text>

        {/* Field rings */}
        <circle cx="350" cy="240" r="160" fill="none" stroke="#0d2040" strokeWidth="0.8" opacity="0.4"/>
        <circle cx="350" cy="240" r="90"  fill="none" stroke="#0d2040" strokeWidth="0.5" opacity="0.25"/>

        {/* Edges */}
        {BODY_EDGES.map((e, i) => {
          const A = nodeMap[e.from]; const B = nodeMap[e.to]
          if (!A || !B) return null
          const mx = (A.x + B.x) / 2 + (A.y - B.y) * 0.18
          const my = (A.y + B.y) / 2 + (B.x - A.x) * 0.18
          const ec = EDGE_COLORS[e.type]
          const markerEnd = e.type === 'freedom' ? 'url(#arr-f)' : e.type === 'burden' ? 'url(#arr-b)' : e.type === 'barrier' ? 'url(#arr-br)' : 'url(#arr)'
          return (
            <path key={i}
              d={`M${A.x},${A.y} Q${mx},${my} ${B.x},${B.y}`}
              fill="none" stroke={ec} strokeWidth={e.w} opacity="0.55"
              markerEnd={markerEnd}
              className={e.type === 'barrier' ? 'bda' : ''}
            />
          )
        })}

        {/* Nodes */}
        {BODY_NODES.map(n => (
          <g key={n.id} style={{ cursor: 'pointer' }} onClick={() => {
            const preset = NODE_DETAIL[`body-${n.id}`]
            setSelected({
              id: `body-${n.id}`, label: n.label, layer: 'body_lifeworld',
              metrics: preset?.metrics ?? { FDCR: n.type === 'barrier' ? 25 : 50, BTR: n.type === 'barrier' ? 68 : 35 },
              analysis: preset?.analysis ?? `${n.label}: lifeworld node. Type: ${n.type}.`,
              burdenPath: preset?.burdenPath ?? 'Click connected nodes to trace burden pathway.',
              correction: preset?.correction ?? 'Freedom-generative reform: expand access, reduce barriers.',
            })
          }}>
            {n.type === 'barrier' && (
              <circle cx={n.x} cy={n.y} r={n.r + 8} fill="none" stroke={n.color} strokeWidth="1" opacity="0.3"/>
            )}
            <circle cx={n.x} cy={n.y} r={n.r} fill={n.color} opacity={n.type === 'barrier' ? 0.9 : 0.85} filter="url(#nglow)"/>
            <text x={n.x} y={n.type === 'actor' ? n.y - n.r - 6 : n.y + n.r + 11}
              textAnchor="middle" fontSize={n.type === 'actor' ? '9' : '7'}
              fill={n.color} fontFamily="monospace" fontWeight={n.type === 'actor' ? '700' : '400'}>
              {n.label}
            </text>
          </g>
        ))}

        {/* Overlay: burden metric */}
        {overlays.has('urban_body') && (
          <g>
            <rect x="30" y="30" width="160" height="50" fill="#06111a" stroke="#1e3a5a" strokeWidth="1"/>
            <text x="40" y="48" fontSize="7" fill="#2a5a8a" fontFamily="monospace">Burden flows</text>
            <text x="40" y="62" fontSize="11" fill="#ef4444" fontFamily="monospace" fontWeight="700">{Math.round(m.BTR)}</text>
            <text x="110" y="48" fontSize="7" fill="#2a5a8a" fontFamily="monospace">Freedom flows</text>
            <text x="110" y="62" fontSize="11" fill="#4ade80" fontFamily="monospace" fontWeight="700">{Math.round(m.FDCR)}</text>
          </g>
        )}
      </svg>
    )
  }, [overlays, m.BTR, m.FDCR])

  // ── SVG Institutional Flow ─────────────────────────────────────
  const InstitutionalCanvas = useCallback(() => {
    const nodeMap = Object.fromEntries(FLOW_NODES.map(n => [n.id, n]))
    const bypassRate = scenario === 'reform' ? '45%' : scenario === 'managerial' ? '92%' : '75%'
    return (
      <svg viewBox="0 0 700 480" className="w-full h-full" style={{ background: '#04080e' }}>
        <defs>
          <style>{`.fda{stroke-dasharray:7 4;animation:ff 1.6s linear infinite}@keyframes ff{to{stroke-dashoffset:-22}}`}</style>
          <marker id="fa"  markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill="#2a5a8a" opacity="0.7"/></marker>
          <marker id="fa-f" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill="#4ade80" opacity="0.8"/></marker>
          <marker id="fa-b" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill="#ef4444" opacity="0.8"/></marker>
          <marker id="fa-br"markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill="#f97316" opacity="0.8"/></marker>
          <filter id="fngl"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>

        {/* Background grid */}
        <line x1="350" y1="20" x2="350" y2="465" stroke="#0d2040" strokeWidth="0.5" opacity="0.4"/>
        <text x="352" y="18" fontSize="7" fill="#1e3a5a" fontFamily="monospace">Entry → Processing → Decision → Outcome</text>

        {/* Overlays */}
        {overlays.has('CFR') && (
          <g>
            <rect x="570" y="195" width="110" height="42" fill="#0a0505" stroke="#3a1010" strokeWidth="1"/>
            <text x="578" y="210" fontSize="7" fill="#f97316" fontFamily="monospace">Classification Fixation</text>
            <text x="578" y="228" fontSize="13" fill="#ef4444" fontFamily="monospace" fontWeight="700">{Math.round(m.CFR)}</text>
          </g>
        )}
        {overlays.has('MSJR') && (
          <g>
            <rect x="20" y="195" width="130" height="42" fill="#0a0808" stroke="#2a1818" strokeWidth="1"/>
            <text x="28" y="210" fontSize="7" fill="#fbbf24" fontFamily="monospace">Responsibility Displace</text>
            <text x="28" y="228" fontSize="13" fill="#ef4444" fontFamily="monospace" fontWeight="700">{Math.round(m.MSJR)}</text>
          </g>
        )}

        {/* Democratic bypass rate */}
        <rect x="20" y="260" width="140" height="36" fill="#030c08" stroke="#0d3a18" strokeWidth="1"/>
        <text x="28" y="275" fontSize="7" fill="#4ade80" fontFamily="monospace">Demo. review bypass</text>
        <text x="28" y="289" fontSize="11" fill="#fbbf24" fontFamily="monospace" fontWeight="700">{bypassRate}</text>

        {/* Edges */}
        {FLOW_EDGES.map((e, i) => {
          const A = nodeMap[e.from]; const B = nodeMap[e.to]
          if (!A || !B) return null
          const dx = B.x - A.x; const dy = B.y - A.y
          const mx = (A.x + B.x) / 2 + (Math.abs(dx) > 10 ? 0 : dx > 0 ? 30 : -30)
          const my = (A.y + B.y) / 2 + (Math.abs(dx) > 30 ? -20 : 0)
          const ec = EDGE_COLORS[e.type] ?? '#2a5a8a'
          const mk = e.type === 'freedom' ? 'url(#fa-f)' : e.type === 'burden' ? 'url(#fa-b)' : e.type === 'barrier' ? 'url(#fa-br)' : 'url(#fa)'
          return (
            <g key={i}>
              <path d={`M${A.x},${A.y} Q${mx},${my} ${B.x},${B.y}`}
                fill="none" stroke={ec} strokeWidth="2" opacity="0.6"
                markerEnd={mk}
                className={e.type === 'barrier' ? 'fda' : ''}/>
              {e.label && (
                <text x={mx} y={my-4} textAnchor="middle" fontSize="7" fill={ec} fontFamily="monospace" opacity="0.85">{e.label}</text>
              )}
            </g>
          )
        })}

        {/* Nodes */}
        {FLOW_NODES.map(n => {
          const isAI = n.id === 'AI'
          return (
            <g key={n.id} style={{ cursor: 'pointer' }} onClick={() => {
              const preset = NODE_DETAIL[`flow-${n.id}`]
              setSelected({
                id: `flow-${n.id}`, label: n.label, layer: 'institutional_flow',
                metrics: preset?.metrics ?? { FDCR: 50, CFR: 50, RBR: 50 },
                analysis: preset?.analysis ?? `${n.label}: institutional flow node.`,
                burdenPath: preset?.burdenPath ?? 'Click adjacent nodes to trace pathway.',
                correction: preset?.correction ?? 'Democratic oversight and subject appeal required.',
              })
            }}>
              {isAI && <circle cx={n.x} cy={n.y} r="26" fill="none" stroke="#ef4444" strokeWidth="1.5" opacity="0.4"/>}
              {n.shape === 'circle'  && <circle cx={n.x} cy={n.y} r="18" fill={n.color} opacity="0.85" filter="url(#fngl)"/>}
              {n.shape === 'rect'    && <rect x={n.x-26} y={n.y-13} width="52" height="26" fill={n.color} opacity="0.85" filter="url(#fngl)"/>}
              {n.shape === 'diamond' && (
                <polygon points={`${n.x},${n.y-18} ${n.x+22},${n.y} ${n.x},${n.y+18} ${n.x-22},${n.y}`}
                  fill={n.color} opacity="0.85" filter="url(#fngl)"/>
              )}
              <text x={n.x} y={n.y + (n.shape === 'rect' ? 32 : 28)}
                textAnchor="middle" fontSize="7" fill={n.color} fontFamily="monospace"
                fontWeight={['AI', 'CLASS', 'EXCL'].includes(n.id) ? '700' : '400'}>
                {n.label}
              </text>
            </g>
          )
        })}

        {/* Re-entry blockage */}
        {overlays.has('RBR') && (
          <g>
            <rect x="20" y="412" width="130" height="36" fill="#050808" stroke="#1e3a5a" strokeWidth="1"/>
            <text x="28" y="427" fontSize="7" fill="#4a8abb" fontFamily="monospace">Re-entry Blockage</text>
            <text x="28" y="441" fontSize="11" fill="#f97316" fontFamily="monospace" fontWeight="700">{Math.round(m.RBR)}</text>
          </g>
        )}
      </svg>
    )
  }, [scenario, overlays, m.CFR, m.MSJR, m.RBR])

  const ActiveCanvas = activeLayer === 'planetary'          ? PlanetaryCanvas
                     : activeLayer === 'urban_nature'       ? UrbanCanvas
                     : activeLayer === 'body_lifeworld'     ? BodyCanvas
                     : InstitutionalCanvas

  const mRisk = (k: string, v: number) =>
    ['BTR','MSJR','CFR','RBR','EPBTM','EER','EP-BTM'].includes(k)
      ? (v > 65 ? '#ef4444' : v > 45 ? '#fbbf24' : '#4ade80')
      : (v > 60 ? '#4ade80' : v > 40 ? '#fbbf24' : '#ef4444')

  const statusBars = [
    { k:'FDCR',   v: m.FDCR,          risk:false },
    { k:'G-FDCR', v: m.GFDCR,         risk:false },
    { k:'E-FDCR', v: m['E-FDCR'],     risk:false },
    { k:'BTR',    v: m.BTR,           risk:true  },
    { k:'MSJR',   v: m.MSJR,          risk:true  },
    { k:'CFR',    v: m.CFR,           risk:true  },
    { k:'RBR',    v: m.RBR,           risk:true  },
    { k:'BGR',    v: m.BGR,           risk:false },
  ]

  return (
    <div className="bg-[#05080f] flex flex-col -mx-6 -mt-8 overflow-hidden" style={{ height:'calc(100vh)' }}>

      {/* TOP BAR */}
      <div className="flex items-stretch border-b border-[#1e3a5a] bg-[#060c14] flex-shrink-0 overflow-x-auto" style={{height:'44px'}}>
        <div className="flex items-center gap-2 px-4 border-r border-[#1e3a5a] flex-shrink-0">
          <span className="text-[7px] font-mono uppercase tracking-[0.18em] text-[#1e3a5a]">FEDS</span>
          <div className="w-px h-3 bg-[#1e3a5a]"/>
          <span className="text-[7px] font-mono text-[#2a5a8a] uppercase tracking-wider">Simulation Theater</span>
        </div>

        {/* Mode */}
        <div className="flex items-stretch border-r border-[#1e3a5a] flex-shrink-0">
          <div className="flex items-center px-2 border-r border-[#0f1e2e]">
            <span className="text-[7px] font-mono uppercase tracking-widest text-[#1e3a5a]">Mode</span>
          </div>
          {LAYER_MODES.map(lm => (
            <button key={lm.id} onClick={() => { setActiveLayer(lm.id); setSelected(null) }}
              className={`flex items-center px-3 text-[9px] font-mono border-r border-[#0f1e2e] h-full whitespace-nowrap transition-colors ${
                activeLayer === lm.id ? 'text-[#7ac8f8] bg-[#0a1825]' : 'text-[#2a5a8a] hover:text-[#4a8abb] hover:bg-[#07101a]'
              }`}>
              {lm.label}
            </button>
          ))}
        </div>

        {/* Scenario */}
        <div className="flex items-stretch border-r border-[#1e3a5a] flex-shrink-0">
          <div className="flex items-center px-2 border-r border-[#0f1e2e]">
            <span className="text-[7px] font-mono uppercase tracking-widest text-[#1e3a5a]">Scenario</span>
          </div>
          {SCENARIOS.map(s => (
            <button key={s.id} onClick={() => setScenario(s.id)}
              className={`flex items-center gap-1.5 px-3 text-[9px] font-mono border-r border-[#0f1e2e] h-full whitespace-nowrap transition-colors ${
                scenario === s.id ? 'bg-[#0a1825]' : 'hover:bg-[#07101a]'
              }`}
              style={{ color: scenario === s.id ? s.color : '#2a5a8a' }}>
              {scenario === s.id && <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{background:s.color}}/>}
              {s.label}
            </button>
          ))}
        </div>

        {/* Time */}
        <div className="flex items-stretch flex-1">
          <div className="flex items-center px-2 border-r border-[#0f1e2e] flex-shrink-0">
            <span className="text-[7px] font-mono uppercase tracking-widest text-[#1e3a5a]">T</span>
          </div>
          {TIME_LABELS.map((lbl, i) => (
            <button key={i} onClick={() => setTimeHorizon(i as THorizon)}
              className={`flex items-center px-3 text-[9px] font-mono border-r border-[#0f1e2e] h-full whitespace-nowrap transition-colors ${
                timeHorizon === i ? 'text-[#7ac8f8] bg-[#0a1825]' : 'text-[#2a5a8a] hover:text-[#4a8abb] hover:bg-[#07101a]'
              }`}>{lbl}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT PANEL */}
        <div className="w-44 flex-shrink-0 border-r border-[#1e3a5a] bg-[#060c14] overflow-y-auto flex flex-col">
          <div className="flex-1">
            {OVERLAY_GROUPS.map(g => (
              <div key={g.label}>
                <div className="text-[7px] font-mono uppercase tracking-widest text-[#1e3a5a] px-3 py-1.5 border-b border-[#0f1e2e] bg-[#060c14] sticky top-0">
                  {g.label}
                </div>
                {g.items.map(item => {
                  const on = overlays.has(item.id)
                  return (
                    <button key={item.id} onClick={() => toggleOverlay(item.id)} title={item.label}
                      className={`w-full flex items-center gap-2 px-3 py-1.5 border-b border-[#07101a] transition-colors group ${on ? 'bg-[#07111d]' : 'hover:bg-[#070e18]'}`}>
                      <div className="w-2 h-2 flex-shrink-0 border transition-colors"
                        style={{ borderColor: on ? item.color : '#1e3a5a', background: on ? item.color : 'transparent' }}/>
                      <span className="text-[9px] font-mono" style={{ color: on ? item.color : '#2a5a8a' }}>{item.label}</span>
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* CANVAS */}
        <div className="flex-1 relative bg-[#04080e] overflow-hidden">
          <div className="absolute inset-0" style={{bottom:'28px'}}>
            <ActiveCanvas/>
          </div>
          {/* Status strip */}
          <div className="absolute bottom-0 left-0 right-0 flex items-center bg-[#04080e]/95 border-t border-[#1e3a5a]" style={{height:'28px'}}>
            {statusBars.map(({k,v,risk}) => {
              const val = Math.round(v)
              const c = risk ? (val>65?'#ef4444':val>45?'#fbbf24':'#4ade80') : (val>60?'#4ade80':val>40?'#fbbf24':'#ef4444')
              return (
                <div key={k} className="flex items-center gap-1.5 px-3 border-r border-[#1e3a5a] h-full">
                  <span className="text-[7px] font-mono text-[#2a5a8a]">{k}</span>
                  <span className="text-[9px] font-mono font-bold" style={{color:c}}>{val}</span>
                </div>
              )
            })}
            <div className="flex-1"/>
            <span className="text-[7px] font-mono text-[#1e3a5a] px-3">{scOpt.label} · {TIME_LABELS[timeHorizon]}</span>
          </div>
        </div>

        {/* RIGHT INSPECTOR */}
        <div className="w-60 flex-shrink-0 border-l border-[#1e3a5a] bg-[#060c14] overflow-y-auto text-[9px]">
          {!selected ? (
            <div>
              <div className="px-3 py-2 border-b border-[#1e3a5a]">
                <div className="text-[7px] font-mono uppercase tracking-widest text-[#1e3a5a] mb-1">Active Case File</div>
                <div className="font-mono text-[#7ac8f8] leading-tight">{caseLabel}</div>
              </div>
              <div className="px-3 py-2 border-b border-[#1e3a5a]">
                <div className="text-[7px] font-mono uppercase tracking-widest text-[#1e3a5a] mb-1.5">Scenario</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{background:scOpt.color}}/>
                  <span className="font-mono" style={{color:scOpt.color}}>{scOpt.label}</span>
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
                    { k:'FDCR',   v:m.FDCR,       risk:false },
                    { k:'G-FDCR', v:m.GFDCR,       risk:false },
                    { k:'E-FDCR', v:m['E-FDCR'],   risk:false },
                    { k:'EBDCR',  v:m.EBDCR,       risk:false },
                    { k:'BTR',    v:m.BTR,          risk:true  },
                    { k:'MSJR',   v:m.MSJR,        risk:true  },
                    { k:'CFR',    v:m.CFR,          risk:true  },
                    { k:'RBR',    v:m.RBR,          risk:true  },
                    { k:'BGR',    v:m.BGR,          risk:false },
                  ].map(({k,v,risk}) => {
                    const val = Math.round(v)
                    const c = mRisk(k, val)
                    return (
                      <div key={k}>
                        <div className="flex justify-between mb-0.5">
                          <span className="font-mono text-[#2a5a8a]">{k}</span>
                          <span className="font-mono font-bold" style={{color:c}}>{val}</span>
                        </div>
                        <div className="h-px bg-[#0f1a2a]">
                          <div className="h-px" style={{width:`${val}%`,background:c}}/>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
              <div className="px-3 py-2 border-b border-[#1e3a5a]">
                <div className="text-[7px] font-mono uppercase tracking-widest text-[#1e3a5a] mb-1.5">Primary Burden Pathway</div>
                <div className="font-mono text-[#ef4444] leading-relaxed">AI Scoring → Classification Gate → Exclusion Zone</div>
              </div>
              <div className="px-3 py-2 border-b border-[#1e3a5a]">
                <div className="text-[7px] font-mono uppercase tracking-widest text-[#1e3a5a] mb-1.5">Main Correction Mechanism</div>
                <div className="font-mono text-[#4ade80] leading-relaxed">Democratic Review Gate → Appeal Process</div>
              </div>
              <div className="px-3 py-2">
                <div className="text-[7px] font-mono text-[#1e3a5a] leading-relaxed">Click any node, region, or building block to inspect metrics, burden pathway, and correction mechanism.</div>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-start justify-between gap-2 px-3 py-2 border-b border-[#1e3a5a]">
                <div>
                  <div className="text-[7px] font-mono uppercase tracking-widest text-[#1e3a5a] mb-0.5">
                    Inspector · {selected.layer.replace(/_/g,' ')}
                  </div>
                  <h3 className="font-bold text-[#7ac8f8] text-[10px] leading-tight">{selected.label}</h3>
                </div>
                <button onClick={() => setSelected(null)} className="text-[#2a5a8a] hover:text-[#7ac8f8] font-mono text-[10px] shrink-0">✕</button>
              </div>
              <div className="px-3 py-2 border-b border-[#1e3a5a]">
                <div className="text-[7px] font-mono uppercase tracking-widest text-[#1e3a5a] mb-2">Metrics</div>
                <div className="space-y-2">
                  {Object.entries(selected.metrics).map(([k,v]) => {
                    const val = Math.round(v as number)
                    const c = mRisk(k, val)
                    return (
                      <div key={k}>
                        <div className="flex justify-between mb-0.5">
                          <span className="font-mono text-[#2a5a8a]">{k}</span>
                          <span className="font-mono font-bold" style={{color:c}}>{val}</span>
                        </div>
                        <div className="h-px bg-[#0f1a2a]">
                          <div className="h-px" style={{width:`${Math.min(100,val)}%`,background:c}}/>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
              <div className="px-3 py-2 border-b border-[#1e3a5a]">
                <div className="text-[7px] font-mono uppercase tracking-widest text-[#1e3a5a] mb-1.5">Analysis</div>
                <p className="text-[8px] text-[#3a6a8a] leading-relaxed">{selected.analysis}</p>
              </div>
              <div className="px-3 py-2 border-b border-[#1e3a5a]">
                <div className="text-[7px] font-mono uppercase tracking-widest text-[#1e3a5a] mb-1.5">Burden Transfer</div>
                <p className="text-[8px] text-[#f97316] leading-relaxed">{selected.burdenPath}</p>
              </div>
              <div className="px-3 py-2">
                <div className="text-[7px] font-mono uppercase tracking-widest text-[#1e3a5a] mb-1.5">Correction Mechanism</div>
                <p className="text-[8px] text-[#4ade80] leading-relaxed">{selected.correction}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* LEGEND */}
      <div className="flex-shrink-0 border-t border-[#1e3a5a] bg-[#060c14] flex items-center overflow-x-auto" style={{height:'32px'}}>
        {[
          { sym:'●', sc:'#4ade80', label:'Node size', desc:'→ metric magnitude' },
          { sym:'—', sc:'#ef4444', label:'Red arc',   desc:'→ burden transfer'  },
          { sym:'●', sc:'#4ade80', label:'Green',     desc:'→ freedom/positive' },
          { sym:'●', sc:'#ef4444', label:'Red',       desc:'→ risk/burden'      },
          { sym:'●', sc:'#fbbf24', label:'Yellow',    desc:'→ moderate'         },
          { sym:'▬', sc:'#4a8abb', label:'Elevation', desc:'→ FDCR density'     },
          { sym:'◈', sc:'#a78bfa', label:'Gateway',   desc:'→ entry/compute'    },
          { sym:'⬡', sc:'#f97316', label:'Extraction',desc:'→ resource burden'  },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-1.5 px-3 border-r border-[#1e3a5a] h-full flex-shrink-0">
            <span className="text-[9px] font-bold" style={{color:item.sc}}>{item.sym}</span>
            <span className="text-[7px] font-mono text-[#2a5a8a]">{item.label}</span>
            <span className="text-[7px] font-mono text-[#1e3a5a]">{item.desc}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
