'use client'

import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars, Environment } from '@react-three/drei'
import { useSimulationStore } from '@/lib/simulation/simulationStore'
import PlanetaryLayer from './PlanetaryLayer'
import UrbanNatureLayer from './UrbanNatureLayer'
import BodyLifeworldLayer from './BodyLifeworldLayer'
import InstitutionalFlowLayer from './InstitutionalFlowLayer'
import SimulationInspector from './SimulationInspector'
import TrajectoryPanel from './TrajectoryPanel'
import type { BaseMetrics, EcoMetrics, ScenarioId, TimeHorizon } from '@/lib/simulation/types'

interface Props {
  baseMetrics: BaseMetrics
  ecoMetrics: EcoMetrics
  scenario: ScenarioId
  timeHorizon: TimeHorizon
  locale: string
}

const LAYER_CAMERA: Record<string, [number, number, number]> = {
  planetary:         [0, 0, 5],
  urban_nature:      [0, 4, 6],
  body_lifeworld:    [0, 0, 5],
  institutional_flow:[0, 0, 5],
}

export default function SimulationTheater({ baseMetrics, ecoMetrics, scenario, timeHorizon, locale }: Props) {
  const { activeLayer, setActiveLayer, setScenario, setTimeHorizon, animating, setAnimating } = useSimulationStore()

  const camPos = LAYER_CAMERA[activeLayer] ?? [0, 0, 5]

  const LAYERS: { id: string; label: string; labelJa: string }[] = [
    { id: 'planetary',          label: 'Planetary',        labelJa: '惑星' },
    { id: 'urban_nature',       label: 'Urban-Nature',     labelJa: '都市-自然' },
    { id: 'body_lifeworld',     label: 'Body-Lifeworld',   labelJa: '身体-生活世界' },
    { id: 'institutional_flow', label: 'Institutional Flow', labelJa: '制度フロー' },
  ]

  const SCENARIOS: { id: ScenarioId; label: string; labelJa: string; color: string }[] = [
    { id: 'current',    label: 'A — Current',          labelJa: 'A — 現在',           color: '#fbbf24' },
    { id: 'reform',     label: 'B — Freedom Reform',   labelJa: 'B — 自由改革',       color: '#4ade80' },
    { id: 'managerial', label: 'C — Managerial Int.',  labelJa: 'C — 管理的強化',     color: '#ef4444' },
  ]

  const TIME_LABELS = ['Now', '1yr', '5yr', '10yr', '25yr', 'Gen+']
  const TIME_LABELS_JA = ['今', '1年', '5年', '10年', '25年', '将来']
  const timeLabelArr = locale === 'ja' ? TIME_LABELS_JA : TIME_LABELS

  return (
    <div className="relative w-full" style={{ height: '520px' }}>
      {/* Layer selector */}
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-1">
        {LAYERS.map((l) => (
          <button
            key={l.id}
            onClick={() => setActiveLayer(l.id as any)}
            className={`text-[8px] font-mono px-2 py-1 border transition-colors text-left ${
              activeLayer === l.id
                ? 'border-[#4a8abb] bg-[#0f2535] text-[#7ac8f8]'
                : 'border-[#1e3a5a] bg-[#04080e]/80 text-[#2a5a8a] hover:text-[#5a9aba]'
            }`}
          >
            {locale === 'ja' ? l.labelJa : l.label}
          </button>
        ))}
      </div>

      {/* Scenario selector */}
      <div className="absolute bottom-3 left-3 z-20 flex flex-col gap-1">
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            onClick={() => setScenario(s.id)}
            className={`text-[8px] font-mono px-2 py-1 border transition-colors text-left ${
              scenario === s.id
                ? 'border-[#4a8abb] bg-[#0f2535]'
                : 'border-[#1e3a5a] bg-[#04080e]/80 text-[#2a5a8a] hover:text-[#5a9aba]'
            }`}
            style={{ color: scenario === s.id ? s.color : undefined }}
          >
            {locale === 'ja' ? s.labelJa : s.label}
          </button>
        ))}
      </div>

      {/* Time horizon */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1">
        <div className="text-[7px] font-mono text-[#2a5a8a] uppercase tracking-widest">
          T = {timeLabelArr[timeHorizon]}
        </div>
        <input
          type="range" min={0} max={5} step={1}
          value={timeHorizon}
          onChange={(e) => setTimeHorizon(Number(e.target.value) as TimeHorizon)}
          className="w-40 accent-[#4a8abb]"
        />
        <div className="flex gap-1">
          {timeLabelArr.map((l, i) => (
            <span key={i} className="text-[6px] font-mono" style={{ color: i === timeHorizon ? '#7ac8f8' : '#1e3a5a' }}>{l}</span>
          ))}
        </div>
      </div>

      {/* Trajectory mini-panel */}
      <div className="absolute top-3 right-3 z-20 w-64">
        <SimulationInspector locale={locale} />
      </div>

      {/* Bottom right trajectory */}
      <div className="absolute bottom-3 right-3 z-20 w-64 bg-[#04080e]/90 border border-[#1e3a5a] p-2">
        <TrajectoryPanel
          baseMetrics={baseMetrics}
          ecoMetrics={ecoMetrics}
          scenario={scenario}
          timeHorizon={timeHorizon}
          locale={locale}
        />
      </div>

      {/* Animate toggle */}
      <button
        onClick={() => setAnimating(!animating)}
        className="absolute top-3 left-1/2 -translate-x-1/2 z-20 text-[7px] font-mono border border-[#1e3a5a] bg-[#04080e]/80 px-2 py-1 text-[#2a5a8a] hover:text-[#7ac8f8] hover:border-[#4a8abb] transition-colors"
      >
        {animating ? '⏸ Pause' : '▶ Animate'}
      </button>

      {/* R3F Canvas */}
      <Canvas
        camera={{ position: camPos, fov: 50 }}
        style={{ background: '#04080e' }}
        gl={{ antialias: true, alpha: false }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.3} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} color="#7ac8f8" />
          <pointLight position={[-5, -5, -5]} intensity={0.3} color="#4a8abb" />

          <Stars radius={60} depth={30} count={3000} factor={2} fade speed={animating ? 0.5 : 0} />

          {activeLayer === 'planetary' && (
            <PlanetaryLayer metrics={baseMetrics as any} ecoMetrics={ecoMetrics as any} />
          )}
          {activeLayer === 'urban_nature' && (
            <UrbanNatureLayer metrics={baseMetrics as any} scenario={scenario} />
          )}
          {activeLayer === 'body_lifeworld' && (
            <BodyLifeworldLayer metrics={baseMetrics as any} />
          )}
          {activeLayer === 'institutional_flow' && (
            <InstitutionalFlowLayer metrics={baseMetrics as any} />
          )}

          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            minDistance={2}
            maxDistance={12}
            autoRotate={false}
          />
          <Environment preset="night" />
        </Suspense>
      </Canvas>
    </div>
  )
}
