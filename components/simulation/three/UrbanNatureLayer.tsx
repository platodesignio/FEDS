'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Box, Sphere, Html } from '@react-three/drei'
import * as THREE from 'three'
import { useSimulationStore } from '@/lib/simulation/simulationStore'
import { URBAN_DISTRICTS, URBAN_SPECIAL_NODES, GREEN_CORRIDOR_CELLS, getUrbanCellValue } from '@/lib/simulation/mockData'
import type { InspectorData } from '@/lib/simulation/types'
import type { BaseMetrics, ScenarioId } from '@/lib/simulation/types'

const GRID_COLS = 8
const GRID_ROWS = 6
const CELL_SIZE = 0.75
const GAP = 0.06

const SPECIAL_COLORS: Record<string, string> = {
  hospital:    '#34d399',
  school:      '#60a5fa',
  welfare:     '#a78bfa',
  reentry:     '#fbbf24',
  surveillance:'#ef4444',
}

const SPECIAL_ICONS: Record<string, string> = {
  hospital:    'H',
  school:      'S',
  welfare:     'W',
  reentry:     'R',
  surveillance:'⬡',
}

interface Props {
  metrics: BaseMetrics
  scenario: ScenarioId
  overlays: Set<string>
}

export default function UrbanNatureLayer({ metrics, scenario, overlays }: Props) {
  const groupRef = useRef<THREE.Group>(null)
  const { openInspector } = useSimulationStore()

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x, -0.4, delta * 0.4
      )
    }
  })

  const cells = useMemo(() => Array.from({ length: GRID_ROWS * GRID_COLS }, (_, i) => {
    const col  = i % GRID_COLS
    const row  = Math.floor(i / GRID_COLS)
    const value   = getUrbanCellValue(col, row, scenario)
    const height  = 0.06 + (value / 100) * 1.4
    const isGreen = GREEN_CORRIDOR_CELLS.has(i)
    const distFromCenter = Math.sqrt((col - 3.5) ** 2 + (row - 2.5) ** 2)
    // Surveillance intensity: higher near centre and industrial edges
    const survIntensity = Math.max(0, 0.8 - distFromCenter * 0.1 + (col < 2 ? 0.2 : 0))
    const district = URBAN_DISTRICTS[i % URBAN_DISTRICTS.length]
    return { col, row, value, height, isGreen, survIntensity, district, idx: i }
  }), [scenario])

  const specialMap = useMemo(() => {
    const m: Record<string, typeof URBAN_SPECIAL_NODES[0]> = {}
    URBAN_SPECIAL_NODES.forEach((n) => {
      m[`${n.col}_${n.row}`] = n
    })
    return m
  }, [])

  const handleClick = (cell: typeof cells[0]) => {
    const special = specialMap[`${cell.col}_${cell.row}`]
    const data: InspectorData = {
      id: `urban_${cell.col}_${cell.row}`,
      label: special ? special.label : cell.district.label,
      labelJa: cell.district.labelJa,
      metrics: {
        FDCR:     cell.value,
        BGR:      metrics.BGR ?? 42,
        CFR:      Math.max(5, 100 - cell.value),
        BTR:      metrics.BTR ?? 58,
        'E-FDCR': cell.value * 0.88,
        MSJR:     special?.type === 'surveillance' ? 78 : 45,
        RBR:      special?.type === 'reentry' ? 65 : 40,
      },
      description: special
        ? getSpecialNodeDesc(special.type, cell.value)
        : `${cell.district.label}: Urban district FDCR proxy ${Math.round(cell.value)}. Spatial classification risk inversely correlates with freedom density.`,
      descriptionJa: `${cell.district.labelJa}：地区FDCR代理値 ${Math.round(cell.value)}。`,
      layer: 'urban_nature',
    }
    openInspector(data)
  }

  const w = GRID_COLS * (CELL_SIZE + GAP)
  const d = GRID_ROWS * (CELL_SIZE + GAP)

  return (
    <group ref={groupRef}>
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[w + 0.4, d + 0.4]} />
        <meshStandardMaterial color="#040c14" roughness={1} />
      </mesh>

      {/* Grid lines on ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.49, 0]}>
        <planeGeometry args={[w + 0.4, d + 0.4]} />
        <meshBasicMaterial color="#0d2040" wireframe transparent opacity={0.3} />
      </mesh>

      {/* City blocks */}
      {cells.map((cell, i) => {
        const x = (cell.col - GRID_COLS / 2 + 0.5) * (CELL_SIZE + GAP)
        const z = (cell.row - GRID_ROWS / 2 + 0.5) * (CELL_SIZE + GAP)

        // Color logic: green corridor is always green; otherwise FDCR-based
        let color: string
        if (cell.isGreen) {
          color = '#1a5a2a'
        } else {
          const v = cell.value
          if (v >= 65) color = '#1a4a2a'         // high FDCR: dark green
          else if (v >= 50) color = '#2a3a1a'    // medium: olive
          else if (v >= 35) color = '#3a2a10'    // low: dark amber
          else color = '#3a1010'                  // very low: dark red
        }

        // Emissive: hotter for low FDCR (burden) or high surveillance
        const emissiveColor = cell.isGreen
          ? '#0a3a15'
          : cell.value < 40
            ? '#3a0a0a'
            : '#0a1a0a'

        const special = specialMap[`${cell.col}_${cell.row}`]

        return (
          <group key={i} position={[x, cell.height / 2 - 0.5, z]}>
            <Box
              args={[CELL_SIZE, cell.height, CELL_SIZE]}
              onClick={() => handleClick(cell)}
            >
              <meshStandardMaterial
                color={color}
                emissive={emissiveColor}
                emissiveIntensity={0.4}
                roughness={0.5}
                metalness={0.2}
              />
            </Box>

            {/* Surveillance overlay: red top on surveillance cells */}
            {overlays.has('spatial_class') && cell.survIntensity > 0.5 && !cell.isGreen && (
              <Box args={[CELL_SIZE * 0.6, 0.04, CELL_SIZE * 0.6]} position={[0, cell.height / 2 + 0.02, 0]}>
                <meshBasicMaterial color="#ef4444" transparent opacity={cell.survIntensity * 0.6} />
              </Box>
            )}

            {/* Heat burden overlay */}
            {overlays.has('urban_body') && cell.value < 40 && (
              <Box args={[CELL_SIZE * 0.8, 0.03, CELL_SIZE * 0.8]} position={[0, cell.height / 2 + 0.04, 0]}>
                <meshBasicMaterial color="#f97316" transparent opacity={0.4} />
              </Box>
            )}

            {/* Special node marker */}
            {special && (
              <>
                <Sphere args={[0.12, 12, 12]} position={[0, cell.height / 2 + 0.18, 0]}>
                  <meshStandardMaterial
                    color={SPECIAL_COLORS[special.type]}
                    emissive={SPECIAL_COLORS[special.type]}
                    emissiveIntensity={0.9}
                  />
                </Sphere>
                <Html position={[0, cell.height / 2 + 0.45, 0]} distanceFactor={5} style={{ pointerEvents: 'none' }}>
                  <div style={{
                    color: SPECIAL_COLORS[special.type],
                    fontSize: '7px',
                    fontFamily: 'monospace',
                    whiteSpace: 'nowrap',
                    textShadow: '0 0 4px #000',
                  }}>
                    {SPECIAL_ICONS[special.type]} {special.label}
                  </div>
                </Html>
              </>
            )}
          </group>
        )
      })}

      {/* Green corridor labels */}
      {overlays.has('EFDCR') && (
        <Html position={[3.2, 1.5, 0]} distanceFactor={5} style={{ pointerEvents: 'none' }}>
          <div style={{ color: '#4ade80', fontSize: '7px', fontFamily: 'monospace', opacity: 0.85 }}>
            Green Corridor
          </div>
        </Html>
      )}
    </group>
  )
}

function getSpecialNodeDesc(type: string, fdcr: number): string {
  const map: Record<string, string> = {
    hospital:    `Urban hospital node. Health access correlates with local FDCR=${Math.round(fdcr)}. Under-resourced in low-FDCR districts.`,
    school:      `Public school node. Educational access as freedom-generative resource. Spatial classification affects admission pathways.`,
    welfare:     `Welfare distribution centre. Re-entry support function. Classification risk for recipients: high.`,
    reentry:     `Re-entry administrative office. Success rate inversely correlated with prior AI classification score. FDCR=${Math.round(fdcr)}.`,
    surveillance:`Surveillance data collection node. Feeds classification pipeline. Subject access to data: none. Appeal mechanism: absent.`,
  }
  return map[type] || `Special urban node. FDCR proxy ${Math.round(fdcr)}.`
}
