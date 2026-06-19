'use client'

interface Props {
  label: string
  value: number | string
  description?: string
  size?: 'large' | 'normal'
  type?: 'positive' | 'risk' | 'neutral'
}

export function colorForPositive(v: number): string {
  if (v >= 70) return '#15803d'
  if (v >= 40) return '#b45309'
  return '#b91c1c'
}

export function colorForRisk(v: number): string {
  if (v > 70) return '#b91c1c'
  if (v >= 40) return '#b45309'
  return '#15803d'
}

export default function ScoreCard({ label, value, description, size = 'normal', type = 'neutral' }: Props) {
  const numeric = typeof value === 'number' ? value : null
  let color = '#1a3a5c'
  if (numeric !== null) {
    if (type === 'risk') color = colorForRisk(numeric)
    else if (type === 'positive') color = colorForPositive(numeric)
  }
  return (
    <div className="border border-[#e2e8f0] bg-white p-4">
      <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div
        className={`font-mono font-bold ${size === 'large' ? 'text-5xl' : 'text-2xl'}`}
        style={{ color }}
      >
        {value}
      </div>
      {description && <div className="mt-1 text-xs text-gray-600">{description}</div>}
    </div>
  )
}
