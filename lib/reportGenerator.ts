import { AuditState } from '@/types/audit'
import { MetricScores } from '@/types/metric'
import { ActorImpact, BurdenTransferEntry } from '@/types/actor'
import { AuditReport, ReportSection } from '@/types/report'
import { Locale } from '@/types/i18n'

function f(n: number): string {
  return Math.round(n).toString()
}

export function generateReport(
  auditState: AuditState,
  metrics: MetricScores,
  fdcr: number,
  gfdcr: number,
  judgments: string[],
  actorImpacts: ActorImpact[],
  burdenTransfers: BurdenTransferEntry[],
  _locale: Locale
): AuditReport {
  const ms = metrics as unknown as Record<string, number>
  const sections: ReportSection[] = []
  const add = (title: string, titleJa: string, content: string) =>
    sections.push({ title, titleJa, content })

  const target = auditState.target || 'the audited system'
  const losers = actorImpacts.filter((a) => a.netImpact < 0).map((a) => a.actor)
  const winners = actorImpacts.filter((a) => a.netImpact >= 0).map((a) => a.actor)

  add('1. Executive Summary', '1. 要旨', `This audit evaluates "${target}" (category: ${auditState.category}). The Freedom Dialectical Correctness Rate (FDCR) is ${f(fdcr)} and the Global FDCR is ${f(gfdcr)}. Primary judgment: ${judgments[0]}.`)
  add('2. Scope and Layers', '2. 範囲とレイヤー', `Layers examined: ${auditState.layers.join(', ') || 'none specified'}. Subjects considered: ${auditState.subjects.join(', ') || 'none specified'}.`)
  add('3. Methodological Notice', '3. 方法論的注記', 'No real persons are scored. Scores are operational, revisable indicators within a dialectical framework, not absolute truths.')
  add('4. Creative Future Configuration', '4. 創造的未来構成', `CFCS = ${f(ms.CFCS)}. This measures whether the system opens genuinely new future possibilities rather than managing existing paths.`)
  add('5. Dialectical Error Correction', '5. 弁証法的誤り訂正', `DER = ${f(ms.DER)}. Capacity to convert failures and contradictions into learning rather than punishment.`)
  add('6. Re-entry Capacity', '6. 再参入能力', `RCI = ${f(ms.RCI)}, RBR = ${f(ms.RBR)}. Ability of affected subjects to appeal, re-apply, and rehabilitate.`)
  add('7. Managerial Self-Justification', '7. 管理的自己正当化', `MSJR = ${f(ms.MSJR)}. Degree to which safety/efficiency/fairness language justifies control.`)
  add('8. Classification Fixation', '8. 分類固定', `CFR = ${f(ms.CFR)}, MTR = ${f(ms.MTR)}. Risk of irreversible, hard-to-exit classification and over-trust in automated scoring.`)
  add('9. Lifeworld Sensitivity', '9. 生活世界感応', `LSAR = ${f(ms.LSAR)}, EIR = ${f(ms.EIR)}. Preservation of bodily pain, care burden, local context and testimony.`)
  add('10. Democratic Revisability', '10. 民主的改訂可能性', `DRR = ${f(ms.DRR)}. Extent of public contestability, independent audit, and revision.`)
  add('11. Bodily Generativity', '11. 身体生成', `BGR = ${f(ms.BGR)}, BBI = ${f(ms.BBI)}. Protection of sleep, breath, recovery vs accumulated bodily burden.`)
  add('12. Background Ecology and Care', '12. 背景生態とケア', `BDER = ${f(ms.BDER)}, RDR = ${f(ms.RDR)}. Strength of living cooperation and fairness of burden distribution.`)
  add('13. Generative Theory Indicators', '13. 生成理論指標', `IGR = ${f(ms.IGR)}, PDFS = ${f(ms.PDFS)}, MGR = ${f(ms.MGR)}, D-RGR = ${f(ms['D-RGR'])}, SRGR = ${f(ms.SRGR)}, TIGR = ${f(ms.TIGR)}.`)
  add('14. Temporal Dynamics', '14. 時間動態', `TCR = ${f(ms.TCR)}, TIGR = ${f(ms.TIGR)}. Whether time for reflection, recovery and appeal is generated or compressed.`)
  add('15. Epistemic Justice', '15. 認識的正義', `EIR = ${f(ms.EIR)}. Risk that testimony is silenced and lifeworld reduced to data.`)
  add('16. State Power and Repression', '16. 国家権力と抑圧', `SRR = ${f(ms.SRR)}. Expansion of policing, surveillance, and coercive state power.`)
  add('17. Marketization and Financialization', '17. 市場化と金融化', `FMR = ${f(ms.FMR)}, NPR = ${f(ms.NPR)}. Conversion of basic needs into commodities and normalization of precarity.`)
  add('18. Ecological Generativity and Externalization', '18. 生態生成と外部化', `EGR = ${f(ms.EGR)}, EER = ${f(ms.EER)}. Regenerative capacity vs externalized energy/compute/carbon burden.`)
  add('19. Supply Chain and Extraction', '19. サプライチェーンと採取', `SCTR = ${f(ms.SCTR)}, SCDR = ${f(ms.SCDR)}. Transparency vs extractive dependency.`)
  add('20. Global Burden Transfer', '20. 地球的負担転嫁', `BTR = ${f(ms.BTR)}, CDR = ${f(ms.CDR)}, FGR = ${f(ms.FGR)}. ${burdenTransfers.length} burden transfer pathway(s) identified.`)
  add('21. Colonial and Data-Colonial Injustice', '21. 植民地・データ植民地的不正義', `CIR = ${f(ms.CIR)}, DCR = ${f(ms.DCR)}. Reproduction of colonial and data-colonial injustice.`)
  add('22. Actor Impact Analysis', '22. 当事者影響分析', `Winners: ${winners.join(', ') || 'none'}. Losers: ${losers.join(', ') || 'none'}. ${actorImpacts.length} subject(s) analyzed.`)
  add('23. Daoist Lens', '23. 道家的レンズ', `DPS = ${f(ms.DPS)}, WWR = ${f(ms.WWR)}, LRI = ${f(ms.LRI)}. Alignment with non-coercive, non-forcing natural ordering.`)
  add('24. Judgments', '24. 判定', `Applicable judgments: ${judgments.join(', ')}.`)
  add('25. Recommendations', '25. 提言', `Prioritize raising re-entry capacity (RCI), democratic revisability (DRR), and reducing burden transfer (BTR). Address the highest risk metrics first to move toward dialectical correctness.`)

  return {
    generatedAt: new Date().toISOString(),
    target,
    category: auditState.category,
    layers: auditState.layers,
    subjects: auditState.subjects,
    fdcr: Math.round(fdcr),
    gfdcr: Math.round(gfdcr),
    judgment: judgments[0],
    sections,
  }
}
