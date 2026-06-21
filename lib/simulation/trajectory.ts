import type { BaseMetrics, EcoMetrics, ScenarioId, TrajectoryPoint, TrajectoryResult } from './types'

const TIME_STEPS = 6

const SCENARIO_MODIFIERS: Record<ScenarioId, {
  fdcrDelta: number
  btrDelta: number
  msjrDelta: number
  bgrDelta: number
  eFdcrDelta: number
  ebdcrDelta: number
  epBtmDelta: number
}> = {
  current: {
    fdcrDelta: -1.2,
    btrDelta: 2.5,
    msjrDelta: 1.5,
    bgrDelta: -0.8,
    eFdcrDelta: -2.0,
    ebdcrDelta: -1.5,
    epBtmDelta: 3.0,
  },
  reform: {
    fdcrDelta: 3.5,
    btrDelta: -3.0,
    msjrDelta: -2.5,
    bgrDelta: 2.2,
    eFdcrDelta: 2.5,
    ebdcrDelta: 1.8,
    epBtmDelta: -2.5,
  },
  managerial: {
    fdcrDelta: -3.5,
    btrDelta: 5.0,
    msjrDelta: 4.5,
    bgrDelta: -2.0,
    eFdcrDelta: -3.5,
    ebdcrDelta: -3.0,
    epBtmDelta: 5.5,
  },
}

function clamp(v: number): number {
  return Math.max(0, Math.min(100, v))
}

export function calculateTrajectory(
  baseMetrics: BaseMetrics,
  ecoMetrics: EcoMetrics,
  scenario: ScenarioId,
  timeHorizon: number = TIME_STEPS - 1
): TrajectoryResult {
  const mod = SCENARIO_MODIFIERS[scenario]
  const points: TrajectoryPoint[] = []

  for (let t = 0; t <= timeHorizon; t++) {
    const decay = 1 + t * 0.15
    points.push({
      t,
      fdcr:   clamp(baseMetrics.FDCR   + mod.fdcrDelta   * t * decay),
      eFdcr:  clamp(ecoMetrics['E-FDCR'] + mod.eFdcrDelta * t * decay),
      btr:    clamp(baseMetrics.BTR    + mod.btrDelta    * t * decay),
      msjr:   clamp(baseMetrics.MSJR   + mod.msjrDelta   * t * decay),
      bgr:    clamp(baseMetrics.BGR    + mod.bgrDelta    * t * decay),
      cfr:    clamp(baseMetrics.CFR    + mod.msjrDelta   * t * 0.8),
      rbr:    clamp(baseMetrics.RBR    + mod.btrDelta    * t * 0.6),
      ebdcr:  clamp(ecoMetrics.EBDCR   + mod.ebdcrDelta  * t * decay),
      epBtm:  clamp(ecoMetrics['EP-BTM'] + mod.epBtmDelta * t * decay),
    })
  }

  const last = points[points.length - 1]
  const first = points[0]
  const fdcrDiff = last.fdcr - first.fdcr

  const trend: TrajectoryResult['trend'] =
    fdcrDiff > 5 ? 'improving' : fdcrDiff < -5 ? 'deteriorating' : 'stable'

  const thresholdPoint = points.find((p) => p.fdcr < 35 || p.btr > 70)
  const criticalThreshold = thresholdPoint ? thresholdPoint.t : null

  return {
    points,
    scenario,
    finalFDCR: Math.round(last.fdcr),
    trend,
    criticalThreshold,
  }
}

export function getTimeLabel(t: number, locale: string): string {
  const en = ['Now', '1 Year', '5 Years', '10 Years', '25 Years', 'Future Generations']
  const ja = ['現在', '1年後', '5年後', '10年後', '25年後', '将来世代']
  return locale === 'ja' ? ja[t] : en[t]
}
