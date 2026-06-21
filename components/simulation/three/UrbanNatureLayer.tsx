'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Box, Html } from '@react-three/drei'
import * as THREE from 'three'
import { useSimulationStore } from '@/lib/simulation/simulationStore'
import { URBAN_DISTRICTS } from '@/lib/simulation/mockData'
import type { InspectorData } from '@/lib/simulation/types'

const GRID_COLS = 8
const GRID_ROWS = 6
const CELL_SIZE = 0.8
const GAP = 0.05

function fdcrToColor(v: number, alpha = 1): string {
  const r = v < 50 ? 255 : Math.round(255 * (1 - (v - 50) / 50))
  const g = v > 50 ? 255 : Math.round(255 * (v / 50))
  return `rgba(${r},${g},60,${alpha})`
}

interface Props {
  metrics: Record<string, number>
  scenario: string
}

export default function UrbanNatureLayer({ metrics, scenario }: Props) {
  const groupRef = useRef<THREE.Group>(null)
  const { openInspector } = useSimulationStore()

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x, -0.35, delta * 0.5
      )
    }
  })

  const cells = Array.from({ length: GRID_ROWS * GRID_COLS }, (_, i) => {
    const col = i % GRID_COLS
    const row = Math.floor(i / GRID_COLS)
    const dist = Math.sqrt((col - 3.5) ** 2 + (row - 2.5) ** 2)
    const baseValue = Math.max(5, Math.min(95, 70 - dist * 12 + Math.random() * 15))
    const scenarioAdj = scenario === 'reform' ? 10 : scenario === 'managerial' ? -15 : 0
    const value = Math.max(5, Math.min(95, baseValue + scenarioAdj))
    const height = 0.05 + (value / 100) * 1.2
    const district = URBAN_DISTRICTS[i % URBAN_DISTRICTS.length]
    return { col, row, value, height, district }
  })

  const handleClick = (cell: typeof cells[0]) => {
    const data: InspectorData = {
      id: `urban_${cell.col}_${cell.row}`,
      label: cell.district.label,
      labelJa: cell.district.labelJa,
      metrics: {
        FDCR:  cell.value,
        BGR:   metrics.BGR ?? 50,
        CFR:   100 - cell.value,
        BTR:   metrics.BTR ?? 50,
        'E-FDCR': cell.value * 0.9,
      },
      description: `${cell.district.label}: District FDCR proxy ${Math.round(cell.value)}. Spatial classification risk inversely correlates with freedom density.`,
      descriptionJa: `${cell.district.labelJa}：地区FDCR代理値 ${Math.round(cell.value)}。空間分類リスクは自由密度と逆相関する。`,
      layer: 'urban_nature',
    }
    openInspector(data)
  }

  const w = GRID_COLS * (CELL_SIZE + GAP)
  const d = GRID_ROWS * (CELL_SIZE + GAP)

  return (
    <group ref={groupRef}>
      {cells.map((cell, i) => {
        const x = (cell.col - GRID_COLS / 2 + 0.5) * (CELL_SIZE + GAP)
        const z = (cell.row - GRID_ROWS / 2 + 0.5) * (CELL_SIZE + GAP)
        const hue = cell.value < 50
          ? `hsl(${cell.value * 2.4},80%,45%)`
          : `hsl(${100 + cell.value},70%,40%)`
        return (
          <group key={i} position={[x, cell.height / 2 - 0.5, z]}>
            <Box
              args={[CELL_SIZE, cell.height, CELL_SIZE]}
              onClick={() => handleClick(cell)}
            >
              <meshStandardMaterial
                color={hue}
                emissive={hue}
                emissiveIntensity={0.2}
                roughness={0.6}
                metalness={0.3}
              />
            </Box>
          </group>
        )
      })}

      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial color="#060e18" roughness={1} />
      </mesh>

      {/* District labels for prominent nodes */}
      {URBAN_DISTRICTS.slice(0, 4).map((d, i) => {
        const x = (d.x + 0.5) * (CELL_SIZE + GAP) * 2
        const z = (d.y + 0.5) * (CELL_SIZE + GAP) * 2
        return (
          <Html key={i} position={[x, 1.5, z]} distanceFactor={6} style={{ pointerEvents: 'none' }}>
            <div style={{ color: '#7ac8f8', fontSize: '8px', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
              {d.label}
            </div>
          </Html>
        )
      })}
    </group>
  )
}
