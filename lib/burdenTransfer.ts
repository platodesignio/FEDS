import { BurdenTransferEntry } from '@/types/actor'
import { MetricScores } from '@/types/metric'

export function computeBurdenTransfers(
  metrics: MetricScores,
  subjects: string[],
  _category: string
): BurdenTransferEntry[] {
  const ms = metrics as unknown as Record<string, number>
  const out: BurdenTransferEntry[] = []

  const receiver = (preferred: string, fallback: string) =>
    subjects.includes(preferred) ? preferred : fallback

  if (ms.BTR > 60) {
    out.push({
      from: 'Institution / Operator',
      to: receiver('Migrants', 'Workers'),
      burdenType: 'Hidden labor & operational burden',
      magnitude: Math.round(ms.BTR),
      visibility: ms.BTR > 80 ? 'invisible' : 'semi-visible',
    })
  }
  if (ms.CDR > 60 || ms.FGR > 60) {
    out.push({
      from: 'Current generation',
      to: 'Future generations',
      burdenType: 'Carbon & ecological debt',
      magnitude: Math.round(Math.max(ms.CDR, ms.FGR)),
      visibility: 'invisible',
    })
  }
  if (ms.RDR > 60) {
    out.push({
      from: 'Institution / System',
      to: receiver('Applicants', 'Residents'),
      burdenType: 'Displaced responsibility',
      magnitude: Math.round(ms.RDR),
      visibility: 'semi-visible',
    })
  }
  if (ms.EER > 60) {
    out.push({
      from: 'Technical system',
      to: 'Ecosystems',
      burdenType: 'Energy / compute externalization',
      magnitude: Math.round(ms.EER),
      visibility: 'invisible',
    })
  }
  if (ms.SCDR > 60) {
    out.push({
      from: 'Consuming region',
      to: 'Extraction region / Indigenous communities',
      burdenType: 'Resource extraction dependency',
      magnitude: Math.round(ms.SCDR),
      visibility: 'invisible',
    })
  }
  if (ms.BBI > 60) {
    out.push({
      from: 'System throughput',
      to: receiver('Care workers', 'Workers'),
      burdenType: 'Bodily & temporal burden',
      magnitude: Math.round(ms.BBI),
      visibility: 'visible',
    })
  }

  return out
}
