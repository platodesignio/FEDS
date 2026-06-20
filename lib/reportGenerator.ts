import { AuditState } from '@/types/audit'
import { MetricScores } from '@/types/metric'
import { ActorImpact, BurdenTransferEntry } from '@/types/actor'
import { AuditReport, ReportSection } from '@/types/report'
import { Locale } from '@/types/i18n'

function f(n: number): string { return Math.round(n).toString() }

function scoreLabel(n: number): string {
  if (n >= 70) return 'strong'
  if (n >= 50) return 'moderate'
  if (n >= 30) return 'weak'
  return 'critical'
}
function riskLabel(n: number): string {
  if (n >= 70) return 'high'
  if (n >= 50) return 'moderate'
  if (n >= 30) return 'low'
  return 'minimal'
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

  const target  = auditState.target || 'the audited system'
  const cat     = auditState.category || 'unspecified category'
  const layers  = auditState.layers.join(', ') || 'none specified'
  const subjects = auditState.subjects.join(', ') || 'none specified'

  const losers   = actorImpacts.filter((a) => a.netImpact < 0).map((a) => a.actor)
  const winners  = actorImpacts.filter((a) => a.netImpact >= 0).map((a) => a.actor)
  const hidden   = actorImpacts.filter((a) => a.status === 'Hidden Loser' || a.status === 'Delayed Loser').map((a) => a.actor)
  const reBlocked = actorImpacts.filter((a) => a.status === 'Re-entry Blocked Subject').map((a) => a.actor)
  const voiceExcl = actorImpacts.filter((a) => a.status === 'Voice-Excluded Subject').map((a) => a.actor)

  // ── 01 ──────────────────────────────────────────────────────────────────
  add(
    '1. Audit Target',
    '1. 監査対象',
    `Audit target: "${target}". Category: ${cat}. Layers examined: ${layers}. Affected subjects identified: ${subjects}. This audit was conducted using the Freedom Dialectical Correctness Rate (FDCR) framework.`
  )

  // ── 02 ──────────────────────────────────────────────────────────────────
  add(
    '2. Scope and Methodological Notice',
    '2. 範囲と方法論的注記',
    `No real persons are scored. FDCR audits directional effects of systems, institutions, technologies, spaces, classifications, practices, and policies — never individuals. Scores are operational, revisable indicators within a dialectical audit framework. All weights are provisional and calibratable through empirical review.`
  )

  // ── 03 ──────────────────────────────────────────────────────────────────
  add(
    '3. Overall FDCR Judgment',
    '3. FDCR総合判定',
    `The Freedom Dialectical Correctness Rate (FDCR) for "${target}" is ${f(fdcr)} / 100. This score places the system in the "${judgments[0]}" category. ${
      fdcr >= 70
        ? 'The system demonstrates strong creative future-challenge capacity while broadly preserving the directional correctness of freedom-generation.'
        : fdcr >= 50
        ? 'The system shows conditional correctness but requires targeted improvements in re-entry, democratic revisability, or bodily generation to sustain freedom-generation direction.'
        : fdcr >= 35
        ? 'The system is dialectically unstable. It generates some freedom while simultaneously producing significant risks of classification fixation, re-entry blockage, or managerial self-justification that undermine long-term freedom-generation.'
        : 'The system is critically low in freedom-generation correctness. It exhibits structural features — classification fixation, managerial self-justification, re-entry blockage — that actively close future possibility.'
    } Additional judgments applied: ${judgments.slice(1).join(', ') || 'none'}.`
  )

  // ── 04 ──────────────────────────────────────────────────────────────────
  add(
    '4. Global FDCR Judgment',
    '4. グローバルFDCR判定',
    `The Global Freedom Dialectical Correctness Rate (G-FDCR) is ${f(gfdcr)} / 100. ${
      gfdcr < fdcr - 15
        ? `There is a significant gap between local FDCR (${f(fdcr)}) and global G-FDCR (${f(gfdcr)}). This indicates that the system's local freedom-generation depends on burden transfer to other regions, generations, ecosystems, or invisible workers. Burden transfer risk (BTR = ${f(ms.BTR)}), climate displacement risk (CDR = ${f(ms.CDR)}), and future generation risk (FGR = ${f(ms.FGR)}) are key contributors to this gap.`
        : `The gap between local FDCR (${f(fdcr)}) and global G-FDCR (${f(gfdcr)}) is within acceptable range. However, supply chain dependency risk (SCDR = ${f(ms.SCDR)}) and ecological extraction risk (EER = ${f(ms.EER)}) remain active concerns for planetary-scale correctness.`
    } ${burdenTransfers.length} burden transfer pathway(s) were identified.`
  )

  // ── 05 ──────────────────────────────────────────────────────────────────
  add(
    '5. Creative Future-Challenge Analysis',
    '5. 創造的未来挑戦分析',
    `CFCS = ${f(ms.CFCS)} (${scoreLabel(ms.CFCS)}). ${
      ms.CFCS < 40
        ? `This is critically low. "${target}" does not open genuinely new future possibilities. It manages existing paths rather than enabling creative deviation, experimentation, and non-standard trajectories. The system is likely reducing freedom to stability management.`
        : ms.CFCS < 60
        ? `"${target}" shows moderate creative future-challenge capacity, but experimentation allowance and tolerance for non-standard paths remain insufficient to generate robust dialectical freedom.`
        : `"${target}" demonstrates strong future possibility opening and tolerance for creative deviation.`
    } DER = ${f(ms.DER)} (${scoreLabel(ms.DER)}). Dialectical efficacy — the capacity to convert contradiction and failure into institutional learning — is ${scoreLabel(ms.DER)}.`
  )

  // ── 06 ──────────────────────────────────────────────────────────────────
  add(
    '6. Managerial Self-Justification Risk Analysis',
    '6. 管理的自己正当化リスク分析',
    `MSJR = ${f(ms.MSJR)} (${riskLabel(ms.MSJR)} risk). ${
      ms.MSJR > 70
        ? `HIGH RISK. "${target}" shows strong evidence of managerial self-justification. The system uses safety, efficiency, fairness, innovation, evidence-based policy, or AI authority language to justify control, classification, surveillance, or exclusion. This is a critical freedom-closing mechanism. A cap has been or should be applied to FDCR.`
        : ms.MSJR > 50
        ? `Moderate managerial self-justification risk. The system shows tendencies to use neutral-sounding language to justify institutional control without adequate democratic check.`
        : `Managerial self-justification risk is currently within acceptable range.`
    } Optimization-as-public-good framing and AI-score-as-responsibility-shield patterns are the primary vectors identified.`
  )

  // ── 07 ──────────────────────────────────────────────────────────────────
  add(
    '7. Classification and Re-entry Risk Analysis',
    '7. 分類・再参入リスク分析',
    `CFR = ${f(ms.CFR)} (${riskLabel(ms.CFR)} classification fixation). RBR = ${f(ms.RBR)} (${riskLabel(ms.RBR)} re-entry blockage). RCI = ${f(ms.RCI)} (${scoreLabel(ms.RCI)} return capacity). ${
      ms.RBR > 70 && ms.RCI < 30
        ? `RETURN-CRITICAL. The system creates severe re-entry blockage. Affected subjects face significant barriers to returning after failure, misclassification, illness, low score, or administrative rejection. This constitutes a structurally closed future.`
        : ms.CFR > 70
        ? `High classification fixation risk. Categories imposed by this system are difficult to revise, exit, or contest. AI score persistence and record rigidity are primary drivers.`
        : `Re-entry and classification conditions are ${scoreLabel(ms.RCI) === 'strong' ? 'adequate' : 'in need of strengthening'}.`
    } MTR = ${f(ms.MTR)} — risk of treating limited classifications as truths about human worth or future possibility.`
  )

  // ── 08 ──────────────────────────────────────────────────────────────────
  add(
    '8. Lifeworld Translation Analysis',
    '8. 生活世界翻訳分析',
    `LSAR = ${f(ms.LSAR)} (${scoreLabel(ms.LSAR)}). EIR = ${f(ms.EIR)} (epistemic injustice risk: ${riskLabel(ms.EIR)}). ${
      ms.LSAR < 40
        ? `Lifeworld translation quality is weak. Bodily pain, care burden, local context, and personal testimony are being lost when translated into institutional categories, administrative vocabularies, data fields, and AI-scored outputs. This is a primary site of epistemic injustice.`
        : ms.LSAR < 60
        ? `Lifeworld translation is partial. Some experiential content is preserved, but non-standard cases, care burdens, and local knowledge remain vulnerable to erasure.`
        : `Lifeworld translation quality is relatively strong. Institutional categories allow space for ambiguity and contestation.`
    } EIR = ${f(ms.EIR)}: risk that affected subjects' testimony is dismissed, their pain is unrecognizable in administrative form, or their knowledge is excluded from legitimate audit processes.`
  )

  // ── 09 ──────────────────────────────────────────────────────────────────
  add(
    '9. Bio-Divisional Efficacy Analysis',
    '9. 生命分業的効力分析',
    `BDER = ${f(ms.BDER)} (${scoreLabel(ms.BDER)}). BGR = ${f(ms.BGR)} (${scoreLabel(ms.BGR)}). BBI = ${f(ms.BBI)} (bodily burden index: ${riskLabel(ms.BBI)}). ${
      ms.BDER < 40
        ? `Bio-divisional efficacy is low. The system fails to generate cooperative, living, regenerative division of labor across bodies, institutions, care networks, and ecology. Living beings are being reduced to functional units for productivity, compliance, or optimization.`
        : `Bio-divisional efficacy shows moderate to strong capacity for cooperative labor generation.`
    } BGR = ${f(ms.BGR)}: the system's support for bodily return — sleep, breath, posture, movement, sensory recovery, and embodied practical freedom — is ${scoreLabel(ms.BGR)}. RDR = ${f(ms.RDR)}: responsibility displacement risk (burden shifted to individuals) is ${riskLabel(ms.RDR)}.`
  )

  // ── 10 ──────────────────────────────────────────────────────────────────
  add(
    '10. Democratic Re-Audit Analysis',
    '10. 民主的再監査分析',
    `DRR = ${f(ms.DRR)} (${scoreLabel(ms.DRR)}). ${
      ms.DRR < 30
        ? `CRITICAL. Democratic re-audit capacity is severely insufficient. Affected subjects cannot meaningfully contest, reinterpret, revise, or reopen institutional classifications, AI scores, bureaucratic decisions, or policy models. This is a structural closure of democratic legitimacy.`
        : ms.DRR < 50
        ? `Democratic revisability is weak. Public contestation mechanisms, independent audit bodies, participatory review, and transparent model documentation are inadequate.`
        : `Democratic re-audit capacity is ${scoreLabel(ms.DRR)}. Mechanisms for public contestation, independent oversight, and affected-subject participation are present.`
    } TIGR = ${f(ms.TIGR)}: time generated for appeal, repair, recovery, and institutional learning is ${scoreLabel(ms.TIGR)}.`
  )

  // ── 11 ──────────────────────────────────────────────────────────────────
  add(
    '11. Information-Generation Seven Systems Analysis',
    '11. 情報生成七システム分析',
    `IGR = ${f(ms.IGR)} (information transparency). PDFS = ${f(ms.PDFS)} (pre-classification support). MGR = ${f(ms.MGR)} (meaningful explanation). TFGR = ${f(ms.TFGR)} (truth-feeling generation — lower values indicate less score absolutization). D-RGR = ${f(ms['D-RGR'])} (cooperative relation generation). SRGR = ${f(ms.SRGR)} (responsibility clarity). TIGR = ${f(ms.TIGR)} (temporal integration). ${
      ms.TFGR > 70 ? 'High TFGR indicates dangerous score absolutization — AI or institutional scores are being treated as truths about human essence.' : ''
    }`
  )

  // ── 12 ──────────────────────────────────────────────────────────────────
  add(
    '12. Ecological and Whole-System Analysis',
    '12. 生態・全体システム分析',
    `EGR = ${f(ms.EGR)} (ecological generation rate: ${scoreLabel(ms.EGR)}). EER = ${f(ms.EER)} (ecological extraction risk: ${riskLabel(ms.EER)}). CDR = ${f(ms.CDR)} (climate displacement risk: ${riskLabel(ms.CDR)}). ${
      ms.EER > 70 && ms.EGR < 30
        ? 'HIGH ecological risk. Ecological generation capacity is critically low while extraction and externalization is high. A layer cap of 40 should apply to the Ecological/Whole-System layer.'
        : 'Ecological generation and extraction risks require ongoing monitoring.'
    } AI compute burden, carbon footprint, and supply chain extraction dependency also contribute to these scores.`
  )

  // ── 13 ──────────────────────────────────────────────────────────────────
  add(
    '13. Global Burden Transfer Analysis',
    '13. 地球的負担転嫁分析',
    `BTR = ${f(ms.BTR)} (burden transfer risk: ${riskLabel(ms.BTR)}). FGR = ${f(ms.FGR)} (future generation risk: ${riskLabel(ms.FGR)}). SCDR = ${f(ms.SCDR)} (supply chain dependency risk: ${riskLabel(ms.SCDR)}). CIR = ${f(ms.CIR)} (coloniality/imperial residue risk). DCR = ${f(ms.DCR)} (data colonialism risk). ${
      ms.BTR > 70 ? 'High burden transfer risk. The freedom generated by this system depends on costs transferred to other classes, regions, nations, generations, or ecosystems.' : ''
    } ${burdenTransfers.length > 0 ? `${burdenTransfers.length} burden transfer pathway(s) identified.` : 'No explicit burden transfer pathways above threshold detected.'}`
  )

  // ── 14 ──────────────────────────────────────────────────────────────────
  add(
    '14. Who Wins, Who Loses, and Who Receives the Burden?',
    '14. 誰が勝ち、誰が負け、誰が負担を受けるか？',
    `${actorImpacts.length} actor(s) analyzed. ` +
    `Direct winners: ${winners.length > 0 ? winners.join(', ') : 'none identified'}. ` +
    `Direct losers: ${losers.length > 0 ? losers.join(', ') : 'none identified'}. ` +
    `Hidden or delayed losers: ${hidden.length > 0 ? hidden.join(', ') : 'none'}. ` +
    `Re-entry blocked subjects: ${reBlocked.length > 0 ? reBlocked.join(', ') : 'none'}. ` +
    `Voice-excluded subjects: ${voiceExcl.length > 0 ? voiceExcl.join(', ') : 'none'}. ` +
    `${burdenTransfers.map((b) => `Burden from ${b.from} → ${b.to} (${b.burdenType}, magnitude ${b.magnitude})`).join('; ') || 'No explicit burden transfer pathways above threshold.'}` +
    ` The actor impact distribution indicates ${losers.length > winners.length ? 'a net negative impact on more subjects than winners — freedom gains are concentrated.' : 'a relatively balanced distribution, though hidden losers and voice-excluded subjects require further attention.'}`
  )

  // ── 15 ──────────────────────────────────────────────────────────────────
  add(
    '15. Actor Impact Matrix Interpretation',
    '15. 当事者影響マトリクス解釈',
    `${actorImpacts.map((a) => `${a.actor}: net impact ${a.netImpact > 0 ? '+' : ''}${a.netImpact} (${a.status}) — freedom gain ${a.freedomGain}, freedom loss ${a.freedomLoss}, bodily burden ${a.bodilyBurden}, re-entry capacity ${a.reEntryCapacity}, democratic voice ${a.democraticVoice}`).join('. ') || 'No actor impact data computed (no subjects selected).'}`
  )

  // ── 16 ──────────────────────────────────────────────────────────────────
  add(
    '16. Securitization and Financialization Risks',
    '16. 安全保障化と市場化リスク',
    `SRR = ${f(ms.SRR)} (securitization risk: ${riskLabel(ms.SRR)}). FMR = ${f(ms.FMR)} (financialization/marketization risk: ${riskLabel(ms.FMR)}). NPR = ${f(ms.NPR)} (narrative polarization risk). GSR = ${f(ms.GSR)} (geopolitical security risk). ${
      ms.SRR > 65 ? 'Securitization risk is elevated: safety, order, border, surveillance, or risk-prevention language may be expanding coercive or exclusionary power. ' : ''
    }${ms.FMR > 65 ? 'Financialization risk is elevated: freedom appears conditional on purchasing power, credit score, or market eligibility. ' : ''}`
  )

  // ── 17 ──────────────────────────────────────────────────────────────────
  add(
    '17. Temporal and Metaphysical Risks',
    '17. 時間的・形而上学的リスク',
    `TCR = ${f(ms.TCR)} (temporal compression risk: ${riskLabel(ms.TCR)}). MTR = ${f(ms.MTR)} (metaphysical transgression risk: ${riskLabel(ms.MTR)}). ${
      ms.MTR > 75
        ? 'CRITICAL: High metaphysical transgression risk. Limited models, scores, or AI predictions are being used as if they represent truths about human worth, destiny, ability, or future possibility. This constitutes a fundamental dialectical error.'
        : ''
    }${ms.TCR > 65 ? 'High temporal compression: the system destroys time for repair, learning, recovery, reflection, and institutional memory.' : ''}`
  )

  // ── 18 ──────────────────────────────────────────────────────────────────
  add(
    '18. Historical and Colonial Responsibility',
    '18. 歴史的・植民地的責任',
    `HGR = ${f(ms.HGR)} (historical-generational responsibility rate: ${scoreLabel(ms.HGR)}). CIR = ${f(ms.CIR)} (coloniality/imperial residue risk: ${riskLabel(ms.CIR)}). ${
      ms.CIR > 60 ? 'Significant colonial or imperial residue risk detected. Current freedom, institutional advantage, or technological capacity may be built upon unresolved structural extraction. ' : ''
    }${ms.HGR < 40 ? 'Historical learning integration is weak. The system shows low capacity to learn from past failures, recognize intergenerational responsibility, or avoid repeating past exclusions under new technical language.' : ''}`
  )

  // ── 19 ──────────────────────────────────────────────────────────────────
  add(
    '19. Global Democratic and Planetary Accountability',
    '19. グローバル民主主義と惑星的責任',
    `GDRR = ${f(ms.GDRR)} (global democratic re-audit rate). GDDR = ${f(ms.GDDR)} (global democratic deficit risk). PAI = ${f(ms.PAI)} (planetary accountability index). PRCI = ${f(ms.PRCI)} (planetary return capacity index). CBRI = ${f(ms.CBRI)} (cross-border re-entry index). SCTR = ${f(ms.SCTR)} (supply chain transparency rate). ${ms.GDDR > 65 ? 'Global democratic deficit is high: cross-border effects exceed available democratic institutions for contestation.' : ''} ${ms.PRCI < 35 ? 'Planetary return capacity is low: the capacity for ecological, institutional, and civilizational repair is being undermined.' : ''}`
  )

  // ── 20 ──────────────────────────────────────────────────────────────────
  add(
    '20. Correction Rules Applied',
    '20. 適用された修正ルール',
    `The following correction rules were evaluated during scoring. High MSJR caps FDCR at 55; low RCI caps at 45; high CFR + RBR together cap at 45; low CFCS or DER cap at 60; low BGR caps at 55; low DRR in public policy / bureaucracy caps at 50; high MTR caps at 55. Global correction rules apply further caps to G-FDCR based on BTR, CDR, FGR, GDDR, EER, and PRCI values.`
  )

  // ── 21 ──────────────────────────────────────────────────────────────────
  add(
    '21. Daoist Corrective Lens',
    '21. 道家的修正レンズ',
    `DPS = ${f(ms.DPS)} (Daoist practicality score). WWR = ${f(ms.WWR)} (wu-wei responsiveness). LRI = ${f(ms.LRI)} (low reactivity index). This secondary corrective lens detects over-management, forced optimization, excessive classification, and loss of natural position-generation. It is not the main theory of FEDS Studio — it supports FDCR as a corrective signal only. Low values in DPS and WWR suggest the system imposes excessive intervention or suppresses organic self-organization.`
  )

  // ── 22 ──────────────────────────────────────────────────────────────────
  add(
    '22. Scenario Comparison Summary',
    '22. シナリオ比較要旨',
    `Three scenarios were generated. Current System: FDCR and G-FDCR as reported above. Freedom-Generative Reform Scenario: applies +15 to positive metrics and −15 to risk metrics to model a reform trajectory. Managerial Intensification Scenario: applies −15 to positive metrics and +15 to risk metrics to model a worsening management trajectory. The delta between current and reform scenarios indicates the practical freedom-generation potential of targeted policy intervention.`
  )

  // ── 23 ──────────────────────────────────────────────────────────────────
  add(
    '23. Judgment Categories Summary',
    '23. 判定カテゴリ要旨',
    `Primary judgment: ${judgments[0]}. ${judgments.length > 1 ? `Additional judgments applicable: ${judgments.slice(1).join('; ')}.` : ''} Each judgment reflects a specific pattern of freedom-closing or freedom-generating dynamics identified in the metric profile. Multiple judgments indicate compound structural conditions requiring targeted intervention.`
  )

  // ── 24 ──────────────────────────────────────────────────────────────────
  const improvements: string[] = []
  if (ms.RCI < 40)   improvements.push('Add appeal procedure, record expiration, and reclassification pathway (RCI).')
  if (ms.MSJR > 65)  improvements.push('Separate efficiency from freedom-generation metrics. Add anti-MSJR audit check.')
  if (ms.DRR < 40)   improvements.push('Add independent audit body and participatory review cycle (DRR).')
  if (ms.CFR > 65)   improvements.push('Introduce record expiration and reduce AI score persistence (CFR).')
  if (ms.BGR < 40)   improvements.push('Add bodily burden assessment and time-for-repair policy (BGR).')
  if (ms.EIR > 65)   improvements.push('Add epistemic injustice review and lifeworld testimony channel (EIR).')
  if (ms.BTR > 60)   improvements.push('Add burden transfer disclosure and cross-border accountability mechanism (BTR).')
  if (ms.MTR > 65)   improvements.push('Prevent score from becoming proxy for human worth. Add uncertainty documentation (MTR).')
  if (ms.EER > 65)   improvements.push('Add ecological cost visibility and institutional energy responsibility assignment (EER).')
  if (ms.LSAR < 40)  improvements.push('Add lifeworld testimony channel and affected-subject participation (LSAR).')
  if (ms.BDER < 40)  improvements.push('Strengthen living cooperation and redistribute burden without exploitation (BDER).')
  if (improvements.length === 0) improvements.push('No critical improvement conditions triggered at current thresholds. Continue democratic re-audit cycle.')

  add(
    '24. Improvement Conditions',
    '24. 改善条件',
    improvements.join(' ')
  )

  // ── 25 ──────────────────────────────────────────────────────────────────
  add(
    '25. Final Audit Conclusion',
    '25. 最終監査結論',
    `"${target}" receives a Freedom Dialectical Correctness Rate (FDCR) of ${f(fdcr)} and a Global FDCR of ${f(gfdcr)}. Primary judgment: ${judgments[0]}. ${
      fdcr >= 70
        ? `The system is operating in a freedom-generative direction with adequate creative future-challenge, re-entry capacity, and democratic revisability. Continued democratic re-audit and ecological monitoring are recommended.`
        : fdcr >= 50
        ? `The system has conditional correctness. Without targeted improvements in ${[ms.RCI < 40 ? 're-entry capacity' : '', ms.DRR < 40 ? 'democratic revisability' : '', ms.MSJR > 65 ? 'managerial self-justification reduction' : ''].filter(Boolean).join(', ')}, it risks drift toward freedom-closing patterns.`
        : `The system is below the threshold of dialectical correctness. Structural reform is required to restore creative future-challenge, re-entry, democratic re-audit, and bodily generation. The primary freedom-closing risks are: ${[ms.MSJR > 65 ? 'managerial self-justification' : '', ms.CFR > 65 ? 'classification fixation' : '', ms.RBR > 70 ? 're-entry blockage' : '', ms.MTR > 70 ? 'metaphysical transgression' : ''].filter(Boolean).join(', ') || 'a compound of risks across metrics'}.`
    } This audit is an operational indicator, not a verdict. All findings require democratic re-audit, expert review, and calibration against empirical case data before any institutional action.`
  )

  return {
    generatedAt: new Date().toISOString(),
    target,
    category: cat,
    layers: auditState.layers,
    subjects: auditState.subjects,
    fdcr: Math.round(fdcr),
    gfdcr: Math.round(gfdcr),
    judgment: judgments[0],
    sections,
  }
}
