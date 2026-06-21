'use client'

import { useSimulationStore } from '@/lib/simulation/simulationStore'

const METRIC_LABELS: Record<string, string> = {
  FDCR:      'Freedom Dialectical Correctness Rate',
  'E-FDCR':  'Ecological Freedom-Evolution Rate',
  BTR:       'Burden Transfer Risk',
  MSJR:      'Managerial Self-Justification Risk',
  CFR:       'Classification Fixation Risk',
  RBR:       'Re-entry Blockage Risk',
  BGR:       'Bodily Generation Rate',
  EBDCR:     'Eco Bio-Divisional Correctness Rate',
  'EP-BTM':  'Eco-Planetary Burden Transfer Matrix',
  DER:       'Dialectical Efficacy Rate',
}

function metricColor(key: string, value: number): string {
  const isRisk = ['BTR','MSJR','CFR','RBR','EP-BTM'].includes(key)
  if (isRisk) return value > 65 ? '#ef4444' : value > 45 ? '#fbbf24' : '#4ade80'
  return value > 60 ? '#4ade80' : value > 40 ? '#fbbf24' : '#ef4444'
}

export default function SimulationInspector({ locale }: { locale: string }) {
  const { inspectorOpen, inspectorData, closeInspector } = useSimulationStore()

  if (!inspectorOpen || !inspectorData) return null

  return (
    <div
      className="absolute top-4 right-4 w-72 bg-[#060c14] border border-[#1e3a5a] p-4 space-y-3 z-50"
      style={{ backdropFilter: 'blur(8px)' }}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-[8px] font-mono uppercase tracking-widest text-[#2a5a8a]">
            Inspector — {inspectorData.layer.replace(/_/g, ' ')}
          </div>
          <h3 className="text-sm font-bold text-[#7ac8f8] leading-tight mt-0.5">
            {locale === 'ja' ? inspectorData.labelJa : inspectorData.label}
          </h3>
        </div>
        <button
          onClick={closeInspector}
          className="text-[#2a5a8a] hover:text-[#7ac8f8] text-xs font-mono shrink-0 mt-0.5"
        >
          ✕
        </button>
      </div>

      <div className="space-y-1.5">
        {Object.entries(inspectorData.metrics).map(([key, value]) => {
          const color = metricColor(key, value)
          return (
            <div key={key} className="space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-[8px] font-mono text-[#3a6a8a]">{key}</span>
                <span className="text-[9px] font-mono font-bold" style={{ color }}>
                  {Math.round(value)}
                </span>
              </div>
              <div className="h-0.5 bg-[#0f1a2a]">
                <div
                  className="h-0.5 transition-all"
                  style={{ width: `${value}%`, background: color }}
                />
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-[9px] text-[#3a6a8a] leading-relaxed border-t border-[#1e3a5a] pt-2">
        {locale === 'ja' ? inspectorData.descriptionJa : inspectorData.description}
      </p>

      <div className="text-[8px] font-mono text-[#1e3a5a]">
        Click any node in the simulation to inspect
      </div>
    </div>
  )
}
