'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Box, Sphere, Line, Html, Torus } from '@react-three/drei'
import * as THREE from 'three'
import { useSimulationStore } from '@/lib/simulation/simulationStore'
import { FLOW_NODES, FLOW_EDGES, INSPECTOR_PRESETS } from '@/lib/simulation/mockData'
import type { InspectorData } from '@/lib/simulation/types'
import type { BaseMetrics, ScenarioId } from '@/lib/simulation/types'

const NODE_COLORS: Record<string, string> = {
  gateway:     '#a78bfa',
  institution: '#4a8abb',
  barrier:     '#ef4444',
  actor:       '#7ac8f8',
}

const EDGE_COLORS: Record<string, string> = {
  freedom: '#4ade80',
  burden:  '#ef4444',
  barrier: '#f97316',
  neutral: '#2a5a8a',
}

const NODE_LABELS_BELOW: Record<string, boolean> = {
  IF_APPROVE: true,
  IF_REJECT:  true,
  IF_REENTRY: true,
  IF_EXCLUSION: true,
}

interface Props {
  metrics: BaseMetrics
  scenario: ScenarioId
  overlays: Set<string>
}

export default function InstitutionalFlowLayer({ metrics, scenario, overlays }: Props) {
  const pulseRef = useRef(0)
  const { openInspector } = useSimulationStore()

  useFrame((_, delta) => {
    pulseRef.current += delta
  })

  // Scale approval/rejection probabilities by scenario
  const approvalBonus = scenario === 'reform' ? 0.2 : scenario === 'managerial' ? -0.2 : 0

  const edgeLines = useMemo(() =>
    FLOW_EDGES.map((edge) => {
      const from = FLOW_NODES.find((n) => n.id === edge.from)!
      const to   = FLOW_NODES.find((n) => n.id === edge.to)!
      const p0 = new THREE.Vector3(from.x * 1.3, from.y * 1.1, 0)
      const p1 = new THREE.Vector3(to.x   * 1.3, to.y   * 1.1, 0)
      // Offset midpoint horizontally for curved paths
      const midOffset = (Math.abs(from.x - to.x) > 0.5) ? 0.3 : 0.1
      const mid = new THREE.Vector3(
        (from.x + to.x) * 0.65 + midOffset * Math.sign(to.x - from.x),
        (from.y + to.y) * 0.55,
        0
      )
      const curve = new THREE.QuadraticBezierCurve3(p0, mid, p1)
      return { edge, points: curve.getPoints(28) }
    }),
    []
  )

  const handleNodeClick = (node: typeof FLOW_NODES[0]) => {
    const preset = INSPECTOR_PRESETS[node.id]
    const data: InspectorData = preset
      ? { ...preset, layer: 'institutional_flow' }
      : {
          id:      node.id,
          label:   node.label,
          labelJa: node.labelJa,
          metrics: getNodeMetrics(node.id, metrics, approvalBonus),
          description:   getNodeDesc(node.id, approvalBonus),
          descriptionJa: `${node.labelJa}：制度フローノード。`,
          layer: 'institutional_flow',
        }
    openInspector(data)
  }

  return (
    <group>
      {/* Background grid */}
      <mesh position={[0, 0, -0.3]}>
        <planeGeometry args={[7, 8]} />
        <meshBasicMaterial color="#030810" />
      </mesh>

      {/* Vertical axis label */}
      <Html position={[-3.2, 2.4, 0]} distanceFactor={6} style={{ pointerEvents: 'none' }}>
        <div style={{ color: '#1e3a5a', fontSize: '7px', fontFamily: 'monospace', writingMode: 'vertical-rl' }}>
          Entry → Processing → Decision → Outcome
        </div>
      </Html>

      {/* Classification fixation indicator */}
      {overlays.has('CFR') && (
        <Html position={[2.8, -0.2, 0]} distanceFactor={5} style={{ pointerEvents: 'none' }}>
          <div style={{
            background: '#0a0505',
            border: '1px solid #3a1010',
            padding: '4px 8px',
            fontFamily: 'monospace',
            fontSize: '7px',
            whiteSpace: 'nowrap',
          }}>
            <div style={{ color: '#f97316', marginBottom: 2 }}>Classification Fixation Risk</div>
            <div style={{ color: '#ef4444', fontWeight: 700 }}>{Math.round(metrics.CFR ?? 55)}</div>
          </div>
        </Html>
      )}

      {/* Responsibility displacement label */}
      {overlays.has('MSJR') && (
        <Html position={[-3.2, -0.2, 0]} distanceFactor={5} style={{ pointerEvents: 'none' }}>
          <div style={{
            background: '#0a0808',
            border: '1px solid #2a1818',
            padding: '4px 8px',
            fontFamily: 'monospace',
            fontSize: '7px',
            whiteSpace: 'nowrap',
          }}>
            <div style={{ color: '#fbbf24', marginBottom: 2 }}>Responsibility Displacement</div>
            <div style={{ color: '#ef4444', fontWeight: 700 }}>{Math.round(metrics.MSJR ?? 62)}</div>
          </div>
        </Html>
      )}

      {/* Democratic review indicator */}
      <Html position={[-2.8, -0.8, 0]} distanceFactor={5} style={{ pointerEvents: 'none' }}>
        <div style={{
          background: '#030c08',
          border: '1px solid #0d3a18',
          padding: '4px 8px',
          fontFamily: 'monospace',
          fontSize: '7px',
          whiteSpace: 'nowrap',
        }}>
          <div style={{ color: '#4ade80', marginBottom: 2 }}>Democratic Review (bypass rate)</div>
          <div style={{ color: '#fbbf24', fontWeight: 700 }}>{scenario === 'reform' ? '45%' : scenario === 'managerial' ? '92%' : '75%'}</div>
        </div>
      </Html>

      {/* Edges */}
      {edgeLines.map(({ edge, points }, i) => (
        <Line
          key={i}
          points={points}
          color={EDGE_COLORS[edge.type]}
          lineWidth={edge.weight * 3}
          transparent
          opacity={0.65}
          dashed={edge.type === 'barrier'}
          dashSize={0.07}
          gapSize={0.05}
        />
      ))}

      {/* Nodes */}
      {FLOW_NODES.map((node) => {
        const color   = NODE_COLORS[node.type] ?? '#7ac8f8'
        const pos: [number, number, number] = [node.x * 1.3, node.y * 1.1, 0]
        const isBarrier = node.type === 'barrier'
        const isGateway = node.type === 'gateway'
        const size = isBarrier ? 0.14 : isGateway ? 0.16 : 0.13

        return (
          <group key={node.id} position={pos} onClick={() => handleNodeClick(node)}>
            {/* Barrier: cube shape */}
            {isBarrier ? (
              <>
                <Box args={[size * 2, size * 2, size * 1.2]}>
                  <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} roughness={0.2} metalness={0.3} />
                </Box>
                <Torus args={[size * 1.8, 0.012, 6, 32]} rotation={[0, 0, 0]}>
                  <meshBasicMaterial color={color} transparent opacity={0.35} />
                </Torus>
              </>
            ) : isGateway ? (
              /* Gateway: diamond shape via rotated box */
              <Box args={[size * 1.8, size * 1.8, size * 1.2]} rotation={[0, 0, Math.PI / 4]}>
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} roughness={0.3} />
              </Box>
            ) : (
              /* Institution: sphere */
              <>
                <Sphere args={[size, 20, 20]}>
                  <meshStandardMaterial color={color} emissive={color} emissiveIntensity={node.id === 'IF_AI' ? 0.9 : 0.4} roughness={0.3} />
                </Sphere>
                {node.id === 'IF_AI' && (
                  <Torus args={[size + 0.1, 0.015, 6, 32]}>
                    <meshBasicMaterial color="#ef4444" transparent opacity={0.5} />
                  </Torus>
                )}
              </>
            )}

            <Html
              distanceFactor={5.5}
              position={[0, NODE_LABELS_BELOW[node.id] ? -0.28 : 0.28, 0]}
              style={{ pointerEvents: 'none' }}
            >
              <div style={{
                color,
                fontSize: '7px',
                fontFamily: 'monospace',
                whiteSpace: 'nowrap',
                textShadow: '0 0 5px #000',
                textAlign: 'center',
                maxWidth: '90px',
                lineHeight: 1.3,
                fontWeight: ['IF_AI', 'IF_CLASS'].includes(node.id) ? 700 : 400,
              }}>
                {node.label}
              </div>
            </Html>
          </group>
        )
      })}

      {/* Re-entry blockage indicator at bottom */}
      {overlays.has('RBR') && (
        <Html position={[-1.5, -3.6, 0]} distanceFactor={5} style={{ pointerEvents: 'none' }}>
          <div style={{
            background: '#050808',
            border: '1px solid #1e3a5a',
            padding: '4px 8px',
            fontFamily: 'monospace',
            fontSize: '7px',
            whiteSpace: 'nowrap',
          }}>
            <div style={{ color: '#4a8abb', marginBottom: 2 }}>Re-entry Blockage Risk</div>
            <div style={{ color: '#f97316', fontWeight: 700 }}>{Math.round(metrics.RBR ?? 51)}</div>
          </div>
        </Html>
      )}
    </group>
  )
}

function getNodeMetrics(id: string, m: BaseMetrics, approvalBonus: number): Record<string, number> {
  const base: Record<string, Record<string, number>> = {
    IF_ENTRY:     { FDCR: 80, CFR: 10, RBR: 5,  MSJR: 10 },
    IF_APP:       { FDCR: 55, CFR: 35, RBR: 25, MSJR: 40 },
    IF_DATA:      { FDCR: 40, CFR: 55, RBR: 40, BTR: 60, MSJR: 55 },
    IF_DEMO:      { FDCR: 72, CFR: 20, RBR: 25, MSJR: 30 },
    IF_APPROVE:   { FDCR: Math.min(90, 65 + approvalBonus * 100), RBR: 20, CFR: 10 },
    IF_REJECT:    { FDCR: 25, RBR: m.RBR ?? 51, CFR: m.CFR ?? 55, BTR: 72 },
    IF_APPEAL:    { FDCR: 40, RBR: 60, CFR: 50, MSJR: 45 },
    IF_REENTRY:   { FDCR: 30, RBR: m.RBR ?? 51, CFR: m.CFR ?? 55 },
    IF_EXCLUSION: { FDCR: 8,  RBR: 90, CFR: 85, BTR: 88, MSJR: 80 },
  }
  return base[id] ?? { FDCR: m.FDCR ?? 47, CFR: m.CFR ?? 55, RBR: m.RBR ?? 51 }
}

function getNodeDesc(id: string, approvalBonus: number): string {
  const approvalPct = Math.round(Math.min(90, 35 + approvalBonus * 100))
  const rejectPct = 100 - approvalPct
  const map: Record<string, string> = {
    IF_ENTRY:     `Application entry point. Nominal access is open but screening begins immediately. Data collection at intake feeds AI pipeline.`,
    IF_APP:       `Application screening gate. Preliminary filters reduce applicant pool before AI scoring. Screening criteria: partially opaque.`,
    IF_DATA:      `Data intake and processing. Subject data aggregated from multiple sources. No explicit consent mechanism. Surveillance inputs included.`,
    IF_DEMO:      `Democratic review gate — the primary correction mechanism. Currently bypassed in most cases. Activation requires explicit policy mandate.`,
    IF_APPROVE:   `Approval outcome. Access granted. Current rate: approximately ${approvalPct}% of applicants under this scenario. Re-entry conditions apply.`,
    IF_REJECT:    `Rejection outcome. ${rejectPct}% of applicants. Feeds exclusion and appeal pathways. Classification record persists.`,
    IF_APPEAL:    `Appeal and contestation process. Resource-intensive for subjects. Success rate: ~30%. Most appeals routed to exclusion.`,
    IF_REENTRY:   `Re-entry administrative gate. Prior classification score continues to influence outcome. FDCR deficit compounds across re-entry attempts.`,
    IF_EXCLUSION: `Terminal exclusion zone. Classification record locks subject out of formal system. No automatic expiry. Correction requires democratic override.`,
  }
  return map[id] || `Institutional flow node.`
}
