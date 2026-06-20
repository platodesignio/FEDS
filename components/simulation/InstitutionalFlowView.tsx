'use client'

import { useMemo } from 'react'

interface FlowNode {
  id: string; label: string; labelJa: string
  x: number; y: number; type: 'entry' | 'process' | 'gate' | 'exit_pos' | 'exit_neg' | 'burden'
  riskMetric?: string; riskThreshold?: number
}

interface FlowEdge {
  from: string; to: string; label?: string
  type: 'normal' | 'block' | 'transfer' | 'democratic' | 'burden'
  condition?: (ms: Record<string, number>) => boolean
}

const NODES: FlowNode[] = [
  { id: 'application',   label: 'Application',       labelJa: '申請',           x: 400, y: 40,  type: 'entry' },
  { id: 'data_intake',   label: 'Data Intake',        labelJa: 'データ収集',     x: 400, y: 110, type: 'process' },
  { id: 'classification',label: 'Classification',     labelJa: '分類',           x: 400, y: 185, type: 'gate', riskMetric: 'CFR', riskThreshold: 65 },
  { id: 'ai_scoring',    label: 'AI Scoring',         labelJa: 'AIスコアリング', x: 580, y: 185, type: 'gate', riskMetric: 'MTR', riskThreshold: 65 },
  { id: 'bur_review',    label: 'Bureaucratic Review',labelJa: '官僚審査',       x: 400, y: 265, type: 'process', riskMetric: 'MSJR', riskThreshold: 65 },
  { id: 'approval',      label: 'Approval',           labelJa: '承認',           x: 220, y: 340, type: 'exit_pos' },
  { id: 'rejection',     label: 'Rejection',          labelJa: '拒絶',           x: 580, y: 340, type: 'gate', riskMetric: 'RBR', riskThreshold: 65 },
  { id: 'appeal',        label: 'Appeal',             labelJa: '異議申立',       x: 220, y: 415, type: 'democratic', riskMetric: 'DRR', riskThreshold: 40 },
  { id: 'reentry',       label: 'Re-entry',           labelJa: '再参入',         x: 220, y: 490, type: 'exit_pos', riskMetric: 'RCI', riskThreshold: 40 },
  { id: 'exclusion',     label: 'Exclusion',          labelJa: '排除',           x: 700, y: 415, type: 'exit_neg' },
  { id: 'lifeworld',     label: 'Lifeworld Impact',  labelJa: '生活世界への影響', x: 100, y: 265, type: 'burden', riskMetric: 'EIR', riskThreshold: 65 },
  { id: 'burden_tx',    label: 'Burden Transfer',    labelJa: '負担転嫁',       x: 700, y: 265, type: 'burden', riskMetric: 'BTR', riskThreshold: 60 },
]

const EDGES: FlowEdge[] = [
  { from: 'application',   to: 'data_intake',    type: 'normal' },
  { from: 'data_intake',   to: 'classification', type: 'normal' },
  { from: 'data_intake',   to: 'ai_scoring',     type: 'normal', label: 'AI path' },
  { from: 'classification',to: 'bur_review',     type: 'normal' },
  { from: 'ai_scoring',    to: 'bur_review',     type: 'normal' },
  { from: 'bur_review',    to: 'approval',       type: 'normal' },
  { from: 'bur_review',    to: 'rejection',      type: 'block' },
  { from: 'rejection',     to: 'appeal',         type: 'democratic', label: 'appeal' },
  { from: 'rejection',     to: 'exclusion',      type: 'block', label: 'no appeal' },
  { from: 'appeal',        to: 'reentry',        type: 'normal' },
  { from: 'appeal',        to: 'exclusion',      type: 'block', label: 'appeal denied' },
  { from: 'data_intake',   to: 'lifeworld',      type: 'burden', label: 'testimony lost' },
  { from: 'classification',to: 'burden_tx',      type: 'transfer', label: 'hidden transfer' },
]

type NodeType = 'entry' | 'process' | 'gate' | 'exit_pos' | 'exit_neg' | 'burden' | 'democratic'

const NODE_COLORS: Record<NodeType, { bg: string; border: string; text: string }> = {
  entry:      { bg: '#0f2535', border: '#4a8abb', text: '#7ac8f8' },
  process:    { bg: '#0f1a2a', border: '#2a5a8a', text: '#5a9aba' },
  gate:       { bg: '#1a1505', border: '#f59e0b', text: '#fbbf24' },
  exit_pos:   { bg: '#051a0f', border: '#15803d', text: '#4ade80' },
  exit_neg:   { bg: '#1a0505', border: '#b91c1c', text: '#f87171' },
  burden:     { bg: '#12080a', border: '#7c3aed', text: '#a78bfa' },
  democratic: { bg: '#051018', border: '#0ea5e9', text: '#38bdf8' },
}

const EDGE_COLORS: Record<string, string> = {
  normal:     '#2a5a8a',
  block:      '#b91c1c',
  transfer:   '#7c3aed',
  democratic: '#0ea5e9',
  burden:     '#7c3aed',
}

function edgePath(from: FlowNode, to: FlowNode): string {
  const dx = to.x - from.x; const dy = to.y - from.y
  if (Math.abs(dx) < 20) {
    return `M ${from.x} ${from.y + 16} L ${to.x} ${to.y - 16}`
  }
  const mx = (from.x + to.x) / 2
  return `M ${from.x} ${from.y + 16} C ${from.x} ${from.y + 50}, ${mx} ${to.y - 30}, ${to.x} ${to.y - 16}`
}

interface Props {
  metrics?: Record<string, number>
  scenario: 'current' | 'reform' | 'managerial'
  timeHorizon: number
  locale: string
  t: (k: string) => string
}

export default function InstitutionalFlowView({ metrics, scenario, timeHorizon, locale }: Props) {
  const ms = metrics ?? {}
  const scenarioMult = scenario === 'reform' ? 0.7 : scenario === 'managerial' ? 1.3 : 1.0

  const nodeMap = useMemo(() => new Map(NODES.map((n) => [n.id, n])), [])

  function isNodeRisk(node: FlowNode): boolean {
    if (!node.riskMetric) return false
    const val = (ms[node.riskMetric] ?? 50) * scenarioMult
    return val > (node.riskThreshold ?? 65)
  }

  function nodeColors(node: FlowNode) {
    const base = NODE_COLORS[node.type]
    if (isNodeRisk(node)) return { bg: '#1a0a0a', border: '#ef4444', text: '#fca5a5' }
    return base
  }

  // Blocked edges
  function isEdgeActive(edge: FlowEdge): boolean {
    if (edge.type === 'democratic') {
      return (ms.DRR ?? 50) > 35
    }
    return true
  }

  // Risk annotations
  const riskNodes = NODES.filter(isNodeRisk)

  return (
    <div className="space-y-3">
      {/* Risk annotations bar */}
      {riskNodes.length > 0 && (
        <div className="flex flex-wrap gap-2 border border-[#3a1a1a] bg-[#0f0808] p-2">
          {riskNodes.map((n) => (
            <div key={n.id} className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <span className="text-[9px] font-mono text-red-400">
                {n.label} — {n.riskMetric} HIGH
              </span>
            </div>
          ))}
        </div>
      )}

      {/* SVG flow */}
      <div className="bg-[#060c14] border border-[#1e3a5a] overflow-hidden">
        <div className="px-3 pt-2 text-[9px] font-mono text-[#2a5a8a] uppercase tracking-widest">
          Institutional Flow — {scenario.toUpperCase()} — T+{['Now','1yr','5yr','10yr','25yr','Future'][timeHorizon]}
        </div>
        <svg viewBox="0 0 800 560" style={{ width: '100%', height: 480 }}>
          <defs>
            <marker id="arrow-normal" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L0,6 L6,3 z" fill="#2a5a8a" />
            </marker>
            <marker id="arrow-block" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L0,6 L6,3 z" fill="#b91c1c" />
            </marker>
            <marker id="arrow-transfer" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L0,6 L6,3 z" fill="#7c3aed" />
            </marker>
            <marker id="arrow-democratic" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L0,6 L6,3 z" fill="#0ea5e9" />
            </marker>
            <marker id="arrow-burden" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L0,6 L6,3 z" fill="#7c3aed" />
            </marker>
          </defs>

          {/* Edges */}
          {EDGES.map((edge, i) => {
            const from = nodeMap.get(edge.from); const to = nodeMap.get(edge.to)
            if (!from || !to) return null
            const color = EDGE_COLORS[edge.type]
            const active = isEdgeActive(edge)
            return (
              <g key={i}>
                <path
                  d={edgePath(from, to)}
                  fill="none"
                  stroke={color}
                  strokeWidth={active ? 1.5 : 0.5}
                  strokeOpacity={active ? 0.8 : 0.2}
                  strokeDasharray={edge.type === 'burden' || edge.type === 'transfer' ? '4 3' : undefined}
                  markerEnd={`url(#arrow-${edge.type})`}
                />
                {edge.label && (
                  <text
                    x={(from.x + to.x) / 2 + 8}
                    y={(from.y + to.y) / 2 - 2}
                    fontSize="8" fill={color} opacity="0.7" fontFamily="monospace"
                  >
                    {edge.label}
                  </text>
                )}
              </g>
            )
          })}

          {/* Nodes */}
          {NODES.map((node) => {
            const colors = nodeColors(node)
            const risk = isNodeRisk(node)
            const label = locale === 'ja' ? node.labelJa : node.label
            return (
              <g key={node.id}>
                {risk && (
                  <rect x={node.x - 52} y={node.y - 19} width="104" height="34"
                    fill="#3a0000" rx="2" opacity="0.4" />
                )}
                <rect
                  x={node.x - 50} y={node.y - 17} width="100" height="32"
                  fill={colors.bg} stroke={colors.border} strokeWidth={risk ? 1.5 : 1}
                  rx="2" opacity={0.95}
                />
                <text
                  x={node.x} y={node.y + 2}
                  textAnchor="middle" fontSize="9"
                  fill={colors.text} fontFamily="monospace"
                >{label}</text>
                {node.riskMetric && (
                  <text x={node.x} y={node.y + 13} textAnchor="middle" fontSize="7.5"
                    fill={risk ? '#ef4444' : colors.border} fontFamily="monospace" opacity="0.8">
                    {node.riskMetric} {Math.round((ms[node.riskMetric] ?? 50) * scenarioMult)}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      {/* Flow legend */}
      <div className="grid grid-cols-2 gap-px bg-[#1e3a5a] border border-[#1e3a5a]">
        {[
          { type: 'normal', label: 'Standard pathway' },
          { type: 'block', label: 'Blockage / rejection' },
          { type: 'democratic', label: 'Democratic re-audit path' },
          { type: 'burden', label: 'Lifeworld / burden transfer' },
        ].map(({ type, label }) => (
          <div key={type} className="bg-[#060c14] px-3 py-2 flex items-center gap-2">
            <div className="w-5 h-0.5" style={{ background: EDGE_COLORS[type] }} />
            <span className="text-[9px] font-mono" style={{ color: EDGE_COLORS[type] }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
