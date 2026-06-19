import { MetricRef } from './metric'

export interface VariableSchema {
  id: string
  label: string
  labelJa: string
  description: string
  category: string
  affectedMetrics: MetricRef[]
  affectedLayers: string[]
  affectedActors: string[]
  polarity: 'positive' | 'negative'
  weight: number
  defaultValue: number
  min: number
  max: number
}

export interface AuditQuestion {
  id: string
  text: string
  textJa: string
  description: string
  category: string
  affectedMetrics: MetricRef[]
}

export interface AuditState {
  target: string
  category: string
  layers: string[]
  subjects: string[]
  variableValues: Record<string, number>
  questionValues: Record<string, number>
}

export interface LayerScore {
  layer: string
  score: number
  positive: number
  risk: number
}
