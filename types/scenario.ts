import { MetricScores } from './metric'

export type ScenarioId = 'current' | 'reform' | 'managerial'

export interface ScenarioResult {
  id: ScenarioId
  label: string
  labelJa: string
  fdcr: number
  gfdcr: number
  metrics: MetricScores
  judgment: string
  corrections: string[]
}
