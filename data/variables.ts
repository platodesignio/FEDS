import { VariableSchema } from '@/types/audit'
import { MetricRef } from '@/types/metric'

function m(metric: string, weight: number, polarity: 'positive' | 'negative' = 'positive'): MetricRef {
  return { metric, weight, polarity }
}

interface V {
  id: string
  label: string
  labelJa: string
  category: string
  polarity: 'positive' | 'negative'
  metrics: MetricRef[]
  layers?: string[]
  actors?: string[]
  description?: string
}

const RAW: V[] = [
  // A — Future / creative openness
  { id: 'future_possibility_opening', label: 'Future possibility opening', labelJa: '未来可能性の開放', category: 'A', polarity: 'positive', metrics: [m('CFCS', 1.2)], layers: ['individual', 'social'] },
  { id: 'creative_deviation_tolerance', label: 'Creative deviation tolerance', labelJa: '創造的逸脱の許容', category: 'A', polarity: 'positive', metrics: [m('CFCS', 1.0)] },
  { id: 'experimentation_allowance', label: 'Experimentation allowance', labelJa: '実験の許容', category: 'A', polarity: 'positive', metrics: [m('CFCS', 0.8), m('DER', 0.6)] },
  { id: 'non_standard_path_support', label: 'Non-standard path support', labelJa: '非標準経路の支援', category: 'A', polarity: 'positive', metrics: [m('CFCS', 0.8), m('RCI', 0.6)] },
  // B — Error correction
  { id: 'conflict_transformation', label: 'Conflict transformation', labelJa: '対立の変換', category: 'B', polarity: 'positive', metrics: [m('DER', 1.0)] },
  { id: 'failure_to_learning', label: 'Failure-to-learning conversion', labelJa: '失敗から学習へ', category: 'B', polarity: 'positive', metrics: [m('DER', 1.0), m('CFCS', 0.5)] },
  { id: 'error_correction_capacity', label: 'Error correction capacity', labelJa: '誤り訂正能力', category: 'B', polarity: 'positive', metrics: [m('DER', 1.0), m('RCI', 0.5)] },
  // C — Re-entry
  { id: 'appeal_possibility', label: 'Appeal possibility', labelJa: '異議申立の可能性', category: 'C', polarity: 'positive', metrics: [m('RCI', 1.2), m('DRR', 0.8), m('RBR', 1.3, 'negative')] },
  { id: 'reapplication_possibility', label: 'Re-application possibility', labelJa: '再申請の可能性', category: 'C', polarity: 'positive', metrics: [m('RCI', 1.0)] },
  { id: 'record_expiration', label: 'Record expiration', labelJa: '記録の失効', category: 'C', polarity: 'positive', metrics: [m('RCI', 1.0), m('CFR', 1.0, 'negative')] },
  { id: 'rehabilitation_pathway', label: 'Rehabilitation pathway', labelJa: '更生経路', category: 'C', polarity: 'positive', metrics: [m('RCI', 1.0), m('BDER', 0.6)] },
  // D — Managerial self-justification (negative)
  { id: 'management_efficiency_as_freedom', label: 'Management efficiency framed as freedom', labelJa: '効率の自由化', category: 'D', polarity: 'negative', metrics: [m('MSJR', 1.5, 'negative')] },
  { id: 'safety_language_control', label: 'Safety-language control', labelJa: '安全言語による統制', category: 'D', polarity: 'negative', metrics: [m('MSJR', 1.2, 'negative'), m('SRR', 0.8, 'negative')] },
  { id: 'ai_score_responsibility_shield', label: 'AI score as responsibility shield', labelJa: 'AIスコアの責任盾化', category: 'D', polarity: 'negative', metrics: [m('MSJR', 1.2, 'negative'), m('MTR', 1.0, 'negative')] },
  { id: 'optimization_as_public_good', label: 'Optimization framed as public good', labelJa: '最適化の公益化', category: 'D', polarity: 'negative', metrics: [m('MSJR', 1.0, 'negative'), m('CFR', 0.8, 'negative')] },
  // E — Classification fixation (negative)
  { id: 'ai_score_persistence', label: 'AI score persistence', labelJa: 'AIスコアの永続性', category: 'E', polarity: 'negative', metrics: [m('CFR', 1.3, 'negative'), m('RBR', 1.0, 'negative')] },
  { id: 'record_rigidity', label: 'Record rigidity', labelJa: '記録の硬直性', category: 'E', polarity: 'negative', metrics: [m('CFR', 1.2, 'negative')] },
  { id: 'predictive_policing', label: 'Predictive policing', labelJa: '予測的取締り', category: 'E', polarity: 'negative', metrics: [m('CFR', 1.0, 'negative'), m('SRR', 1.0, 'negative'), m('MTR', 0.8, 'negative')] },
  // F — Lifeworld sensitivity
  { id: 'bodily_pain_preserved', label: 'Bodily pain preserved in record', labelJa: '身体的痛みの保存', category: 'F', polarity: 'positive', metrics: [m('LSAR', 1.0), m('EIR', 1.0, 'negative')] },
  { id: 'care_burden_preserved', label: 'Care burden preserved', labelJa: 'ケア負担の保存', category: 'F', polarity: 'positive', metrics: [m('LSAR', 1.0), m('EIR', 0.8, 'negative')] },
  { id: 'local_context_preserved', label: 'Local context preserved', labelJa: '地域文脈の保存', category: 'F', polarity: 'positive', metrics: [m('LSAR', 1.0)] },
  { id: 'testimony_not_reduced', label: 'Testimony not reduced to data', labelJa: '証言の非還元', category: 'F', polarity: 'positive', metrics: [m('LSAR', 0.8), m('EIR', 1.0, 'negative')] },
  // G — Democratic revisability
  { id: 'public_contestability', label: 'Public contestability', labelJa: '公的争訟可能性', category: 'G', polarity: 'positive', metrics: [m('DRR', 1.2)] },
  { id: 'independent_audit_body', label: 'Independent audit body', labelJa: '独立監査機関', category: 'G', polarity: 'positive', metrics: [m('DRR', 1.0)] },
  { id: 'transparent_model_docs', label: 'Transparent model documentation', labelJa: '透明なモデル文書', category: 'G', polarity: 'positive', metrics: [m('DRR', 0.8), m('LSAR', 0.5)] },
  // H — Bodily generativity
  { id: 'sleep_protection', label: 'Sleep protection', labelJa: '睡眠の保護', category: 'H', polarity: 'positive', metrics: [m('BGR', 1.0)] },
  { id: 'breath_recovery', label: 'Breath / recovery', labelJa: '呼吸・回復', category: 'H', polarity: 'positive', metrics: [m('BGR', 1.0), m('LRI', 0.8)] },
  { id: 'commute_burden_reduction', label: 'Commute burden reduction', labelJa: '通勤負担の軽減', category: 'H', polarity: 'positive', metrics: [m('BGR', 0.8), m('BBI', 0.8, 'negative')] },
  { id: 'sensory_overload_reduction', label: 'Sensory overload reduction', labelJa: '感覚過負荷の軽減', category: 'H', polarity: 'positive', metrics: [m('BGR', 0.8), m('BBI', 0.8, 'negative')] },
  // I — Background ecology / care
  { id: 'living_cooperation', label: 'Living cooperation', labelJa: '生きた協働', category: 'I', polarity: 'positive', metrics: [m('BDER', 1.0)] },
  { id: 'care_network_strength', label: 'Care network strength', labelJa: 'ケアネットワークの強度', category: 'I', polarity: 'positive', metrics: [m('BDER', 1.0), m('RCI', 0.5)] },
  { id: 'burden_redistribution', label: 'Burden redistribution', labelJa: '負担の再分配', category: 'I', polarity: 'positive', metrics: [m('BDER', 0.8), m('RDR', 1.0, 'negative')] },
  // J — Generative theory indicators
  { id: 'information_transparency', label: 'Information transparency', labelJa: '情報の透明性', category: 'J-IGR', polarity: 'positive', metrics: [m('IGR', 1.0)] },
  { id: 'evidence_accessibility', label: 'Evidence accessibility', labelJa: '証拠へのアクセス', category: 'J-IGR', polarity: 'positive', metrics: [m('IGR', 1.0)] },
  { id: 'pre_classification_support', label: 'Pre-classification support', labelJa: '分類前支援', category: 'J-PDFS', polarity: 'positive', metrics: [m('PDFS', 1.0)] },
  { id: 'meaningful_explanation', label: 'Meaningful explanation', labelJa: '意味ある説明', category: 'J-MGR', polarity: 'positive', metrics: [m('MGR', 1.0)] },
  { id: 'score_absolutization', label: 'Score absolutization', labelJa: 'スコアの絶対化', category: 'J-TFGR', polarity: 'negative', metrics: [m('TFGR', 1.0, 'negative'), m('MTR', 0.8, 'negative')] },
  { id: 'cooperative_relation_generation', label: 'Cooperative relation generation', labelJa: '協働関係の生成', category: 'J-D-RGR', polarity: 'positive', metrics: [m('D-RGR', 1.0)] },
  { id: 'responsibility_clarity', label: 'Responsibility clarity', labelJa: '責任の明確化', category: 'J-SRGR', polarity: 'positive', metrics: [m('SRGR', 1.0)] },
  { id: 'time_for_appeal', label: 'Time for appeal', labelJa: '異議申立の時間', category: 'J-TIGR', polarity: 'positive', metrics: [m('TIGR', 1.0), m('TCR', 0.8, 'negative')] },
  // K/L — Ecological
  { id: 'energy_burden', label: 'Energy burden', labelJa: 'エネルギー負担', category: 'K', polarity: 'negative', metrics: [m('EGR', 1.0, 'negative'), m('EER', 1.0, 'negative')] },
  { id: 'carbon_burden', label: 'Carbon burden', labelJa: '炭素負担', category: 'K', polarity: 'negative', metrics: [m('EGR', 1.0, 'negative'), m('EER', 0.8, 'negative'), m('CDR', 1.0, 'negative')] },
  { id: 'regenerative_capacity', label: 'Regenerative capacity', labelJa: '再生能力', category: 'K', polarity: 'positive', metrics: [m('EGR', 1.0), m('PRCI', 0.8)] },
  // M — Supply chain
  { id: 'supply_chain_transparency', label: 'Supply chain transparency', labelJa: 'サプライチェーン透明性', category: 'M', polarity: 'positive', metrics: [m('SCTR', 1.0)] },
  { id: 'resource_extraction_dependency', label: 'Resource extraction dependency', labelJa: '資源採取依存', category: 'M', polarity: 'negative', metrics: [m('SCDR', 1.0, 'negative')] },
  // N — Compute / data
  { id: 'ai_compute_burden', label: 'AI compute burden', labelJa: 'AI計算負担', category: 'N', polarity: 'negative', metrics: [m('EER', 1.0, 'negative'), m('EGR', 0.6, 'negative')] },
  { id: 'data_colonialism', label: 'Data colonialism', labelJa: 'データ植民地主義', category: 'N', polarity: 'negative', metrics: [m('DCR', 1.2, 'negative'), m('CIR', 0.8, 'negative')] },
  // O — Mobility
  { id: 'migrant_access', label: 'Migrant access', labelJa: '移民のアクセス', category: 'O', polarity: 'positive', metrics: [m('CBRI', 1.0)] },
  // Q — Colonial / historical
  { id: 'colonial_legacy', label: 'Colonial legacy', labelJa: '植民地的遺産', category: 'Q', polarity: 'negative', metrics: [m('CIR', 1.0, 'negative'), m('HGR', 0.8, 'negative')] },
  // S — Care labor
  { id: 'care_labor_burden', label: 'Care labor burden', labelJa: 'ケア労働負担', category: 'S', polarity: 'negative', metrics: [m('BBI', 1.0, 'negative'), m('ILBR', 1.0, 'negative')] },
  // T — Epistemic
  { id: 'testimony_credibility_loss', label: 'Testimony credibility loss', labelJa: '証言信用性の喪失', category: 'T', polarity: 'negative', metrics: [m('EIR', 1.2, 'negative')] },
  // U — Police power
  { id: 'police_power_expansion', label: 'Police power expansion', labelJa: '警察権力の拡大', category: 'U', polarity: 'negative', metrics: [m('SRR', 1.2, 'negative'), m('CFR', 0.8, 'negative')] },
  // V — Marketization
  { id: 'education_marketization', label: 'Education marketization', labelJa: '教育の市場化', category: 'V', polarity: 'negative', metrics: [m('FMR', 1.0, 'negative')] },
  { id: 'housing_as_investment', label: 'Housing as investment', labelJa: '投資対象としての住宅', category: 'V', polarity: 'negative', metrics: [m('FMR', 1.0, 'negative'), m('RCI', 0.6, 'negative')] },
]

export const VARIABLES: VariableSchema[] = RAW.map((v) => ({
  id: v.id,
  label: v.label,
  labelJa: v.labelJa,
  description: v.description ?? v.label,
  category: v.category,
  affectedMetrics: v.metrics,
  affectedLayers: v.layers ?? [],
  affectedActors: v.actors ?? [],
  polarity: v.polarity,
  weight: 1,
  defaultValue: 50,
  min: 0,
  max: 100,
}))

export const VARIABLE_CATEGORIES: { id: string; label: string; labelJa: string }[] = [
  { id: 'A', label: 'Future / Creative Openness', labelJa: '未来・創造的開放' },
  { id: 'B', label: 'Error Correction', labelJa: '誤り訂正' },
  { id: 'C', label: 'Re-entry', labelJa: '再参入' },
  { id: 'D', label: 'Managerial Self-Justification', labelJa: '管理的自己正当化' },
  { id: 'E', label: 'Classification Fixation', labelJa: '分類固定' },
  { id: 'F', label: 'Lifeworld Sensitivity', labelJa: '生活世界感応' },
  { id: 'G', label: 'Democratic Revisability', labelJa: '民主的改訂' },
  { id: 'H', label: 'Bodily Generativity', labelJa: '身体生成' },
  { id: 'I', label: 'Background Ecology / Care', labelJa: '背景生態・ケア' },
  { id: 'J-IGR', label: 'Information Generation', labelJa: '情報生成' },
  { id: 'J-PDFS', label: 'Pre-classification Dignity', labelJa: '分類前尊厳' },
  { id: 'J-MGR', label: 'Meaning Generation', labelJa: '意味生成' },
  { id: 'J-TFGR', label: 'Trust Fragility', labelJa: '信頼脆弱' },
  { id: 'J-D-RGR', label: 'Dialogical Relations', labelJa: '対話関係' },
  { id: 'J-SRGR', label: 'Shared Responsibility', labelJa: '責任共有' },
  { id: 'J-TIGR', label: 'Time Generation', labelJa: '時間生成' },
  { id: 'K', label: 'Ecological Burden', labelJa: '生態負担' },
  { id: 'M', label: 'Supply Chain', labelJa: 'サプライチェーン' },
  { id: 'N', label: 'Compute / Data', labelJa: '計算・データ' },
  { id: 'O', label: 'Mobility', labelJa: '移動' },
  { id: 'Q', label: 'Colonial / Historical', labelJa: '植民地・歴史' },
  { id: 'S', label: 'Care Labor', labelJa: 'ケア労働' },
  { id: 'T', label: 'Epistemic Justice', labelJa: '認識的正義' },
  { id: 'U', label: 'Police Power', labelJa: '警察権力' },
  { id: 'V', label: 'Marketization', labelJa: '市場化' },
]
