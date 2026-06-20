import { AuditState } from '@/types/audit'

export interface DemoCase {
  id: string
  label: string
  labelJa: string
  description: string
  descriptionJa: string
  state: AuditState
}

function makeVars(overrides: Record<string, number>): Record<string, number> {
  const base: Record<string, number> = {
    future_possibility_opening: 50,
    creative_deviation_tolerance: 50,
    experimentation_allowance: 50,
    non_standard_path_support: 50,
    conflict_transformation: 50,
    failure_to_learning: 50,
    error_correction_capacity: 50,
    appeal_possibility: 50,
    reapplication_possibility: 50,
    record_expiration: 50,
    rehabilitation_pathway: 50,
    management_efficiency_as_freedom: 50,
    safety_language_control: 50,
    ai_score_responsibility_shield: 50,
    optimization_as_public_good: 50,
    ai_score_persistence: 50,
    record_rigidity: 50,
    predictive_policing: 50,
    bodily_pain_preserved: 50,
    care_burden_preserved: 50,
    local_context_preserved: 50,
    testimony_not_reduced: 50,
    public_contestability: 50,
    independent_audit_body: 50,
    transparent_model_docs: 50,
    sleep_protection: 50,
    breath_recovery: 50,
    commute_burden_reduction: 50,
    sensory_overload_reduction: 50,
    living_cooperation: 50,
    care_network_strength: 50,
    burden_redistribution: 50,
    information_transparency: 50,
    evidence_accessibility: 50,
    pre_classification_support: 50,
    meaningful_explanation: 50,
    score_absolutization: 50,
    cooperative_relation_generation: 50,
    responsibility_clarity: 50,
    time_for_appeal: 50,
    energy_burden: 50,
    carbon_burden: 50,
    regenerative_capacity: 50,
    supply_chain_transparency: 50,
    resource_extraction_dependency: 50,
    ai_compute_burden: 50,
    data_colonialism: 50,
    migrant_access: 50,
    colonial_legacy: 50,
    care_labor_burden: 50,
    testimony_credibility_loss: 50,
    police_power_expansion: 50,
    education_marketization: 50,
    housing_as_investment: 50,
  }
  return { ...base, ...overrides }
}

function makeQs(overrides: Record<string, number>): Record<string, number> {
  const base: Record<string, number> = {
    q_future_opening: 2,
    q_failure_learning: 2,
    q_appeal_strength: 2,
    q_msjr_detection: 2,
    q_lifeworld_preservation: 2,
    q_public_contestability: 2,
    q_bodily_protection: 2,
    q_burden_opacity: 2,
    q_classification_lock: 2,
    q_cost_transfer: 2,
    q_voice_exclusion: 2,
    q_ecological_relation: 2,
    q_record_expiry: 2,
    q_institutional_learning: 2,
    q_temporal_compression: 2,
    q_democratic_revision: 2,
    q_epistemic_erasure: 2,
    q_securitization: 2,
    q_market_conditioning: 2,
    q_narrative_polarization: 2,
  }
  return { ...base, ...overrides }
}

// ─── Demo Case 1: AI Hiring System ─────────────────────────────────────────
const aiHiringState: AuditState = {
  target: 'AI Hiring System',
  category: 'AI scoring system',
  layers: [
    'institutional_bureaucratic',
    'body',
    'political_democratic',
    'social_relational',
    'technological_infrastructural',
  ],
  subjects: ['Workers', 'Applicants', 'Migrants', 'Disabled people', 'Low-income groups'],
  variableValues: makeVars({
    // Low creative openness — system enforces narrow candidate profiles
    future_possibility_opening: 22,
    creative_deviation_tolerance: 18,
    non_standard_path_support: 15,
    // Some error correction exists (HR review)
    error_correction_capacity: 35,
    // Re-entry is very poor — rejected candidates get no explanation
    appeal_possibility: 20,
    reapplication_possibility: 30,
    record_expiration: 18,
    rehabilitation_pathway: 22,
    // High managerial self-justification
    management_efficiency_as_freedom: 80,
    safety_language_control: 65,
    ai_score_responsibility_shield: 88,
    optimization_as_public_good: 82,
    // High classification fixation
    ai_score_persistence: 85,
    record_rigidity: 78,
    predictive_policing: 40,
    // Lifeworld badly translated
    bodily_pain_preserved: 20,
    care_burden_preserved: 18,
    local_context_preserved: 25,
    testimony_not_reduced: 15,
    // Democratic re-audit weak
    public_contestability: 22,
    independent_audit_body: 30,
    transparent_model_docs: 28,
    // Bodily burden: long interview marathons, psychometric testing
    sleep_protection: 40,
    sensory_overload_reduction: 35,
    // Score absolutization very high
    score_absolutization: 90,
    responsibility_clarity: 28,
    time_for_appeal: 20,
    // Moderate ecological — data centers
    ai_compute_burden: 70,
    data_colonialism: 65,
    testimony_credibility_loss: 82,
    education_marketization: 60,
  }),
  questionValues: makeQs({
    q_future_opening: 1,
    q_failure_learning: 1,
    q_appeal_strength: 1,
    q_msjr_detection: 5,
    q_lifeworld_preservation: 1,
    q_public_contestability: 1,
    q_bodily_protection: 2,
    q_burden_opacity: 4,
    q_classification_lock: 5,
    q_cost_transfer: 3,
    q_voice_exclusion: 4,
    q_epistemic_erasure: 4,
    q_securitization: 2,
    q_market_conditioning: 4,
    q_democratic_revision: 1,
    q_institutional_learning: 2,
  }),
}

// ─── Demo Case 2: Smart City Surveillance Policy ───────────────────────────
const smartCityState: AuditState = {
  target: 'Smart City Surveillance Policy',
  category: 'Public policy',
  layers: [
    'urban_spatial',
    'body',
    'political_democratic',
    'technological_infrastructural',
    'institutional_bureaucratic',
    'international_geopolitical',
  ],
  subjects: [
    'Citizens',
    'Migrants',
    'Low-income groups',
    'Disabled people',
    'Children',
    'Local communities',
  ],
  variableValues: makeVars({
    // Creative openness suppressed by surveillance environment
    future_possibility_opening: 30,
    creative_deviation_tolerance: 20,
    experimentation_allowance: 25,
    // Re-entry after misclassification
    appeal_possibility: 28,
    record_expiration: 20,
    rehabilitation_pathway: 25,
    // Very high managerial/safety self-justification
    management_efficiency_as_freedom: 75,
    safety_language_control: 90,
    ai_score_responsibility_shield: 80,
    optimization_as_public_good: 72,
    // Very high classification fixation via face recognition
    ai_score_persistence: 82,
    record_rigidity: 80,
    predictive_policing: 92,
    // Lifeworld badly erased by sensor abstraction
    bodily_pain_preserved: 18,
    care_burden_preserved: 20,
    local_context_preserved: 22,
    testimony_not_reduced: 18,
    // Democratic re-audit very weak
    public_contestability: 20,
    independent_audit_body: 25,
    transparent_model_docs: 20,
    // Heavy bodily burden: surveillance anxiety, movement restriction
    sleep_protection: 35,
    breath_recovery: 38,
    sensory_overload_reduction: 28,
    // Score absolutization
    score_absolutization: 85,
    responsibility_clarity: 30,
    time_for_appeal: 22,
    // High police power
    police_power_expansion: 88,
    // Ecological / compute burden
    energy_burden: 72,
    ai_compute_burden: 78,
    data_colonialism: 70,
    testimony_credibility_loss: 80,
    // Migrant access restricted
    migrant_access: 22,
  }),
  questionValues: makeQs({
    q_future_opening: 1,
    q_failure_learning: 1,
    q_appeal_strength: 1,
    q_msjr_detection: 5,
    q_lifeworld_preservation: 1,
    q_public_contestability: 1,
    q_bodily_protection: 1,
    q_burden_opacity: 4,
    q_classification_lock: 5,
    q_cost_transfer: 3,
    q_voice_exclusion: 5,
    q_ecological_relation: 2,
    q_epistemic_erasure: 4,
    q_securitization: 5,
    q_market_conditioning: 3,
    q_democratic_revision: 1,
    q_institutional_learning: 1,
    q_narrative_polarization: 4,
  }),
}

// ─── Demo Case 3: Public Welfare Scoring System ────────────────────────────
const welfareState: AuditState = {
  target: 'Public Welfare Scoring System',
  category: 'Welfare',
  layers: [
    'institutional_bureaucratic',
    'body',
    'political_democratic',
    'social_relational',
    'historical_cultural',
  ],
  subjects: [
    'Low-income groups',
    'Disabled people',
    'Elderly people',
    'Children',
    'Migrants',
    'Care workers',
    'Future generations',
  ],
  variableValues: makeVars({
    // Low creative openness — rigid eligibility criteria
    future_possibility_opening: 28,
    creative_deviation_tolerance: 22,
    non_standard_path_support: 20,
    // Re-entry partially available but fragmented
    appeal_possibility: 35,
    reapplication_possibility: 38,
    record_expiration: 25,
    rehabilitation_pathway: 30,
    // Moderate managerial self-justification
    management_efficiency_as_freedom: 68,
    safety_language_control: 60,
    ai_score_responsibility_shield: 72,
    optimization_as_public_good: 65,
    // High classification fixation — scoring locks people into categories
    ai_score_persistence: 78,
    record_rigidity: 75,
    // Lifeworld partially preserved but care burden ignored
    bodily_pain_preserved: 30,
    care_burden_preserved: 25,
    local_context_preserved: 32,
    testimony_not_reduced: 28,
    // Democratic re-audit fragile
    public_contestability: 32,
    independent_audit_body: 38,
    transparent_model_docs: 35,
    // Bodily burden from administrative friction
    sleep_protection: 42,
    commute_burden_reduction: 38,
    // Care labor burden high (welfare users also carers)
    care_labor_burden: 80,
    care_network_strength: 35,
    // Score absolutization
    score_absolutization: 78,
    responsibility_clarity: 35,
    time_for_appeal: 32,
    testimony_credibility_loss: 72,
    // Epistemic injustice in form-filling
    education_marketization: 50,
    housing_as_investment: 55,
    burden_redistribution: 30,
  }),
  questionValues: makeQs({
    q_future_opening: 1,
    q_failure_learning: 2,
    q_appeal_strength: 2,
    q_msjr_detection: 4,
    q_lifeworld_preservation: 2,
    q_public_contestability: 2,
    q_bodily_protection: 2,
    q_burden_opacity: 3,
    q_classification_lock: 4,
    q_cost_transfer: 3,
    q_voice_exclusion: 4,
    q_epistemic_erasure: 4,
    q_securitization: 2,
    q_market_conditioning: 3,
    q_democratic_revision: 2,
    q_institutional_learning: 2,
    q_record_expiry: 1,
    q_temporal_compression: 4,
  }),
}

export const DEMO_CASES: DemoCase[] = [
  {
    id: 'ai_hiring',
    label: 'AI Hiring System',
    labelJa: 'AI採用システム',
    description:
      'An automated candidate scoring and filtering system used in large-scale recruitment. Evaluates applicants via algorithmic profile matching, psychometric testing, and historical hiring data.',
    descriptionJa:
      '大規模採用で使用される自動候補者スコアリング・フィルタリングシステム。アルゴリズムによるプロファイルマッチング、心理測定テスト、過去の採用データで応募者を評価する。',
    state: aiHiringState,
  },
  {
    id: 'smart_city_surveillance',
    label: 'Smart City Surveillance Policy',
    labelJa: 'スマートシティ監視政策',
    description:
      'A municipal policy deploying facial recognition, movement tracking, behavioral analytics, and integrated sensor networks to manage public safety, traffic, and social order in an urban environment.',
    descriptionJa:
      '顔認識、移動追跡、行動分析、統合センサーネットワークを展開し、都市環境における公安・交通・社会秩序を管理する自治体政策。',
    state: smartCityState,
  },
  {
    id: 'welfare_scoring',
    label: 'Public Welfare Scoring System',
    labelJa: '公的福祉スコアリングシステム',
    description:
      'A government welfare eligibility system that classifies and scores applicants using administrative data, income verification, behavioral compliance tracking, and algorithmic risk assessment to determine benefit access.',
    descriptionJa:
      '行政データ、収入確認、行動遵守追跡、アルゴリズムによるリスク評価を用いて申請者を分類・採点し、給付へのアクセスを決定する政府の福祉適格性システム。',
    state: welfareState,
  },
]
