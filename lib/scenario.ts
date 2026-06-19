import { AuditState } from '@/types/audit'
import { MetricScores } from '@/types/metric'
import { ScenarioId, ScenarioResult } from '@/types/scenario'
import { ALL_METRICS, RISK_METRIC_IDS } from '@/data/metrics'
import { computeFDCR } from './scoring'
import { computeGFDCR } from './globalScoring'
import { applyCorrections } from './corrections'
import { determineJudgments } from './judgments'
import { clamp } from './normalization'

const RISK = new Set(RISK_METRIC_IDS)

function adjust(metrics: MetricScores, posDelta: number, riskDelta: number): MetricScores {
  const src = metrics as unknown as Record<string, number>
  const out: Record<string, number> = {}
  for (const m of ALL_METRICS) {
    const isRisk = RISK.has(m.id)
    const delta = isRisk ? riskDelta : posDelta
    out[m.id] = clamp(src[m.id] + delta, 0, 100)
  }
  return out as unknown as MetricScores
}

function build(
  id: ScenarioId,
  label: string,
  labelJa: string,
  baseState: AuditState,
  metrics: MetricScores
): ScenarioResult {
  const rawFdcr = computeFDCR(metrics)
  const rawGfdcr = computeGFDCR(metrics, rawFdcr)
  const corr = applyCorrections(rawFdcr, rawGfdcr, metrics, baseState.category)
  const judgments = determineJudgments(corr.fdcr, corr.gfdcr, metrics, baseState.category, corr.corrections)
  return {
    id,
    label,
    labelJa,
    fdcr: Math.round(corr.fdcr),
    gfdcr: Math.round(corr.gfdcr),
    metrics,
    judgment: judgments[0],
    corrections: corr.corrections,
  }
}

export function generateScenarioResults(
  baseState: AuditState,
  metrics: MetricScores,
  _fdcr: number,
  _gfdcr: number
): Record<ScenarioId, ScenarioResult> {
  return {
    current: build('current', 'Current', '現状', baseState, metrics),
    reform: build('reform', 'Reform', '改革', baseState, adjust(metrics, 15, -15)),
    managerial: build('managerial', 'Managerial', '管理強化', baseState, adjust(metrics, -15, 15)),
  }
}
