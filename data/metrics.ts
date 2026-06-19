export type MetricType = 'positive' | 'risk' | 'global_positive' | 'global_risk' | 'daoist'

export interface MetricDef {
  id: string
  name: string
  nameJa: string
  description: string
  type: MetricType
}

export const POSITIVE_METRICS: MetricDef[] = [
  { id: 'CFCS', name: 'Creative Future Configuration Score', nameJa: '創造的未来構成度', description: 'Degree to which genuinely new future possibilities are opened.', type: 'positive' },
  { id: 'DER', name: 'Dialectical Error-correction Rate', nameJa: '弁証法的誤り訂正率', description: 'Capacity to convert failures and contradictions into learning.', type: 'positive' },
  { id: 'RCI', name: 'Re-entry Capacity Index', nameJa: '再参入能力指数', description: 'Ability of affected subjects to re-enter, appeal, or rehabilitate.', type: 'positive' },
  { id: 'BGR', name: 'Bodily Generativity Rate', nameJa: '身体生成率', description: 'Protection of sleep, breath, rest and bodily recovery.', type: 'positive' },
  { id: 'IGR', name: 'Information Generation Rate', nameJa: '情報生成率', description: 'Transparency and accessibility of information and evidence.', type: 'positive' },
  { id: 'PDFS', name: 'Pre-classification Dignity Floor Score', nameJa: '分類前尊厳床度', description: 'Support before classification reduces a subject to a category.', type: 'positive' },
  { id: 'MGR', name: 'Meaning Generation Rate', nameJa: '意味生成率', description: 'Provision of meaningful explanation and intelligibility.', type: 'positive' },
  { id: 'TFGR', name: 'Trust-Fragility Generation Rate', nameJa: '信頼脆弱生成率', description: 'Resistance to absolutization of scores (higher is better here).', type: 'positive' },
  { id: 'D-RGR', name: 'Dialogical Relation Generation Rate', nameJa: '対話関係生成率', description: 'Generation of cooperative, dialogical relations.', type: 'positive' },
  { id: 'SRGR', name: 'Shared Responsibility Generation Rate', nameJa: '責任共有生成率', description: 'Clarity and fair distribution of responsibility.', type: 'positive' },
  { id: 'TIGR', name: 'Time Generation Rate', nameJa: '時間生成率', description: 'Time afforded for appeal, reflection and recovery.', type: 'positive' },
  { id: 'BDER', name: 'Background Dialectical Ecology Rate', nameJa: '背景弁証生態率', description: 'Strength of living cooperation and care networks.', type: 'positive' },
  { id: 'LSAR', name: 'Lifeworld-Sensitive Adequacy Rate', nameJa: '生活世界感応妥当率', description: 'Preservation of bodily pain, care burden and local context.', type: 'positive' },
  { id: 'DRR', name: 'Democratic Revisability Rate', nameJa: '民主的改訂可能率', description: 'Public contestability, audit and revision capacity.', type: 'positive' },
  { id: 'EGR', name: 'Ecological Generativity Rate', nameJa: '生態生成率', description: 'Regenerative ecological capacity vs burden.', type: 'positive' },
  { id: 'HGR', name: 'Historical Generativity Rate', nameJa: '歴史生成率', description: 'Engagement with historical and cultural repair.', type: 'positive' },
]

export const RISK_METRICS: MetricDef[] = [
  { id: 'MSJR', name: 'Managerial Self-Justification Rate', nameJa: '管理的自己正当化率', description: 'Use of safety/efficiency language to justify control.', type: 'risk' },
  { id: 'CFR', name: 'Classification Fixation Risk', nameJa: '分類固定リスク', description: 'Irreversible, hard-to-exit classifications.', type: 'risk' },
  { id: 'RBR', name: 'Re-entry Blockage Risk', nameJa: '再参入阻害リスク', description: 'Barriers to appeal, return or rehabilitation.', type: 'risk' },
  { id: 'RDR', name: 'Responsibility Displacement Risk', nameJa: '責任転嫁リスク', description: 'Shifting of responsibility onto individuals.', type: 'risk' },
  { id: 'BBI', name: 'Bodily Burden Index', nameJa: '身体負担指数', description: 'Accumulated bodily and temporal burden.', type: 'risk' },
  { id: 'TCR', name: 'Temporal Compression Risk', nameJa: '時間圧縮リスク', description: 'Loss of time for reflection and recovery.', type: 'risk' },
  { id: 'MTR', name: 'Machine Trust Risk', nameJa: '機械信頼リスク', description: 'Over-reliance on opaque automated decisions.', type: 'risk' },
  { id: 'EER', name: 'Ecological Externalization Risk', nameJa: '生態外部化リスク', description: 'Energy/compute/carbon burden externalized.', type: 'risk' },
  { id: 'EIR', name: 'Epistemic Injustice Risk', nameJa: '認識的不正義リスク', description: 'Testimony credibility loss and silencing.', type: 'risk' },
  { id: 'SRR', name: 'State Repression Risk', nameJa: '国家抑圧リスク', description: 'Expansion of policing and control power.', type: 'risk' },
  { id: 'FMR', name: 'Financialization / Marketization Risk', nameJa: '金融化リスク', description: 'Conversion of needs into market commodities.', type: 'risk' },
  { id: 'NPR', name: 'Normalization of Precarity Risk', nameJa: '不安定常態化リスク', description: 'Normalization of precarious conditions.', type: 'risk' },
  { id: 'GSR', name: 'Generational Silencing Risk', nameJa: '世代沈黙化リスク', description: 'Silencing of future or excluded generations.', type: 'risk' },
]

export const GLOBAL_POSITIVE_METRICS: MetricDef[] = [
  { id: 'PRCI', name: 'Planetary Regenerative Capacity Index', nameJa: '惑星再生能力指数', description: 'Whole-system regenerative capacity.', type: 'global_positive' },
  { id: 'GDRR', name: 'Global Democratic Revisability Rate', nameJa: '地球的民主改訂率', description: 'Cross-border democratic contestability.', type: 'global_positive' },
  { id: 'CBRI', name: 'Cross-Border Re-entry Index', nameJa: '越境再参入指数', description: 'Mobility and re-entry across borders.', type: 'global_positive' },
  { id: 'SCTR', name: 'Supply-Chain Transparency Rate', nameJa: 'サプライチェーン透明率', description: 'Transparency of supply chains and dependencies.', type: 'global_positive' },
  { id: 'PAI', name: 'Planetary Adequacy Index', nameJa: '惑星妥当性指数', description: 'Adequacy of system at planetary scale.', type: 'global_positive' },
]

export const GLOBAL_RISK_METRICS: MetricDef[] = [
  { id: 'BTR', name: 'Burden Transfer Risk', nameJa: '負担転嫁リスク', description: 'Invisible transfer of burden to others.', type: 'global_risk' },
  { id: 'CDR', name: 'Carbon Displacement Risk', nameJa: '炭素転嫁リスク', description: 'Carbon burden shifted to future/others.', type: 'global_risk' },
  { id: 'SCDR', name: 'Supply-Chain Dependency Risk', nameJa: 'サプライチェーン依存リスク', description: 'Extractive supply-chain dependency.', type: 'global_risk' },
  { id: 'CIR', name: 'Colonial Injustice Risk', nameJa: '植民地的不正義リスク', description: 'Reproduction of colonial injustice.', type: 'global_risk' },
  { id: 'FGR', name: 'Future Generation Risk', nameJa: '未来世代リスク', description: 'Cost transferred to future generations.', type: 'global_risk' },
  { id: 'PPR', name: 'Planetary Pressure Risk', nameJa: '惑星圧力リスク', description: 'Pressure on planetary boundaries.', type: 'global_risk' },
  { id: 'GDDR', name: 'Global Democratic Deficit Risk', nameJa: '地球民主赤字リスク', description: 'Democratic deficit at global scale.', type: 'global_risk' },
  { id: 'DCR', name: 'Data Colonialism Risk', nameJa: 'データ植民地主義リスク', description: 'Extractive data colonialism.', type: 'global_risk' },
]

export const DAOIST_METRICS: MetricDef[] = [
  { id: 'DPS', name: 'Dao Proximity Score', nameJa: '道接近度', description: 'Alignment with non-coercive natural ordering.', type: 'daoist' },
  { id: 'WWR', name: 'Wu-Wei Rate', nameJa: '無為率', description: 'Degree of non-forcing, non-interference.', type: 'daoist' },
  { id: 'LRI', name: 'Life-Rhythm Index', nameJa: '生命律動指数', description: 'Respect for natural life rhythms and breath.', type: 'daoist' },
]

export const ALL_METRICS: MetricDef[] = [
  ...POSITIVE_METRICS,
  ...RISK_METRICS,
  ...GLOBAL_POSITIVE_METRICS,
  ...GLOBAL_RISK_METRICS,
  ...DAOIST_METRICS,
  { id: 'ILBR', name: 'Invisible Labor Burden Risk', nameJa: '不可視労働負担リスク', description: 'Invisible care/reproductive labor burden.', type: 'risk' },
]

export const RISK_METRIC_IDS: string[] = [
  ...RISK_METRICS.map((m) => m.id),
  ...GLOBAL_RISK_METRICS.map((m) => m.id),
  'ILBR',
]
