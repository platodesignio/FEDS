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

// ── Body-Lifeworld layer ──────────────────────────────────────────
export const BODY_NODES: SimNode[] = [
  { id: 'BL_SUBJECT', label: 'Subject Body',          labelJa: '主体身体',        x: 0,    y: 0,   z: 0, value: 50, type: 'actor' },
  { id: 'BL_WORK',    label: 'Work / Productivity',   labelJa: '労働/生産性',     x: -1.5, y: 1,   z: 0, value: 60, type: 'zone' },
  { id: 'BL_CARE',    label: 'Care Labour',           labelJa: 'ケア労働',        x: 1.5,  y: 1,   z: 0, value: 30, type: 'zone' },
  { id: 'BL_HEALTH',  label: 'Health / Reproduction', labelJa: '健康/再生産',     x: 0,    y: 1.8, z: 0, value: 45, type: 'zone' },
  { id: 'BL_SURV',    label: 'Surveillance Capture',  labelJa: '監視捕捉',        x: -1,   y: -1,  z: 0, value: 70, type: 'barrier' },
  { id: 'BL_CLASS',   label: 'Classification Gate',   labelJa: '分類ゲート',      x: 1,    y: -1,  z: 0, value: 65, type: 'barrier' },
  { id: 'BL_FREE',    label: 'Freedom Space',         labelJa: '自由空間',        x: 0,    y: -1.8,z: 0, value: 25, type: 'zone' },
]

export const BODY_EDGES: SimEdge[] = [
  { from: 'BL_SUBJECT', to: 'BL_WORK',    weight: 0.8, type: 'neutral' },
  { from: 'BL_SUBJECT', to: 'BL_CARE',    weight: 0.6, type: 'burden' },
  { from: 'BL_SUBJECT', to: 'BL_HEALTH',  weight: 0.5, type: 'neutral' },
  { from: 'BL_SURV',    to: 'BL_SUBJECT', weight: 0.7, type: 'barrier' },
  { from: 'BL_CLASS',   to: 'BL_SUBJECT', weight: 0.6, type: 'barrier' },
  { from: 'BL_SUBJECT', to: 'BL_FREE',    weight: 0.3, type: 'freedom' },
]

// ── Institutional Flow layer ──────────────────────────────────────
export const FLOW_NODES: SimNode[] = [
  { id: 'IF_ENTRY',    label: 'Entry Point',          labelJa: '入口',            x: 0,   y: 2,   z: 0, value: 0,  type: 'gateway' },
  { id: 'IF_APP',      label: 'Application Screen',   labelJa: '申請スクリーニング', x: 0,  y: 1,   z: 0, value: 50, type: 'institution' },
  { id: 'IF_AI',       label: 'AI Scoring Engine',    labelJa: 'AIスコアリング',   x: 0,   y: 0,   z: 0, value: 75, type: 'institution' },
  { id: 'IF_DEMO',     label: 'Democratic Review',    labelJa: '民主的審査',       x: -1.5,y: 0,   z: 0, value: 30, type: 'institution' },
  { id: 'IF_APPROVE',  label: 'Approval',             labelJa: '承認',             x: -1,  y: -1,  z: 0, value: 0,  type: 'gateway' },
  { id: 'IF_REJECT',   label: 'Rejection',            labelJa: '拒否',             x: 1,   y: -1,  z: 0, value: 0,  type: 'barrier' },
  { id: 'IF_APPEAL',   label: 'Appeal Process',       labelJa: '異議申し立て',     x: 1.5, y: 0,   z: 0, value: 20, type: 'institution' },
  { id: 'IF_REENTRY',  label: 'Re-entry Gate',        labelJa: '再参入ゲート',     x: -1,  y: -2,  z: 0, value: 15, type: 'barrier' },
  { id: 'IF_EXCLUSION',label: 'Exclusion Zone',       labelJa: '排除ゾーン',       x: 1,   y: -2,  z: 0, value: 0,  type: 'barrier' },
]

export const FLOW_EDGES: SimEdge[] = [
  { from: 'IF_ENTRY',    to: 'IF_APP',      weight: 1.0, type: 'neutral' },
  { from: 'IF_APP',      to: 'IF_AI',       weight: 0.9, type: 'neutral' },
  { from: 'IF_AI',       to: 'IF_DEMO',     weight: 0.3, type: 'freedom' },
  { from: 'IF_AI',       to: 'IF_APPROVE',  weight: 0.4, type: 'freedom' },
  { from: 'IF_AI',       to: 'IF_REJECT',   weight: 0.6, type: 'burden' },
  { from: 'IF_DEMO',     to: 'IF_APPROVE',  weight: 0.7, type: 'freedom' },
  { from: 'IF_REJECT',   to: 'IF_APPEAL',   weight: 0.25,type: 'neutral' },
  { from: 'IF_APPEAL',   to: 'IF_APPROVE',  weight: 0.3, type: 'freedom' },
  { from: 'IF_APPEAL',   to: 'IF_EXCLUSION',weight: 0.7, type: 'barrier' },
  { from: 'IF_APPROVE',  to: 'IF_REENTRY',  weight: 0.5, type: 'neutral' },
  { from: 'IF_REJECT',   to: 'IF_EXCLUSION',weight: 0.75,type: 'barrier' },
]

// ── Inspector data presets ────────────────────────────────────────
export const INSPECTOR_PRESETS: Record<string, Omit<InspectorData, 'layer'>> = {
  'IF_AI': {
    id: 'IF_AI',
    label: 'AI Scoring Engine',
    labelJa: 'AIスコアリング・エンジン',
    metrics: { CFR: 75, MSJR: 80, RBR: 65, BTR: 70, FDCR: 22 },
    description: 'Automated classification system. Exhibits high Classification Fixation Risk (CFR=75) and severe Managerial Self-Justification Risk (MSJR=80). Primary burden transfer node.',
    descriptionJa: '自動分類システム。CFR（分類固定リスク）=75、MSJR（管理的自己正当化リスク）=80と高い水準にある。主要な負担転嫁ノード。',
  },
  'BL_CLASS': {
    id: 'BL_CLASS',
    label: 'Classification Gate',
    labelJa: '分類ゲート',
    metrics: { CFR: 65, RBR: 60, BGR: 25, FDCR: 31 },
    description: 'Intersection of bodily surveillance and institutional classification. High re-entry blockage. Low bodily generation rate indicates lifeworld suppression.',
    descriptionJa: '身体的監視と制度的分類の交差点。再参入阻止率が高く、生体生成率が低いため生活世界の抑圧が示唆される。',
  },
  'AF': {
    id: 'AF',
    label: 'Africa (Global Burden Receiver)',
    labelJa: 'アフリカ（グローバル負担受容地域）',
    metrics: { 'E-FDCR': 21, EBDCR: 18, 'EP-BTM': 82, BTR: 78, FDCR: 29 },
    description: 'Highest EP-BTM burden reception zone globally. Receives compounded ecological, economic, and freedom-suppressive transfers from Global North actors.',
    descriptionJa: 'EP-BTM（生態惑星的負担転嫁）の世界最高受容地域。北半球主体からの生態的・経済的・自由抑圧的複合転嫁を受けている。',
  },
}
