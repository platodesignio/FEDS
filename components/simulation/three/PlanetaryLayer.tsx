'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sphere, Line, Html } from '@react-three/drei'
import * as THREE from 'three'
import { useSimulationStore } from '@/lib/simulation/simulationStore'
import { PLANETARY_REGIONS, PLANETARY_BURDEN_ARCS } from '@/lib/simulation/mockData'
import type { InspectorData } from '@/lib/simulation/types'

function latLonToXYZ(lat: number, lon: number, r: number): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)
  return [
    -r * Math.sin(phi) * Math.cos(theta),
     r * Math.cos(phi),
     r * Math.sin(phi) * Math.sin(theta),
  ]
}

function scoreToColor(value: number): string {
  if (value >= 60) return '#4ade80'
  if (value >= 45) return '#fbbf24'
  if (value >= 30) return '#f97316'
  return '#ef4444'
}

interface Props {
  metrics: Record<string, number>
  ecoMetrics: Record<string, number>
}

export default function PlanetaryLayer({ metrics, ecoMetrics }: Props) {
  const globeRef = useRef<THREE.Mesh>(null)
  const { openInspector } = useSimulationStore()

  useFrame((_, delta) => {
    if (globeRef.current) {
      globeRef.current.rotation.y += delta * 0.05
    }
  })

  const regionPositions = useMemo(() =>
    PLANETARY_REGIONS.map((r) => ({
      ...r,
      pos: latLonToXYZ(r.y, r.x, 2.15),
    })),
    []
  )

  const arcPoints = useMemo(() => {
    return PLANETARY_BURDEN_ARCS.map((arc) => {
      const fromR = PLANETARY_REGIONS.find((r) => r.id === arc.from)!
      const toR   = PLANETARY_REGIONS.find((r) => r.id === arc.to)!
      const p0 = new THREE.Vector3(...latLonToXYZ(fromR.y, fromR.x, 2.15))
      const p1 = new THREE.Vector3(...latLonToXYZ(toR.y,   toR.x,   2.15))
      const mid = p0.clone().add(p1).multiplyScalar(0.5).normalize().multiplyScalar(3.0)
      const curve = new THREE.QuadraticBezierCurve3(p0, mid, p1)
      return { arc, points: curve.getPoints(40) }
    })
  }, [])

  const handleRegionClick = (region: typeof PLANETARY_REGIONS[0]) => {
    const data: InspectorData = {
      id: region.id,
      label: region.label,
      labelJa: region.labelJa,
      metrics: {
        'E-FDCR': ecoMetrics['E-FDCR'] ?? region.value,
        FDCR:  metrics.FDCR  ?? 50,
        BTR:   metrics.BTR   ?? 50,
        'EP-BTM': ecoMetrics['EP-BTM'] ?? 50,
        EBDCR: ecoMetrics.EBDCR ?? 50,
      },
      description: `${region.label}: FDCR regional proxy ${region.value}. Burden reception and ecological pressure vary by time horizon and scenario.`,
      descriptionJa: `${region.labelJa}：FDCR地域代理値 ${region.value}。負担受容と生態的圧力はシナリオ・時間軸により変動。`,
      layer: 'planetary',
    }
    openInspector(data)
  }

  return (
    <group>
      {/* Globe */}
      <mesh ref={globeRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial
          color="#0a1830"
          roughness={0.8}
          metalness={0.1}
          transparent
          opacity={0.9}
          wireframe={false}
        />
      </mesh>

      {/* Grid lines */}
      <mesh>
        <sphereGeometry args={[2.01, 32, 16]} />
        <meshBasicMaterial color="#0f2540" wireframe transparent opacity={0.15} />
      </mesh>

      {/* Region nodes */}
      {regionPositions.map((r) => (
        <group key={r.id} position={r.pos}>
          <Sphere args={[0.08, 16, 16]} onClick={() => handleRegionClick(r)}>
            <meshStandardMaterial
              color={scoreToColor(r.value)}
              emissive={scoreToColor(r.value)}
              emissiveIntensity={0.6}
            />
          </Sphere>
          <Html distanceFactor={8} style={{ pointerEvents: 'none' }}>
            <div style={{
              color: scoreToColor(r.value),
              fontSize: '9px',
              fontFamily: 'monospace',
              whiteSpace: 'nowrap',
              textShadow: '0 0 4px #000',
            }}>
              {r.id} {r.value}
            </div>
          </Html>
        </group>
      ))}

      {/* Burden arcs */}
      {arcPoints.map(({ arc, points }, i) => (
        <Line
          key={i}
          points={points}
          color="#ef4444"
          lineWidth={arc.weight * 1.5}
          transparent
          opacity={0.4}
        />
      ))}

      {/* Atmosphere glow */}
      <mesh>
        <sphereGeometry args={[2.3, 32, 32]} />
        <meshBasicMaterial
          color="#0a3a6a"
          transparent
          opacity={0.08}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  )
}
