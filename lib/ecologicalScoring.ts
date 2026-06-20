import { MetricScores } from '@/types/metric'
import { EcoScores } from '@/types/eco'
import { clamp } from './normalization'

export function computeEcologicalScores(
  metrics: MetricScores,
  fdcr: number,
  gfdcr: number,
  subjects: string[]
): EcoScores {
  const ms = metrics as unknown as Record<string, number>
  const ecoCorrections: string[] = []
  const ecoJudgments: string[] = []

  // ── EBDE: Ecological Bio-Divisional Efficacy ─────────────────────────────
  // Measures whether ecological division of labor generates regenerative efficacy
  const ebdePos = (
    ms.EGR * 0.25 +
    ms.BDER * 0.20 +
    ms.PRCI * 0.18 +
    ms.BGR * 0.15 +
    ms.GDRR * 0.12 +
    ms.HGR * 0.10
  )
  const ebdeRisk = (
    ms.EER * 0.30 +
    ms.BTR * 0.25 +
    ms.CDR * 0.20 +
    ms.SCDR * 0.15 +
    ms.FGR * 0.10
  )
  const EBDE = clamp(ebdePos - ebdeRisk * 0.55 + 25, 0, 100)

  // ── EP-BTM: Eco-Planetary Burden Transfer Matrix (scalar) ─────────────────
  // Aggregate of burden transfer pathways across eco-planetary dimensions
  const epbtm = (
    ms.BTR * 0.20 +
    ms.EER * 0.18 +
    ms.CDR * 0.16 +
    ms.SCDR * 0.14 +
    ms.FGR * 0.12 +
    ms.CIR * 0.10 +
    ms.DCR * 0.06 +
    ms.PPR * 0.04
  )
  const EP_BTM = clamp(epbtm, 0, 100)

  // ── EcoRiskPenalty ────────────────────────────────────────────────────────
  const ecoRiskPenalty = (
    ms.EER * 0.18 +
    ms.BTR * 0.16 +
    ms.CDR * 0.14 +
    ms.SCDR * 0.14 +
    ms.FGR * 0.12 +
    ms.CIR * 0.10 +
    ms.DCR * 0.08 +
    ms.ILBR * 0.08
  )

  // ── EBDCR: Ecological Bio-Divisional Correctness Rate ────────────────────
  const ebdcrRaw = (
    ms.EGR * 0.16 +
    EBDE * 0.14 +
    ms.PRCI * 0.12 +
    ms.BDER * 0.12 +
    ms.SCTR * 0.10 +
    ms.HGR * 0.10 +
    ms.BGR * 0.08 +
    ms.RCI * 0.08 +
    ms.GDRR * 0.06 +
    ms.PAI * 0.04
  ) - ecoRiskPenalty * 0.55
  const EBDCR = clamp(ebdcrRaw + 25, 0, 100)

  // ── EcoPlanetaryRiskPenalty ───────────────────────────────────────────────
  const ecoPlanetaryRiskPenalty = (
    EP_BTM * 0.20 +
    ms.EER * 0.16 +
    ms.CDR * 0.14 +
    ms.SCDR * 0.12 +
    ms.FGR * 0.12 +
    ms.BTR * 0.10 +
    ms.CIR * 0.08 +
    ms.PPR * 0.08
  )

  // ── E-FDCR: Ecological Freedom-Evolution Dialectical Correctness Rate ─────
  const efdcrRaw = (
    fdcr * 0.20 +
    gfdcr * 0.18 +
    EBDCR * 0.16 +
    ms.PRCI * 0.12 +
    ms.EGR * 0.10 +
    ms.BDER * 0.08 +
    ms.GDRR * 0.08 +
    ms.HGR * 0.08
  ) - ecoPlanetaryRiskPenalty * 0.55
  let E_FDCR = clamp(efdcrRaw + 22, 0, 100)

  // ── Ecological Correction Rules ───────────────────────────────────────────
  const hasFutureGen = subjects.some((s) =>
    s.toLowerCase().includes('future') || s.toLowerCase().includes('generation')
  )

  if (ms.EER > 80) {
    E_FDCR = Math.min(E_FDCR, 50)
    ecoCorrections.push('EER > 80 caps E-FDCR at 50.')
  }
  if (EP_BTM > 75) {
    E_FDCR = Math.min(E_FDCR, 50)
    ecoCorrections.push('EP-BTM > 75 caps E-FDCR at 50.')
  }
  if (ms.PRCI < 30) {
    E_FDCR = Math.min(E_FDCR, 45)
    ecoCorrections.push('PRCI < 30 caps E-FDCR at 45.')
  }
  if (ms.CDR > 75 && hasFutureGen) {
    E_FDCR = Math.min(E_FDCR, 45)
    ecoCorrections.push('CDR > 75 with future-generation subjects caps E-FDCR at 45.')
  }

  // ── Ecological Judgment Categories ───────────────────────────────────────
  if (ms.SCDR > 75 && ms.SCTR < 35) {
    ecoJudgments.push('ecologically_opaque_freedom')
  }
  if (fdcr > 70 && E_FDCR < 45) {
    ecoJudgments.push('locally_free_ecologically_incorrect')
  }
  if (EBDCR < 40 && ms.BDER > 70) {
    ecoJudgments.push('human_centered_bio_division_eco_failure')
  }
  if (E_FDCR < 35) {
    ecoJudgments.push('eco_planetary_freedom_failure')
  }
  if (E_FDCR >= 65 && EBDCR >= 60 && ms.EGR >= 60) {
    ecoJudgments.push('ecologically_correct_freedom_evolution')
  }

  return {
    EBDE,
    EBDCR,
    'E-FDCR': E_FDCR,
    'EP-BTM': EP_BTM,
    ecoRiskPenalty,
    ecoPlanetaryRiskPenalty,
    ecoCorrections,
    ecoJudgments,
  }
}
