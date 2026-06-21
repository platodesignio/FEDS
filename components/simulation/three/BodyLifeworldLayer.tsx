'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sphere, Line, Html, Torus } from '@react-three/drei'
import * as THREE from 'three'
import { useSimulationStore } from '@/lib/simulation/simulationStore'
import { BODY_NODES, BODY_EDGES, INSPECTOR_PRESETS } from '@/lib/simulation/mockData'
import type { InspectorData } from '@/lib/simulation/types'
import type { BaseMetrics } from '@/lib/simulation/types'

const NODE_COLORS: Record<string, string> = {
  actor:       '#7ac8f8',
  zone:        '#4a8abb',
  barrier:     '#ef4444',
  institution: '#fbbf24',
  gateway:     '#a78bfa',
}

const EDGE_COLORS: Record<string, string> = {
  freedom: '#4ade80',
  burden:  '#ef4444',
  barrier: '#f97316',
  neutral: '#2a5a8a',
}

// Node-specific overrides for visual identity
const NODE_STYLE: Record<string, { color: string; emissive: number; size: number }> = {
  BL_SUBJECT:  { color: '#7ac8f8', emissive: 0.6, size: 0.22 },
  BL_SLEEP:    { color: '#4a7a9a', emissive: 0.3, size: 0.13 },
  BL_COMMUTE:  { color: '#6a5a3a', emissive: 0.3, size: 0.11 },
  BL_WORK:     { color: '#3a6a8a', emissive: 0.4, size: 0.14 },
  BL_CARE:     { color: '#5a4a8a', emissive: 0.4, size: 0.13 },
  BL_HEALTH:   { color: '#2a7a6a', emissive: 0.4, size: 0.12 },
  BL_WAIT:     { color: '#5a3a1a', emissive: 0.5, size: 0.10 },
  BL_APPEAL:   { color: '#4ade80', emissive: 0.5, size: 0.11 },
  BL_SURV:     { color: '#ef4444', emissive: 0.9, size: 0.17 },
  BL_CLASS:    { color: '#f97316', emissive: 0.8, size: 0.16 },
  BL_FREE:     { color: '#4ade80', emissive: 0.7, size: 0.15 },
  BL_RECOV:    { color: '#34d399', emissive: 0.5, size: 0.10 },
}

interface Props {
  metrics: BaseMetrics
  overlays: Set<string>
}

export default function BodyLifeworldLayer({ metrics, overlays }: Props) {
  const groupRef    = useRef<THREE.Group>(null)
  const pulseRef    = useRef(0)
  const { openInspector } = useSimulationStore()

  useFrame((_, delta) => {
    pulseRef.current += delta
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.03
    }
  })

  const edgeLines = useMemo(() =>
    BODY_EDGES.map((edge) => {
      const from = BODY_NODES.find((n) => n.id === edge.from)!
      const to   = BODY_NODES.find((n) => n.id === edge.to)!
      // Slight curve via midpoint offset
      const p0 = new THREE.Vector3(from.x * 1.3, from.y * 1.3, from.z)
      const p1 = new THREE.Vector3(to.x   * 1.3, to.y   * 1.3, to.z)
      const mid = p0.clone().add(p1).multiplyScalar(0.5)
      mid.x += (Math.sin(from.x + to.x) * 0.15)
      mid.y += (Math.cos(from.y + to.y) * 0.15)
      const curve = new THREE.QuadraticBezierCurve3(p0, mid, p1)
      return { edge, points: curve.getPoints(24) }
    }),
    []
  )

  const handleNodeClick = (node: typeof BODY_NODES[0]) => {
    const preset = INSPECTOR_PRESETS[node.id]
    const data: InspectorData = preset
      ? { ...preset, layer: 'body_lifeworld' }
      : {
          id:           node.id,
          label:        node.label,
          labelJa:      node.labelJa,
          metrics: {
            FDCR:  node.value,
            BGR:   metrics.BGR  ?? 42,
            BTR:   node.type === 'barrier' ? 70 : 35,
            RBR:   node.type === 'barrier' ? 65 : 25,
            MSJR:  node.type === 'barrier' ? 68 : 30,
          },
          description:   getBodyNodeDesc(node.id, node.value),
          descriptionJa: `${node.labelJa}：身体-生活世界ノード、FDCR代理値 ${node.value}。`,
          layer: 'body_lifeworld',
        }
    openInspector(data)
  }

  return (
    <group ref={groupRef}>
      {/* Field boundary rings */}
      <Torus args={[2.0, 0.008, 8, 80]} rotation={[0, 0, 0]}>
        <meshBasicMaterial color="#0f2540" transparent opacity={0.35} />
      </Torus>
      <Torus args={[1.0, 0.005, 8, 80]} rotation={[0, 0, 0]}>
        <meshBasicMaterial color="#0f2540" transparent opacity={0.2} />
      </Torus>

      {/* Axis guides */}
      <Line points={[[-2.4, 0, 0], [2.4, 0, 0]]} color="#0d2040" lineWidth={0.5} transparent opacity={0.3} />
      <Line points={[[0, -2.8, 0], [0, 2.2, 0]]} color="#0d2040" lineWidth={0.5} transparent opacity={0.3} />

      {/* Freedom / Burden zone indicators */}
      <Html position={[0, 2.4, 0]} distanceFactor={6} style={{ pointerEvents: 'none' }}>
        <div style={{ color: '#4ade80', fontSize: '7px', fontFamily: 'monospace', textShadow: '0 0 4px #000' }}>↑ reproduction / health</div>
      </Html>
      <Html position={[0, -2.8, 0]} distanceFactor={6} style={{ pointerEvents: 'none' }}>
        <div style={{ color: '#ef4444', fontSize: '7px', fontFamily: 'monospace', textShadow: '0 0 4px #000' }}>↓ classification / exclusion</div>
      </Html>
      <Html position={[-2.6, 0, 0]} distanceFactor={6} style={{ pointerEvents: 'none' }}>
        <div style={{ color: '#3a6a8a', fontSize: '7px', fontFamily: 'monospace', textShadow: '0 0 4px #000' }}>← work / institutional</div>
      </Html>
      <Html position={[2.3, 0, 0]} distanceFactor={6} style={{ pointerEvents: 'none' }}>
        <div style={{ color: '#3a6a8a', fontSize: '7px', fontFamily: 'monospace', textShadow: '0 0 4px #000' }}>→ recovery / appeal</div>
      </Html>

      {/* Edges */}
      {edgeLines.map(({ edge, points }, i) => (
        <Line
          key={i}
          points={points}
          color={EDGE_COLORS[edge.type]}
          lineWidth={edge.weight * 2.2}
          transparent
          opacity={0.5}
          dashed={edge.type === 'barrier'}
          dashSize={0.08}
          gapSize={0.06}
        />
      ))}

      {/* Nodes */}
      {BODY_NODES.map((node) => {
        const style = NODE_STYLE[node.id] ?? { color: '#4a8abb', emissive: 0.4, size: 0.10 }
        const pos: [number, number, number] = [node.x * 1.3, node.y * 1.3, node.z]
        const isBarrier = node.type === 'barrier'

        return (
          <group key={node.id} position={pos}>
            {/* Barrier glow ring */}
            {isBarrier && (
              <Torus args={[style.size + 0.08, 0.01, 6, 32]}>
                <meshBasicMaterial color={style.color} transparent opacity={0.4} />
              </Torus>
            )}

            <Sphere
              args={[style.size, 20, 20]}
              onClick={() => handleNodeClick(node)}
            >
              <meshStandardMaterial
                color={style.color}
                emissive={style.color}
                emissiveIntensity={style.emissive}
                roughness={isBarrier ? 0.1 : 0.4}
                metalness={isBarrier ? 0.4 : 0.1}
              />
            </Sphere>

            <Html distanceFactor={5.5} style={{ pointerEvents: 'none' }}>
              <div style={{
                color: style.color,
                fontSize: node.type === 'actor' ? '9px' : '7px',
                fontFamily: 'monospace',
                whiteSpace: 'nowrap',
                textShadow: '0 0 4px #000',
                fontWeight: node.type === 'actor' ? 700 : 400,
              }}>
                {node.label}
              </div>
            </Html>
          </group>
        )
      })}

      {/* Burden flow indicator (overlaid when urban_body enabled) */}
      {overlays.has('urban_body') && (
        <Html position={[1.8, 1.8, 0]} distanceFactor={5} style={{ pointerEvents: 'none' }}>
          <div style={{
            background: '#0a0a0a',
            border: '1px solid #1e3a5a',
            padding: '4px 6px',
            fontFamily: 'monospace',
            fontSize: '7px',
            color: '#3a6a8a',
            whiteSpace: 'nowrap',
          }}>
            <div style={{ color: '#ef4444', marginBottom: 2 }}>Burden flows: {Math.round(metrics.BTR ?? 58)}</div>
            <div style={{ color: '#4ade80' }}>Freedom flows: {Math.round(metrics.FDCR ?? 47)}</div>
          </div>
        </Html>
      )}
    </group>
  )
}

function getBodyNodeDesc(id: string, value: number): string {
  const map: Record<string, string> = {
    BL_SUBJECT:  `Central subject body. Receives intersecting burdens from surveillance, classification, care, and commute. Freedom access constrained by barrier nodes.`,
    BL_SLEEP:    `Sleep and recovery node. Constrained by work schedules and commute time. Under-resourced in low-FDCR subjects. Recovery window shrinks under managerial intensification.`,
    BL_COMMUTE:  `Transit and commute burden. Time-body extraction from low-FDCR subjects. Surveillance data point. Classification trigger in transit systems.`,
    BL_WORK:     `Productive labour zone. Source of systemic value extraction. Classification of subject begins here.`,
    BL_CARE:     `Unpaid care labour. Disproportionately allocated to gendered and classed subjects. Invisible in FDCR metric — a known methodological gap.`,
    BL_HEALTH:   `Health and reproductive capacity. Diminished by care burden accumulation. Re-entry condition for participation.`,
    BL_WAIT:     `Waiting and queue time. Bureaucratic burden on classified subjects. Appeal, welfare, and re-entry all require extended waiting.`,
    BL_APPEAL:   `Contestation and appeal. Active pathway to freedom space. Success rate: approximately 30% under current scenario.`,
    BL_RECOV:    `Recovery window. Available to subjects with low surveillance density and adequate sleep. Shrinks under managerial intensification.`,
    BL_FREE:     `Target state: freedom space. Currently accessible to approximately ${Math.round(value)}% of subject population. Primary goal of freedom-generative reform.`,
  }
  return map[id] || `Lifeworld node with FDCR proxy ${value}.`
}
