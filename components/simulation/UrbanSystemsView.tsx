'use client'

import { useState, useMemo } from 'react'

const LAYERS = [
  { id: 'FDCR',        label: 'FDCR',              color: (v: number) => v > 65 ? '#4ade80' : v > 45 ? '#fbbf24' : '#f87171' },
  { id: 'BGR',         label: 'Bodily Generation', color: (v: number) => v > 65 ? '#4ade80' : v > 45 ? '#fbbf24' : '#f87171' },
  { id: 'RCI',         label: 'Re-entry Capacity', color: (v: number) => v > 65 ? '#4ade80' : v > 45 ? '#fbbf24' : '#f87171' },
  { id: 'MSJR',        label: 'Managerial SJR',    color: (v: number) => v > 65 ? '#f87171' : v > 45 ? '#fbbf24' : '#4ade80' },
  { id: 'CFR',         label: 'Classification Fix',color: (v: number) => v > 65 ? '#f87171' : v > 45 ? '#fbbf24' : '#4ade80' },
  { id: 'BTR',         label: 'Burden Transfer',   color: (v: number) => v > 65 ? '#f87171' : v > 45 ? '#fbbf24' : '#4ade80' },
  { id: 'E-FDCR',      label: 'E-FDCR Eco',        color: (v: number) => v > 65 ? '#4ade80' : v > 45 ? '#fbbf24' : '#f87171' },
  { id: 'BODILY',      label: 'Urban Bodily Burden',color: (v: number) => v > 65 ? '#f87171' : v > 45 ? '#fbbf24' : '#4ade80' },
  { id: 'SPATIAL_CFR', label: 'Spatial Classification', color: (v: number) => v > 65 ? '#f87171' : v > 45 ? '#fbbf24' : '#4ade80' },
]

// 8×6 city block grid — each block has type, district, and metric scores
const CITY_BLOCKS = Array.from({ length: 48 }, (_, i) => {
  const col = i % 8; const row = Math.floor(i / 8)
  const types = ['residential', 'commercial', 'industrial', 'public', 'green', 'infrastructure', 'surveillance', 'welfare']
  const districts = ['CBD', 'CBD', 'Inner', 'Inner', 'Inner', 'Middle', 'Middle', 'Outer']
  return {
    id: i, col, row, type: types[col % types.length],
    district: districts[col],
    // Base values — will be modulated by metrics
    baseScore: 30 + Math.sin(i * 0.7) * 20 + Math.cos(i * 0.4) * 15,
    surveillanceDensity: col < 3 ? 70 + row * 3 : 30 + row * 5,
    publicSpaceAccess: col > 4 ? 65 + row * 2 : 40 - row * 4,
    heatBurden: row > 3 ? 70 + col * 3 : 35 + col * 4,
    welfareAccess: col > 5 || row > 4 ? 55 : 35,
  }
})

const BLOCK_TYPE_ICONS: Record<string, string> = {
  residential: '⌂', commercial: '▪', industrial: '▣', public: '◈',
  green: '◉', infrastructure: '▲', surveillance: '◆', welfare: '✦',
}

interface Props {
  metrics?: Record<string, number>
  ecoMetrics?: Record<string, number>  // includes E-FDCR, EBDCR
  scenario: 'current' | 'reform' | 'managerial'
  timeHorizon: number
  t: (k: string) => string
}

export default function UrbanSystemsView({ metrics, ecoMetrics, scenario, timeHorizon, t }: Props) {
  const [activeLayer, setActiveLayer] = useState('FDCR')
  const [hoveredBlock, setHoveredBlock] = useState<number | null>(null)
  const ms = metrics ?? {}
  const eco = ecoMetrics ?? {}

  const scenarioMult = scenario === 'reform' ? 0.75 : scenario === 'managerial' ? 1.25 : 1.0
  const timePenalty = timeHorizon * 0.05

  const layerDef = LAYERS.find((l) => l.id === activeLayer) ?? LAYERS[0]

  const blockValues = useMemo(() =>
    CITY_BLOCKS.map((b) => {
      let v: number
      switch (activeLayer) {
        case 'FDCR':        v = b.baseScore + (ms.CFCS ?? 50) * 0.3 - timePenalty * 20; break
        case 'BGR':         v = b.publicSpaceAccess * 0.6 + (ms.BGR ?? 50) * 0.4; break
        case 'RCI':         v = b.welfareAccess * 0.5 + (ms.RCI ?? 50) * 0.5 - (b.row > 3 ? 10 : 0); break
        case 'MSJR':        v = b.surveillanceDensity * 0.5 + (ms.MSJR ?? 50) * 0.5 * scenarioMult; break
        case 'CFR':         v = (b.surveillanceDensity * 0.4 + (ms.CFR ?? 50) * 0.6) * scenarioMult; break
        case 'BTR':         v = (b.col < 2 ? 70 : 40) * 0.5 + (ms.BTR ?? 50) * 0.5 * scenarioMult; break
        case 'E-FDCR':      v = (eco['E-FDCR'] ?? 50) + b.publicSpaceAccess * 0.2 - b.heatBurden * 0.1; break
        case 'BODILY':      v = b.heatBurden * 0.5 + (ms.BBI ?? 50) * 0.5 * scenarioMult; break
        case 'SPATIAL_CFR': v = b.surveillanceDensity * 0.6 + (ms.CFR ?? 50) * 0.4 * scenarioMult; break
        default:            v = b.baseScore
      }
      return Math.max(0, Math.min(100, v))
    }), [activeLayer, ms, eco, scenarioMult, timePenalty])

  const hovered = hoveredBlock !== null ? CITY_BLOCKS[hoveredBlock] : null
  const hoveredVal = hoveredBlock !== null ? blockValues[hoveredBlock] : null

  return (
    <div className="space-y-3">
      {/* Layer selector */}
      <div className="flex flex-wrap gap-1">
        {LAYERS.map((l) => (
          <button
            key={l.id}
            onClick={() => setActiveLayer(l.id)}
            className={`text-[9px] font-mono px-2 py-1 border transition-colors ${
              activeLayer === l.id
                ? 'border-[#4a8abb] bg-[#0f2535] text-[#7ac8f8]'
                : 'border-[#1e3a5a] text-[#3a6a8a] hover:border-[#3a6a8a] hover:text-[#5a9aba]'
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>

      {/* City grid */}
      <div className="relative bg-[#080e18] border border-[#1e3a5a] p-3">
        <div className="text-[9px] font-mono text-[#2a5a8a] uppercase tracking-widest mb-2">
          Urban Systems — {layerDef.label} — {scenario.toUpperCase()} — T+{['Now','1yr','5yr','10yr','25yr','Future'][timeHorizon]}
        </div>

        <div className="grid gap-0.5" style={{ gridTemplateColumns: 'repeat(8, 1fr)' }}>
          {CITY_BLOCKS.map((b, i) => {
            const v = blockValues[i]
            const color = layerDef.color(v)
            const isHovered = hoveredBlock === i
            return (
              <div
                key={b.id}
                onMouseEnter={() => setHoveredBlock(i)}
                onMouseLeave={() => setHoveredBlock(null)}
                className="relative cursor-pointer transition-all"
                style={{
                  aspectRatio: '1',
                  background: `${color}${Math.round(15 + v * 0.5).toString(16).padStart(2,'0')}`,
                  border: isHovered ? `1px solid ${color}` : '1px solid #0a1520',
                  opacity: isHovered ? 1 : 0.75,
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <span style={{ fontSize: 10, color, opacity: 0.6 }}>
                    {BLOCK_TYPE_ICONS[b.type]}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Hover tooltip */}
        {hovered && hoveredVal !== null && (
          <div className="absolute top-2 right-2 bg-[#0a1520] border border-[#1e3a5a] p-2 text-[9px] font-mono space-y-0.5 min-w-[120px]">
            <div className="text-[#4a8abb] uppercase tracking-widest">Block {hovered.id}</div>
            <div className="text-[#7ac8f8]">{hovered.district} / {hovered.type}</div>
            <div className="text-[#4a8abb]">{layerDef.label}</div>
            <div className="text-white font-bold text-sm">{Math.round(hoveredVal)}</div>
            <div className="text-[#3a6a8a] mt-1">Surveillance: {Math.round(hovered.surveillanceDensity)}</div>
            <div className="text-[#3a6a8a]">Public space: {Math.round(hovered.publicSpaceAccess)}</div>
            <div className="text-[#3a6a8a]">Heat burden: {Math.round(hovered.heatBurden)}</div>
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center gap-1">
            <div className="w-20 h-2 rounded-none" style={{ background: 'linear-gradient(to right, #f87171, #fbbf24, #4ade80)' }} />
            <span className="text-[8px] font-mono text-[#3a6a8a]">Low → High</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(BLOCK_TYPE_ICONS).slice(0,4).map(([type, icon]) => (
              <span key={type} className="text-[8px] font-mono text-[#3a6a8a]">{icon} {type}</span>
            ))}
          </div>
        </div>
      </div>

      {/* District summary */}
      <div className="grid grid-cols-4 gap-px bg-[#1e3a5a] border border-[#1e3a5a]">
        {['CBD', 'Inner', 'Middle', 'Outer'].map((district) => {
          const districtBlocks = CITY_BLOCKS.filter((b) => b.district === district)
          const avgVal = districtBlocks.reduce((s, b) => s + blockValues[b.id], 0) / districtBlocks.length
          const color = layerDef.color(avgVal)
          return (
            <div key={district} className="bg-[#080e18] p-2 space-y-0.5">
              <div className="text-[8px] font-mono text-[#3a6a8a] uppercase">{district}</div>
              <div className="font-mono text-lg font-bold" style={{ color }}>{Math.round(avgVal)}</div>
              <div className="text-[8px] font-mono" style={{ color }}>{layerDef.label}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
