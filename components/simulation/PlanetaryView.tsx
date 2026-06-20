'use client'

import { useMemo } from 'react'
import { EcoScores } from '@/types/eco'

interface BurdenArc {
  id: string
  label: string
  from: [number, number]  // cx, cy on 800×500 viewport
  to: [number, number]
  magnitude: number       // 0–100
  type: 'climate' | 'supply' | 'labor' | 'waste' | 'data' | 'finance'
}

const REGION_NODES = [
  { id: 'north_america',  label: 'North America',    cx: 160, cy: 155, r: 38 },
  { id: 'europe',         label: 'Europe',            cx: 400, cy: 130, r: 30 },
  { id: 'east_asia',      label: 'East Asia',         cx: 595, cy: 145, r: 36 },
  { id: 'south_asia',     label: 'South Asia',        cx: 545, cy: 210, r: 28 },
  { id: 'southeast_asia', label: 'SE Asia',           cx: 615, cy: 240, r: 22 },
  { id: 'middle_east',    label: 'Middle East',       cx: 465, cy: 195, r: 24 },
  { id: 'africa',         label: 'Africa',            cx: 420, cy: 280, r: 42 },
  { id: 'latin_america',  label: 'Latin America',     cx: 210, cy: 295, r: 36 },
  { id: 'oceania',        label: 'Oceania',           cx: 655, cy: 320, r: 22 },
  { id: 'arctic',         label: 'Arctic',            cx: 400, cy: 52,  r: 18 },
  { id: 'antarctica',     label: 'Antarctica',        cx: 400, cy: 450, r: 18 },
]

const ARC_COLORS: Record<string, string> = {
  climate:  '#ef4444',
  supply:   '#f59e0b',
  labor:    '#8b5cf6',
  waste:    '#6b7280',
  data:     '#3b82f6',
  finance:  '#10b981',
}

function cubicBezierMidpoint(x1: number, y1: number, x2: number, y2: number): [number, number] {
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2
  const dx = x2 - x1; const dy = y2 - y1
  const len = Math.sqrt(dx * dx + dy * dy)
  // Control point perpendicular offset
  const nx = -dy / len * 60; const ny = dx / len * 60
  return [mx + nx, my + ny]
}

function arcPath(from: [number, number], to: [number, number]): string {
  const [cx, cy] = cubicBezierMidpoint(from[0], from[1], to[0], to[1])
  return `M ${from[0]} ${from[1]} Q ${cx} ${cy} ${to[0]} ${to[1]}`
}

interface Props {
  ecoScores?: EcoScores
  metrics?: Record<string, number>
  scenario: 'current' | 'reform' | 'managerial'
  timeHorizon: number  // 0–5 (Immediate to Future Generations)
  activeLayer: string
  t: (k: string) => string
}

export default function PlanetaryView({ ecoScores, metrics, scenario, timeHorizon, activeLayer, t }: Props) {
  const ms = metrics ?? {}

  // Derive burden arc magnitudes from metrics + time horizon
  const timeMultiplier = 1 + timeHorizon * 0.15
  const scenarioMult = scenario === 'reform' ? 0.65 : scenario === 'managerial' ? 1.35 : 1.0

  const arcs: BurdenArc[] = useMemo(() => [
    {
      id: 'climate_north_south', label: 'Climate Displacement',
      from: [160, 155], to: [420, 280],
      magnitude: Math.min(100, (ms.CDR ?? 50) * timeMultiplier * scenarioMult),
      type: 'climate',
    },
    {
      id: 'supply_asia_na', label: 'Supply Chain Flow',
      from: [595, 145], to: [160, 155],
      magnitude: Math.min(100, (ms.SCDR ?? 50) * scenarioMult),
      type: 'supply',
    },
    {
      id: 'rare_metal_africa', label: 'Resource Extraction',
      from: [420, 280], to: [400, 130],
      magnitude: Math.min(100, (ms.CIR ?? 50) * timeMultiplier * scenarioMult),
      type: 'waste',
    },
    {
      id: 'data_burden', label: 'AI / Data Burden',
      from: [160, 155], to: [595, 145],
      magnitude: Math.min(100, (ms.EER ?? 50) * 0.8 * scenarioMult),
      type: 'data',
    },
    {
      id: 'labor_south_asia', label: 'Labor Extraction',
      from: [545, 210], to: [400, 130],
      magnitude: Math.min(100, (ms.ILBR ?? 50) * scenarioMult),
      type: 'labor',
    },
    {
      id: 'waste_latam', label: 'Waste Displacement',
      from: [400, 130], to: [210, 295],
      magnitude: Math.min(100, (ms.BTR ?? 50) * 0.7 * timeMultiplier * scenarioMult),
      type: 'waste',
    },
    {
      id: 'finance_flow', label: 'Finance Flow',
      from: [160, 155], to: [400, 130],
      magnitude: Math.min(100, (ms.FMR ?? 50) * 0.6 * scenarioMult),
      type: 'finance',
    },
  ], [ms, timeMultiplier, scenarioMult])

  // Layer-filtered region color
  function regionColor(node: typeof REGION_NODES[0]): string {
    if (activeLayer === 'E-FDCR' || activeLayer === 'EBDCR') {
      // Mock: higher latitude = more ecological capacity
      const latProxy = 1 - node.cy / 500
      const score = 30 + latProxy * 40 + (ms.EGR ?? 50) * 0.3
      if (score > 65) return '#15803d'
      if (score > 45) return '#d97706'
      return '#b91c1c'
    }
    if (activeLayer === 'BTR') {
      const isSource = ['north_america', 'europe', 'east_asia'].includes(node.id)
      return isSource ? '#15803d' : '#b91c1c'
    }
    return '#1a3a5c'
  }

  function regionOpacity(node: typeof REGION_NODES[0]): number {
    if (activeLayer === 'FDCR') {
      return node.id === 'arctic' || node.id === 'antarctica' ? 0.3 : 0.7
    }
    return 0.65
  }

  const efdcr = ecoScores?.['E-FDCR'] ?? null
  const ebdcr = ecoScores?.EBDCR ?? null
  const epbtm = ecoScores?.['EP-BTM'] ?? null

  return (
    <div className="space-y-3">
      {/* Indicators row */}
      <div className="grid grid-cols-3 gap-px bg-[#2a3a4a] border border-[#2a3a4a]">
        {[
          { label: 'E-FDCR', value: efdcr, desc: 'Eco Freedom-Evolution Rate' },
          { label: 'EBDCR',  value: ebdcr, desc: 'Eco Bio-Div Correctness' },
          { label: 'EP-BTM', value: epbtm, desc: 'Eco-Planetary Burden Transfer' },
        ].map(({ label, value, desc }) => (
          <div key={label} className="bg-[#0f1923] p-3">
            <div className="text-[9px] font-mono uppercase tracking-widest text-[#4a7fa5]">{label}</div>
            <div
              className="font-mono text-2xl font-bold leading-none"
              style={{ color: value === null ? '#4a7fa5' : value >= 60 ? '#4ade80' : value >= 40 ? '#fbbf24' : '#f87171' }}
            >
              {value === null ? '—' : Math.round(value)}
            </div>
            <div className="text-[9px] text-[#4a7fa5] mt-0.5">{desc}</div>
          </div>
        ))}
      </div>

      {/* SVG Globe */}
      <div className="relative bg-[#0a1520] border border-[#1e3a5a] overflow-hidden">
        <div className="absolute top-2 left-3 text-[9px] font-mono text-[#2a5a8a] uppercase tracking-widest">
          Planetary Burden Transfer View — {scenario.toUpperCase()} — T+{timeHorizon === 0 ? 'Immediate' : timeHorizon === 1 ? '1yr' : timeHorizon === 2 ? '5yr' : timeHorizon === 3 ? '10yr' : timeHorizon === 4 ? '25yr' : 'FutureGen'}
        </div>

        <svg viewBox="0 0 800 500" className="w-full" style={{ height: 380 }}>
          {/* Ocean background */}
          <rect x="0" y="0" width="800" height="500" fill="#0a1520" />

          {/* Grid lines (latitude/longitude proxy) */}
          {[1,2,3,4].map((i) => (
            <line key={`h${i}`} x1="20" y1={i*100} x2="780" y2={i*100} stroke="#0f2030" strokeWidth="0.5" />
          ))}
          {[1,2,3,4,5,6,7].map((i) => (
            <line key={`v${i}`} x1={i*100+20} y1="20" x2={i*100+20} y2="480" stroke="#0f2030" strokeWidth="0.5" />
          ))}

          {/* Globe outline */}
          <ellipse cx="400" cy="250" rx="370" ry="230" fill="none" stroke="#0e2535" strokeWidth="1" />

          {/* Burden arcs */}
          <defs>
            {Object.entries(ARC_COLORS).map(([type, color]) => (
              <marker key={type} id={`arrow-${type}`} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0,0 L0,6 L6,3 z" fill={color} opacity="0.8" />
              </marker>
            ))}
            {arcs.map((arc) => (
              <filter key={`glow-${arc.id}`} id={`glow-${arc.id}`}>
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            ))}
          </defs>

          {arcs.map((arc) => {
            const opacity = arc.magnitude / 100 * 0.85 + 0.1
            const strokeW = 0.5 + arc.magnitude / 100 * 3.5
            const color = ARC_COLORS[arc.type]
            if (opacity < 0.2) return null
            return (
              <g key={arc.id}>
                <path
                  d={arcPath(arc.from, arc.to)}
                  fill="none"
                  stroke={color}
                  strokeWidth={strokeW}
                  opacity={opacity}
                  strokeDasharray={arc.type === 'data' ? '4 3' : undefined}
                  markerEnd={`url(#arrow-${arc.type})`}
                />
              </g>
            )
          })}

          {/* Region nodes */}
          {REGION_NODES.map((node) => (
            <g key={node.id}>
              <circle
                cx={node.cx} cy={node.cy} r={node.r}
                fill={regionColor(node)} opacity={regionOpacity(node)}
                stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.2"
              />
              <text
                x={node.cx} y={node.cy + node.r + 11}
                textAnchor="middle" fontSize="9" fill="#7aa8c8" fontFamily="monospace"
              >
                {node.label}
              </text>
            </g>
          ))}

          {/* Ecological risk zones */}
          {(ms.CDR ?? 50) > 60 && (
            <ellipse cx="400" cy="52" rx="60" ry="20" fill="#ef4444" opacity="0.15" />
          )}
          {(ms.EER ?? 50) > 60 && (
            <ellipse cx="420" cy="280" rx="55" ry="30" fill="#f59e0b" opacity="0.12" />
          )}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-2 left-3 flex flex-wrap gap-3">
          {Object.entries(ARC_COLORS).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1">
              <div className="w-4 h-0.5" style={{ background: color }} />
              <span className="text-[8px] font-mono" style={{ color }}>{type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Eco corrections */}
      {ecoScores && ecoScores.ecoCorrections.length > 0 && (
        <div className="border border-[#2a3a2a] bg-[#0f1a0f] p-3 space-y-1">
          <div className="text-[9px] font-mono uppercase tracking-widest text-[#4a8a4a]">Ecological Corrections</div>
          {ecoScores.ecoCorrections.map((c, i) => (
            <div key={i} className="text-[10px] font-mono text-[#6aaa6a]">▸ {c}</div>
          ))}
        </div>
      )}
    </div>
  )
}
