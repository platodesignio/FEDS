'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Box, Sphere, Line, Html } from '@react-three/drei'
import * as THREE from 'three'
import { useSimulationStore } from '@/lib/simulation/simulationStore'
import { FLOW_NODES, FLOW_EDGES, INSPECTOR_PRESETS } from '@/lib/simulation/mockData'
import type { InspectorData } from '@/lib/simulation/types'

const NODE_COLORS: Record<string, string> = {
  gateway:     '#a78bfa',
  institution: '#fbbf24',
  barrier:     '#ef4444',
  actor:       '#7ac8f8',
}

const EDGE_COLORS: Record<string, string> = {
  freedom: '#4ade80',
  burden:  '#ef4444',
  barrier: '#f97316',
  neutral: '#4a7a9a',
}

export default function InstitutionalFlowLayer({ metrics }: { metrics: Record<string, number> }) {
  const pulseRef = useRef(0)
  const { openInspector } = useSimulationStore()

  useFrame((_, delta) => {
    pulseRef.current += delta
  })

  const edgeLines = FLOW_EDGES.map((edge) => {
    const from = FLOW_NODES.find((n) => n.id === edge.from)!
    const to   = FLOW_NODES.find((n) => n.id === edge.to)!
    const p0 = new THREE.Vector3(from.x * 1.4, from.y * 1.2, 0)
    const p1 = new THREE.Vector3(to.x   * 1.4, to.y   * 1.2, 0)
    const mid = new THREE.Vector3(
      (from.x + to.x) * 0.7 + (Math.random() - 0.5) * 0.2,
      (from.y + to.y) * 0.6,
      0
    )
    const curve = new THREE.QuadraticBezierCurve3(p0, mid, p1)
    return { edge, points: curve.getPoints(20) }
  })

  const handleNodeClick = (node: typeof FLOW_NODES[0]) => {
    const preset = INSPECTOR_PRESETS[node.id]
    const data: InspectorData = preset
      ? { ...preset, layer: 'institutional_flow' }
      : {
          id: node.id,
          label: node.label,
          labelJa: node.labelJa,
          metrics: { FDCR: 50, CFR: node.type === 'barrier' ? 70 : 30, RBR: node.type === 'barrier' ? 65 : 20 },
          description: `${node.label}: Institutional node in the classification and appeal flow.`,
          descriptionJa: `${node.labelJa}：分類・異議申し立てフローにおける制度的ノード。`,
          layer: 'institutional_flow',
        }
    openInspector(data)
  }

  return (
    <group>
      {/* Flow edges */}
      {edgeLines.map(({ edge, points }, i) => (
        <Line
          key={i}
          points={points}
          color={EDGE_COLORS[edge.type]}
          lineWidth={edge.weight * 2.5}
          transparent
          opacity={0.6}
          dashed={edge.type === 'barrier'}
          dashSize={0.1}
          gapSize={0.05}
        />
      ))}

      {/* Nodes */}
      {FLOW_NODES.map((node) => {
        const color = NODE_COLORS[node.type] ?? '#7ac8f8'
        const pos: [number, number, number] = [node.x * 1.4, node.y * 1.2, 0]
        const isBarrier = node.type === 'barrier'
        return (
          <group key={node.id} position={pos} onClick={() => handleNodeClick(node)}>
            {isBarrier ? (
              <Box args={[0.22, 0.22, 0.22]}>
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} roughness={0.2} />
              </Box>
            ) : (
              <Sphere args={[0.13, 16, 16]}>
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} roughness={0.4} />
              </Sphere>
            )}
            <Html distanceFactor={6} style={{ pointerEvents: 'none' }}>
              <div style={{
                color,
                fontSize: '7px',
                fontFamily: 'monospace',
                whiteSpace: 'nowrap',
                textShadow: '0 0 3px #000',
                maxWidth: '80px',
                lineHeight: 1.2,
              }}>
                {node.label}
              </div>
            </Html>
          </group>
        )
      })}
    </group>
  )
}
