'use client'

import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import { useSimulationStore } from '@/lib/simulation/simulationStore'
import PlanetaryLayer from './PlanetaryLayer'
import UrbanNatureLayer from './UrbanNatureLayer'
import BodyLifeworldLayer from './BodyLifeworldLayer'
import InstitutionalFlowLayer from './InstitutionalFlowLayer'
import type { BaseMetrics, EcoMetrics, ScenarioId, TimeHorizon } from '@/lib/simulation/types'

interface Props {
  baseMetrics: BaseMetrics
  ecoMetrics: EcoMetrics
  scenario: ScenarioId
  timeHorizon: TimeHorizon
  activeOverlays: Set<string>
}

const LAYER_CAMERA: Record<string, [number, number, number]> = {
  planetary:           [0, 0, 5.5],
  urban_nature:        [0, 5, 7],
  body_lifeworld:      [0, 0, 6],
  institutional_flow:  [0, 0, 6],
}

const LAYER_FOV: Record<string, number> = {
  planetary:           50,
  urban_nature:        45,
  body_lifeworld:      52,
  institutional_flow:  52,
}

export default function SimulationTheater({ baseMetrics, ecoMetrics, scenario, timeHorizon, activeOverlays }: Props) {
  const { activeLayer, animating } = useSimulationStore()
  const camPos = LAYER_CAMERA[activeLayer] ?? [0, 0, 5.5]
  const fov    = LAYER_FOV[activeLayer] ?? 50

  return (
    <Canvas
      camera={{ position: camPos, fov }}
      style={{ background: '#04080e', width: '100%', height: '100%' }}
      gl={{ antialias: true, alpha: false }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.25} />
        <directionalLight position={[5, 5, 5]}   intensity={0.7}  color="#7ac8f8" />
        <directionalLight position={[-5, -3, -5]} intensity={0.15} color="#2a4a7a" />
        <pointLight       position={[0, 0, 0]}    intensity={0.1}  color="#1e3a5a" />

        <Stars radius={80} depth={40} count={4000} factor={2.5} fade speed={animating ? 0.4 : 0} />

        {activeLayer === 'planetary' && (
          <PlanetaryLayer
            metrics={baseMetrics}
            ecoMetrics={ecoMetrics}
            overlays={activeOverlays}
            scenario={scenario}
            timeHorizon={timeHorizon}
          />
        )}
        {activeLayer === 'urban_nature' && (
          <UrbanNatureLayer
            metrics={baseMetrics}
            scenario={scenario}
            overlays={activeOverlays}
          />
        )}
        {activeLayer === 'body_lifeworld' && (
          <BodyLifeworldLayer
            metrics={baseMetrics}
            overlays={activeOverlays}
          />
        )}
        {activeLayer === 'institutional_flow' && (
          <InstitutionalFlowLayer
            metrics={baseMetrics}
            scenario={scenario}
            overlays={activeOverlays}
          />
        )}

        <OrbitControls
          enableDamping
          dampingFactor={0.06}
          minDistance={2}
          maxDistance={14}
          autoRotate={false}
        />
      </Suspense>
    </Canvas>
  )
}
