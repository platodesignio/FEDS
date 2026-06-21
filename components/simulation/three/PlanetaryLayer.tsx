'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sphere, Line, Html } from '@react-three/drei'
import * as THREE from 'three'
import { useSimulationStore } from '@/lib/simulation/simulationStore'
import {
  PLANETARY_REGIONS,
  PLANETARY_BURDEN_ARCS,
  EXTRACTION_ZONES,
  DISPLACEMENT_ZONES,
  COMPUTE_NODES,
} from '@/lib/simulation/mockData'
import type { InspectorData } from '@/lib/simulation/types'
import type { BaseMetrics, EcoMetrics, ScenarioId, TimeHorizon } from '@/lib/simulation/types'

function latLonToXYZ(lat: number, lon: number, r: number): [number, number, number] {
  const phi   = (90 - lat)  * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)
  return [
    -r * Math.sin(phi) * Math.cos(theta),
     r * Math.cos(phi),
     r * Math.sin(phi) * Math.sin(theta),
  ]
}

function latLonToVec3(lat: number, lon: number, r: number): THREE.Vector3 {
  return new THREE.Vector3(...latLonToXYZ(lat, lon, r))
}

function scoreToColor(value: number): string {
  if (value >= 60) return '#4ade80'
  if (value >= 45) return '#fbbf24'
  if (value >= 30) return '#f97316'
  return '#ef4444'
}

interface Props {
  metrics: BaseMetrics
  ecoMetrics: EcoMetrics
  overlays: Set<string>
  scenario: ScenarioId
  timeHorizon: TimeHorizon
}

export default function PlanetaryLayer({ metrics, ecoMetrics, overlays, scenario, timeHorizon }: Props) {
  const globeRef   = useRef<THREE.Mesh>(null)
  const flowRef    = useRef<number>(0)
  const { openInspector } = useSimulationStore()

  useFrame((_, delta) => {
    if (globeRef.current) {
      globeRef.current.rotation.y += delta * 0.04
    }
    flowRef.current += delta
  })

  // Scale FDCR values by scenario + time
  const scenarioMod = scenario === 'reform' ? 8 : scenario === 'managerial' ? -10 : 0
  const timeMod = timeHorizon * (scenario === 'reform' ? 2 : scenario === 'managerial' ? -2 : -0.5)

  const regionPositions = useMemo(() =>
    PLANETARY_REGIONS.map((r) => ({
      ...r,
      pos: latLonToXYZ(r.y, r.x, 2.18),
      adjustedValue: Math.max(5, Math.min(95, r.value + scenarioMod + timeMod)),
    })),
    [scenarioMod, timeMod]
  )

  const burdenArcs = useMemo(() => {
    return PLANETARY_BURDEN_ARCS.map((arc) => {
      const fromR = PLANETARY_REGIONS.find((r) => r.id === arc.from)!
      const toR   = PLANETARY_REGIONS.find((r) => r.id === arc.to)!
      const p0 = latLonToVec3(fromR.y, fromR.x, 2.18)
      const p1 = latLonToVec3(toR.y,   toR.x,   2.18)
      const mid = p0.clone().add(p1).multiplyScalar(0.5).normalize().multiplyScalar(3.2)
      const curve = new THREE.QuadraticBezierCurve3(p0, mid, p1)
      return { arc, points: curve.getPoints(50) }
    })
  }, [])

  const extractionPositions = useMemo(() =>
    EXTRACTION_ZONES.map((z) => ({ ...z, pos: latLonToXYZ(z.lat, z.lon, 2.22) })),
    []
  )

  const displacementPositions = useMemo(() =>
    DISPLACEMENT_ZONES.map((z) => ({ ...z, pos: latLonToXYZ(z.lat, z.lon, 2.20) })),
    []
  )

  const computePositions = useMemo(() =>
    COMPUTE_NODES.map((n) => ({ ...n, pos: latLonToXYZ(n.lat, n.lon, 2.22) })),
    []
  )

  // Flow lines: animated arcs for data/resource flows
  const flowArcs = useMemo(() => {
    const flows = [
      { from: { lat: 37, lon: -122 }, to: { lat: -3, lon: 23 },  color: '#a78bfa', label: 'AI data extraction' },
      { from: { lat: 53, lon: 10  }, to: { lat: 14, lon: 5   },  color: '#f97316', label: 'Carbon displacement' },
      { from: { lat: 35, lon: 110 }, to: { lat: -8, lon: 178 },  color: '#ef4444', label: 'Climate burden' },
    ]
    return flows.map((f) => {
      const p0 = latLonToVec3(f.from.lat, f.from.lon, 2.18)
      const p1 = latLonToVec3(f.to.lat,   f.to.lon,   2.18)
      const mid = p0.clone().add(p1).multiplyScalar(0.5).normalize().multiplyScalar(3.5)
      const curve = new THREE.QuadraticBezierCurve3(p0, mid, p1)
      return { ...f, points: curve.getPoints(60) }
    })
  }, [])

  const handleRegionClick = (region: typeof PLANETARY_REGIONS[0] & { adjustedValue: number }) => {
    const preset = { NA: 'NA', AF: 'AF' }[region.id]
    if (preset) {
      openInspector({
        id: region.id,
        label: region.label,
        labelJa: region.labelJa,
        metrics: {
          'E-FDCR': ecoMetrics['E-FDCR'] ?? region.value,
          FDCR:     region.adjustedValue,
          BTR:      metrics.BTR   ?? 50,
          'EP-BTM': ecoMetrics['EP-BTM'] ?? 50,
          EBDCR:    ecoMetrics.EBDCR ?? 50,
        },
        description: getRegionDescription(region.id, region.adjustedValue),
        descriptionJa: `${region.labelJa}：地域FDCR代理値 ${Math.round(region.adjustedValue)}。`,
        layer: 'planetary',
      })
    } else {
      openInspector({
        id: region.id,
        label: region.label,
        labelJa: region.labelJa,
        metrics: {
          'E-FDCR': Math.max(5, ecoMetrics['E-FDCR'] - (70 - region.adjustedValue) * 0.3),
          FDCR:      region.adjustedValue,
          BTR:       Math.max(10, 85 - region.adjustedValue),
          'EP-BTM':  Math.min(95, 90 - region.adjustedValue),
          EBDCR:     Math.max(10, ecoMetrics.EBDCR - (60 - region.adjustedValue) * 0.2),
        },
        description: getRegionDescription(region.id, region.adjustedValue),
        descriptionJa: `${region.labelJa}：地域FDCR代理値 ${Math.round(region.adjustedValue)}。`,
        layer: 'planetary',
      })
    }
  }

  return (
    <group>
      {/* Globe core */}
      <mesh ref={globeRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial
          color="#060e1c"
          roughness={0.9}
          metalness={0.05}
          transparent
          opacity={0.95}
        />
      </mesh>

      {/* Grid overlay */}
      <mesh>
        <sphereGeometry args={[2.01, 36, 18]} />
        <meshBasicMaterial color="#0d2040" wireframe transparent opacity={0.12} />
      </mesh>

      {/* Atmosphere inner glow */}
      <mesh>
        <sphereGeometry args={[2.28, 32, 32]} />
        <meshBasicMaterial color="#0a2850" transparent opacity={0.06} side={THREE.BackSide} />
      </mesh>

      {/* Atmosphere outer */}
      <mesh>
        <sphereGeometry args={[2.45, 32, 32]} />
        <meshBasicMaterial color="#061a40" transparent opacity={0.03} side={THREE.BackSide} />
      </mesh>

      {/* Burden arcs */}
      {burdenArcs.map(({ arc, points }, i) => (
        <Line
          key={`burden-${i}`}
          points={points}
          color="#ef4444"
          lineWidth={arc.weight * 2.5}
          transparent
          opacity={0.55}
        />
      ))}

      {/* Flow arcs (AI/resource flows) */}
      {overlays.has('eco_extract') && flowArcs.map((f, i) => (
        <Line
          key={`flow-${i}`}
          points={f.points}
          color={f.color}
          lineWidth={1.2}
          transparent
          opacity={0.35}
          dashed
          dashSize={0.08}
          gapSize={0.06}
        />
      ))}

      {/* Extraction zones */}
      {overlays.has('eco_extract') && extractionPositions.map((z) => (
        <group key={z.id} position={z.pos}>
          <Sphere args={[0.055, 12, 12]}>
            <meshStandardMaterial color="#f97316" emissive="#f97316" emissiveIntensity={1.0} />
          </Sphere>
          <Html distanceFactor={9} style={{ pointerEvents: 'none' }}>
            <div style={{ color: '#f97316', fontSize: '7px', fontFamily: 'monospace', whiteSpace: 'nowrap', textShadow: '0 0 4px #000', opacity: 0.85 }}>
              ⬡ {z.label}
            </div>
          </Html>
        </group>
      ))}

      {/* Climate displacement zones */}
      {DISPLACEMENT_ZONES && displacementPositions.map((z) => (
        <group key={z.id} position={z.pos}>
          <Sphere args={[0.04, 10, 10]}>
            <meshStandardMaterial color="#60a5fa" emissive="#60a5fa" emissiveIntensity={0.8} transparent opacity={0.7} />
          </Sphere>
          <Html distanceFactor={9} style={{ pointerEvents: 'none' }}>
            <div style={{ color: '#60a5fa', fontSize: '6px', fontFamily: 'monospace', whiteSpace: 'nowrap', textShadow: '0 0 4px #000', opacity: 0.75 }}>
              ◈ {z.label}
            </div>
          </Html>
        </group>
      ))}

      {/* AI compute nodes */}
      {overlays.has('FDCR') && computePositions.map((n) => (
        <group key={n.id} position={n.pos}>
          <Sphere args={[0.045, 10, 10]}>
            <meshStandardMaterial color="#a78bfa" emissive="#a78bfa" emissiveIntensity={0.9} />
          </Sphere>
          <Html distanceFactor={9} style={{ pointerEvents: 'none' }}>
            <div style={{ color: '#a78bfa', fontSize: '6px', fontFamily: 'monospace', whiteSpace: 'nowrap', textShadow: '0 0 4px #000', opacity: 0.8 }}>
              ◈ {n.label}
            </div>
          </Html>
        </group>
      ))}

      {/* Region nodes */}
      {regionPositions.map((r) => {
        const color = scoreToColor(r.adjustedValue)
        const size  = 0.065 + (r.adjustedValue / 100) * 0.065
        return (
          <group key={r.id} position={r.pos}>
            <Sphere args={[size, 16, 16]} onClick={() => handleRegionClick(r)}>
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.7}
                roughness={0.2}
              />
            </Sphere>
            <Html distanceFactor={7} style={{ pointerEvents: 'none' }}>
              <div style={{
                color,
                fontSize: '8px',
                fontFamily: 'monospace',
                whiteSpace: 'nowrap',
                textShadow: '0 0 5px #000',
                fontWeight: 700,
              }}>
                {r.id} {Math.round(r.adjustedValue)}
              </div>
            </Html>
          </group>
        )
      })}
    </group>
  )
}

function getRegionDescription(id: string, value: number): string {
  const map: Record<string, string> = {
    NA: `North America FDCR=${Math.round(value)}. Highest formal FDCR, but largest AI compute exporter. Carbon and extraction burden transferred south.`,
    EU: `Europe FDCR=${Math.round(value)}. Moderate freedom scores with significant colonial burden legacy. Climate finance commitments partially offset EP-BTM.`,
    AS: `Asia-Pacific FDCR=${Math.round(value)}. High heterogeneity. Manufacturing burden, surveillance infrastructure density, and climate vulnerability.`,
    LA: `Latin America FDCR=${Math.round(value)}. Receives extraction burden from North. Democratic correction mechanisms partially operational.`,
    AF: `Africa FDCR=${Math.round(value)}. Highest EP-BTM burden reception globally. Ecological extraction and climate displacement at critical levels.`,
    ME: `Middle East FDCR=${Math.round(value)}. Petroleum extraction zone, classification risk high. Democratic review mechanisms constrained.`,
    SA: `South Asia FDCR=${Math.round(value)}. Dense population, high climate vulnerability, significant AI classification burden from Northern systems.`,
  }
  return map[id] || `FDCR regional proxy ${Math.round(value)}.`
}
