export interface JudgmentCategory {
  id: string
  name: string
  nameJa: string
  description: string
  thresholds: string
}

export const JUDGMENT_CATEGORIES: JudgmentCategory[] = [
  { id: 'freedom_dialectically_correct', name: 'Freedom Dialectically Correct', nameJa: '自由弁証法的に正しい', description: 'The system generates freedom dialectically across layers with low transfer risk.', thresholds: 'FDCR >= 70' },
  { id: 'conditionally_correct', name: 'Conditionally Correct', nameJa: '条件付きで正しい', description: 'Broadly generative but conditional on specific reforms.', thresholds: 'FDCR 55-69' },
  { id: 'dialectically_unstable', name: 'Dialectically Unstable', nameJa: '弁証法的に不安定', description: 'Mixed dynamics; generativity and closure coexist unstably.', thresholds: 'FDCR 40-54' },
  { id: 'freedom_closing', name: 'Freedom Closing', nameJa: '自由の閉鎖', description: 'System fixes classifications and blocks re-entry.', thresholds: 'CFR > 80 and RBR > 70' },
  { id: 'managerially_self_justifying', name: 'Managerially Self-Justifying', nameJa: '管理的自己正当化', description: 'Control justified through safety/efficiency language.', thresholds: 'MSJR > 70 and CFCS < 40' },
  { id: 'return_critical', name: 'Return Critical', nameJa: '再参入危機', description: 'Re-entry is critically blocked for affected subjects.', thresholds: 'RBR > 80 and RCI < 30' },
  { id: 'locally_generative_globally_transferring', name: 'Locally Generative, Globally Transferring', nameJa: '局所生成・地球転嫁', description: 'Generative locally but transfers burden globally.', thresholds: 'FDCR > 70 and G-FDCR < 45' },
  { id: 'epistemically_unjust', name: 'Epistemically Unjust', nameJa: '認識的に不正', description: 'Testimony silenced; lifeworld reduced to data.', thresholds: 'EIR > 70' },
  { id: 'ecologically_externalizing', name: 'Ecologically Externalizing', nameJa: '生態外部化', description: 'Ecological burden externalized to whole-system.', thresholds: 'EER > 70 or CDR > 70' },
  { id: 'colonially_reproducing', name: 'Colonially Reproducing', nameJa: '植民地的再生産', description: 'Reproduces colonial / data-colonial injustice.', thresholds: 'CIR > 65 or DCR > 65' },
  { id: 'future_silencing', name: 'Future Silencing', nameJa: '未来沈黙化', description: 'Costs transferred to silenced future generations.', thresholds: 'FGR > 65 or GSR > 65' },
  { id: 'marketizing_basic_needs', name: 'Marketizing Basic Needs', nameJa: '基本ニーズの市場化', description: 'Basic needs converted into market commodities.', thresholds: 'FMR > 65' },
  { id: 'bodily_burdening', name: 'Bodily Burdening', nameJa: '身体負担化', description: 'Accumulated bodily and temporal burden.', thresholds: 'BBI > 65' },
  { id: 'state_repressive', name: 'State Repressive', nameJa: '国家抑圧的', description: 'Expands coercive state and police power.', thresholds: 'SRR > 65' },
  { id: 'precarity_normalizing', name: 'Precarity Normalizing', nameJa: '不安定常態化', description: 'Normalizes precarious conditions.', thresholds: 'NPR > 65' },
  { id: 'dao_aligned', name: 'Dao-Aligned', nameJa: '道に適う', description: 'Aligned with non-coercive natural ordering.', thresholds: 'DPS > 65 and WWR > 60' },
  // ── Ecological judgment categories ────────────────────────────────────────
  { id: 'ecologically_correct_freedom_evolution', name: 'Ecologically Correct Freedom-Evolution', nameJa: '生態的に正しい自由進化', description: 'The system generates human freedom while preserving ecological regeneration, planetary return capacity, non-human life, future generations, and transparent division of labor.', thresholds: 'E-FDCR >= 65 and EBDCR >= 60 and EGR >= 60' },
  { id: 'locally_free_ecologically_incorrect', name: 'Locally Freedom-Generative but Ecologically Incorrect', nameJa: '局所的自由生成・生態的不正答', description: 'The system generates local human freedom while transferring burden to ecosystems, other regions, non-human life, or future generations.', thresholds: 'FDCR > 70 and E-FDCR < 45' },
  { id: 'ecologically_opaque_freedom', name: 'Ecologically Opaque Freedom', nameJa: '生態的不透明自由', description: 'The system appears clean, efficient, or sustainable locally but hides extraction, logistics, waste, energy, labor, or planetary burden elsewhere.', thresholds: 'SCDR > 75 and SCTR < 35' },
  { id: 'human_centered_bio_division_eco_failure', name: 'Human-Centered Bio-Division with Ecological Failure', nameJa: '人間中心生命分業・生態失敗', description: 'The system produces human cooperation or institutional efficiency while excluding ecological systems and non-human life from the division-of-labor audit.', thresholds: 'EBDCR < 40 and BDER > 70' },
  { id: 'eco_planetary_freedom_failure', name: 'Eco-Planetary Freedom Failure', nameJa: '生態地球的自由失敗', description: 'The system cannot be considered freedom-generative because its freedom depends on ecological destruction, future-generation burden, or planetary return failure.', thresholds: 'E-FDCR < 35' },
]
