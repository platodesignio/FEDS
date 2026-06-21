'use client'

import { useMemo } from 'react'
import { calculateTrajectory, getTimeLabel } from '@/lib/simulation/trajectory'
import type { BaseMetrics, EcoMetrics, ScenarioId, TimeHorizon } from '@/lib/simulation/types'

interface Props {
  baseMetrics: BaseMetrics
  ecoMetrics: EcoMetrics
  scenario: ScenarioId
  timeHorizon: TimeHorizon
  locale: string
}

const SCENARIO_COLORS: Record<ScenarioId, string> = {
  current:    '#fbbf24',
  reform:     '#4ade80',
  managerial: '#ef4444',
}

export default function TrajectoryPanel({ baseMetrics, ecoMetrics, scenario, timeHorizon, locale }: Props) {
  const traj = useMemo(
    () => calculateTrajectory(baseMetrics, ecoMetrics, scenario, 5),
    [baseMetrics, ecoMetrics, scenario]
  )

  const W = 240
  const H = 80
  const pad = 8

  const maxV = 100
  const xStep = (W - pad * 2) / (traj.points.length - 1)
  const yScale = (H - pad * 2) / maxV

  function toPath(values: number[]): string {
    return values.map((v, i) => {
      const x = pad + i * xStep
      const y = H - pad - v * yScale
      return `${i === 0 ? 'M' : 'L'}${x},${y}`
    }).join(' ')
  }

  const fdcrPath  = toPath(traj.points.map((p) => p.fdcr))
  const btrPath   = toPath(traj.points.map((p) => p.btr))
  const eFdcrPath = toPath(traj.points.map((p) => p.eFdcr))

  const color = SCENARIO_COLORS[scenario]
  const trendLabel = traj.trend === 'improving' ? '↑ Improving'
    : traj.trend === 'deteriorating' ? '↓ Deteriorating'
    : '→ Stable'
  const trendColor = traj.trend === 'improving' ? '#4ade80'
    : traj.trend === 'deteriorating' ? '#ef4444'
    : '#fbbf24'

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-[8px] font-mono uppercase tracking-widest text-[#2a5a8a]">Trajectory</div>
        <span className="text-[9px] font-mono" style={{ color: trendColor }}>{trendLabel}</span>
      </div>

      <svg width={W} height={H} className="bg-[#04080e] border border-[#0f1e30]">
        {/* Grid */}
        {[25, 50, 75].map((v) => (
          <line
            key={v}
            x1={pad} y1={H - pad - v * yScale}
            x2={W - pad} y2={H - pad - v * yScale}
            stroke="#0f1e30" strokeWidth={0.5}
          />
        ))}
        {/* BTR (red) */}
        <path d={btrPath} fill="none" stroke="#ef4444" strokeWidth={1} opacity={0.5} />
        {/* E-FDCR (green) */}
        <path d={eFdcrPath} fill="none" stroke="#4ade80" strokeWidth={1} opacity={0.6} />
        {/* FDCR (main) */}
        <path d={fdcrPath} fill="none" stroke={color} strokeWidth={1.5} />
        {/* Current time cursor */}
        <line
          x1={pad + timeHorizon * xStep} y1={pad}
          x2={pad + timeHorizon * xStep} y2={H - pad}
          stroke="#7ac8f8" strokeWidth={0.5} strokeDasharray="2,2"
        />
        {/* Critical threshold marker */}
        {traj.criticalThreshold !== null && (
          <circle
            cx={pad + traj.criticalThreshold * xStep}
            cy={H - pad - (traj.points[traj.criticalThreshold]?.fdcr ?? 50) * yScale}
            r={3} fill="#ef4444" opacity={0.8}
          />
        )}
      </svg>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5" style={{ background: color }} />
          <span className="text-[7px] font-mono text-[#3a6a8a]">FDCR → {traj.finalFDCR}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 bg-[#4ade80]" />
          <span className="text-[7px] font-mono text-[#3a6a8a]">E-FDCR</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 bg-[#ef4444]" />
          <span className="text-[7px] font-mono text-[#3a6a8a]">BTR</span>
        </div>
        {traj.criticalThreshold !== null && (
          <span className="text-[7px] font-mono text-[#ef4444]">
            ⚠ threshold at t={traj.criticalThreshold}
          </span>
        )}
      </div>
    </div>
  )
}
