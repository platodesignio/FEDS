import { MetricScores } from '@/types/metric'
import { clamp } from './normalization'

export function computeGFDCR(metrics: MetricScores, fdcr: number): number {
  const ms = metrics as unknown as Record<string, number>
  const globalPos = ['PRCI', 'GDRR', 'CBRI', 'SCTR', 'PAI']
  const globalRisk = ['BTR', 'CDR', 'SCDR', 'CIR', 'FGR', 'PPR', 'GDDR', 'DCR']
  let posSum = 0
  for (const id of globalPos) posSum += ms[id]
  let riskSum = 0
  for (const id of globalRisk) riskSum += ms[id]
  const posAvg = posSum / globalPos.length
  const riskAvg = riskSum / globalRisk.length
  // G-FDCR pulls down local FDCR by global transfer risk
  const transferPenalty = riskAvg * 0.6
  const gfdcr = fdcr * 0.5 + posAvg * 0.5 - transferPenalty
  return clamp(gfdcr + 25, 0, 100)
}
