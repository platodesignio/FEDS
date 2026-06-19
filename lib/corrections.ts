import { MetricScores } from '@/types/metric'
import { clamp } from './normalization'

export interface CorrectionResult {
  fdcr: number
  gfdcr: number
  corrections: string[]
  layerCaps: Record<string, number>
  globalFlags: string[]
}

export function applyCorrections(
  rawFdcr: number,
  rawGfdcr: number,
  metrics: MetricScores,
  category: string
): CorrectionResult {
  const ms = metrics as unknown as Record<string, number>
  const corrections: string[] = []
  const globalFlags: string[] = []
  const layerCaps: Record<string, number> = {}
  let fdcr = rawFdcr
  let gfdcr = rawGfdcr

  // Managerial self-justification cap
  if (ms.MSJR > 70) {
    fdcr = Math.min(fdcr, 55)
    corrections.push('Managerial self-justification (MSJR > 70) caps FDCR at 55.')
  }
  // Classification fixation + re-entry blockage cap
  if (ms.CFR > 80 && ms.RBR > 70) {
    fdcr = Math.min(fdcr, 45)
    corrections.push('Freedom-closing dynamics (CFR > 80, RBR > 70) cap FDCR at 45.')
    layerCaps['institutional'] = 40
  }
  // Re-entry critical
  if (ms.RBR > 80 && ms.RCI < 30) {
    fdcr = Math.min(fdcr, 40)
    corrections.push('Critical re-entry blockage (RBR > 80, RCI < 30) caps FDCR at 40.')
  }
  // Epistemic injustice
  if (ms.EIR > 70) {
    fdcr -= 8
    corrections.push('Epistemic injustice (EIR > 70) deducts 8 from FDCR.')
  }
  // Bodily burden
  if (ms.BBI > 70) {
    fdcr -= 6
    layerCaps['body'] = 45
    corrections.push('High bodily burden (BBI > 70) deducts 6 and caps Body layer.')
  }
  // State repression
  if (ms.SRR > 70) {
    fdcr -= 6
    corrections.push('State repression risk (SRR > 70) deducts 6 from FDCR.')
  }
  // Global transfer corrections
  if (ms.BTR > 60) {
    gfdcr -= 10
    globalFlags.push('High burden transfer (BTR > 60).')
  }
  if (ms.CDR > 60 || ms.FGR > 60) {
    gfdcr -= 8
    globalFlags.push('Carbon / future-generation displacement.')
  }
  if (ms.CIR > 60 || ms.DCR > 60) {
    gfdcr -= 8
    globalFlags.push('Colonial / data-colonial injustice.')
  }
  if (ms.EER > 70) {
    gfdcr -= 6
    globalFlags.push('Ecological externalization (EER > 70).')
  }
  // Local-global divergence
  if (rawFdcr > 70 && gfdcr < 45) {
    corrections.push('Locally generative but globally transferring — divergence flagged.')
  }
  // Category-specific: AI scoring systems get extra scrutiny on machine trust
  if (category === 'ai_scoring' && ms.MTR > 65) {
    fdcr -= 5
    corrections.push('AI scoring with high machine-trust risk (MTR > 65) deducts 5.')
  }

  fdcr = clamp(fdcr, 0, 100)
  gfdcr = clamp(gfdcr, 0, 100)
  return { fdcr, gfdcr, corrections, layerCaps, globalFlags }
}
