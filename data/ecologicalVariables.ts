import { VariableSchema } from '@/types/audit'
import { MetricRef } from '@/types/metric'

function m(metric: string, weight: number, polarity: 'positive' | 'negative' = 'positive'): MetricRef {
  return { metric, weight, polarity }
}

interface V {
  id: string; label: string; labelJa: string; category: string
  polarity: 'positive' | 'negative'; metrics: MetricRef[]
  layers?: string[]; actors?: string[]; description?: string
}

const ECO_RAW: V[] = [
  // ── A. Ecological Division Variables ─────────────────────────────────────
  { id: 'food_system_dependency',   label: 'Food system dependency',   labelJa: '食料システム依存度',   category: 'ECO_A', polarity: 'negative', metrics: [m('EER', 1.0, 'negative'), m('BTR', 0.8, 'negative'), m('BDER', 0.6, 'negative')] },
  { id: 'water_system_dependency',  label: 'Water system dependency',  labelJa: '水システム依存度',     category: 'ECO_A', polarity: 'negative', metrics: [m('EER', 0.9, 'negative'), m('PRCI', 0.8, 'negative')] },
  { id: 'energy_system_dependency', label: 'Energy system dependency', labelJa: 'エネルギーシステム依存度', category: 'ECO_A', polarity: 'negative', metrics: [m('EER', 1.0, 'negative'), m('CDR', 0.8, 'negative'), m('SCDR', 0.6, 'negative')] },
  { id: 'soil_degradation',         label: 'Soil degradation',         labelJa: '土壌劣化',             category: 'ECO_A', polarity: 'negative', metrics: [m('EGR', 1.2, 'negative'), m('EER', 0.8, 'negative'), m('PRCI', 0.6, 'negative')] },
  { id: 'biodiversity_loss',        label: 'Biodiversity loss',        labelJa: '生物多様性損失',       category: 'ECO_A', polarity: 'negative', metrics: [m('EGR', 1.3, 'negative'), m('EER', 1.0, 'negative'), m('PRCI', 0.8, 'negative')] },
  { id: 'forest_extraction',        label: 'Forest extraction',        labelJa: '森林採取',             category: 'ECO_A', polarity: 'negative', metrics: [m('EER', 1.1, 'negative'), m('CDR', 0.9, 'negative'), m('EGR', 1.0, 'negative')] },
  { id: 'ocean_burden',             label: 'Ocean burden',             labelJa: '海洋負担',             category: 'ECO_A', polarity: 'negative', metrics: [m('EER', 1.0, 'negative'), m('PRCI', 0.7, 'negative'), m('FGR', 0.8, 'negative')] },
  { id: 'waste_displacement',       label: 'Waste displacement',       labelJa: '廃棄物転嫁',           category: 'ECO_A', polarity: 'negative', metrics: [m('BTR', 1.2, 'negative'), m('EER', 0.9, 'negative'), m('CIR', 0.7, 'negative')] },
  { id: 'land_use_conversion',      label: 'Land-use conversion',      labelJa: '土地利用転換',         category: 'ECO_A', polarity: 'negative', metrics: [m('EGR', 1.0, 'negative'), m('EER', 0.8, 'negative'), m('PRCI', 0.6, 'negative')] },
  { id: 'species_displacement',     label: 'Species displacement',     labelJa: '種の移動・排除',       category: 'ECO_A', polarity: 'negative', metrics: [m('EGR', 1.1, 'negative'), m('PRCI', 0.9, 'negative'), m('FGR', 0.7, 'negative')] },
  { id: 'habitat_fragmentation',    label: 'Habitat fragmentation',    labelJa: '生息地断片化',         category: 'ECO_A', polarity: 'negative', metrics: [m('EGR', 1.0, 'negative'), m('EER', 0.8, 'negative')] },
  { id: 'ecological_repair_capacity', label: 'Ecological repair capacity', labelJa: '生態修復能力',     category: 'ECO_A', polarity: 'positive', metrics: [m('EGR', 1.2), m('PRCI', 1.0), m('EER', 0.8, 'negative')] },
  { id: 'regenerative_local_cycles', label: 'Regenerative local cycles', labelJa: '再生的地域循環',    category: 'ECO_A', polarity: 'positive', metrics: [m('EGR', 1.0), m('BDER', 0.8), m('PRCI', 0.7)] },
  { id: 'non_human_life_consideration', label: 'Non-human life consideration', labelJa: '非人間生命への配慮', category: 'ECO_A', polarity: 'positive', metrics: [m('EGR', 1.0), m('PAI', 0.8), m('PRCI', 0.7)] },
  { id: 'ecological_re_entry_capacity', label: 'Ecological re-entry capacity', labelJa: '生態的再参入能力', category: 'ECO_A', polarity: 'positive', metrics: [m('PRCI', 1.2), m('EGR', 0.8), m('RCI', 0.6)] },

  // ── B. Planetary Infrastructure Variables ─────────────────────────────────
  { id: 'data_center_energy_burden', label: 'Data center energy burden', labelJa: 'データセンターエネルギー負担', category: 'ECO_B', polarity: 'negative', metrics: [m('EER', 1.2, 'negative'), m('CDR', 0.9, 'negative'), m('ILBR', 0.8, 'negative')] },
  { id: 'ai_compute_eco_burden',    label: 'AI compute ecological burden', labelJa: 'AIコンピュート生態的負担', category: 'ECO_B', polarity: 'negative', metrics: [m('EER', 1.1, 'negative'), m('BTR', 0.8, 'negative'), m('CDR', 0.9, 'negative')] },
  { id: 'cloud_infra_concentration',label: 'Cloud infrastructure concentration', labelJa: 'クラウドインフラ集中', category: 'ECO_B', polarity: 'negative', metrics: [m('SCDR', 1.0, 'negative'), m('PPR', 0.9, 'negative'), m('GDDR', 0.7, 'negative')] },
  { id: 'rare_metal_extraction',    label: 'Rare metal extraction',    labelJa: 'レアメタル採掘',       category: 'ECO_B', polarity: 'negative', metrics: [m('EER', 1.0, 'negative'), m('CIR', 0.9, 'negative'), m('BTR', 0.8, 'negative')] },
  { id: 'semiconductor_supply_dep', label: 'Semiconductor supply dependency', labelJa: '半導体供給依存度', category: 'ECO_B', polarity: 'negative', metrics: [m('SCDR', 1.1, 'negative'), m('PPR', 0.8, 'negative')] },
  { id: 'logistics_distance',       label: 'Logistics distance',       labelJa: '物流距離',             category: 'ECO_B', polarity: 'negative', metrics: [m('CDR', 0.8, 'negative'), m('BTR', 0.7, 'negative'), m('EER', 0.7, 'negative')] },
  { id: 'port_dependency',          label: 'Port dependency',          labelJa: '港湾依存度',           category: 'ECO_B', polarity: 'negative', metrics: [m('SCDR', 0.9, 'negative'), m('BTR', 0.7, 'negative')] },
  { id: 'shipping_emissions',       label: 'Shipping emissions',       labelJa: '船舶排出',             category: 'ECO_B', polarity: 'negative', metrics: [m('CDR', 1.0, 'negative'), m('EER', 0.8, 'negative')] },
  { id: 'energy_grid_fragility',    label: 'Energy grid fragility',    labelJa: 'エネルギーグリッド脆弱性', category: 'ECO_B', polarity: 'negative', metrics: [m('PRCI', 0.9, 'negative'), m('EGR', 0.7, 'negative')] },
  { id: 'urban_heat_island',        label: 'Urban heat island effect', labelJa: 'ヒートアイランド効果', category: 'ECO_B', polarity: 'negative', metrics: [m('BGR', 0.8, 'negative'), m('EER', 0.7, 'negative'), m('BBI', 0.8, 'negative')] },
  { id: 'climate_adaptation_capacity', label: 'Climate adaptation capacity', labelJa: '気候適応能力',   category: 'ECO_B', polarity: 'positive', metrics: [m('PRCI', 1.0), m('EGR', 0.8), m('CDR', 0.8, 'negative')] },
  { id: 'planetary_repair_responsibility', label: 'Planetary repair responsibility', labelJa: '地球修復責任', category: 'ECO_B', polarity: 'positive', metrics: [m('HGR', 1.0), m('PAI', 0.9), m('PRCI', 0.8), m('GDRR', 0.7)] },

  // ── C. Eco-Bio-Divisional Variables ──────────────────────────────────────
  { id: 'care_labor_dependence',     label: 'Care labor dependence',     labelJa: 'ケア労働依存度',       category: 'ECO_C', polarity: 'negative', metrics: [m('BDER', 1.0, 'negative'), m('RDR', 0.9, 'negative'), m('ILBR', 0.8, 'negative')] },
  { id: 'agricultural_labor_dep',    label: 'Agricultural labor dependence', labelJa: '農業労働依存度',   category: 'ECO_C', polarity: 'negative', metrics: [m('BDER', 0.9, 'negative'), m('ILBR', 0.9, 'negative'), m('CIR', 0.7, 'negative')] },
  { id: 'migrant_labor_dependence',  label: 'Migrant labor dependence',  labelJa: '移住労働依存度',       category: 'ECO_C', polarity: 'negative', metrics: [m('BDER', 0.8, 'negative'), m('CIR', 0.9, 'negative'), m('ILBR', 0.8, 'negative'), m('CBRI', 0.7, 'negative')] },
  { id: 'maintenance_labor_dep',     label: 'Maintenance labor dependence', labelJa: 'メンテナンス労働依存度', category: 'ECO_C', polarity: 'negative', metrics: [m('ILBR', 1.0, 'negative'), m('BDER', 0.7, 'negative')] },
  { id: 'waste_labor_dependence',    label: 'Waste labor dependence',    labelJa: '廃棄労働依存度',       category: 'ECO_C', polarity: 'negative', metrics: [m('ILBR', 1.0, 'negative'), m('BTR', 0.8, 'negative'), m('EER', 0.7, 'negative')] },
  { id: 'logistics_labor_dep',       label: 'Logistics labor dependence', labelJa: '物流労働依存度',      category: 'ECO_C', polarity: 'negative', metrics: [m('ILBR', 0.9, 'negative'), m('BBI', 0.8, 'negative'), m('RDR', 0.7, 'negative')] },
  { id: 'platform_labor_dep',        label: 'Platform labor dependence', labelJa: 'プラットフォーム労働依存度', category: 'ECO_C', polarity: 'negative', metrics: [m('ILBR', 0.9, 'negative'), m('FMR', 0.8, 'negative'), m('RDR', 0.8, 'negative')] },
  { id: 'non_human_eco_labor',       label: 'Non-human ecological labor', labelJa: '非人間生態労働',      category: 'ECO_C', polarity: 'positive', metrics: [m('EGR', 1.0), m('BDER', 0.8), m('PAI', 0.7)] },
  { id: 'ecosystem_service_dep',     label: 'Ecosystem service dependency', labelJa: '生態系サービス依存度', category: 'ECO_C', polarity: 'negative', metrics: [m('EER', 0.9, 'negative'), m('PRCI', 0.8, 'negative'), m('EGR', 0.7, 'negative')] },
  { id: 'freedom_on_invisible_eco',  label: 'Freedom dependent on invisible ecological work', labelJa: '見えない生態労働への自由依存', category: 'ECO_C', polarity: 'negative', metrics: [m('ILBR', 1.2, 'negative'), m('BTR', 0.9, 'negative'), m('EER', 0.8, 'negative')] },
  { id: 'eco_labor_recognition',     label: 'Institutional recognition of ecological labor', labelJa: '生態労働の制度的認識', category: 'ECO_C', polarity: 'positive', metrics: [m('BDER', 1.0), m('EGR', 0.8), m('HGR', 0.7), m('PAI', 0.7)] },

  // ── D. Eco-Planetary Burden Transfer Variables ────────────────────────────
  { id: 'burden_city_to_country',   label: 'Burden: city to countryside',   labelJa: '都市から農村への負担転嫁',   category: 'ECO_D', polarity: 'negative', metrics: [m('BTR', 1.1, 'negative'), m('CIR', 0.8, 'negative'), m('EER', 0.7, 'negative')] },
  { id: 'burden_north_to_south',    label: 'Burden: Global North to South', labelJa: 'グローバル・ノースからサウスへの負担転嫁', category: 'ECO_D', polarity: 'negative', metrics: [m('BTR', 1.3, 'negative'), m('CIR', 1.2, 'negative'), m('GDDR', 0.9, 'negative')] },
  { id: 'burden_present_to_future', label: 'Burden: present to future gen', labelJa: '現在世代から将来世代への負担転嫁', category: 'ECO_D', polarity: 'negative', metrics: [m('FGR', 1.3, 'negative'), m('PRCI', 0.9, 'negative'), m('HGR', 0.7, 'negative')] },
  { id: 'burden_rich_to_poor',      label: 'Burden: high-consumption to low-power groups', labelJa: '高消費グループから低権力グループへの負担転嫁', category: 'ECO_D', polarity: 'negative', metrics: [m('BTR', 1.1, 'negative'), m('RDR', 0.9, 'negative'), m('EIR', 0.8, 'negative')] },
  { id: 'burden_humans_to_nonhuman',label: 'Burden: humans to non-human life', labelJa: '人間から非人間生命への負担転嫁', category: 'ECO_D', polarity: 'negative', metrics: [m('EER', 1.2, 'negative'), m('EGR', 1.0, 'negative'), m('PRCI', 0.8, 'negative')] },
  { id: 'burden_ai_to_energy',      label: 'Burden: AI infrastructure to energy systems', labelJa: 'AIインフラからエネルギーシステムへの負担転嫁', category: 'ECO_D', polarity: 'negative', metrics: [m('EER', 1.0, 'negative'), m('CDR', 0.9, 'negative'), m('ILBR', 0.8, 'negative')] },
  { id: 'burden_clean_to_waste',    label: 'Burden: clean cities to waste zones', labelJa: '清潔都市から廃棄ゾーンへの負担転嫁', category: 'ECO_D', polarity: 'negative', metrics: [m('BTR', 1.1, 'negative'), m('CIR', 0.9, 'negative'), m('EER', 0.8, 'negative')] },
  { id: 'burden_efficiency_to_eco', label: 'Burden: institutional efficiency to ecological extraction', labelJa: '制度的効率性から生態的採取への負担転嫁', category: 'ECO_D', polarity: 'negative', metrics: [m('EER', 1.2, 'negative'), m('MSJR', 0.8, 'negative'), m('BTR', 0.9, 'negative')] },
  { id: 'burden_consumer_to_logis', label: 'Burden: consumer freedom to logistics labor', labelJa: '消費者の自由から物流労働への負担転嫁', category: 'ECO_D', polarity: 'negative', metrics: [m('ILBR', 1.1, 'negative'), m('BTR', 0.9, 'negative'), m('RDR', 0.8, 'negative')] },
  { id: 'burden_decarbon_to_extract', label: 'Burden: local decarbonization to external extraction', labelJa: '地域脱炭素化から外部採取への負担転嫁', category: 'ECO_D', polarity: 'negative', metrics: [m('BTR', 1.2, 'negative'), m('CIR', 1.0, 'negative'), m('SCDR', 0.9, 'negative')] },
]

function toSchema(v: V): VariableSchema {
  return {
    id: v.id, label: v.label, labelJa: v.labelJa,
    description: v.label, category: v.category, polarity: v.polarity,
    affectedMetrics: v.metrics.map((mr) => ({ metric: mr.metric, weight: mr.weight, polarity: mr.polarity ?? 'positive' })),
    affectedLayers: v.layers ?? ['ecological_planetary'],
    affectedActors: v.actors ?? [],
    weight: 1.0, defaultValue: 50, min: 0, max: 100,
  }
}

export const ECO_VARIABLES: VariableSchema[] = ECO_RAW.map(toSchema)

export const ECO_VARIABLE_CATEGORIES = [
  { id: 'ECO_A', label: 'Ecological Division', labelJa: '生態分業変数' },
  { id: 'ECO_B', label: 'Planetary Infrastructure', labelJa: '地球的インフラ変数' },
  { id: 'ECO_C', label: 'Eco-Bio-Divisional', labelJa: '生態生命分業変数' },
  { id: 'ECO_D', label: 'Eco-Planetary Burden Transfer', labelJa: '生態地球的負担転嫁変数' },
]
