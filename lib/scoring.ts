import { AuditState } from '@/types/audit'
import { MetricScores } from '@/types/metric'
import { VARIABLES } from '@/data/variables'
import { QUESTIONS } from '@/data/questions'
import { ALL_METRICS, POSITIVE_METRICS } from '@/data/metrics'
import { clamp } from './normalization'

const ALL_METRIC_IDS = ALL_METRICS.map((m) => m.id)

function emptyScores(): MetricScores {
  const obj: Record<string, number> = {}
  for (const id of ALL_METRIC_IDS) obj[id] = 50
  return obj as unknown as MetricScores
}

export function computeMetricScores(state: AuditState): MetricScores {
  const scores = emptyScores() as unknown as Record<string, number>

  // Variables
  for (const v of VARIABLES) {
    const raw = state.variableValues[v.id]
    if (raw === undefined) continue
    const factor = raw / 100 // 0..1
    for (const ref of v.affectedMetrics) {
      if (!(ref.metric in scores)) continue
      // contribution magnitude scaled to +-30 band
      const magnitude = factor * ref.weight * 30
      if (ref.polarity === 'positive') {
        scores[ref.metric] += magnitude
      } else {
        // variable hurts this metric (risk metric goes up, or positive metric goes down)
        scores[ref.metric] += magnitude
      }
    }
  }

  // Questions (0..5 Likert)
  for (const q of QUESTIONS) {
    const raw = state.questionValues[q.id]
    if (raw === undefined) continue
    const factor = raw / 5 // 0..1
    for (const ref of q.affectedMetrics) {
      if (!(ref.metric in scores)) continue
      const magnitude = factor * ref.weight * 24
      scores[ref.metric] += magnitude
    }
  }

  for (const id of ALL_METRIC_IDS) {
    scores[id] = clamp(scores[id], 0, 100)
  }
  return scores as unknown as MetricScores
}

const POSITIVE_IDS = POSITIVE_METRICS.map((m) => m.id)

export function computeFDCR(metrics: MetricScores): number {
  const ms = metrics as unknown as Record<string, number>
  let posSum = 0
  let posCount = 0
  for (const id of POSITIVE_IDS) {
    posSum += ms[id]
    posCount++
  }
  // TFGR high is good (already positive). Local risk subset:
  const localRiskIds = ['MSJR', 'CFR', 'RBR', 'RDR', 'BBI', 'TCR', 'MTR', 'EIR', 'SRR', 'FMR', 'NPR']
  let riskSum = 0
  for (const id of localRiskIds) riskSum += ms[id]
  const riskAvg = riskSum / localRiskIds.length
  const posAvg = posSum / posCount
  // FDCR = positive generativity minus risk penalty
  const fdcr = posAvg - riskAvg * 0.55
  return clamp(fdcr + 27.5, 0, 100)
}
