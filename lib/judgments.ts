import { MetricScores } from '@/types/metric'
import { EcoScores } from '@/types/eco'

export function determineJudgments(
  fdcr: number,
  gfdcr: number,
  metrics: MetricScores,
  _category: string,
  _corrections: string[],
  ecoScores?: EcoScores
): string[] {
  const ms = metrics as unknown as Record<string, number>
  const out: string[] = []

  // Primary
  if (fdcr >= 70) out.push('freedom_dialectically_correct')
  else if (fdcr >= 55) out.push('conditionally_correct')
  else if (fdcr >= 40) out.push('dialectically_unstable')
  else {
    // dominant risk decides
    if (ms.CFR > 80 && ms.RBR > 70) out.push('freedom_closing')
    else if (ms.MSJR > 70) out.push('managerially_self_justifying')
    else out.push('dialectically_unstable')
  }

  const add = (id: string) => {
    if (!out.includes(id)) out.push(id)
  }

  if (ms.MSJR > 70 && ms.CFCS < 40) add('managerially_self_justifying')
  if (ms.RBR > 80 && ms.RCI < 30) add('return_critical')
  if (ms.CFR > 80 && ms.RBR > 70) add('freedom_closing')
  if (fdcr > 70 && gfdcr < 45) add('locally_generative_globally_transferring')
  if (ms.EIR > 70) add('epistemically_unjust')
  if (ms.EER > 70 || ms.CDR > 70) add('ecologically_externalizing')
  if (ms.CIR > 65 || ms.DCR > 65) add('colonially_reproducing')
  if (ms.FGR > 65 || ms.GSR > 65) add('future_silencing')
  if (ms.FMR > 65) add('marketizing_basic_needs')
  if (ms.BBI > 65) add('bodily_burdening')
  if (ms.SRR > 65) add('state_repressive')
  if (ms.NPR > 65) add('precarity_normalizing')
  if (ms.DPS > 65 && ms.WWR > 60) add('dao_aligned')

  // Ecological judgments
  if (ecoScores) {
    for (const j of ecoScores.ecoJudgments) add(j)
  }

  return out
}
