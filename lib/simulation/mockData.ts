import type { SimNode, SimEdge, InspectorData } from './types'

// ── Planetary layer ──────────────────────────────────────────────
export const PLANETARY_REGIONS: SimNode[] = [
  { id: 'NA',  label: 'North America',    labelJa: '北米',         x: -120, y: 40,  z: 0, value: 62, type: 'region', color: '#4ade80' },
  { id: 'EU',  label: 'Europe',           labelJa: 'ヨーロッパ',    x: 10,   y: 52,  z: 0, value: 58, type: 'region', color: '#fbbf24' },
  { id: 'AS',  label: 'Asia-Pacific',     labelJa: 'アジア太平洋',  x: 100,  y: 25,  z: 0, value: 44, type: 'region', color: '#f87171' },
  { id: 'LA',  label: 'Latin America',    labelJa: 'ラテンアメリカ', x: -65,  y: -15, z: 0, value: 38, type: 'region', color: '#f87171' },
  { id: 'AF',  label: 'Africa',           labelJa: 'アフリカ',      x: 25,   y: -5,  z: 0, value: 29, type: 'region', color: '#ef4444' },
  { id: 'ME',  label: 'Middle East',      labelJa: '中東',          x: 45,   y: 28,  z: 0, value: 33, type: 'region', color: '#ef4444' },
  { id: 'SA',  label: 'South Asia',       labelJa: '南アジア',      x: 75,   y: 22,  z: 0, value: 35, type: 'region', color: '#f87171' },
]

// Extraction zones (lat/lon, visible as pulsing rings on the globe)
export const EXTRACTION_ZONES: Array<{ id: string; lat: number; lon: number; label: string; intensity: number }> = [
  { id: 'EX_CONGO',    lat: -3,   lon: 23,   label: 'Congo Basin extraction',        intensity: 0.9 },
  { id: 'EX_AMAZON',   lat: -5,   lon: -60,  label: 'Amazon resource corridor',       intensity: 0.85 },
  { id: 'EX_GULF',     lat: 25,   lon: 50,   label: 'Gulf petroleum zone',            intensity: 0.75 },
  { id: 'EX_SAHEL',    lat: 14,   lon: 5,    label: 'Sahel land extraction',          intensity: 0.8 },
  { id: 'EX_MEKONG',   lat: 16,   lon: 105,  label: 'Mekong Delta extraction',        intensity: 0.7 },
]

// Climate displacement zones
export const DISPLACEMENT_ZONES: Array<{ id: string; lat: number; lon: number; label: string; severity: number }> = [
  { id: 'DZ_PACIFIC',  lat: -8,   lon: 178,  label: 'Pacific displacement zone',      severity: 0.95 },
  { id: 'DZ_COASTAL',  lat: 23,   lon: 90,   label: 'Bangladesh coastal zone',        severity: 0.88 },
  { id: 'DZ_SAHARA',   lat: 17,   lon: 3,    label: 'Sub-Saharan displacement',       severity: 0.82 },
  { id: 'DZ_ARCTIC',   lat: 71,   lon: -25,  label: 'Arctic ice collapse zone',       severity: 0.70 },
]

// AI compute / data centre burden nodes
export const COMPUTE_NODES: Array<{ id: string; lat: number; lon: number; label: string; power: number }> = [
  { id: 'AI_US',    lat: 37,  lon: -122, label: 'Silicon Valley AI cluster',    power: 0.95 },
  { id: 'AI_EU',    lat: 53,  lon: 10,   label: 'EU data centre belt',          power: 0.72 },
  { id: 'AI_CN',    lat: 35,  lon: 110,  label: 'China compute cluster',        power: 0.88 },
  { id: 'AI_SEA',   lat: 1,   lon: 104,  label: 'Southeast Asia cloud hub',     power: 0.60 },
]

export const PLANETARY_BURDEN_ARCS: SimEdge[] = [
  { from: 'NA', to: 'AF', weight: 0.8, type: 'burden' },
  { from: 'EU', to: 'LA', weight: 0.7, type: 'burden' },
  { from: 'AS', to: 'SA', weight: 0.5, type: 'burden' },
  { from: 'ME', to: 'AF', weight: 0.6, type: 'burden' },
  { from: 'NA', to: 'LA', weight: 0.4, type: 'burden' },
  { from: 'EU', to: 'AF', weight: 0.9, type: 'burden' },
]

// ── Urban-Nature layer ────────────────────────────────────────────
export const URBAN_DISTRICTS: SimNode[] = [
  { id: 'D_CBD',    label: 'Central Business District', labelJa: 'CBD中心業務地区', x: 0,   y: 0,   z: 0, value: 72, type: 'zone' },
  { id: 'D_GOV',    label: 'Government Quarter',        labelJa: '行政地区',        x: -1,  y: 1,   z: 0, value: 55, type: 'institution' },
  { id: 'D_UNI',    label: 'University Belt',           labelJa: '大学地帯',        x: 1,   y: 1,   z: 0, value: 68, type: 'zone' },
  { id: 'D_IND',    label: 'Industrial Zone',           labelJa: '産業地帯',        x: -2,  y: 0,   z: 0, value: 28, type: 'zone' },
  { id: 'D_SLUM',   label: 'Informal Settlement',       labelJa: '非公式居住区',    x: 2,   y: -1,  z: 0, value: 15, type: 'zone' },
  { id: 'D_SUBURB', label: 'Suburb Ring',               labelJa: '郊外リング',      x: 0,   y: -2,  z: 0, value: 45, type: 'zone' },
  { id: 'D_GREEN',  label: 'Green Corridor',            labelJa: '緑地回廊',        x: 1,   y: -1,  z: 0, value: 60, type: 'zone' },
  { id: 'D_PORT',   label: 'Port / Supply Hub',         labelJa: '港湾/供給拠点',   x: -1,  y: -1,  z: 0, value: 40, type: 'zone' },
]

// Deterministic cell values for the 8×6 urban grid (avoid Math.random in render)
export function getUrbanCellValue(col: number, row: number, scenario: string): number {
  const dist = Math.sqrt((col - 3.5) ** 2 + (row - 2.5) ** 2)
  // Deterministic variation using col/row hash
  const hash = ((col * 7 + row * 13) % 17) / 17
  const base = Math.max(5, Math.min(95, 70 - dist * 10 + hash * 20 - 5))
  const adj = scenario === 'reform' ? 10 : scenario === 'managerial' ? -15 : 0
  return Math.max(5, Math.min(95, base + adj))
}

// Special urban nodes (hospitals, schools, welfare, re-entry centres)
export const URBAN_SPECIAL_NODES: Array<{
  col: number; row: number; type: 'hospital' | 'school' | 'welfare' | 'reentry' | 'surveillance'; label: string
}> = [
  { col: 1, row: 1, type: 'hospital',    label: 'Central Hospital' },
  { col: 5, row: 1, type: 'school',      label: 'Public School' },
  { col: 3, row: 3, type: 'welfare',     label: 'Welfare Centre' },
  { col: 6, row: 4, type: 'reentry',     label: 'Re-entry Office' },
  { col: 2, row: 4, type: 'surveillance',label: 'Surveillance Post' },
  { col: 4, row: 5, type: 'surveillance',label: 'Data Collection' },
  { col: 0, row: 2, type: 'reentry',     label: 'Appeal Office' },
]

// Green corridor cell indices (flat index in 8×6 grid)
export const GREEN_CORRIDOR_CELLS = new Set([
  7, 15, 23, 31, 39,   // column 7 vertical strip
  32, 33, 34,           // row 4 partial
])

// ── Body-Lifeworld layer ──────────────────────────────────────────
export const BODY_NODES: SimNode[] = [
  { id: 'BL_SUBJECT',  label: 'Subject Body',          labelJa: '主体身体',        x: 0,    y: 0,    z: 0, value: 50, type: 'actor' },
  { id: 'BL_SLEEP',    label: 'Sleep / Recovery',      labelJa: '睡眠/回復',       x: -2,   y: 1.5,  z: 0, value: 35, type: 'zone' },
  { id: 'BL_COMMUTE',  label: 'Commute / Transit',     labelJa: '通勤/移動',       x: 2,    y: 1.5,  z: 0, value: 40, type: 'zone' },
  { id: 'BL_WORK',     label: 'Work / Productivity',   labelJa: '労働/生産性',     x: -1.5, y: 0.8,  z: 0, value: 60, type: 'zone' },
  { id: 'BL_CARE',     label: 'Care Labour',           labelJa: 'ケア労働',        x: 1.5,  y: 0.8,  z: 0, value: 30, type: 'zone' },
  { id: 'BL_HEALTH',   label: 'Health / Reproduction', labelJa: '健康/再生産',     x: 0,    y: 1.8,  z: 0, value: 45, type: 'zone' },
  { id: 'BL_WAIT',     label: 'Waiting / Queue',       labelJa: '待機/行列',       x: -0.8, y: -0.8, z: 0, value: 20, type: 'zone' },
  { id: 'BL_APPEAL',   label: 'Appeal / Contestation', labelJa: '異議申し立て',    x: 0.8,  y: -0.8, z: 0, value: 22, type: 'zone' },
  { id: 'BL_SURV',     label: 'Surveillance Capture',  labelJa: '監視捕捉',        x: -1,   y: -1.6, z: 0, value: 70, type: 'barrier' },
  { id: 'BL_CLASS',    label: 'Classification Gate',   labelJa: '分類ゲート',      x: 1,    y: -1.6, z: 0, value: 65, type: 'barrier' },
  { id: 'BL_FREE',     label: 'Freedom Space',         labelJa: '自由空間',        x: 0,    y: -2.4, z: 0, value: 25, type: 'zone' },
  { id: 'BL_RECOV',    label: 'Recovery Window',       labelJa: '回復の窓',        x: 2,    y: -0.5, z: 0, value: 32, type: 'zone' },
]

export const BODY_EDGES: SimEdge[] = [
  { from: 'BL_SUBJECT', to: 'BL_SLEEP',   weight: 0.6, type: 'neutral' },
  { from: 'BL_SUBJECT', to: 'BL_WORK',    weight: 0.8, type: 'neutral' },
  { from: 'BL_SUBJECT', to: 'BL_CARE',    weight: 0.6, type: 'burden' },
  { from: 'BL_SUBJECT', to: 'BL_HEALTH',  weight: 0.5, type: 'neutral' },
  { from: 'BL_SUBJECT', to: 'BL_COMMUTE', weight: 0.5, type: 'burden' },
  { from: 'BL_SUBJECT', to: 'BL_WAIT',    weight: 0.4, type: 'burden' },
  { from: 'BL_SUBJECT', to: 'BL_APPEAL',  weight: 0.3, type: 'freedom' },
  { from: 'BL_SURV',    to: 'BL_SUBJECT', weight: 0.7, type: 'barrier' },
  { from: 'BL_CLASS',   to: 'BL_SUBJECT', weight: 0.6, type: 'barrier' },
  { from: 'BL_SUBJECT', to: 'BL_FREE',    weight: 0.3, type: 'freedom' },
  { from: 'BL_APPEAL',  to: 'BL_FREE',    weight: 0.4, type: 'freedom' },
  { from: 'BL_RECOV',   to: 'BL_FREE',    weight: 0.5, type: 'freedom' },
  { from: 'BL_SLEEP',   to: 'BL_RECOV',   weight: 0.6, type: 'freedom' },
  { from: 'BL_WAIT',    to: 'BL_APPEAL',  weight: 0.3, type: 'neutral' },
  { from: 'BL_SURV',    to: 'BL_CLASS',   weight: 0.8, type: 'barrier' },
]

// ── Institutional Flow layer ──────────────────────────────────────
export const FLOW_NODES: SimNode[] = [
  { id: 'IF_ENTRY',       label: 'Entry Point',             labelJa: '入口',                x: 0,    y: 2.2,  z: 0, value: 0,  type: 'gateway' },
  { id: 'IF_APP',         label: 'Application Screening',   labelJa: '申請スクリーニング',   x: 0,    y: 1.4,  z: 0, value: 50, type: 'institution' },
  { id: 'IF_DATA',        label: 'Data Intake',             labelJa: 'データ取込',           x: 0,    y: 0.6,  z: 0, value: 65, type: 'institution' },
  { id: 'IF_AI',          label: 'AI Scoring Engine',       labelJa: 'AIスコアリング',       x: 0,    y: -0.2, z: 0, value: 75, type: 'institution' },
  { id: 'IF_CLASS',       label: 'Classification Output',   labelJa: '分類出力',             x: 0,    y: -1,   z: 0, value: 68, type: 'institution' },
  { id: 'IF_DEMO',        label: 'Democratic Review',       labelJa: '民主的審査',           x: -2,   y: -0.2, z: 0, value: 30, type: 'institution' },
  { id: 'IF_APPROVE',     label: 'Approval',                labelJa: '承認',                 x: -1.5, y: -1.8, z: 0, value: 0,  type: 'gateway' },
  { id: 'IF_REJECT',      label: 'Rejection',               labelJa: '拒否',                 x: 1,    y: -1.8, z: 0, value: 0,  type: 'barrier' },
  { id: 'IF_APPEAL',      label: 'Appeal Process',          labelJa: '異議申し立て',          x: 2,    y: -0.2, z: 0, value: 20, type: 'institution' },
  { id: 'IF_REENTRY',     label: 'Re-entry Gate',           labelJa: '再参入ゲート',          x: -1.5, y: -2.8, z: 0, value: 15, type: 'barrier' },
  { id: 'IF_EXCLUSION',   label: 'Exclusion Zone',          labelJa: '排除ゾーン',            x: 1,    y: -2.8, z: 0, value: 0,  type: 'barrier' },
]

export const FLOW_EDGES: SimEdge[] = [
  { from: 'IF_ENTRY',    to: 'IF_APP',       weight: 1.0, type: 'neutral' },
  { from: 'IF_APP',      to: 'IF_DATA',      weight: 0.9, type: 'neutral' },
  { from: 'IF_DATA',     to: 'IF_AI',        weight: 0.9, type: 'neutral' },
  { from: 'IF_AI',       to: 'IF_CLASS',     weight: 0.85,type: 'neutral' },
  { from: 'IF_AI',       to: 'IF_DEMO',      weight: 0.25,type: 'freedom' },
  { from: 'IF_CLASS',    to: 'IF_APPROVE',   weight: 0.35,type: 'freedom' },
  { from: 'IF_CLASS',    to: 'IF_REJECT',    weight: 0.65,type: 'burden' },
  { from: 'IF_DEMO',     to: 'IF_APPROVE',   weight: 0.7, type: 'freedom' },
  { from: 'IF_REJECT',   to: 'IF_APPEAL',    weight: 0.25,type: 'neutral' },
  { from: 'IF_APPEAL',   to: 'IF_APPROVE',   weight: 0.3, type: 'freedom' },
  { from: 'IF_APPEAL',   to: 'IF_EXCLUSION', weight: 0.7, type: 'barrier' },
  { from: 'IF_APPROVE',  to: 'IF_REENTRY',   weight: 0.5, type: 'neutral' },
  { from: 'IF_REJECT',   to: 'IF_EXCLUSION', weight: 0.75,type: 'barrier' },
]

// ── Inspector data presets ────────────────────────────────────────
export const INSPECTOR_PRESETS: Record<string, Omit<InspectorData, 'layer'>> = {
  'IF_AI': {
    id: 'IF_AI',
    label: 'AI Scoring Engine',
    labelJa: 'AIスコアリング・エンジン',
    metrics: { CFR: 75, MSJR: 80, RBR: 65, BTR: 70, FDCR: 22 },
    description: 'Automated classification system. Exhibits high Classification Fixation Risk (CFR=75) and severe Managerial Self-Justification Risk (MSJR=80). Primary burden transfer node.',
    descriptionJa: '自動分類システム。CFR=75、MSJR=80と高い水準にある。主要な負担転嫁ノード。',
  },
  'IF_CLASS': {
    id: 'IF_CLASS',
    label: 'Classification Output',
    labelJa: '分類出力ノード',
    metrics: { CFR: 68, RBR: 62, MSJR: 72, FDCR: 30 },
    description: 'Classification fixation point. Once assigned, categories persist across re-evaluation cycles. Democratic override rate: 25%.',
    descriptionJa: '分類固定化ポイント。一度割り当てられると再評価サイクルを超えて持続する。民主的上書き率：25%。',
  },
  'IF_DEMO': {
    id: 'IF_DEMO',
    label: 'Democratic Review Gate',
    labelJa: '民主的審査ゲート',
    metrics: { FDCR: 72, RBR: 25, CFR: 20, MSJR: 30 },
    description: 'Primary correction mechanism. Currently bypassed in 75% of cases. Activation requires explicit routing from AI Scoring Engine.',
    descriptionJa: '主要な修正メカニズム。現在75%のケースで回避されている。AIスコアリングエンジンからの明示的なルーティングが必要。',
  },
  'BL_CLASS': {
    id: 'BL_CLASS',
    label: 'Classification Gate',
    labelJa: '分類ゲート',
    metrics: { CFR: 65, RBR: 60, BGR: 25, FDCR: 31 },
    description: 'Intersection of bodily surveillance and institutional classification. High re-entry blockage. Low bodily generation rate indicates lifeworld suppression.',
    descriptionJa: '身体的監視と制度的分類の交差点。再参入阻止率が高く生活世界の抑圧が示唆される。',
  },
  'BL_SURV': {
    id: 'BL_SURV',
    label: 'Surveillance Capture',
    labelJa: '監視捕捉',
    metrics: { CFR: 72, BTR: 68, MSJR: 75, FDCR: 20 },
    description: 'Surveillance data feeds directly into AI classification pipeline. Subject has no audit access. Data minimisation policies absent.',
    descriptionJa: '監視データはAI分類パイプラインに直接入力される。対象はデータへのアクセス権を持たない。',
  },
  'AF': {
    id: 'AF',
    label: 'Africa (Global Burden Receiver)',
    labelJa: 'アフリカ（グローバル負担受容地域）',
    metrics: { 'E-FDCR': 21, EBDCR: 18, 'EP-BTM': 82, BTR: 78, FDCR: 29 },
    description: 'Highest EP-BTM burden reception zone globally. Receives compounded ecological, economic, and freedom-suppressive transfers from Global North actors.',
    descriptionJa: 'EP-BTM（生態惑星的負担転嫁）の世界最高受容地域。北半球主体からの生態的・経済的・自由抑圧的複合転嫁を受けている。',
  },
  'NA': {
    id: 'NA',
    label: 'North America',
    labelJa: '北米',
    metrics: { FDCR: 62, 'E-FDCR': 48, 'EP-BTM': 22, BTR: 35, EBDCR: 44 },
    description: 'Highest FDCR score in dataset, but significant EP-BTM exporter. AI compute burden concentrated here. Carbon and extraction burden exported to Global South.',
    descriptionJa: 'FDCR最高スコアだが、EP-BTM輸出国でもある。AI計算負担が集中しており、炭素・資源採掘負担を南半球に輸出している。',
  },
  'BL_FREE': {
    id: 'BL_FREE',
    label: 'Freedom Space',
    labelJa: '自由空間',
    metrics: { FDCR: 78, BGR: 72, RBR: 15, CFR: 10 },
    description: 'Target state for freedom-generative reform. Currently constrained by classification gate and surveillance capture. Low access rate.',
    descriptionJa: '自由生成改革の目標状態。現在は分類ゲートと監視捕捉によって制約されている。アクセス率低下中。',
  },
}
