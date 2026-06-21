'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sphere, Line, Html } from '@react-three/drei'
import * as THREE from 'three'
import { useSimulationStore } from '@/lib/simulation/simulationStore'
import { BODY_NODES, BODY_EDGES } from '@/lib/simulation/mockData'
import { INSPECTOR_PRESETS } from '@/lib/simulation/mockData'
import type { InspectorData } from '@/lib/simulation/types'

const NODE_COLORS: Record<string, string> = {
  actor:       '#7ac8f8',
  zone:        '#4ade80',
  barrier:     '#ef4444',
  institution: '#fbbf24',
  gateway:     '#a78bfa',
}

const EDGE_COLORS: Record<string, string> = {
  freedom: '#4ade80',
  burden:  '#ef4444',
  barrier: '#f97316',
  neutral: '#3a6a8a',
}

export default function BodyLifeworldLayer({ metrics }: { metrics: Record<string, number> }) {
  const groupRef = useRef<THREE.Group>(null)
  const { openInspector } = useSimulationStore()

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.08
    }
  })

  const edgeLines = BODY_EDGES.map((edge) => {
    const from = BODY_NODES.find((n) => n.id === edge.from)!
    const to   = BODY_NODES.find((n) => n.id === edge.to)!
    return {
      edge,
      points: [
        new THREE.Vector3(from.x * 1.5, from.y * 1.5, from.z),
        new THREE.Vector3(to.x   * 1.5, to.y   * 1.5, to.z),
      ],
    }
  })

  const handleNodeClick = (node: typeof BODY_NODES[0]) => {
    const preset = INSPECTOR_PRESETS[node.id]
    const data: InspectorData = preset
      ? { ...preset, layer: 'body_lifeworld' }
      : {
          id: node.id,
          label: node.label,
          labelJa: node.labelJa,
          metrics: { FDCR: node.value, BGR: metrics.BGR ?? 50, BTR: metrics.BTR ?? 50 },
          description: `${node.label}: Lifeworld node with FDCR proxy ${node.value}. Part of the body-lifeworld dialectical field.`,
          descriptionJa: `${node.labelJa}：FDCR代理値 ${node.value} の生活世界ノード。身体-生活世界の弁証法的場の一部。`,
          layer: 'body_lifeworld',
        }
    openInspector(data)
  }

  return (
    <group ref={groupRef}>
      {/* Edge lines */}
      {edgeLines.map(({ edge, points }, i) => (
        <Line
          key={i}
          points={points}
          color={EDGE_COLORS[edge.type]}
          lineWidth={edge.weight * 2}
          transparent
          opacity={0.5}
        />
      ))}

      {/* Nodes */}
      {BODY_NODES.map((node) => {
        const color = NODE_COLORS[node.type] ?? '#7ac8f8'
        const size  = node.type === 'actor' ? 0.18 : node.type === 'barrier' ? 0.14 : 0.10
        return (
          <group key={node.id} position={[node.x * 1.5, node.y * 1.5, node.z]}>
            <Sphere args={[size, 16, 16]} onClick={() => handleNodeClick(node)}>
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={node.type === 'barrier' ? 0.8 : 0.4}
                roughness={0.3}
              />
            </Sphere>
            <Html distanceFactor={6} style={{ pointerEvents: 'none' }}>
              <div style={{
                color,
                fontSize: '8px',
                fontFamily: 'monospace',
                whiteSpace: 'nowrap',
                textShadow: '0 0 3px #000',
              }}>
                {node.label}
              </div>
            </Html>
          </group>
        )
      })}

      {/* Central field indicator */}
      <mesh>
        <torusGeometry args={[1.8, 0.01, 8, 64]} />
        <meshBasicMaterial color="#0f2540" transparent opacity={0.4} />
      </mesh>
    </group>
  )
}
