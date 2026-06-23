'use client'
import { useState, useMemo, useCallback, useEffect } from 'react'
import { CASES, DEFAULT_CASE } from '@/lib/simulation/simCases'
import { applyScenario, TH_ALL, TH_LABELS, SC_LABELS, SC_COLORS } from '@/lib/simulation/simScenarios'
import { GLOBE, orthoProject, CONTINENTS, PLANETARY_NODES, BURDEN_ARCS } from '@/lib/simulation/planetaryData'
import { GRID, isoOrigin, cellFDCR, ZONE_MAP, CIVIC_NODES, GREEN_CELLS } from '@/lib/simulation/urbanData'
import { BODY_NODES, BODY_EDGES } from '@/lib/simulation/bodyData'
import { FLOW_NODES, FLOW_EDGES } from '@/lib/simulation/institutionalData'
import type { SimMode, ScenarioType, TimeHorizon, SimMetrics, SimObject, CaseFile } from '@/lib/simulation/simTypes'

// Color helpers
const fc = (v: number) => v >= 60 ? '#4ade80' : v >= 45 ? '#fbbf24' : v >= 30 ? '#f97316' : '#ef4444'
const rc = (v: number) => v > 70 ? '#ef4444' : v > 50 ? '#f97316' : v > 35 ? '#fbbf24' : '#4ade80'
const mc = (k: string, v: number) => ['BTR', 'MSJR', 'CFR', 'RBR', 'EER', 'EPBTM'].includes(k) ? rc(v) : fc(v)

const ZONE_COLORS: Record<string, string> = {
  residential: '#1e3a5f', institutional: '#2d1b4e', green: '#14532d',
  surveillance: '#3b1212', transit: '#1a2535', exclusion: '#1c0a0a',
  ecoRepair: '#0f3320', industrial: '#1a1208',
}
const ZONE_TOP_COLORS: Record<string, string> = {
  residential: '#2563eb', institutional: '#7c3aed', green: '#16a34a',
  surveillance: '#dc2626', transit: '#0891b2', exclusion: '#991b1b',
  ecoRepair: '#15803d', industrial: '#92400e',
}

const OVERLAY_GROUPS = [
  { id: 'freedom', label: 'Freedom-Correctness', metrics: ['FDCR', 'GFDCR', 'EFDCR', 'EBDCR'], color: '#4ade80' },
  { id: 'reentry', label: 'Re-entry / Class.', metrics: ['RCI', 'CFR', 'RBR', 'DRR', 'LSAR'], color: '#60a5fa' },
  { id: 'bodily', label: 'Bodily / Lifeworld', metrics: ['BGR', 'BBI', 'TCR', 'EIR', 'RDR'], color: '#fb7185' },
  { id: 'ecological', label: 'Ecological / Planetary', metrics: ['EGR', 'EER', 'BTR', 'EPBTM', 'CDR', 'SCDR', 'FGR'], color: '#f97316' },
  { id: 'institutional', label: 'Institutional Risk', metrics: ['MSJR', 'MTR', 'SRR', 'FMR', 'PPR'], color: '#a78bfa' },
]

const TRAJECTORY_METRICS: Array<keyof SimMetrics> = ['FDCR', 'GFDCR', 'EFDCR', 'EBDCR', 'BGR', 'RCI', 'MSJR', 'CFR', 'RBR', 'BTR', 'EER', 'FGR']

const MODE_LABELS: Record<SimMode, string> = {
  planetary: 'Planetary', urban: 'Urban', body: 'Body', flow: 'Flow', integrated: 'Integrated',
}

function ArrowDef({ id, color }: { id: string; color: string }) {
  return (
    <marker id={id} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill={color} />
    </marker>
  )
}

function MetricBar({ label, value, colorFn }: { label: string; value: number; colorFn: (v: number) => string }) {
  const c = colorFn(value)
  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, marginBottom: 2 }}>
        <span style={{ color: '#94a3b8' }}>{label}</span>
        <span style={{ color: c, fontFamily: 'monospace' }}>{value.toFixed(0)}</span>
      </div>
      <div style={{ height: 3, background: '#1e293b', borderRadius: 2 }}>
        <div style={{ width: `${value}%`, height: '100%', background: c, borderRadius: 2, transition: 'width 0.4s' }} />
      </div>
    </div>
  )
}

// ─── Planetary Canvas ─────────────────────────────────────────────────────────
function PlanetaryCanvas({
  metrics, overlays, selectedId, onSelect,
}: {
  metrics: SimMetrics; overlays: Set<string>; selectedId: string | null; onSelect: (id: string | null) => void
}) {
  const [tick, setTick] = useState(0)
  useEffect(() => { const id = setInterval(() => setTick(t => t + 1), 60); return () => clearInterval(id) }, [])
  const dash = tick * 0.4

  const showExtraction = overlays.has('ecological')
  const showCompute = overlays.has('institutional')
  const showClimate = overlays.has('ecological')

  const filteredNodes = PLANETARY_NODES.filter(n => {
    if (n.nodeCategory === 'extraction') return showExtraction
    if (n.nodeCategory === 'compute') return showCompute
    if (n.nodeCategory === 'climate' || n.nodeCategory === 'waste') return showClimate
    return true
  })

  return (
    <svg viewBox="0 0 710 458" style={{ width: '100%', height: '100%', cursor: 'default' }}>
      <defs>
        <radialGradient id="globeGrad" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#0f2040" />
          <stop offset="60%" stopColor="#060e20" />
          <stop offset="100%" stopColor="#020810" />
        </radialGradient>
        <clipPath id="globeClip">
          <circle cx={GLOBE.cx} cy={GLOBE.cy} r={GLOBE.r} />
        </clipPath>
        <ArrowDef id="p_arr_burden" color="#ef4444" />
        <ArrowDef id="p_arr_free" color="#4ade80" />
      </defs>

      <circle cx={GLOBE.cx} cy={GLOBE.cy} r={GLOBE.r + 12} fill="none" stroke="#1e3a5f" strokeWidth="14" opacity="0.4" />
      <circle cx={GLOBE.cx} cy={GLOBE.cy} r={GLOBE.r + 6} fill="none" stroke="#2563eb" strokeWidth="3" opacity="0.15" />
      <circle cx={GLOBE.cx} cy={GLOBE.cy} r={GLOBE.r} fill="url(#globeGrad)" />

      <g clipPath="url(#globeClip)" opacity="0.18" stroke="#334155" strokeWidth="0.6" fill="none">
        {[-60, -30, 0, 30, 60].map(lat => {
          const pts: string[] = []
          for (let lon = -180; lon <= 180; lon += 5) {
            const p = orthoProject(lat, lon)
            if (p.visible) pts.push((pts.length === 0 ? 'M' : 'L') + p.x.toFixed(1) + ',' + p.y.toFixed(1))
          }
          return <path key={'lat' + lat} d={pts.join(' ')} />
        })}
        {[-120, -60, 0, 60, 120].map(lon => {
          const pts: string[] = []
          for (let lat2 = -80; lat2 <= 80; lat2 += 5) {
            const p = orthoProject(lat2, lon)
            if (p.visible) pts.push((pts.length === 0 ? 'M' : 'L') + p.x.toFixed(1) + ',' + p.y.toFixed(1))
          }
          return <path key={'lon' + lon} d={pts.join(' ')} />
        })}
      </g>

      <g clipPath="url(#globeClip)">
        {CONTINENTS.map(cont => {
          const parts: string[] = []
          let penDown = false
          cont.pts.forEach(([clat, clon]) => {
            const p = orthoProject(clat, clon)
            if (p.visible) {
              parts.push((penDown ? 'L' : 'M') + p.x.toFixed(1) + ',' + p.y.toFixed(1))
              penDown = true
            } else { penDown = false }
          })
          return <path key={cont.id} d={parts.join(' ')} fill="#1e3a5f" stroke="#2563eb" strokeWidth="0.8" opacity="0.7" />
        })}
      </g>

      {BURDEN_ARCS.map(arc => {
        const fromNode = PLANETARY_NODES.find(n => n.id === arc.from)
        const toNode = PLANETARY_NODES.find(n => n.id === arc.to)
        if (!fromNode || !toNode) return null
        const fp = orthoProject(fromNode.lat, fromNode.lon)
        const tp = orthoProject(toNode.lat, toNode.lon)
        if (!fp.visible || !tp.visible) return null
        const mx = (fp.x + tp.x) / 2
        const my = (fp.y + tp.y) / 2 - 60
        const d = `M${fp.x.toFixed(1)},${fp.y.toFixed(1)} Q${mx.toFixed(1)},${my.toFixed(1)} ${tp.x.toFixed(1)},${tp.y.toFixed(1)}`
        return (
          <path key={arc.id} d={d} fill="none" stroke={arc.arcColor}
            strokeWidth="1.2" strokeDasharray="5,4" strokeDashoffset={-dash} opacity="0.55"
            markerEnd={arc.flowType === 'freedom' ? 'url(#p_arr_free)' : 'url(#p_arr_burden)'} />
        )
      })}

      {filteredNodes.map(node => {
        const p = orthoProject(node.lat, node.lon)
        if (!p.visible) return null
        const f = node.metrics.FDCR ?? 45
        const r = 4 + (f / 100) * 8
        const c = fc(f)
        const isSel = selectedId === node.id
        return (
          <g key={node.id} style={{ cursor: 'pointer' }} onClick={() => onSelect(isSel ? null : node.id)}>
            {isSel && <circle cx={p.x} cy={p.y} r={r + 5} fill="none" stroke="#06b6d4" strokeWidth="1.5" opacity="0.9" />}
            <circle cx={p.x} cy={p.y} r={r} fill={c} opacity="0.85" />
            <circle cx={p.x} cy={p.y} r={r} fill="none" stroke="#0f172a" strokeWidth="0.8" />
            <text x={p.x} y={p.y - r - 3} textAnchor="middle" fill="#e2e8f0" fontSize="7" fontFamily="monospace">
              {node.label.split(' ')[0]}
            </text>
          </g>
        )
      })}

      <circle cx={GLOBE.cx} cy={GLOBE.cy} r={GLOBE.r} fill="none" stroke="#1e40af" strokeWidth="1.2" opacity="0.5" />
    </svg>
  )
}

// ─── Urban Canvas ─────────────────────────────────────────────────────────────
function UrbanCanvas({
  scenario, th, overlays, selectedId, onSelect,
}: {
  scenario: ScenarioType; th: TimeHorizon; overlays: Set<string>; selectedId: string | null; onSelect: (id: string | null) => void
}) {
  const showSurv = overlays.has('institutional')
  const showHeat = overlays.has('ecological')
  const showRent = overlays.has('bodily')

  const cells: Array<{ col: number; row: number; key: string }> = []
  for (let col = 0; col < GRID.cols; col++) {
    for (let row2 = 0; row2 < GRID.rows; row2++) {
      cells.push({ col, row: row2, key: `${col},${row2}` })
    }
  }
  cells.sort((a, b) => (a.col + a.row) - (b.col + b.row))

  return (
    <svg viewBox="0 0 710 458" style={{ width: '100%', height: '100%', cursor: 'default' }}>
      {cells.map(({ col, row, key }) => {
        const zone = ZONE_MAP[key] ?? 'residential'
        const fdcr = cellFDCR(col, row, scenario, th)
        const { x, y } = isoOrigin(col, row)
        const h = fdcr * 0.55 + 8
        const tw = GRID.tileW / 2
        const th2 = GRID.tileH / 2
        const isSel = selectedId === key
        const topFill = isSel ? '#06b6d4'
          : showSurv && (zone === 'surveillance' || zone === 'institutional') ? '#7f1d1d'
          : showHeat && (zone === 'exclusion' || zone === 'industrial') ? '#78350f'
          : showRent && zone === 'residential' ? '#1e3a5f'
          : GREEN_CELLS.has(key) ? '#15803d'
          : ZONE_TOP_COLORS[zone]
        const top = `${x},${y - h} ${x + tw},${y + th2 - h} ${x},${y + th2 * 2 - h} ${x - tw},${y + th2 - h}`
        const left = `${x - tw},${y + th2 - h} ${x},${y + th2 * 2 - h} ${x},${y + th2 * 2} ${x - tw},${y + th2}`
        const right = `${x},${y + th2 * 2 - h} ${x + tw},${y + th2 - h} ${x + tw},${y + th2} ${x},${y + th2 * 2}`
        return (
          <g key={key} style={{ cursor: 'pointer' }} onClick={() => onSelect(isSel ? null : key)}>
            <polygon points={left} fill={ZONE_COLORS[zone]} stroke="#020810" strokeWidth="0.5" opacity="0.9" />
            <polygon points={right} fill={ZONE_COLORS[zone]} stroke="#020810" strokeWidth="0.5" opacity="0.75" />
            <polygon points={top} fill={topFill} stroke={isSel ? '#06b6d4' : '#020810'} strokeWidth={isSel ? 1.2 : 0.5} opacity="0.92" />
            {CIVIC_NODES[key] && (
              <text x={x} y={y - h - 4} textAnchor="middle" fontSize="9" fill="#e2e8f0" fontFamily="monospace">
                {CIVIC_NODES[key].symbol}
              </text>
            )}
          </g>
        )
      })}
      <g transform="translate(10,10)">
        {(['green', 'residential', 'institutional', 'surveillance', 'exclusion'] as const).map((z, i) => (
          <g key={z} transform={`translate(0,${i * 14})`}>
            <rect width="10" height="8" fill={ZONE_TOP_COLORS[z]} rx="1" />
            <text x="13" y="8" fill="#94a3b8" fontSize="7" fontFamily="monospace">{z}</text>
          </g>
        ))}
      </g>
    </svg>
  )
}

// ─── Body Canvas ──────────────────────────────────────────────────────────────
function BodyCanvas({
  selectedId, onSelect,
}: {
  selectedId: string | null; onSelect: (id: string | null) => void
}) {
  const [tick, setTick] = useState(0)
  useEffect(() => { const id = setInterval(() => setTick(t => t + 1), 80); return () => clearInterval(id) }, [])
  const pulse = Math.sin(tick * 0.08) * 4

  // Stable bezier control point offsets per edge (avoid random per render)
  const edgeCPs = useMemo(() => BODY_EDGES.map((_, i) => (i % 2 === 0 ? 22 : -22)), [])

  const arrowColor = (ft: string) =>
    ft === 'freedom' ? '#4ade80' : ft === 'compress' ? '#a78bfa' : ft === 'barrier' ? '#f97316' : '#ef4444'
  const arrowId = (ft: string) =>
    ft === 'freedom' ? 'b_free' : ft === 'compress' ? 'b_compress' : ft === 'barrier' ? 'b_barrier' : 'b_burden'

  return (
    <svg viewBox="0 0 710 458" style={{ width: '100%', height: '100%', cursor: 'default' }}>
      <defs>
        <ArrowDef id="b_burden" color="#ef4444" />
        <ArrowDef id="b_free" color="#4ade80" />
        <ArrowDef id="b_barrier" color="#f97316" />
        <ArrowDef id="b_compress" color="#a78bfa" />
      </defs>

      {[80, 130, 180].map((r, i) => (
        <circle key={r} cx={355} cy={229} r={r + pulse * (i + 1) * 0.3}
          fill="none" stroke="#1e3a5f" strokeWidth="0.6" strokeDasharray="3,4" opacity="0.35" />
      ))}

      <line x1={355} y1={60} x2={355} y2={400} stroke="#1e293b" strokeWidth="0.5" />
      <line x1={165} y1={229} x2={545} y2={229} stroke="#1e293b" strokeWidth="0.5" />
      <text x={355} y={56} textAnchor="middle" fill="#334155" fontSize="8" fontFamily="monospace">cognitive</text>
      <text x={355} y={414} textAnchor="middle" fill="#334155" fontSize="8" fontFamily="monospace">metabolic</text>
      <text x={158} y={232} textAnchor="end" fill="#334155" fontSize="8" fontFamily="monospace">relational</text>
      <text x={552} y={232} textAnchor="start" fill="#334155" fontSize="8" fontFamily="monospace">expressive</text>

      {BODY_EDGES.map((edge, ei) => {
        const src = BODY_NODES.find(n => n.id === edge.source)
        const tgt = BODY_NODES.find(n => n.id === edge.target)
        if (!src || !tgt) return null
        const cpOff = edgeCPs[ei]
        const mx = (src.x + tgt.x) / 2 + cpOff
        const my = (src.y + tgt.y) / 2
        const c = arrowColor(edge.flowType)
        return (
          <path key={edge.id}
            d={`M${src.x},${src.y} Q${mx},${my} ${tgt.x},${tgt.y}`}
            fill="none" stroke={c} strokeWidth={edge.severity / 60} opacity={edge.opacity * 0.65}
            markerEnd={`url(#${arrowId(edge.flowType)})`}
            strokeDasharray={edge.flowType === 'barrier' ? '3,3' : undefined}
          />
        )
      })}

      {BODY_NODES.map(node => {
        const isSel = selectedId === node.id
        const isBarrier = node.nodeRole === 'barrier'
        return (
          <g key={node.id} style={{ cursor: 'pointer' }} onClick={() => onSelect(isSel ? null : node.id)}>
            {isBarrier && <circle cx={node.x} cy={node.y} r={node.r + 4} fill="none" stroke={node.color} strokeWidth="1" strokeDasharray="3,3" opacity="0.6" />}
            {isSel && <circle cx={node.x} cy={node.y} r={node.r + 6} fill="none" stroke="#06b6d4" strokeWidth="1.5" />}
            <circle cx={node.x} cy={node.y} r={node.r} fill={node.color} opacity="0.82" />
            <circle cx={node.x} cy={node.y} r={node.r} fill="none" stroke="#0f172a" strokeWidth="0.8" />
            <text x={node.x} y={node.y + 3} textAnchor="middle" fill="#0f172a" fontSize="7" fontWeight="bold" fontFamily="monospace">
              {node.label.substring(0, 5)}
            </text>
          </g>
        )
      })}

      {/* 24h ring */}
      <g transform="translate(630,68)">
        {(() => {
          const segs = [
            { label: 'Sleep', hours: 6, color: '#1e40af' },
            { label: 'Admin', hours: 3, color: '#dc2626' },
            { label: 'Work', hours: 8, color: '#0891b2' },
            { label: 'Care', hours: 3, color: '#15803d' },
            { label: 'Other', hours: 4, color: '#374151' },
          ]
          let angle = -90
          return segs.map(seg => {
            const startRad = (angle * Math.PI) / 180
            const sweep = (seg.hours / 24) * 360
            const endRad = ((angle + sweep) * Math.PI) / 180
            const r2 = 30
            const x1 = r2 * Math.cos(startRad), y1 = r2 * Math.sin(startRad)
            const x2 = r2 * Math.cos(endRad), y2 = r2 * Math.sin(endRad)
            const large = sweep > 180 ? 1 : 0
            const el = (
              <path key={seg.label}
                d={`M0,0 L${x1.toFixed(2)},${y1.toFixed(2)} A${r2},${r2} 0 ${large},1 ${x2.toFixed(2)},${y2.toFixed(2)} Z`}
                fill={seg.color} opacity="0.8" />
            )
            angle += sweep
            return el
          })
        })()}
        <circle cx={0} cy={0} r={16} fill="#020810" />
        <text x={0} y={42} textAnchor="middle" fill="#475569" fontSize="6" fontFamily="monospace">24h burden</text>
      </g>
    </svg>
  )
}

// ─── Flow Canvas ──────────────────────────────────────────────────────────────
function FlowCanvas({
  metrics, selectedId, onSelect,
}: {
  metrics: SimMetrics; selectedId: string | null; onSelect: (id: string | null) => void
}) {
  const [tick, setTick] = useState(0)
  useEffect(() => { const id = setInterval(() => setTick(t => t + 1), 80); return () => clearInterval(id) }, [])
  const aiPulse = 1 + Math.sin(tick * 0.1) * 0.15

  const stageY = [65, 124, 182, 240, 298, 360]
  const stageLabels = ['ENTRY', 'INTAKE / VERIFY', 'AI PROCESS', 'CLASSIFICATION', 'REVIEW', 'OUTCOME']

  const edgeColor = (ft: string) => ft === 'freedom' ? '#4ade80' : ft === 'barrier' ? '#f97316' : '#ef4444'
  const edgeArrow = (ft: string) => ft === 'freedom' ? 'url(#f_free)' : ft === 'barrier' ? 'url(#f_barrier)' : 'url(#f_burden)'

  function renderNode(node: typeof FLOW_NODES[0]) {
    const { x, y, shape, color, id } = node
    const isSel = selectedId === id
    const isAI = id === 'ai_process'
    const w = 52, h = 24
    let body: React.ReactNode
    if (shape === 'diamond') {
      body = <polygon points={`${x},${y - 16} ${x + 26},${y} ${x},${y + 16} ${x - 26},${y}`} fill={color} stroke={isSel ? '#06b6d4' : '#0f172a'} strokeWidth={isSel ? 2 : 0.8} opacity="0.85" />
    } else if (shape === 'hexagon') {
      body = <polygon points={`${x - 26},${y} ${x - 13},${y - 14} ${x + 13},${y - 14} ${x + 26},${y} ${x + 13},${y + 14} ${x - 13},${y + 14}`} fill={color} stroke={isSel ? '#06b6d4' : '#0f172a'} strokeWidth={isSel ? 2 : 0.8} opacity="0.85" />
    } else if (shape === 'circle') {
      body = <circle cx={x} cy={y} r={20} fill={color} stroke={isSel ? '#06b6d4' : '#0f172a'} strokeWidth={isSel ? 2 : 0.8} opacity="0.85" />
    } else {
      body = <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx="4" fill={color} stroke={isSel ? '#06b6d4' : '#0f172a'} strokeWidth={isSel ? 2 : 0.8} opacity="0.85" />
    }
    return (
      <g key={id} style={{ cursor: 'pointer' }} onClick={() => onSelect(isSel ? null : id)}>
        {isSel && <circle cx={x} cy={y} r={32} fill="none" stroke="#06b6d4" strokeWidth="1.5" opacity="0.6" />}
        {isAI && <circle cx={x} cy={y} r={30 * aiPulse} fill="none" stroke="#a78bfa" strokeWidth="1" opacity="0.28" />}
        {body}
        <text x={x} y={y + 4} textAnchor="middle" fill="#0f172a" fontSize="7" fontWeight="bold" fontFamily="monospace">
          {node.tagCode}
        </text>
        {node.tagLabel && (
          <text x={x} y={y + 28} textAnchor="middle" fill="#94a3b8" fontSize="7" fontFamily="monospace">
            {node.tagLabel}
          </text>
        )}
      </g>
    )
  }

  return (
    <svg viewBox="0 0 710 458" style={{ width: '100%', height: '100%', cursor: 'default' }}>
      <defs>
        <ArrowDef id="f_burden" color="#ef4444" />
        <ArrowDef id="f_free" color="#4ade80" />
        <ArrowDef id="f_barrier" color="#f97316" />
      </defs>

      {stageY.map((sy, i) => (
        <g key={i}>
          <line x1={60} y1={sy} x2={650} y2={sy} stroke="#1e293b" strokeWidth="0.6" strokeDasharray="4,4" />
          <text x={64} y={sy - 4} fill="#334155" fontSize="7" fontFamily="monospace">{stageLabels[i]}</text>
        </g>
      ))}

      {FLOW_EDGES.map(edge => {
        const src = FLOW_NODES.find(n => n.id === edge.source)
        const tgt = FLOW_NODES.find(n => n.id === edge.target)
        if (!src || !tgt) return null
        const cpx = (src.x + tgt.x) / 2 + (src.x < tgt.x ? 28 : -28)
        const cpy = (src.y + tgt.y) / 2
        const c = edgeColor(edge.flowType)
        return (
          <path key={edge.id}
            d={`M${src.x},${src.y} Q${cpx},${cpy} ${tgt.x},${tgt.y}`}
            fill="none" stroke={c} strokeWidth={edge.severity / 55} opacity={edge.opacity * 0.7}
            markerEnd={edgeArrow(edge.flowType)}
            strokeDasharray={edge.flowType === 'barrier' ? '4,3' : undefined}
          />
        )
      })}

      {FLOW_NODES.map(n => renderNode(n))}

      {/* Metric panel */}
      <g transform="translate(570,12)">
        <rect width="128" height="82" rx="4" fill="#0c1628" stroke="#1e293b" strokeWidth="0.8" />
        <text x="8" y="16" fill="#475569" fontSize="7" fontFamily="monospace">METRICS</text>
        {(['MSJR', 'CFR', 'RBR'] as Array<keyof SimMetrics>).map((k, i) => (
          <g key={k} transform={`translate(8,${22 + i * 20})`}>
            <text y="10" fill="#64748b" fontSize="7" fontFamily="monospace">{k}</text>
            <text x="42" y="10" fill={rc(metrics[k])} fontSize="8" fontFamily="monospace">{metrics[k].toFixed(0)}</text>
            <rect x="56" y="4" width="36" height="4" rx="2" fill="#1e293b" />
            <rect x="56" y="4" width={36 * (metrics[k] / 100)} height="4" rx="2" fill={rc(metrics[k])} />
          </g>
        ))}
      </g>
    </svg>
  )
}

// ─── Integrated Canvas ────────────────────────────────────────────────────────
function IntegratedCanvas({
  metrics, scenario, th, selectedId, onSelect,
}: {
  metrics: SimMetrics; scenario: ScenarioType; th: TimeHorizon; selectedId: string | null; onSelect: (id: string | null) => void
}) {
  const qw = 355, qh = 229
  const miniPlanetNodes = PLANETARY_NODES.filter(n => n.nodeCategory === 'region').slice(0, 5)
  const miniUrbanCells: Array<{ col: number; row: number }> = []
  for (let c = 0; c < 5; c++) for (let r = 0; r < 4; r++) miniUrbanCells.push({ col: c, row: r })

  return (
    <svg viewBox="0 0 710 458" style={{ width: '100%', height: '100%', cursor: 'default' }}>
      <defs>
        <clipPath id="q_tl"><rect x="0" y="0" width={qw} height={qh} /></clipPath>
        <clipPath id="q_tr"><rect x={qw} y="0" width={qw} height={qh} /></clipPath>
        <clipPath id="q_bl"><rect x="0" y={qh} width={qw} height={qh} /></clipPath>
        <clipPath id="q_br"><rect x={qw} y={qh} width={qw} height={qh} /></clipPath>
      </defs>

      <rect x="0" y="0" width={qw} height={qh} fill="#040c18" stroke="#1e293b" strokeWidth="0.8" />
      <rect x={qw} y="0" width={qw} height={qh} fill="#040c18" stroke="#1e293b" strokeWidth="0.8" />
      <rect x="0" y={qh} width={qw} height={qh} fill="#040c18" stroke="#1e293b" strokeWidth="0.8" />
      <rect x={qw} y={qh} width={qw} height={qh} fill="#040c18" stroke="#1e293b" strokeWidth="0.8" />

      <text x="8" y="15" fill="#334155" fontSize="8" fontFamily="monospace" fontWeight="bold">PLANETARY</text>
      <text x={qw + 8} y="15" fill="#334155" fontSize="8" fontFamily="monospace" fontWeight="bold">URBAN</text>
      <text x="8" y={qh + 15} fill="#334155" fontSize="8" fontFamily="monospace" fontWeight="bold">BODY</text>
      <text x={qw + 8} y={qh + 15} fill="#334155" fontSize="8" fontFamily="monospace" fontWeight="bold">INSTITUTIONAL</text>

      {/* Mini Planetary */}
      <g clipPath="url(#q_tl)">
        <circle cx={qw / 2} cy={qh / 2} r={82} fill="#060e20" stroke="#1e3a5f" strokeWidth="6" />
        {miniPlanetNodes.map(n => {
          const op = orthoProject(n.lat, n.lon)
          if (!op.visible) return null
          const sx = qw / 2 + (op.x - GLOBE.cx) * 0.48
          const sy = qh / 2 + (op.y - GLOBE.cy) * 0.48
          return (
            <g key={n.id}>
              <circle cx={sx} cy={sy} r={5} fill={fc(n.metrics.FDCR ?? 45)} opacity="0.85" />
              <text x={sx} y={sy - 7} textAnchor="middle" fill="#94a3b8" fontSize="6" fontFamily="monospace">{n.id}</text>
            </g>
          )
        })}
        {BURDEN_ARCS.slice(0, 3).map(arc => {
          const fn = PLANETARY_NODES.find(n => n.id === arc.from)
          const tn = PLANETARY_NODES.find(n => n.id === arc.to)
          if (!fn || !tn) return null
          const fp = orthoProject(fn.lat, fn.lon)
          const tp = orthoProject(tn.lat, tn.lon)
          if (!fp.visible || !tp.visible) return null
          return (
            <line key={arc.id}
              x1={qw / 2 + (fp.x - GLOBE.cx) * 0.48} y1={qh / 2 + (fp.y - GLOBE.cy) * 0.48}
              x2={qw / 2 + (tp.x - GLOBE.cx) * 0.48} y2={qh / 2 + (tp.y - GLOBE.cy) * 0.48}
              stroke={arc.arcColor} strokeWidth="0.8" opacity="0.5" strokeDasharray="3,3" />
          )
        })}
      </g>

      {/* Mini Urban */}
      <g clipPath="url(#q_tr)">
        {miniUrbanCells.map(({ col, row }) => {
          const key = `${col},${row}`
          const zone = ZONE_MAP[key] ?? 'residential'
          const ox = qw + 28 + (col - row) * 28
          const oy = 55 + (col + row) * 16
          const tw = 14, th2 = 8, h2 = 16
          const top = `${ox},${oy - h2} ${ox + tw},${oy + th2 - h2} ${ox},${oy + th2 * 2 - h2} ${ox - tw},${oy + th2 - h2}`
          const left = `${ox - tw},${oy + th2 - h2} ${ox},${oy + th2 * 2 - h2} ${ox},${oy + th2 * 2} ${ox - tw},${oy + th2}`
          const right = `${ox},${oy + th2 * 2 - h2} ${ox + tw},${oy + th2 - h2} ${ox + tw},${oy + th2} ${ox},${oy + th2 * 2}`
          return (
            <g key={key}>
              <polygon points={left} fill={ZONE_COLORS[zone]} stroke="#020810" strokeWidth="0.3" opacity="0.9" />
              <polygon points={right} fill={ZONE_COLORS[zone]} stroke="#020810" strokeWidth="0.3" opacity="0.7" />
              <polygon points={top} fill={ZONE_TOP_COLORS[zone]} stroke="#020810" strokeWidth="0.3" opacity="0.85" />
            </g>
          )
        })}
      </g>

      {/* Mini Body */}
      <g clipPath="url(#q_bl)">
        {[52, 88].map(r => (
          <circle key={r} cx={qw / 2} cy={qh + qh / 2} r={r} fill="none" stroke="#1e3a5f" strokeWidth="0.5" strokeDasharray="3,4" opacity="0.4" />
        ))}
        {BODY_NODES.slice(0, 7).map(n => (
          <circle key={n.id} cx={qw / 2 + (n.x - 355) * 0.45} cy={qh + qh / 2 + (n.y - 229) * 0.45} r={n.r * 0.55} fill={n.color} opacity="0.8" />
        ))}
        {BODY_EDGES.slice(0, 8).map(e => {
          const src = BODY_NODES.find(n => n.id === e.source)
          const tgt = BODY_NODES.find(n => n.id === e.target)
          if (!src || !tgt) return null
          const c = e.flowType === 'freedom' ? '#4ade80' : e.flowType === 'compress' ? '#a78bfa' : '#ef4444'
          return <line key={e.id}
            x1={qw / 2 + (src.x - 355) * 0.45} y1={qh + qh / 2 + (src.y - 229) * 0.45}
            x2={qw / 2 + (tgt.x - 355) * 0.45} y2={qh + qh / 2 + (tgt.y - 229) * 0.45}
            stroke={c} strokeWidth="0.7" opacity="0.5" />
        })}
      </g>

      {/* Mini Flow */}
      <g clipPath="url(#q_br)">
        {['entry', 'ai_process', 'class_high', 'bypass', 'deny_final'].map((nid, i) => {
          const node = FLOW_NODES.find(n => n.id === nid)
          if (!node) return null
          const sx = qw + 48 + i * 58
          const sy = qh + 115
          return (
            <g key={nid}>
              {i < 4 && <line x1={sx + 14} y1={sy} x2={sx + 44} y2={sy} stroke="#ef4444" strokeWidth="0.7" opacity="0.5" />}
              <circle cx={sx} cy={sy} r={13} fill={node.color} opacity="0.8" />
              <text x={sx} y={sy + 4} textAnchor="middle" fill="#0f172a" fontSize="6" fontFamily="monospace">{node.tagCode}</text>
            </g>
          )
        })}
        <text x={qw + 178} y={qh + 146} textAnchor="middle" fill="#475569" fontSize="7" fontFamily="monospace">AI pipeline</text>
      </g>

      {/* Cross-scale links */}
      <path d={`M${qw - 18},${78} L${qw + 18},${78}`} stroke="#a78bfa" strokeWidth="1.2" opacity="0.7" strokeDasharray="4,3" />
      <path d={`M${qw + qw / 2},${qh - 10} L${qw + qw / 2},${qh + 10}`} stroke="#f97316" strokeWidth="1.2" opacity="0.7" strokeDasharray="4,3" />
      <path d={`M${qw + 18},${qh + qh / 2} L${qw - 18},${qh + qh / 2}`} stroke="#ef4444" strokeWidth="1.2" opacity="0.7" strokeDasharray="4,3" />
      <path d={`M${qw / 2},${qh - 10} L${qw / 2},${qh + 10}`} stroke="#f97316" strokeWidth="1.2" opacity="0.7" strokeDasharray="4,3" />

      <text x={qw} y={71} textAnchor="middle" fill="#a78bfa" fontSize="6" fontFamily="monospace">AI compute → urban surv.</text>
      <text x={qw + qw / 2} y={qh - 14} textAnchor="middle" fill="#f97316" fontSize="6" fontFamily="monospace">urban class. → inst. flow</text>
      <text x={qw} y={qh + qh / 2 - 6} textAnchor="middle" fill="#ef4444" fontSize="6" fontFamily="monospace">inst. delay → bodily compress.</text>
      <text x={qw / 2} y={qh - 14} textAnchor="middle" fill="#f97316" fontSize="6" fontFamily="monospace">eco. burden → body</text>
    </svg>
  )
}

// ─── Inspector ────────────────────────────────────────────────────────────────
function Inspector({
  caseFile, mode, scenario, th, metrics, selectedObj,
}: {
  caseFile: CaseFile; mode: SimMode; scenario: ScenarioType; th: TimeHorizon
  metrics: SimMetrics; selectedObj: SimObject | null
}) {
  const scColor = SC_COLORS[scenario]
  const judgeLabel = metrics.FDCR >= 70 ? 'FREEDOM-GENERATIVE'
    : metrics.FDCR >= 50 ? 'PARTIAL ACCESS'
    : metrics.FDCR >= 35 ? 'CONSTRAINED'
    : 'SUPPRESSION RISK'

  if (selectedObj) {
    return (
      <div style={{ padding: 10, overflowY: 'auto', height: '100%', boxSizing: 'border-box' }}>
        <div style={{ fontSize: 8, color: '#64748b', fontFamily: 'monospace', marginBottom: 3 }}>
          {selectedObj.objectType} · {selectedObj.systemLayer.toUpperCase()}
        </div>
        <div style={{ fontSize: 10, color: '#e2e8f0', fontFamily: 'monospace', fontWeight: 'bold', marginBottom: 6, lineHeight: 1.3 }}>
          {selectedObj.label}
        </div>
        <div style={{ fontSize: 8, color: '#64748b', marginBottom: 1 }}>Scale: <span style={{ color: '#94a3b8' }}>{selectedObj.affectedScale}</span></div>
        <div style={{ fontSize: 8, color: '#64748b', marginBottom: 8 }}>Actors: <span style={{ color: '#94a3b8' }}>{selectedObj.affectedActors}</span></div>
        {Object.entries(selectedObj.metrics).map(([k, v]) => (
          <MetricBar key={k} label={k} value={v as number} colorFn={val => mc(k, val)} />
        ))}
        <div style={{ marginTop: 8, borderTop: '1px solid #0f172a', paddingTop: 6 }}>
          <Field label="Burden" value={selectedObj.burdenPathway} color="#f87171" />
          <Field label="Re-entry" value={selectedObj.reentryCondition} color="#fb923c" />
          <Field label="Class. risk" value={selectedObj.classificationRisk} color="#fbbf24" />
          <Field label="Lifeworld" value={selectedObj.lifeworldImpact} color="#93c5fd" />
          <Field label="Ecological" value={selectedObj.ecologicalImpact} color="#86efac" />
          <Field label="Correction" value={selectedObj.correctionMechanism} color="#4ade80" />
          <Field label="Scenario" value={selectedObj.scenarioInterpretation} color="#e2e8f0" />
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: 10, overflowY: 'auto', height: '100%', boxSizing: 'border-box' }}>
      <div style={{ fontSize: 8, color: '#64748b', fontFamily: 'monospace', marginBottom: 2 }}>CASE</div>
      <div style={{ fontSize: 10, color: '#e2e8f0', fontFamily: 'monospace', fontWeight: 'bold', marginBottom: 4, lineHeight: 1.3 }}>
        {caseFile.label}
      </div>
      <div style={{ fontSize: 8, color: '#64748b', marginBottom: 6 }}>{caseFile.description}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
        <span style={{ fontSize: 8, color: '#475569' }}>MODE:</span>
        <span style={{ fontSize: 8, color: '#60a5fa', fontFamily: 'monospace' }}>{MODE_LABELS[mode]}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: scColor }} />
        <span style={{ fontSize: 8, color: '#e2e8f0', fontFamily: 'monospace' }}>{SC_LABELS[scenario]}</span>
      </div>
      <div style={{ fontSize: 8, color: '#64748b', marginBottom: 8 }}>{TH_LABELS[th]}</div>

      <div style={{ fontSize: 8, color: '#475569', fontFamily: 'monospace', marginBottom: 4 }}>FREEDOM METRICS</div>
      {(['FDCR', 'GFDCR', 'EFDCR', 'EBDCR'] as Array<keyof SimMetrics>).map(k => (
        <MetricBar key={k} label={k} value={metrics[k]} colorFn={fc} />
      ))}
      <div style={{ fontSize: 8, color: '#475569', fontFamily: 'monospace', marginTop: 8, marginBottom: 4 }}>BURDEN METRICS</div>
      {(['BTR', 'MSJR', 'CFR', 'RBR'] as Array<keyof SimMetrics>).map(k => (
        <MetricBar key={k} label={k} value={metrics[k]} colorFn={rc} />
      ))}

      <div style={{ marginTop: 10, borderTop: '1px solid #0f172a', paddingTop: 8 }}>
        <div style={{ fontSize: 8, color: '#475569', marginBottom: 2 }}>Primary contradiction</div>
        <div style={{ fontSize: 8, color: '#94a3b8' }}>
          {metrics.FDCR < 45
            ? 'Classification systems suppress freedom-correctness below systemic harm threshold.'
            : 'Freedom-correctness partially maintained; burden pathways active.'}
        </div>
        <div style={{ fontSize: 8, color: '#f87171', marginTop: 6, marginBottom: 1 }}>Burden transfer</div>
        <div style={{ fontSize: 8, color: '#f87171' }}>
          BTR {metrics.BTR.toFixed(0)} — {metrics.BTR > 70 ? 'Terminal burden transfer active' : metrics.BTR > 50 ? 'Significant burden displacement' : 'Burden transfer constrained'}
        </div>
        <div style={{ fontSize: 8, color: '#fb923c', marginTop: 6, marginBottom: 1 }}>Re-entry blockage</div>
        <div style={{ fontSize: 8, color: '#fb923c' }}>
          RCI {metrics.RCI.toFixed(0)} — {metrics.RCI < 35 ? 'Re-entry critically blocked' : metrics.RCI < 50 ? 'Constrained re-entry' : 'Partial re-entry available'}
        </div>
        <div style={{ fontSize: 8, color: '#4ade80', marginTop: 6, marginBottom: 1 }}>Correction mechanism</div>
        <div style={{ fontSize: 8, color: '#4ade80' }}>
          DRR {metrics.DRR.toFixed(0)} — {metrics.DRR > 55 ? 'Correction channels functional' : metrics.DRR > 40 ? 'Limited correction capacity' : 'Correction mechanisms suppressed'}
        </div>
        <div style={{ marginTop: 8, padding: '4px 6px', background: '#0c1628', borderRadius: 4, border: `1px solid ${scColor}` }}>
          <div style={{ fontSize: 7, color: '#475569', marginBottom: 2 }}>JUDGMENT</div>
          <div style={{ fontSize: 9, color: scColor, fontFamily: 'monospace', fontWeight: 'bold' }}>{judgeLabel}</div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ marginBottom: 5 }}>
      <div style={{ fontSize: 7, color: '#475569', marginBottom: 1 }}>{label}</div>
      <div style={{ fontSize: 8, color, lineHeight: 1.35 }}>{value}</div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SimulationPage() {
  const [caseId, setCaseId] = useState(DEFAULT_CASE.id)
  const [mode, setMode] = useState<SimMode>('planetary')
  const [scenario, setScenario] = useState<ScenarioType>('current')
  const [th, setTh] = useState<TimeHorizon>('immediate')
  const [activeOverlays, setActiveOverlays] = useState<Set<string>>(new Set())
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const caseFile = useMemo(() => CASES.find(c => c.id === caseId) ?? DEFAULT_CASE, [caseId])
  const metrics = useMemo(() => applyScenario(caseFile.baseMetrics, scenario, th), [caseFile, scenario, th])

  const toggleOverlay = useCallback((id: string) => {
    setActiveOverlays(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  const handleSelect = useCallback((id: string | null) => {
    setSelectedId(id)
  }, [])

  const selectedObj = useMemo((): SimObject | null => {
    if (!selectedId) return null
    const allObjs: SimObject[] = [...PLANETARY_NODES, ...BODY_NODES, ...FLOW_NODES]
    return allObjs.find(o => o.id === selectedId) ?? null
  }, [selectedId])

  const trajData = useMemo(() =>
    TH_ALL.map(t => ({
      th: t,
      values: Object.fromEntries(
        TRAJECTORY_METRICS.map(k => [k, applyScenario(caseFile.baseMetrics, scenario, t)[k]])
      ) as Record<typeof TRAJECTORY_METRICS[number], number>,
    })),
    [caseFile, scenario]
  )

  const handleExport = useCallback(() => {
    const data = { case: caseFile, scenario, th, metrics, trajectory: trajData }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `sim-export-${caseId}-${scenario}-${th}.json`
    a.click(); URL.revokeObjectURL(url)
  }, [caseFile, caseId, scenario, th, metrics, trajData])

  const handleReset = useCallback(() => {
    setCaseId(DEFAULT_CASE.id); setMode('planetary'); setScenario('current')
    setTh('immediate'); setActiveOverlays(new Set()); setSelectedId(null)
  }, [])

  const btnBase: React.CSSProperties = {
    padding: '2px 7px', fontSize: 9, border: '1px solid #1e293b',
    borderRadius: 3, cursor: 'pointer', fontFamily: 'monospace',
    background: 'transparent', color: '#64748b', whiteSpace: 'nowrap',
  }
  const btnActive = (accentColor: string): React.CSSProperties => ({
    ...btnBase, background: '#0c1628', color: accentColor, borderColor: accentColor,
  })

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#020810', color: '#e2e8f0',
      display: 'flex', flexDirection: 'column', fontFamily: 'monospace',
      overflow: 'hidden', zIndex: 10,
    }}>
      {/* Top bar */}
      <div style={{
        height: 42, minHeight: 42, display: 'flex', alignItems: 'center',
        gap: 5, padding: '0 8px', borderBottom: '1px solid #0f172a',
        background: '#040c18', overflowX: 'auto', flexShrink: 0,
      }}>
        <span style={{ fontSize: 10, color: '#60a5fa', fontWeight: 'bold', whiteSpace: 'nowrap', marginRight: 4 }}>
          FEDS · SIM
        </span>
        <select
          value={caseId}
          onChange={e => { setCaseId(e.target.value); setSelectedId(null) }}
          style={{ ...btnBase, background: '#0c1628', padding: '2px 4px', fontSize: 8 }}
        >
          {CASES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <div style={{ width: 1, height: 20, background: '#1e293b' }} />
        {(['planetary', 'urban', 'body', 'flow', 'integrated'] as SimMode[]).map(m => (
          <button key={m} onClick={() => { setMode(m); setSelectedId(null) }}
            style={mode === m ? btnActive('#60a5fa') : btnBase}>
            {MODE_LABELS[m]}
          </button>
        ))}
        <div style={{ width: 1, height: 20, background: '#1e293b' }} />
        {(['current', 'freedomReform', 'managerialIntensification'] as ScenarioType[]).map(s => (
          <button key={s} onClick={() => setScenario(s)}
            style={scenario === s ? btnActive(SC_COLORS[s]) : btnBase}>
            {s === 'current' ? 'Current' : s === 'freedomReform' ? 'Reform' : 'Intensif.'}
          </button>
        ))}
        <div style={{ width: 1, height: 20, background: '#1e293b' }} />
        {TH_ALL.map(t => (
          <button key={t} onClick={() => setTh(t)}
            style={th === t ? btnActive('#fbbf24') : btnBase}>
            {TH_LABELS[t]}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button onClick={handleExport} style={{ ...btnBase, color: '#4ade80', borderColor: '#166534' }}>Export</button>
        <button onClick={handleReset} style={{ ...btnBase, color: '#f87171', borderColor: '#7f1d1d' }}>Reset</button>
      </div>

      {/* Main row */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left rail */}
        <div style={{
          width: 176, minWidth: 176, background: '#040c18',
          borderRight: '1px solid #0f172a', overflowY: 'auto',
          padding: '8px 6px', display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          {OVERLAY_GROUPS.map(grp => {
            const active = activeOverlays.has(grp.id)
            return (
              <div key={grp.id}>
                <button onClick={() => toggleOverlay(grp.id)} style={{
                  width: '100%', textAlign: 'left', padding: '4px 6px',
                  background: active ? '#0c1628' : 'transparent',
                  border: `1px solid ${active ? grp.color : '#1e293b'}`,
                  borderRadius: 4, cursor: 'pointer', marginBottom: 3,
                }}>
                  <span style={{ fontSize: 8, color: active ? grp.color : '#64748b', fontWeight: 'bold', fontFamily: 'monospace' }}>
                    {grp.label}
                  </span>
                </button>
                {active && grp.metrics.map(mk => (
                  <div key={mk} style={{ paddingLeft: 8, marginBottom: 2 }}>
                    <span style={{ fontSize: 7, color: '#475569', fontFamily: 'monospace' }}>· {mk}</span>
                  </div>
                ))}
              </div>
            )
          })}
        </div>

        {/* Canvas */}
        <div style={{ flex: 1, overflow: 'hidden', background: '#020810', position: 'relative' }}>
          {mode === 'planetary' && (
            <PlanetaryCanvas metrics={metrics} overlays={activeOverlays} selectedId={selectedId} onSelect={handleSelect} />
          )}
          {mode === 'urban' && (
            <UrbanCanvas scenario={scenario} th={th} overlays={activeOverlays} selectedId={selectedId} onSelect={handleSelect} />
          )}
          {mode === 'body' && (
            <BodyCanvas selectedId={selectedId} onSelect={handleSelect} />
          )}
          {mode === 'flow' && (
            <FlowCanvas metrics={metrics} selectedId={selectedId} onSelect={handleSelect} />
          )}
          {mode === 'integrated' && (
            <IntegratedCanvas metrics={metrics} scenario={scenario} th={th} selectedId={selectedId} onSelect={handleSelect} />
          )}
        </div>

        {/* Right inspector */}
        <div style={{
          width: 256, minWidth: 256, background: '#040c18',
          borderLeft: '1px solid #0f172a', overflowY: 'auto',
        }}>
          <Inspector caseFile={caseFile} mode={mode} scenario={scenario} th={th} metrics={metrics} selectedObj={selectedObj} />
        </div>
      </div>

      {/* Bottom trajectory panel */}
      <div style={{
        height: 110, minHeight: 110, background: '#040c18',
        borderTop: '1px solid #0f172a', overflowX: 'auto', overflowY: 'hidden', flexShrink: 0,
      }}>
        <table style={{ borderCollapse: 'collapse', fontSize: 8, fontFamily: 'monospace', minWidth: 600, width: '100%' }}>
          <thead>
            <tr style={{ height: 18 }}>
              <th style={{
                width: 54, textAlign: 'left', padding: '2px 8px', color: '#334155',
                fontWeight: 'normal', borderBottom: '1px solid #0f172a',
                position: 'sticky', left: 0, background: '#040c18',
              }}>METRIC</th>
              {TH_ALL.map(t => (
                <th key={t} style={{
                  textAlign: 'center', padding: '2px 10px', whiteSpace: 'nowrap',
                  color: th === t ? '#fbbf24' : '#334155',
                  fontWeight: th === t ? 'bold' : 'normal',
                  borderBottom: '1px solid #0f172a',
                }}>
                  {TH_LABELS[t]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TRAJECTORY_METRICS.map(k => (
              <tr key={k} style={{ height: 14 }}>
                <td style={{
                  padding: '1px 8px', color: '#64748b',
                  borderBottom: '1px solid #080f1e',
                  position: 'sticky', left: 0, background: '#040c18',
                }}>
                  {k}
                </td>
                {trajData.map(({ th: t, values }) => {
                  const v = values[k]
                  const c = mc(k, v)
                  return (
                    <td key={t} style={{
                      textAlign: 'center', padding: '1px 10px', color: c,
                      borderBottom: '1px solid #080f1e',
                      background: th === t ? '#080f1e' : 'transparent',
                      fontWeight: th === t ? 'bold' : 'normal',
                    }}>
                      {v.toFixed(0)}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
