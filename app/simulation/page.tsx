'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { useAudit } from '@/lib/auditContext'

// ── Types ─────────────────────────────────────────────────────────────────────
type LayerId    = 'planetary' | 'urban_nature' | 'body_lifeworld' | 'institutional_flow'
type ScenarioId = 'current' | 'reform' | 'managerial'
type THorizon   = 0 | 1 | 2 | 3 | 4 | 5

interface NodeData {
  id: string
  label: string
  type: string
  actors: string
  fdcr: number
  gfdcr: number
  efdcr: number
  ebdcr: number
  burdenPath: string
  reentry: string
  correction: string
}

// ── Config ────────────────────────────────────────────────────────────────────
const LAYERS: { id: LayerId; label: string }[] = [
  { id: 'planetary',          label: 'Planetary View'     },
  { id: 'urban_nature',       label: 'Urban-Nature'       },
  { id: 'body_lifeworld',     label: 'Body-Lifeworld'     },
  { id: 'institutional_flow', label: 'Institutional Flow' },
]

const SCENARIOS: { id: ScenarioId; label: string; color: string }[] = [
  { id: 'current',    label: 'Current System',             color: '#fbbf24' },
  { id: 'reform',     label: 'Freedom-Generative Reform',  color: '#4ade80' },
  { id: 'managerial', label: 'Managerial Intensification', color: '#ef4444' },
]

const T_LABELS = ['Immediate', '1 yr', '5 yr', '10 yr', '25 yr', 'Future gen.']

const OVERLAY_GROUPS = [
  { label: 'Metrics', items: [
    { id: 'FDCR',  label: 'FDCR',   c: '#4ade80' },
    { id: 'GFDCR', label: 'G-FDCR', c: '#4ade80' },
    { id: 'EFDCR', label: 'E-FDCR', c: '#34d399' },
    { id: 'EBDCR', label: 'EBDCR',  c: '#34d399' },
    { id: 'BGR',   label: 'BGR',    c: '#60a5fa' },
    { id: 'RCI',   label: 'RCI',    c: '#60a5fa' },
  ]},
  { label: 'Risk', items: [
    { id: 'MSJR',  label: 'MSJR',   c: '#ef4444' },
    { id: 'CFR',   label: 'CFR',    c: '#ef4444' },
    { id: 'RBR',   label: 'RBR',    c: '#f97316' },
    { id: 'BTR',   label: 'BTR',    c: '#f97316' },
    { id: 'EER',   label: 'EER',    c: '#fbbf24' },
    { id: 'EPBTM', label: 'EP-BTM', c: '#fbbf24' },
  ]},
  { label: 'Thematic', items: [
    { id: 'urban_body',    label: 'Urban bodily burden',      c: '#f97316' },
    { id: 'spatial_class', label: 'Spatial classification',   c: '#ef4444' },
    { id: 'eco_extract',   label: 'Ecological extraction',    c: '#f97316' },
    { id: 'reentry',       label: 'Re-entry access',          c: '#fbbf24' },
    { id: 'future_gen',    label: 'Future-generation burden', c: '#a78bfa' },
  ]},
]

// ── Metric computation ─────────────────────────────────────────────────────────
function computeMetrics(base: Record<string,number>, sc: ScenarioId, th: THorizon) {
  const sm = sc === 'reform' ? 8 : sc === 'managerial' ? -10 : 0
  const tm = th * (sc === 'reform' ? 1.8 : sc === 'managerial' ? -2.2 : -0.6)
  const risk_sm = sc === 'reform' ? -8 : sc === 'managerial' ? 10 : 0
  const risk_tm = th * (sc === 'reform' ? -1.8 : sc === 'managerial' ? 2.2 : 0.6)
  const clamp = (v: number) => Math.max(3, Math.min(97, v))
  return {
    FDCR:   clamp(base.FDCR  + sm + tm),
    GFDCR:  clamp(base.GFDCR + sm + tm),
    EFDCR:  clamp(base.EFDCR + sm * 0.9 + tm),
    EBDCR:  clamp(base.EBDCR + sm * 0.8 + tm * 0.8),
    BTR:    clamp(base.BTR   + risk_sm + risk_tm),
    MSJR:   clamp(base.MSJR  + risk_sm + risk_tm),
    CFR:    clamp(base.CFR   + risk_sm * 0.9 + risk_tm),
    RBR:    clamp(base.RBR   + risk_sm * 0.8 + risk_tm * 0.9),
    BGR:    clamp(base.BGR   + sm * 0.7 + tm * 0.6),
    RCI:    clamp(base.RCI   + sm * 0.6 + tm * 0.5),
  }
}

function fdcrColor(v: number) {
  return v >= 60 ? '#4ade80' : v >= 45 ? '#fbbf24' : v >= 30 ? '#f97316' : '#ef4444'
}
function riskColor(v: number) {
  return v > 70 ? '#ef4444' : v > 50 ? '#f97316' : v > 35 ? '#fbbf24' : '#4ade80'
}
function metricColor(k: string, v: number) {
  const isRisk = ['BTR','MSJR','CFR','RBR','EER','EPBTM'].includes(k)
  return isRisk ? riskColor(v) : fdcrColor(v)
}

// ── Globe helpers ──────────────────────────────────────────────────────────────
const GCX = 355, GCY = 238, GR = 170, GLON0 = 18
function ortho(lat: number, lon: number) {
  const φ = lat * Math.PI / 180
  const λ = (lon - GLON0) * Math.PI / 180
  return {
    x: GCX + GR * Math.cos(φ) * Math.sin(λ),
    y: GCY - GR * Math.sin(φ),
    vis: Math.cos(φ) * Math.cos(λ) > -0.08,
  }
}

// Approximate continental coastline as a series of lat/lon pairs rendered as polyline
const CONTINENTS: Array<{id:string; path: Array<[number,number]>; color: string}> = [
  { id: 'NA', color: '#0d2035', path: [
    [49,-125],[49,-65],[25,-80],[18,-90],[15,-85],[10,-83],[9,-77],[25,-77],[30,-75],[35,-75],[42,-70],[47,-68],[49,-65],
  ]},
  { id: 'SA', color: '#0d2035', path: [
    [12,-72],[10,-60],[5,-52],[0,-50],[-5,-35],[-10,-37],[-15,-39],[-23,-43],[-33,-53],[-40,-62],[-52,-69],[-55,-67],[-45,-65],[-35,-57],[-22,-41],[-5,-35],[0,-50],[5,-52],[10,-60],[12,-72],
  ]},
  { id: 'EU', color: '#0d2035', path: [
    [71,28],[60,28],[55,24],[52,21],[47,22],[44,28],[37,22],[36,5],[43,-9],[47,-2],[52,2],[52,5],[55,8],[57,10],[58,25],[65,25],[70,22],[71,28],
  ]},
  { id: 'AF', color: '#0d2035', path: [
    [37,10],[30,32],[22,37],[12,42],[2,41],[-4,39],[-10,40],[-26,33],[-34,26],[-34,18],[-28,17],[-20,13],[-6,10],[0,9],[4,8],[4,2],[5,-5],[4,-2],[5,2],[8,3],[15,0],[22,10],[30,32],[37,10],
  ]},
  { id: 'AS', color: '#0d2035', path: [
    [71,28],[71,140],[60,140],[55,130],[42,130],[38,120],[35,120],[22,110],[12,108],[2,103],[1,104],[0,105],[-8,115],[-8,140],[0,140],[10,125],[18,110],[22,110],[35,120],[42,130],[55,130],[60,140],[71,140],[71,28],
  ]},
  { id: 'OC', color: '#0d2035', path: [
    [-10,130],[-10,150],[-25,153],[-38,145],[-38,140],[-35,135],[-22,114],[-15,125],[-10,130],
  ]},
]

const REGIONS = [
  { id: 'NA', label: 'North America', lat: 42, lon: -100, baseFDCR: 61 },
  { id: 'EU', label: 'Europe',        lat: 51, lon:   12, baseFDCR: 57 },
  { id: 'AS', label: 'Asia-Pacific',  lat: 28, lon:  108, baseFDCR: 43 },
  { id: 'LA', label: 'Latin America', lat:-12, lon:  -65, baseFDCR: 37 },
  { id: 'AF', label: 'Africa',        lat: -5, lon:   22, baseFDCR: 27 },
  { id: 'ME', label: 'Middle East',   lat: 27, lon:   46, baseFDCR: 32 },
  { id: 'SA', label: 'South Asia',    lat: 22, lon:   82, baseFDCR: 34 },
]

const BURDEN_ARCS = [
  { from:'NA', to:'AF', w:3.5, label:'EP-BTM primary' },
  { from:'EU', to:'AF', w:2.8, label:'EP-BTM secondary' },
  { from:'NA', to:'LA', w:2.2, label:'Extraction burden' },
  { from:'EU', to:'LA', w:1.8, label:'Debt burden' },
  { from:'AS', to:'SA', w:1.6, label:'Climate displacement' },
  { from:'ME', to:'AF', w:1.4, label:'Resource corridor' },
]

const EXTRACTION_ZONES = [
  { id:'EX_CONGO',  lat:-3,  lon:23,  label:'Congo Basin',    intensity:0.9 },
  { id:'EX_AMAZON', lat:-5,  lon:-60, label:'Amazon corridor', intensity:0.85 },
  { id:'EX_GULF',   lat:25,  lon:50,  label:'Gulf petroleum',  intensity:0.75 },
  { id:'EX_SAHEL',  lat:14,  lon:5,   label:'Sahel land',      intensity:0.8 },
  { id:'EX_MEKONG', lat:16,  lon:105, label:'Mekong Delta',    intensity:0.7 },
]

const COMPUTE_NODES = [
  { id:'AI_US', lat:37, lon:-122, label:'AI/US' },
  { id:'AI_CN', lat:35, lon:110,  label:'AI/CN' },
  { id:'AI_EU', lat:53, lon:10,   label:'AI/EU' },
]

const CLIMATE_ZONES = [
  { id:'CL_PACIFIC', lat:-10, lon:175, label:'Pacific atoll risk' },
  { id:'CL_SAHEL2',  lat:16,  lon:12,  label:'Sahel desertification' },
  { id:'CL_MEKONG2', lat:11,  lon:105, label:'Delta submersion' },
]

const FUTGEN_MARKERS = [
  { lat:55, lon:25,  label:'EU debt burden transfer' },
  { lat:-20,lon:135, label:'Pacific future-gen burden' },
  { lat:12, lon:15,  label:'Sahel generational deprivation' },
]

// ── Isometric helpers ──────────────────────────────────────────────────────────
const ISO_OX = 350, ISO_OY = 145, ISO_SX = 22, ISO_SY = 11

function isoFront(col: number, row: number) {
  return { x: ISO_OX + (col - row) * ISO_SX, y: ISO_OY + (col + row) * ISO_SY }
}

function cellVal(col: number, row: number, sc: ScenarioId, th: THorizon): number {
  const dist = Math.sqrt((col - 3.5) ** 2 + (row - 2.5) ** 2)
  const h = ((col * 7 + row * 13) % 17) / 17
  const base = Math.max(8, Math.min(92, 68 - dist * 9 + h * 18 - 4))
  const sm = sc === 'reform' ? 10 : sc === 'managerial' ? -14 : 0
  const tm = th * (sc === 'reform' ? 1.5 : sc === 'managerial' ? -1.8 : -0.4)
  return Math.max(5, Math.min(95, base + sm + tm))
}

function blockColor(v: number, isGreen: boolean) {
  if (isGreen) return { top:'#16452a', left:'#0e2e1a', right:'#081c0f' }
  if (v >= 70)  return { top:'#1a3a20', left:'#112616', right:'#0a170d' }
  if (v >= 55)  return { top:'#252e14', left:'#181e0c', right:'#0e1207' }
  if (v >= 40)  return { top:'#3a2810', left:'#261a0a', right:'#171006' }
  if (v >= 25)  return { top:'#3a1810', left:'#26100a', right:'#170906' }
  return              { top:'#300e0e', left:'#1e0808', right:'#120404' }
}

const GREEN_CELLS = new Set([7,14,21,28,35,42,33,34])

const RENT_CELLS = new Set([1,2,9,10,17,18]) // top-left = high-rent zone
const COMMUTE_ROUTES = [
  [[0,0],[1,1],[2,2],[3,3],[4,4],[5,5]],  // diagonal route
  [[7,0],[7,1],[7,2],[7,3],[7,4],[7,5]],  // right edge
]
const ECOREP_CELLS = new Set([38,39,46,47]) // bottom-right = ecological repair

const SPECIAL_URBAN: Record<string, {type:string;color:string;sym:string}> = {
  '1_1': { type:'Hospital',     color:'#34d399', sym:'H' },
  '5_1': { type:'School',       color:'#60a5fa', sym:'S' },
  '3_3': { type:'Welfare',      color:'#a78bfa', sym:'W' },
  '6_4': { type:'Re-entry',     color:'#fbbf24', sym:'R' },
  '2_4': { type:'Surveillance', color:'#ef4444', sym:'⬡' },
  '4_5': { type:'Surveillance', color:'#ef4444', sym:'⬡' },
  '7_2': { type:'EcoRepair',    color:'#4ade80', sym:'◉' },
}

// ── Body-Lifeworld nodes ───────────────────────────────────────────────────────
interface BNode { id:string; label:string; x:number; y:number; r:number; color:string; type:string; baseLoad:number }
const BNODES: BNode[] = [
  { id:'SUBJECT',  label:'Subject',         x:355, y:238, r:16, color:'#7ac8f8', type:'actor',    baseLoad:60 },
  { id:'SLEEP',    label:'Sleep/recovery',  x:220, y:148, r:10, color:'#4a6a8a', type:'sustain',  baseLoad:45 },
  { id:'COMMUTE',  label:'Commute',         x:490, y:148, r:9,  color:'#6a5a3a', type:'burden',   baseLoad:72 },
  { id:'WORK',     label:'Work',            x:200, y:215, r:11, color:'#3a5a7a', type:'burden',   baseLoad:68 },
  { id:'CARE',     label:'Unpaid care',     x:510, y:215, r:9,  color:'#5a4a8a', type:'burden',   baseLoad:75 },
  { id:'HEALTH',   label:'Health',          x:355, y:118, r:9,  color:'#2a7a6a', type:'sustain',  baseLoad:50 },
  { id:'WAIT',     label:'Waiting/queue',   x:265, y:305, r:8,  color:'#7a4a1a', type:'burden',   baseLoad:78 },
  { id:'APPEAL',   label:'Appeal',          x:445, y:305, r:8,  color:'#4ade80', type:'freedom',  baseLoad:30 },
  { id:'SURV',     label:'Surveillance',    x:240, y:355, r:13, color:'#ef4444', type:'barrier',  baseLoad:82 },
  { id:'CLASS',    label:'Classification',  x:470, y:355, r:13, color:'#f97316', type:'barrier',  baseLoad:79 },
  { id:'INSTPRES', label:'Inst. pressure',  x:355, y:360, r:9,  color:'#c97020', type:'barrier',  baseLoad:71 },
  { id:'RECOV',    label:'Recovery window', x:530, y:290, r:7,  color:'#34d399', type:'freedom',  baseLoad:28 },
  { id:'TEMPORAL', label:'Temporal compress', x:180,y:305,r:7,  color:'#a78bfa', type:'compress', baseLoad:69 },
  { id:'FREE',     label:'Freedom space',   x:355, y:415, r:11, color:'#4ade80', type:'freedom',  baseLoad:20 },
]

const BEDGES = [
  { from:'SUBJECT', to:'SLEEP',    type:'sustain', w:1.5 },
  { from:'SUBJECT', to:'COMMUTE',  type:'burden',  w:2 },
  { from:'SUBJECT', to:'WORK',     type:'burden',  w:2 },
  { from:'SUBJECT', to:'CARE',     type:'burden',  w:1.5 },
  { from:'SUBJECT', to:'HEALTH',   type:'sustain', w:1.5 },
  { from:'SUBJECT', to:'WAIT',     type:'burden',  w:1.5 },
  { from:'SUBJECT', to:'APPEAL',   type:'freedom', w:1 },
  { from:'SURV',    to:'SUBJECT',  type:'barrier', w:2.5 },
  { from:'CLASS',   to:'SUBJECT',  type:'barrier', w:2.5 },
  { from:'INSTPRES',to:'SUBJECT',  type:'barrier', w:1.5 },
  { from:'TEMPORAL',to:'WORK',     type:'barrier', w:1 },
  { from:'TEMPORAL',to:'WAIT',     type:'barrier', w:1 },
  { from:'SURV',    to:'CLASS',    type:'barrier', w:1.5 },
  { from:'WAIT',    to:'APPEAL',   type:'neutral',  w:1 },
  { from:'APPEAL',  to:'FREE',     type:'freedom', w:1.2 },
  { from:'SLEEP',   to:'RECOV',    type:'sustain', w:1 },
  { from:'SUBJECT', to:'FREE',     type:'freedom', w:1 },
]

const EDGE_C: Record<string,string> = {
  freedom:'#4ade80', burden:'#ef4444', barrier:'#f97316', sustain:'#4a8abb', neutral:'#2a4a6a', compress:'#a78bfa',
}

// Time ring slices: [label, hours, color, burdened]
const TIME_RING = [
  { label:'Sleep',   hours:7,   color:'#2a4a7a', burden:false },
  { label:'Commute', hours:2.5, color:'#6a4a1a', burden:true  },
  { label:'Work',    hours:8,   color:'#2a4a5a', burden:true  },
  { label:'Care',    hours:2.5, color:'#4a3a6a', burden:true  },
  { label:'Wait',    hours:1.5, color:'#6a3a0a', burden:true  },
  { label:'Appeal',  hours:0.5, color:'#1a4a2a', burden:false },
  { label:'Free',    hours:2,   color:'#1a3a2a', burden:false },
]

// ── Institutional Flow ─────────────────────────────────────────────────────────
interface FNode { id:string; label:string; x:number; y:number; shape:string; color:string; tag?:string }
const FNODES: FNode[] = [
  { id:'ENTRY',   label:'Entry Point',            x:355, y: 40, shape:'diamond', color:'#a78bfa' },
  { id:'APP',     label:'Application Screening',  x:355, y: 95, shape:'rect',    color:'#4a7aaa' },
  { id:'DATA',    label:'Data Intake',            x:355, y:152, shape:'rect',    color:'#4a7aaa', tag:'testimony-erasure' },
  { id:'AI',      label:'AI Scoring Engine',      x:355, y:215, shape:'circle',  color:'#ef4444', tag:'classification-fixation' },
  { id:'CLASS',   label:'Classification Output',  x:355, y:278, shape:'rect',    color:'#f97316', tag:'classification-fixation' },
  { id:'DEMO',    label:'Democratic Review',       x:185, y:215, shape:'circle',  color:'#4ade80', tag:'correction' },
  { id:'BURO',    label:'Bureaucratic Review',    x:185, y:278, shape:'rect',    color:'#6a5a3a', tag:'responsibility-displacement' },
  { id:'APPROVE', label:'Approval',               x:185, y:358, shape:'diamond', color:'#4ade80' },
  { id:'REJECT',  label:'Rejection',              x:510, y:358, shape:'rect',    color:'#ef4444', tag:'reentry-blockage' },
  { id:'APPEAL',  label:'Appeal Process',         x:560, y:215, shape:'circle',  color:'#4a7aaa', tag:'reentry-blockage' },
  { id:'REENTRY', label:'Re-entry Gate',          x:185, y:432, shape:'rect',    color:'#fbbf24', tag:'reentry-blockage' },
  { id:'EXCL',    label:'Exclusion Zone',         x:510, y:432, shape:'rect',    color:'#ef4444', tag:'reentry-blockage' },
]

const FEDGES = [
  { from:'ENTRY',   to:'APP',     type:'neutral', label:'' },
  { from:'APP',     to:'DATA',    type:'neutral', label:'' },
  { from:'DATA',    to:'AI',      type:'neutral', label:'' },
  { from:'AI',      to:'CLASS',   type:'neutral', label:'' },
  { from:'AI',      to:'DEMO',    type:'freedom', label:'bypass 75%' },
  { from:'CLASS',   to:'BURO',    type:'neutral', label:'' },
  { from:'BURO',    to:'APPROVE', type:'freedom', label:'35%' },
  { from:'BURO',    to:'REJECT',  type:'burden',  label:'65%' },
  { from:'DEMO',    to:'APPROVE', type:'freedom', label:'' },
  { from:'REJECT',  to:'APPEAL',  type:'neutral', label:'25%' },
  { from:'APPEAL',  to:'APPROVE', type:'freedom', label:'30%' },
  { from:'APPEAL',  to:'EXCL',    type:'barrier', label:'70%' },
  { from:'APPROVE', to:'REENTRY', type:'neutral', label:'' },
  { from:'REJECT',  to:'EXCL',    type:'barrier', label:'75%' },
]

const TAG_LABELS: Record<string,{label:string;color:string}> = {
  'classification-fixation':    { label:'CFR', color:'#ef4444' },
  'reentry-blockage':           { label:'RBR', color:'#f97316' },
  'responsibility-displacement':{ label:'MSJR', color:'#fbbf24' },
  'testimony-erasure':          { label:'TEI', color:'#a78bfa' },
  'correction':                 { label:'COR', color:'#4ade80' },
}

// ── Node data presets ─────────────────────────────────────────────────────────
function makeNodeData(id: string, label: string, overrides: Partial<NodeData>): NodeData {
  return {
    id, label,
    type: overrides.type ?? 'Node',
    actors: overrides.actors ?? 'Subject population',
    fdcr: overrides.fdcr ?? 45,
    gfdcr: overrides.gfdcr ?? 42,
    efdcr: overrides.efdcr ?? 40,
    ebdcr: overrides.ebdcr ?? 38,
    burdenPath: overrides.burdenPath ?? 'Burden pathway under analysis.',
    reentry: overrides.reentry ?? 'Re-entry conditions apply.',
    correction: overrides.correction ?? 'Democratic oversight required.',
  }
}

const PRESETS: Record<string, NodeData> = {
  'globe-AF': makeNodeData('globe-AF','Africa',{ type:'Global Region', actors:'Sub-Saharan and North African populations', fdcr:27, gfdcr:24, efdcr:19, ebdcr:16, burdenPath:'NA → AF (EP-BTM primary arc), EU → AF (secondary), ME → AF (tertiary). Highest burden reception globally.', reentry:'Structural exclusion from global governance mechanisms. Debt obligation limits sovereign re-entry.', correction:'Global FDCR rebalancing: extraction reparations, debt cancellation, climate adaptation finance, technology transfer.'}),
  'globe-NA': makeNodeData('globe-NA','North America',{ type:'Global Region', actors:'US/Canada population; Indigenous nations', fdcr:61, gfdcr:58, efdcr:48, ebdcr:44, burdenPath:'NA exports burden to AF (primary) and LA (secondary) via extraction supply chains and carbon displacement.', reentry:'Formal re-entry mechanisms operational. High classification risk for racialised and Indigenous subjects.', correction:'Reduce EP-BTM: supply chain accountability, carbon pricing, technology transfer obligations.'}),
  'globe-EU': makeNodeData('globe-EU','Europe',{ type:'Global Region', actors:'EU and non-EU European populations', fdcr:57, gfdcr:55, efdcr:44, ebdcr:40, burdenPath:'EU → AF (colonial legacy arc), EU → LA (debt burden arc). Climate finance commitments partially offset.', reentry:'Asylum and migration classification risk. AI-driven border classification systems: high CFR.', correction:'Colonial reparations, climate finance fulfilment, migration CFR reduction via democratic review.'}),
  'globe-AS': makeNodeData('globe-AS','Asia-Pacific',{ type:'Global Region', actors:'East and Southeast Asian populations', fdcr:43, gfdcr:40, efdcr:35, ebdcr:31, burdenPath:'AS receives climate displacement burden from Pacific and South Asian sub-regions. Manufacturing burden exported from Global North.', reentry:'High surveillance infrastructure density. AI classification systems deployed at scale.', correction:'Pacific climate adaptation finance. Surveillance accountability legislation.'}),
  'globe-LA': makeNodeData('globe-LA','Latin America',{ type:'Global Region', actors:'Latin American and Caribbean populations', fdcr:37, gfdcr:34, efdcr:30, ebdcr:27, burdenPath:'NA → LA and EU → LA extraction and debt burden. Democratic correction partially operational.', reentry:'Debt burden limits institutional re-entry. Classification risk high for Indigenous and Afro-descendant populations.', correction:'Debt restructuring, extraction revenue repatriation, democratic review expansion.'}),
  'globe-ME': makeNodeData('globe-ME','Middle East',{ type:'Global Region', actors:'MENA populations', fdcr:32, gfdcr:29, efdcr:26, ebdcr:22, burdenPath:'ME → AF petroleum-linked extraction burden. Climate risk compounding.', reentry:'Conflict-linked classification systems constrain formal re-entry.', correction:'Transition finance, democratic review mechanisms, conflict-linked RBR reduction.'}),
  'globe-SA': makeNodeData('globe-SA','South Asia',{ type:'Global Region', actors:'South Asian populations', fdcr:34, gfdcr:31, efdcr:27, ebdcr:24, burdenPath:'Climate displacement from AS → SA arc. AI classification burden from northern-built systems.', reentry:'High climate-linked displacement constrains re-entry.', correction:'Climate adaptation finance, AI accountability, democratic re-entry mechanisms.'}),
  'flow-AI':     makeNodeData('flow-AI','AI Scoring Engine',{ type:'Algorithmic System', actors:'All applicants (automated)', fdcr:22, gfdcr:20, efdcr:18, ebdcr:15, burdenPath:'AI Scoring → Classification Output → Rejection → Exclusion Zone', reentry:'Prior AI score persists across re-entry attempts. Score audit unavailable to subject.', correction:'Mandatory explainability. Democratic review gate for all AI-scored cases. Subject right to contest.'}),
  'flow-DEMO':   makeNodeData('flow-DEMO','Democratic Review',{ type:'Correction Mechanism', actors:'Review panel; subject', fdcr:72, gfdcr:68, efdcr:62, ebdcr:58, burdenPath:'Bypassed in 75% of cases. When active, redirects to Approval pathway.', reentry:'Democratic review activation enables re-entry bypass of classification pipeline.', correction:'Make democratic review mandatory for all AI-scored cases above risk threshold.'}),
  'flow-EXCL':   makeNodeData('flow-EXCL','Exclusion Zone',{ type:'Terminal Outcome', actors:'Excluded subjects', fdcr:8, gfdcr:7, efdcr:6, ebdcr:5, burdenPath:'Terminal burden sink. All burden pathways converge here without correction.', reentry:'No automatic expiry. No appeal mechanism within exclusion zone.', correction:'Mandatory appeal access with public advocate. Time-limited classification expiry. Automatic democratic review trigger.'}),
  'flow-DATA':   makeNodeData('flow-DATA','Data Intake',{ type:'Data Processing Node', actors:'Subject (passive)', fdcr:40, gfdcr:37, efdcr:32, ebdcr:29, burdenPath:'Surveillance data aggregated without subject consent. Lifeworld testimony excluded from record.', reentry:'Data record persists and influences all future re-entry assessments.', correction:'Data minimisation mandate. Subject right to audit and correct intake record. Lifeworld testimony inclusion requirement.'}),
  'flow-REJECT': makeNodeData('flow-REJECT','Rejection',{ type:'Negative Outcome', actors:'Rejected applicants', fdcr:25, gfdcr:22, efdcr:20, ebdcr:17, burdenPath:'Rejection → Appeal (25%) or → Exclusion (75%). Classification record persists into re-entry.', reentry:'Re-entry requires appeal success (30%) or democratic override. Re-entry rate: 8.5%.', correction:'Reduce rejection pipeline: lower CFR at AI scoring stage, expand democratic review, extend appeal window.'}),
  'body-SUBJECT':makeNodeData('body-SUBJECT','Subject Body',{ type:'Actor Node', actors:'All subjects', fdcr:47, gfdcr:44, efdcr:40, ebdcr:36, burdenPath:'Central convergence node for all burden flows: surveillance, classification, care, commute, institutional pressure.', reentry:'Subject re-entry capacity determined by freedom-space access and barrier reduction.', correction:'Reduce burden node intensities upstream. Expand Freedom Space access via classification reform.'}),
  'body-SURV':   makeNodeData('body-SURV','Surveillance',{ type:'Barrier Node', actors:'All subjects', fdcr:20, gfdcr:18, efdcr:15, ebdcr:13, burdenPath:'Surveillance data → AI pipeline → Classification Gate → Subject Body (barrier)', reentry:'Prior surveillance record constrains re-entry. Subject has no audit access.', correction:'Data minimisation. Subject right to audit. Surveillance accountability legislation.'}),
  'body-CLASS':  makeNodeData('body-CLASS','Classification Gate',{ type:'Barrier Node', actors:'All subjects', fdcr:31, gfdcr:28, efdcr:24, ebdcr:21, burdenPath:'Surveillance + AI Score → Classification Gate → Subject Body constraint', reentry:'Classification score persists across all re-entry attempts. No expiry.', correction:'Replace classification gate with dialectical assessment. Subject agency in rebuttal.'}),
  'body-FREE':   makeNodeData('body-FREE','Freedom Space',{ type:'Target State', actors:'~25% of subject population', fdcr:78, gfdcr:74, efdcr:68, ebdcr:62, burdenPath:'No outgoing burden. This is the correction destination.', reentry:'Freedom space accessed via successful appeal or classification bypass.', correction:'Remove upstream surveillance and classification barriers to expand Freedom Space access.'}),
  'body-TEMPORAL':makeNodeData('body-TEMPORAL','Temporal Compression',{ type:'Systemic Pressure', actors:'Low-FDCR subjects', fdcr:25, gfdcr:22, efdcr:19, ebdcr:16, burdenPath:'Temporal compression → Work burden amplification → Wait queue extension', reentry:'Temporal compression increases re-entry delay: appeal processes require time subjects do not have.', correction:'Temporal relief via reduced commute burden, care infrastructure, paid wait time.'}),
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function SimulationPage() {
  const { scoreResult, loadDemoCase } = useAudit()

  const [activeLayer, setActiveLayer] = useState<LayerId>('planetary')
  const [scenario,    setScenario]    = useState<ScenarioId>('current')
  const [timeHorizon, setTimeHorizon] = useState<THorizon>(0)
  const [overlays,    setOverlays]    = useState(() => new Set(['FDCR','BTR','MSJR','eco_extract','spatial_class']))
  const [selected,    setSelected]    = useState<NodeData | null>(null)
  const [tick,        setTick]        = useState(0)

  useEffect(() => { if (!scoreResult) loadDemoCase('ai_hiring') }, []) // eslint-disable-line

  // Animation tick for dash offsets / pulses
  useEffect(() => {
    const id = setInterval(() => setTick(t => (t + 1) % 1000), 80)
    return () => clearInterval(id)
  }, [])

  const toggleOverlay = (id: string) => setOverlays(p => {
    const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n
  })

  const baseMetrics = useMemo(() => {
    if (!scoreResult) return { FDCR:47, GFDCR:44, EFDCR:41, EBDCR:38, BTR:58, MSJR:62, CFR:55, RBR:51, BGR:42, RCI:38 }
    return {
      FDCR:  scoreResult.fdcr,
      GFDCR: scoreResult.gfdcr,
      EFDCR: scoreResult.ecoScores?.['E-FDCR'] ?? 41,
      EBDCR: scoreResult.ecoScores?.EBDCR ?? 38,
      BTR:   (scoreResult.metrics as any)?.BTR  ?? 58,
      MSJR:  (scoreResult.metrics as any)?.MSJR ?? 62,
      CFR:   (scoreResult.metrics as any)?.CFR  ?? 55,
      RBR:   (scoreResult.metrics as any)?.RBR  ?? 51,
      BGR:   (scoreResult.metrics as any)?.BGR  ?? 42,
      RCI:   (scoreResult.metrics as any)?.RCI  ?? 38,
    }
  }, [scoreResult])

  const m = useMemo(() => computeMetrics(baseMetrics, scenario, timeHorizon), [baseMetrics, scenario, timeHorizon])

  function selectNode(id: string, fallbackLabel: string, fallbackType: string, fdcr: number) {
    const preset = PRESETS[id]
    if (preset) {
      setSelected({ ...preset, fdcr: Math.round(m.FDCR * (preset.fdcr / 47)), gfdcr: Math.round(m.GFDCR * (preset.gfdcr / 44)), efdcr: Math.round(m.EFDCR * (preset.efdcr / 41)), ebdcr: Math.round(m.EBDCR * (preset.ebdcr / 38)) })
    } else {
      setSelected(makeNodeData(id, fallbackLabel, { type: fallbackType, fdcr: Math.round(fdcr), gfdcr: Math.round(fdcr * 0.93), efdcr: Math.round(fdcr * 0.88), ebdcr: Math.round(fdcr * 0.83) }))
    }
  }

  const scOpt = SCENARIOS.find(s => s.id === scenario)!
  const dashOffset = -(tick * 0.8)
  const pulse = 0.5 + 0.5 * Math.sin(tick * 0.12)

  // ── SVG: Planetary ──────────────────────────────────────────────────────────
  const PlanetaryCanvas = useCallback(() => {
    const lats = [-60,-30,0,30,60]
    const lons = [-90,-30,30,90,150]
    const regAdj = REGIONS.map(r => {
      const adj = Math.max(5, Math.min(95, r.baseFDCR + (scenario==='reform'?8:scenario==='managerial'?-10:0) + timeHorizon*(scenario==='reform'?1.8:scenario==='managerial'?-2.2:-0.6)))
      return { ...r, adj, ...ortho(r.lat, r.lon) }
    })

    function contPath(pts: Array<[number,number]>): string {
      return pts.map(([lat,lon],i) => {
        const p = ortho(lat, lon)
        return (i === 0 ? 'M' : p.vis ? 'L' : 'M') + `${p.x.toFixed(1)},${p.y.toFixed(1)}`
      }).join(' ')
    }

    return (
      <svg viewBox="0 0 710 476" className="w-full h-full" style={{background:'#030810'}}>
        <defs>
          <radialGradient id="globeBg" cx="38%" cy="33%">
            <stop offset="0%" stopColor="#0c1e3c"/>
            <stop offset="60%" stopColor="#060e20"/>
            <stop offset="100%" stopColor="#020608"/>
          </radialGradient>
          <radialGradient id="atmoGrad" cx="50%" cy="50%">
            <stop offset="70%" stopColor="transparent"/>
            <stop offset="100%" stopColor="#0a2650" stopOpacity="0.4"/>
          </radialGradient>
          <filter id="glow4"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <filter id="glow2"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <clipPath id="gc"><circle cx={GCX} cy={GCY} r={GR}/></clipPath>
          <style>{`
            .da{stroke-dasharray:8 5;stroke-dashoffset:${dashOffset}}
            .db{stroke-dasharray:4 8;stroke-dashoffset:${dashOffset*0.7}}
            .pulse{opacity:${0.5+pulse*0.5}}
          `}</style>
        </defs>

        {/* Atmosphere */}
        <circle cx={GCX} cy={GCY} r={GR+32} fill="url(#atmoGrad)"/>
        <circle cx={GCX} cy={GCY} r={GR+18} fill="none" stroke="#0a3060" strokeWidth="2" opacity="0.3"/>

        {/* Globe */}
        <circle cx={GCX} cy={GCY} r={GR} fill="url(#globeBg)"/>

        {/* Grid lines */}
        {lats.map(lat => {
          const φ = lat*Math.PI/180
          const y = GCY - GR*Math.sin(φ)
          const hw = GR*Math.cos(φ)
          return <line key={lat} x1={GCX-hw} y1={y} x2={GCX+hw} y2={y} stroke="#0c2038" strokeWidth="0.7" opacity="0.6"/>
        })}
        {lons.map(lon => {
          const λ=(lon-GLON0)*Math.PI/180
          const rx=Math.abs(GR*Math.sin(λ))
          return rx>3 ? <ellipse key={lon} cx={GCX} cy={GCY} rx={rx} ry={GR} fill="none" stroke="#0c2038" strokeWidth="0.7" opacity="0.6" clipPath="url(#gc)"/> : null
        })}
        <line x1={GCX-GR} y1={GCY} x2={GCX+GR} y2={GCY} stroke="#122840" strokeWidth="1" opacity="0.5"/>

        {/* Continental outlines */}
        {CONTINENTS.map(cont => (
          <path key={cont.id} d={contPath(cont.path)} fill={cont.color} stroke="#142438" strokeWidth="0.8" opacity="0.7" clipPath="url(#gc)"/>
        ))}

        {/* Burden arcs */}
        {BURDEN_ARCS.map((arc,i) => {
          const A=regAdj.find(r=>r.id===arc.from)!, B=regAdj.find(r=>r.id===arc.to)!
          if (!A.vis||!B.vis) return null
          const mx=(A.x+B.x)/2, my=(A.y+B.y)/2-70
          return (
            <g key={i}>
              <path d={`M${A.x},${A.y} Q${mx},${my} ${B.x},${B.y}`} fill="none" stroke="#ef4444" strokeWidth={arc.w} opacity="0.4" className="da"/>
              <path d={`M${A.x},${A.y} Q${mx},${my} ${B.x},${B.y}`} fill="none" stroke="#f87171" strokeWidth={arc.w*0.4} opacity="0.7" className="da"/>
            </g>
          )
        })}

        {/* Extraction zones */}
        {overlays.has('eco_extract') && EXTRACTION_ZONES.map((z,i) => {
          const p=ortho(z.lat,z.lon)
          if (!p.vis) return null
          const r=5+z.intensity*5
          return (
            <g key={i} style={{cursor:'pointer'}} onClick={()=>selectNode(`extr-${z.id}`,z.label,'Extraction Zone',18)}>
              <circle cx={p.x} cy={p.y} r={r*1.8} fill="#f97316" opacity={0.1*pulse}/>
              <circle cx={p.x} cy={p.y} r={r} fill="#f97316" opacity="0.85" filter="url(#glow2)"/>
              <text x={p.x+r+4} y={p.y+3} fontSize="7" fill="#f97316" fontFamily="monospace" opacity="0.8">⬡ {z.label}</text>
            </g>
          )
        })}

        {/* Climate displacement */}
        {overlays.has('future_gen') && CLIMATE_ZONES.map((z,i) => {
          const p=ortho(z.lat,z.lon)
          if(!p.vis) return null
          return (
            <g key={i} style={{cursor:'pointer'}} onClick={()=>selectNode(`clim-${z.id}`,z.label,'Climate Displacement',20)}>
              <circle cx={p.x} cy={p.y} r="7" fill="#60a5fa" opacity="0.8" filter="url(#glow2)"/>
              <text x={p.x+10} y={p.y+3} fontSize="7" fill="#60a5fa" fontFamily="monospace">◈ {z.label}</text>
            </g>
          )
        })}

        {/* AI Compute nodes */}
        {overlays.has('FDCR') && COMPUTE_NODES.map((n,i) => {
          const p=ortho(n.lat,n.lon)
          if(!p.vis) return null
          return (
            <g key={i} style={{cursor:'pointer'}} onClick={()=>selectNode(`ai-${n.id}`,n.label,'AI Compute Node',25)}>
              <circle cx={p.x} cy={p.y} r={4+pulse*2} fill="none" stroke="#a78bfa" strokeWidth="1" opacity="0.5"/>
              <circle cx={p.x} cy={p.y} r="5" fill="#a78bfa" opacity="0.9" filter="url(#glow2)"/>
              <text x={p.x+8} y={p.y+3} fontSize="7" fill="#a78bfa" fontFamily="monospace">◈ {n.label}</text>
            </g>
          )
        })}

        {/* Future-gen burden markers */}
        {overlays.has('future_gen') && FUTGEN_MARKERS.map((z,i) => {
          const p=ortho(z.lat,z.lon)
          if(!p.vis) return null
          return (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="4" fill="none" stroke="#a78bfa" strokeWidth="1.5" className="db" opacity="0.7"/>
              <circle cx={p.x} cy={p.y} r="2" fill="#a78bfa" opacity="0.6"/>
            </g>
          )
        })}

        {/* Regional nodes */}
        {regAdj.map(r => {
          if(!r.vis) return null
          const color = fdcrColor(r.adj)
          const nr = 7 + (r.adj/100)*9
          const isSelected = selected?.id === `globe-${r.id}`
          return (
            <g key={r.id} style={{cursor:'pointer'}} onClick={()=>selectNode(`globe-${r.id}`,r.label,'Global Region',r.adj)}>
              {isSelected && <circle cx={r.x} cy={r.y} r={nr+7} fill="none" stroke="#7ac8f8" strokeWidth="1.5" opacity="0.8"/>}
              <circle cx={r.x} cy={r.y} r={nr+5} fill={color} opacity="0.12"/>
              <circle cx={r.x} cy={r.y} r={nr} fill={color} opacity="0.9" filter="url(#glow4)"/>
              <text x={r.x} y={r.y-nr-5} textAnchor="middle" fontSize="8" fill={color} fontFamily="monospace" fontWeight="700">{r.id} {Math.round(r.adj)}</text>
            </g>
          )
        })}

        {/* Globe rim */}
        <circle cx={GCX} cy={GCY} r={GR} fill="none" stroke="#1a3a5a" strokeWidth="1.5" opacity="0.6"/>

        {/* Measurement ticks */}
        {[0,45,90,135,180,225,270,315].map(a => {
          const rad=a*Math.PI/180
          return <line key={a} x1={GCX+(GR-1)*Math.cos(rad)} y1={GCY+(GR-1)*Math.sin(rad)} x2={GCX+(GR+6)*Math.cos(rad)} y2={GCY+(GR+6)*Math.sin(rad)} stroke="#1a3a5a" strokeWidth="0.8" opacity="0.6"/>
        })}

        {/* Annotations */}
        <text x="20" y="436" fontSize="7" fill="#1a3a5a" fontFamily="monospace">● Node size = FDCR magnitude</text>
        <text x="20" y="447" fontSize="7" fill="#1a3a5a" fontFamily="monospace">— Red arc = EP-BTM burden transfer</text>
        <text x="220" y="436" fontSize="7" fill="#1a3a5a" fontFamily="monospace">⬡ Orange = extraction zone</text>
        <text x="220" y="447" fontSize="7" fill="#1a3a5a" fontFamily="monospace">◈ Purple = AI compute node</text>
        <text x="220" y="458" fontSize="7" fill="#1a3a5a" fontFamily="monospace">◈ Blue = climate displacement</text>
        <text x="450" y="436" fontSize="7" fill="#1a3a5a" fontFamily="monospace">Scenario: {scOpt.label}</text>
        <text x="450" y="447" fontSize="7" fill="#1a3a5a" fontFamily="monospace">T-horizon: {T_LABELS[timeHorizon]}</text>
      </svg>
    )
  }, [scenario, timeHorizon, overlays, selected, dashOffset, pulse])

  // ── SVG: Urban-Nature ────────────────────────────────────────────────────────
  const UrbanCanvas = useCallback(() => {
    const cells = []
    for (let row=0;row<6;row++) for (let col=0;col<8;col++) cells.push({col,row,idx:row*8+col})
    cells.sort((a,b)=>(a.col+a.row)-(b.col+b.row))

    const pt = (arr:{x:number,y:number}[]) => arr.map(p=>`${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')

    // Commute route path in SVG iso coords
    function routePts(pairs: number[][]): string {
      return pairs.map(([c,r],i) => {
        const f=isoFront(c,r)
        return `${i===0?'M':'L'}${f.x},${f.y-4}`
      }).join(' ')
    }

    return (
      <svg viewBox="0 0 710 476" className="w-full h-full" style={{background:'#030810'}}>
        <defs>
          <filter id="ubglow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <style>{`.cda{stroke-dasharray:6 5;stroke-dashoffset:${dashOffset}}`}</style>
        </defs>

        {/* Ground */}
        <rect x="0" y="0" width="710" height="476" fill="#030810"/>

        {/* Grid reference lines */}
        {Array.from({length:10},(_,i)=>(
          <line key={i} x1={ISO_OX+(i-4)*ISO_SX*2} y1={ISO_OY-40} x2={ISO_OX+(i-4)*ISO_SX*2-6*ISO_SX} y2={ISO_OY-40+6*ISO_SY*2} stroke="#0a1e30" strokeWidth="0.5" opacity="0.4"/>
        ))}

        {/* Commute routes */}
        {overlays.has('urban_body') && COMMUTE_ROUTES.map((route,i) => (
          <path key={i} d={routePts(route)} fill="none" stroke="#6a4a1a" strokeWidth="2.5" opacity="0.6" className="cda"/>
        ))}

        {/* Rent zone overlay */}
        {overlays.has('spatial_class') && (() => {
          const rentCells = [0,1,2,8,9,10].map(idx => {
            const col=idx%8, row=Math.floor(idx/8)
            const f=isoFront(col,row)
            return f
          })
          return (
            <g opacity="0.15">
              {rentCells.map((f,i)=>(
                <circle key={i} cx={f.x} cy={f.y} r="30" fill="#ef4444"/>
              ))}
            </g>
          )
        })()}

        {/* Isometric blocks */}
        {cells.map(({col,row,idx}) => {
          const v = cellVal(col, row, scenario, timeHorizon)
          const h = 6 + (v/100)*58
          const f = isoFront(col,row)
          const isGreen = GREEN_CELLS.has(idx)
          const isEco = ECOREP_CELLS.has(idx)
          const isRent = RENT_CELLS.has(idx)
          const sp = SPECIAL_URBAN[`${col}_${row}`]
          const clr = isEco ? { top:'#143c1a', left:'#0e2812', right:'#091608' } : blockColor(v, isGreen)
          const isSelected = selected?.id === `urban-${col}-${row}`

          const tN={x:f.x,         y:f.y-2*ISO_SY-h}
          const tE={x:f.x+ISO_SX,  y:f.y-ISO_SY-h}
          const tS={x:f.x,         y:f.y-h}
          const tW={x:f.x-ISO_SX,  y:f.y-ISO_SY-h}
          const gE={x:f.x+ISO_SX,  y:f.y-ISO_SY}
          const gS={x:f.x,         y:f.y}
          const gW={x:f.x-ISO_SX,  y:f.y-ISO_SY}

          return (
            <g key={idx} style={{cursor:'pointer'}} onClick={()=>{
              const label = sp?.type ?? (isGreen?'Green Corridor':isEco?'Ecological Repair Zone':isRent?'High Rent Zone':`District ${col},${row}`)
              selectNode(`urban-${col}-${row}`, label, sp?sp.type:'Urban District', v)
            }}>
              <polygon points={pt([tW,tS,gS,gW])} fill={clr.left} stroke="#030810" strokeWidth="0.4"/>
              <polygon points={pt([tE,tS,gS,gE])} fill={clr.right} stroke="#030810" strokeWidth="0.4"/>
              <polygon points={pt([tN,tE,tS,tW])} fill={isSelected?'#1a3a5a':clr.top} stroke={isSelected?'#7ac8f8':'#030810'} strokeWidth={isSelected?1:0.4}/>

              {/* Overlays on top face */}
              {overlays.has('spatial_class') && sp?.type==='Surveillance' && (
                <polygon points={pt([tN,tE,tS,tW])} fill="#ef4444" opacity="0.55"/>
              )}
              {overlays.has('urban_body') && v<35 && !isGreen && (
                <polygon points={pt([tN,tE,tS,tW])} fill="#f97316" opacity="0.3"/>
              )}
              {isEco && <polygon points={pt([tN,tE,tS,tW])} fill="#4ade80" opacity="0.2"/>}

              {/* Roof marker */}
              {sp && (
                <text x={tN.x} y={tN.y-8} textAnchor="middle" fontSize="9" fill={sp.color} fontFamily="monospace" fontWeight="700" filter="url(#ubglow)">{sp.sym}</text>
              )}
              {isGreen && (
                <circle cx={tN.x} cy={tN.y-4} r="3" fill="#4ade80" opacity="0.7" filter="url(#ubglow)"/>
              )}
              {isRent && overlays.has('spatial_class') && (
                <text x={tN.x} y={tN.y-9} textAnchor="middle" fontSize="7" fill="#ef4444" fontFamily="monospace">$</text>
              )}
            </g>
          )
        })}

        {/* Urban heat zone blobs */}
        {overlays.has('urban_body') && (
          <g opacity="0.12">
            <circle cx={ISO_OX-20} cy={ISO_OY+80} r="60" fill="#f97316"/>
            <circle cx={ISO_OX+120} cy={ISO_OY+100} r="45" fill="#f97316"/>
          </g>
        )}

        <text x="20" y="436" fontSize="7" fill="#1a3a5a" fontFamily="monospace">▬ Height = FDCR density</text>
        <text x="20" y="447" fontSize="7" fill="#1a3a5a" fontFamily="monospace">■ Green = ecological corridor</text>
        <text x="220" y="436" fontSize="7" fill="#1a3a5a" fontFamily="monospace">⬡ Red = surveillance node</text>
        <text x="220" y="447" fontSize="7" fill="#1a3a5a" fontFamily="monospace">◉ Bright green = eco-repair</text>
        <text x="450" y="436" fontSize="7" fill="#1a3a5a" fontFamily="monospace">$ = rent burden zone</text>
        <text x="450" y="447" fontSize="7" fill="#1a3a5a" fontFamily="monospace">— Dashed = commute route</text>
      </svg>
    )
  }, [scenario, timeHorizon, overlays, selected, dashOffset])

  // ── SVG: Body-Lifeworld ──────────────────────────────────────────────────────
  const BodyCanvas = useCallback(() => {
    const nodeMap = Object.fromEntries(BNODES.map(n=>[n.id,n]))

    // Time ring: donut at top-right showing daily burden allocation
    const ringCX=590, ringCY=120, ringR=65, ringW=22
    let ringAngle = -Math.PI/2
    const ringSlices = TIME_RING.map(s => {
      const frac = s.hours/24
      const startA = ringAngle
      const endA = ringAngle + frac*2*Math.PI
      ringAngle = endA
      const x1=ringCX+ringR*Math.cos(startA), y1=ringCY+ringR*Math.sin(startA)
      const x2=ringCX+ringR*Math.cos(endA),   y2=ringCY+ringR*Math.sin(endA)
      const xi1=ringCX+(ringR-ringW)*Math.cos(startA), yi1=ringCY+(ringR-ringW)*Math.sin(startA)
      const xi2=ringCX+(ringR-ringW)*Math.cos(endA),   yi2=ringCY+(ringR-ringW)*Math.sin(endA)
      const lg = frac > 0.5 ? 1 : 0
      const d = `M${x1},${y1} A${ringR},${ringR} 0 ${lg},1 ${x2},${y2} L${xi2},${yi2} A${ringR-ringW},${ringR-ringW} 0 ${lg},0 ${xi1},${yi1} Z`
      return { ...s, d }
    })

    // Burden load adjusted by scenario
    const burdAdj = (base:number) => {
      const sm = scenario==='reform' ? -10 : scenario==='managerial' ? 12 : 0
      const tm = timeHorizon * (scenario==='reform' ? -1.5 : scenario==='managerial' ? 2 : 0.3)
      return Math.max(5, Math.min(98, base + sm + tm))
    }

    return (
      <svg viewBox="0 0 710 476" className="w-full h-full" style={{background:'#030810'}}>
        <defs>
          <filter id="nglow"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <filter id="nglow2"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <style>{`
            .bda{stroke-dasharray:6 4;stroke-dashoffset:${dashOffset}}
            .bdb{stroke-dasharray:3 7;stroke-dashoffset:${dashOffset*0.6}}
          `}</style>
          {['arr','arrF','arrB','arrBr','arrN','arrC'].map((id,i) => {
            const colors=['#2a5a8a','#4ade80','#ef4444','#f97316','#2a4a6a','#a78bfa']
            return (
              <marker key={id} id={id} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill={colors[i]} opacity="0.7"/>
              </marker>
            )
          })}
        </defs>

        {/* Background field */}
        <rect x="0" y="0" width="710" height="476" fill="#030810"/>

        {/* Concentric field rings */}
        {[180,120,70].map((r,i) => (
          <circle key={i} cx={355} cy={238} r={r} fill="none" stroke="#0a1e30" strokeWidth="0.8" opacity={0.4-i*0.1}/>
        ))}

        {/* Axis guides */}
        <line x1="110" y1="238" x2="600" y2="238" stroke="#0a1e30" strokeWidth="0.6" opacity="0.5"/>
        <line x1="355" y1="80"  x2="355" y2="440" stroke="#0a1e30" strokeWidth="0.6" opacity="0.5"/>

        {/* Axis labels */}
        <text x="355" y="76"  textAnchor="middle" fontSize="7" fill="#1a3a5a" fontFamily="monospace">↑ health / reproduction / autonomy</text>
        <text x="355" y="455" textAnchor="middle" fontSize="7" fill="#1a3a5a" fontFamily="monospace">↓ classification / exclusion / erasure</text>
        <text x="108" y="241" textAnchor="end"   fontSize="7" fill="#1a3a5a" fontFamily="monospace">← work / institutional →</text>
        <text x="602" y="241" textAnchor="start"  fontSize="7" fill="#1a3a5a" fontFamily="monospace">← recovery / appeal →</text>

        {/* Institutional contact pressure bands */}
        {overlays.has('spatial_class') && (
          <g opacity="0.08">
            <ellipse cx="355" cy="360" rx="130" ry="50" fill="#f97316"/>
            <ellipse cx="355" cy="350" rx="80"  ry="30" fill="#ef4444"/>
          </g>
        )}

        {/* Temporal compression band */}
        <rect x="140" y="280" width="90" height="60" fill="#a78bfa" opacity="0.05" rx="4"/>
        <text x="185" y="310" textAnchor="middle" fontSize="6" fill="#a78bfa" fontFamily="monospace" opacity="0.5">temporal</text>
        <text x="185" y="320" textAnchor="middle" fontSize="6" fill="#a78bfa" fontFamily="monospace" opacity="0.5">compression</text>

        {/* Edges */}
        {BEDGES.map((e,i) => {
          const A=nodeMap[e.from], B=nodeMap[e.to]
          if (!A||!B) return null
          const mx=(A.x+B.x)/2+(A.y-B.y)*0.18
          const my=(A.y+B.y)/2+(B.x-A.x)*0.18
          const ec=EDGE_C[e.type]
          const mk = e.type==='freedom'?'url(#arrF)':e.type==='burden'?'url(#arrB)':e.type==='barrier'?'url(#arrBr)':e.type==='compress'?'url(#arrC)':e.type==='sustain'?'url(#arrN)':'url(#arr)'
          return (
            <path key={i} d={`M${A.x},${A.y} Q${mx},${my} ${B.x},${B.y}`}
              fill="none" stroke={ec} strokeWidth={e.w} opacity="0.55"
              markerEnd={mk}
              className={e.type==='barrier'?'bda':e.type==='compress'?'bdb':''}
            />
          )
        })}

        {/* Nodes */}
        {BNODES.map(n => {
          const load = burdAdj(n.baseLoad)
          const isBarrier = n.type==='barrier'
          const isFreedom = n.type==='freedom'
          const isSelected = selected?.id === `body-${n.id}`
          const loadColor = isBarrier ? riskColor(load) : isFreedom ? fdcrColor(100-load) : n.color

          return (
            <g key={n.id} style={{cursor:'pointer'}} onClick={()=>selectNode(`body-${n.id}`,n.label,n.type==='barrier'?'Barrier Node':n.type==='freedom'?'Freedom Node':'Lifeworld Node', Math.round(100-n.baseLoad*0.6))}>
              {isBarrier && <circle cx={n.x} cy={n.y} r={n.r+9} fill="none" stroke={n.color} strokeWidth="1.2" opacity="0.3" className="bda"/>}
              {isSelected && <circle cx={n.x} cy={n.y} r={n.r+7} fill="none" stroke="#7ac8f8" strokeWidth="1.5" opacity="0.9"/>}
              <circle cx={n.x} cy={n.y} r={n.r+4} fill={loadColor} opacity="0.12"/>
              <circle cx={n.x} cy={n.y} r={n.r} fill={loadColor} opacity={isBarrier?0.92:0.85} filter="url(#nglow2)"/>
              {/* Load bar inside node */}
              {n.r>9 && (
                <rect x={n.x-n.r*0.6} y={n.y+2} width={n.r*1.2*(load/100)} height="2.5" fill={riskColor(load)} opacity="0.7" rx="1"/>
              )}
              <text x={n.x} y={n.type==='actor'?n.y-n.r-7:n.y+n.r+10}
                textAnchor="middle" fontSize={n.type==='actor'?'9':'7'}
                fill={loadColor} fontFamily="monospace"
                fontWeight={n.type==='actor'||isBarrier?'700':'400'}>
                {n.label}
              </text>
            </g>
          )
        })}

        {/* Daily time ring (top-right) */}
        <g>
          <text x={ringCX} y={ringCY-ringR-12} textAnchor="middle" fontSize="7" fill="#1a3a5a" fontFamily="monospace" letterSpacing="2">24H DISTRIBUTION</text>
          {ringSlices.map((s,i) => (
            <path key={i} d={s.d} fill={s.color} stroke="#030810" strokeWidth="1" opacity="0.85"/>
          ))}
          {/* Ring labels */}
          {ringSlices.map((s,i) => {
            const midA = (i===0?-Math.PI/2:ringSlices.slice(0,i).reduce((a,r)=>a+r.hours/24*2*Math.PI,-Math.PI/2)) + s.hours/24*Math.PI
            const lr = ringR - ringW/2
            return s.hours>1.5 ? (
              <text key={i} x={ringCX+lr*Math.cos(midA)} y={ringCY+lr*Math.sin(midA)+3} textAnchor="middle" fontSize="6" fill="#fff" fontFamily="monospace" opacity="0.7">{s.label}</text>
            ) : null
          })}
          <text x={ringCX} y={ringCY+4} textAnchor="middle" fontSize="8" fill="#1a3a5a" fontFamily="monospace">{Math.round(m.FDCR)}</text>
          <text x={ringCX} y={ringCY+13} textAnchor="middle" fontSize="6" fill="#1a3a5a" fontFamily="monospace">FDCR</text>
        </g>

        {/* Burden magnitude overlay panel */}
        {overlays.has('urban_body') && (
          <g>
            <rect x="16" y="30" width="145" height="56" fill="#060e18" stroke="#1a3a5a" strokeWidth="0.8"/>
            <text x="24" y="44" fontSize="7" fill="#1a3a5a" fontFamily="monospace">BODY BURDEN METRICS</text>
            <text x="24" y="59" fontSize="8" fill="#ef4444" fontFamily="monospace" fontWeight="700">BTR {Math.round(m.BTR)}</text>
            <text x="80" y="59" fontSize="8" fill="#f97316" fontFamily="monospace" fontWeight="700">CFR {Math.round(m.CFR)}</text>
            <text x="24" y="75" fontSize="8" fill="#4ade80" fontFamily="monospace" fontWeight="700">FDCR {Math.round(m.FDCR)}</text>
            <text x="80" y="75" fontSize="8" fill="#60a5fa" fontFamily="monospace" fontWeight="700">BGR {Math.round(m.BGR)}</text>
          </g>
        )}

        <text x="16" y="455" fontSize="7" fill="#1a3a5a" fontFamily="monospace">● Red = barrier/burden node · Green = freedom node · Blue = sustain · Purple = compress</text>
      </svg>
    )
  }, [scenario, timeHorizon, overlays, selected, dashOffset, m.FDCR, m.BTR, m.CFR, m.BGR, pulse])

  // ── SVG: Institutional Flow ──────────────────────────────────────────────────
  const FlowCanvas = useCallback(() => {
    const nMap = Object.fromEntries(FNODES.map(n=>[n.id,n]))

    const bypassRate = scenario==='reform'?'45%':scenario==='managerial'?'92%':'75%'
    const approvalRate = scenario==='reform'?'55%':scenario==='managerial'?'22%':'35%'

    function nodeShape(n: FNode, isSelected: boolean) {
      const sc = isSelected ? '#7ac8f8' : n.color
      const sw = isSelected ? 1.5 : 0.5
      if (n.shape==='circle')  return <circle cx={n.x} cy={n.y} r="20" fill={n.color} opacity="0.9" stroke={sc} strokeWidth={sw}/>
      if (n.shape==='diamond') return <polygon points={`${n.x},${n.y-22} ${n.x+26},${n.y} ${n.x},${n.y+22} ${n.x-26},${n.y}`} fill={n.color} opacity="0.9" stroke={sc} strokeWidth={sw}/>
      return <rect x={n.x-28} y={n.y-14} width="56" height="28" fill={n.color} opacity="0.9" stroke={sc} strokeWidth={sw}/>
    }

    return (
      <svg viewBox="0 0 710 476" className="w-full h-full" style={{background:'#030810'}}>
        <defs>
          <filter id="fglow"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <style>{`.fda{stroke-dasharray:7 4;stroke-dashoffset:${dashOffset}}`}</style>
          {['fa','faF','faB','faBr'].map((id,i)=>{
            const colors=['#2a5a8a','#4ade80','#ef4444','#f97316']
            return (
              <marker key={id} id={id} markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
                <path d="M0,0 L7,3.5 L0,7 Z" fill={colors[i]} opacity="0.8"/>
              </marker>
            )
          })}
        </defs>

        <rect x="0" y="0" width="710" height="476" fill="#030810"/>

        {/* Stage dividers */}
        {[70,135,195,255,325,400].map((y,i) => (
          <line key={i} x1="60" y1={y} x2="650" y2={y} stroke="#0a1e30" strokeWidth="0.5" opacity="0.4"/>
        ))}
        {['Entry','Intake','AI Process','Classification','Review','Outcome'].map((lbl,i) => {
          const ys=[25,102,162,225,288,358]
          return <text key={i} x="68" y={ys[i]} fontSize="6" fill="#1a3a5a" fontFamily="monospace" opacity="0.7">{lbl.toUpperCase()}</text>
        })}

        {/* Tag heatmap blobs */}
        <ellipse cx="355" cy="215" rx="90" ry="55" fill="#ef4444" opacity="0.05"/>
        <ellipse cx="510" cy="395" rx="80" ry="55" fill="#ef4444" opacity="0.06"/>

        {/* Edges */}
        {FEDGES.map((e,i) => {
          const A=nMap[e.from], B=nMap[e.to]
          if (!A||!B) return null
          const dx=B.x-A.x, dy=B.y-A.y
          const mx=(A.x+B.x)/2+(Math.abs(dx)>40?0:dx>0?35:-35)
          const my=(A.y+B.y)/2+(Math.abs(dx)>40?-20:0)
          const ec=EDGE_C[e.type]??'#2a5a8a'
          const mk=e.type==='freedom'?'url(#faF)':e.type==='burden'?'url(#faB)':e.type==='barrier'?'url(#faBr)':'url(#fa)'
          return (
            <g key={i}>
              <path d={`M${A.x},${A.y} Q${mx},${my} ${B.x},${B.y}`}
                fill="none" stroke={ec} strokeWidth="2" opacity="0.6"
                markerEnd={mk}
                className={e.type==='barrier'?'fda':''}/>
              {e.label && <text x={mx} y={my-5} textAnchor="middle" fontSize="7" fill={ec} fontFamily="monospace" opacity="0.85">{e.label}</text>}
            </g>
          )
        })}

        {/* Nodes */}
        {FNODES.map(n => {
          const isSelected = selected?.id === `flow-${n.id}`
          const tag = n.tag ? TAG_LABELS[n.tag] : null
          const isAI = n.id==='AI'
          return (
            <g key={n.id} style={{cursor:'pointer'}} onClick={()=>{
              const fdcr = n.color==='#4ade80'?70:n.color==='#ef4444'?22:n.color==='#f97316'?32:50
              selectNode(`flow-${n.id}`,n.label,'Institutional Node',fdcr)
            }}>
              {isAI && <circle cx={n.x} cy={n.y} r={24+pulse*4} fill="none" stroke="#ef4444" strokeWidth="1" opacity="0.3"/>}
              {isSelected && <circle cx={n.x} cy={n.y} r={(n.shape==='circle'?20:n.shape==='diamond'?26:22)+9} fill="none" stroke="#7ac8f8" strokeWidth="1.5" opacity="0.9"/>}
              <g filter="url(#fglow)">{nodeShape(n, isSelected)}</g>
              {tag && (
                <rect x={n.x+22} y={n.y-9} width={tag.label.length*6+4} height="14" fill="#030810" stroke={tag.color} strokeWidth="0.5" rx="2"/>
              )}
              {tag && <text x={n.x+24} y={n.y+2} fontSize="6.5" fill={tag.color} fontFamily="monospace" fontWeight="700">{tag.label}</text>}
              <text x={n.x} y={n.shape==='rect'?n.y+30:n.y+32}
                textAnchor="middle" fontSize="7" fill={n.color} fontFamily="monospace"
                fontWeight={['AI','CLASS','EXCL'].includes(n.id)?'700':'400'}>
                {n.label}
              </text>
            </g>
          )
        })}

        {/* Metric panels */}
        <g>
          <rect x="16" y="195" width="140" height="42" fill="#060e18" stroke="#1a3a5a" strokeWidth="0.8"/>
          <text x="24" y="209" fontSize="6" fill="#fbbf24" fontFamily="monospace">RESPONSIBILITY DISPLACEMENT</text>
          <text x="24" y="228" fontSize="12" fill="#ef4444" fontFamily="monospace" fontWeight="700">MSJR {Math.round(m.MSJR)}</text>
        </g>
        <g>
          <rect x="560" y="195" width="135" height="42" fill="#060e18" stroke="#1a3a5a" strokeWidth="0.8"/>
          <text x="568" y="209" fontSize="6" fill="#f97316" fontFamily="monospace">CLASSIFICATION FIXATION</text>
          <text x="568" y="228" fontSize="12" fill="#ef4444" fontFamily="monospace" fontWeight="700">CFR {Math.round(m.CFR)}</text>
        </g>
        <g>
          <rect x="16" y="350" width="140" height="42" fill="#060e18" stroke="#1a3a5a" strokeWidth="0.8"/>
          <text x="24" y="364" fontSize="6" fill="#4ade80" fontFamily="monospace">DEMOCRATIC REVIEW BYPASS</text>
          <text x="24" y="383" fontSize="12" fill="#fbbf24" fontFamily="monospace" fontWeight="700">{bypassRate}</text>
        </g>
        <g>
          <rect x="16" y="415" width="140" height="42" fill="#060e18" stroke="#1a3a5a" strokeWidth="0.8"/>
          <text x="24" y="429" fontSize="6" fill="#f97316" fontFamily="monospace">RE-ENTRY BLOCKAGE</text>
          <text x="24" y="448" fontSize="12" fill="#f97316" fontFamily="monospace" fontWeight="700">RBR {Math.round(m.RBR)}</text>
        </g>
        <g>
          <rect x="560" y="350" width="135" height="42" fill="#060e18" stroke="#1a3a5a" strokeWidth="0.8"/>
          <text x="568" y="364" fontSize="6" fill="#4ade80" fontFamily="monospace">APPROVAL RATE</text>
          <text x="568" y="383" fontSize="12" fill="#4ade80" fontFamily="monospace" fontWeight="700">{approvalRate}</text>
        </g>

        <text x="16" y="470" fontSize="6.5" fill="#1a3a5a" fontFamily="monospace">CFR=Classification Fixation · RBR=Re-entry Blockage · MSJR=Responsibility Displacement · TEI=Testimony Erasure · COR=Correction</text>
      </svg>
    )
  }, [scenario, timeHorizon, selected, dashOffset, m.MSJR, m.CFR, m.RBR, pulse])

  const ActiveCanvas = activeLayer==='planetary' ? PlanetaryCanvas : activeLayer==='urban_nature' ? UrbanCanvas : activeLayer==='body_lifeworld' ? BodyCanvas : FlowCanvas

  const statusBars = [
    {k:'FDCR',  v:m.FDCR,  risk:false},{k:'G-FDCR',v:m.GFDCR, risk:false},
    {k:'E-FDCR',v:m.EFDCR, risk:false},{k:'EBDCR', v:m.EBDCR, risk:false},
    {k:'BTR',   v:m.BTR,   risk:true },{k:'MSJR',  v:m.MSJR,  risk:true },
    {k:'CFR',   v:m.CFR,   risk:true },{k:'RBR',   v:m.RBR,   risk:true },
  ]

  const caseLabel = scoreResult ? scoreResult.report.target : 'Case 001 — AI Hiring System (Demo)'

  return (
    <div className="bg-[#030810] flex flex-col overflow-hidden" style={{height:'100vh',marginLeft:'-24px',marginRight:'-24px',marginTop:'-32px'}}>

      {/* TOP BAR */}
      <div className="flex items-stretch border-b border-[#1a3a5a] bg-[#050c16] flex-shrink-0 overflow-x-auto" style={{height:'42px'}}>
        <div className="flex items-center gap-2 px-4 border-r border-[#1a3a5a] flex-shrink-0">
          <span className="text-[7px] font-mono uppercase tracking-[0.2em] text-[#1a3a5a]">FEDS</span>
          <div className="w-px h-3 bg-[#1a3a5a]"/>
          <span className="text-[7px] font-mono text-[#2a5a8a] uppercase tracking-wider">Simulation Theater</span>
          <div className="w-1.5 h-1.5 rounded-full bg-[#4ade80]" style={{boxShadow:`0 0 ${4+pulse*4}px #4ade80`}}/>
        </div>

        <div className="flex items-stretch border-r border-[#1a3a5a] flex-shrink-0">
          <div className="flex items-center px-2 border-r border-[#0d1e2e]"><span className="text-[6px] font-mono uppercase tracking-[0.18em] text-[#1a3a5a]">Mode</span></div>
          {LAYERS.map(lm => (
            <button key={lm.id} onClick={()=>{setActiveLayer(lm.id);setSelected(null)}}
              className={`flex items-center px-3 text-[8.5px] font-mono border-r border-[#0d1e2e] h-full whitespace-nowrap transition-colors ${activeLayer===lm.id?'text-[#7ac8f8] bg-[#08162a]':'text-[#2a5a8a] hover:text-[#4a8abb] hover:bg-[#06101a]'}`}>
              {lm.label}
            </button>
          ))}
        </div>

        <div className="flex items-stretch border-r border-[#1a3a5a] flex-shrink-0">
          <div className="flex items-center px-2 border-r border-[#0d1e2e]"><span className="text-[6px] font-mono uppercase tracking-[0.18em] text-[#1a3a5a]">Scenario</span></div>
          {SCENARIOS.map(s => (
            <button key={s.id} onClick={()=>setScenario(s.id)}
              className={`flex items-center gap-1.5 px-3 text-[8.5px] font-mono border-r border-[#0d1e2e] h-full whitespace-nowrap transition-colors ${scenario===s.id?'bg-[#08162a]':'hover:bg-[#06101a]'}`}
              style={{color:scenario===s.id?s.color:'#2a5a8a'}}>
              {scenario===s.id && <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{background:s.color}}/>}
              {s.label}
            </button>
          ))}
        </div>

        <div className="flex items-stretch flex-1">
          <div className="flex items-center px-2 border-r border-[#0d1e2e] flex-shrink-0"><span className="text-[6px] font-mono uppercase tracking-[0.18em] text-[#1a3a5a]">T</span></div>
          {T_LABELS.map((lbl,i) => (
            <button key={i} onClick={()=>setTimeHorizon(i as THorizon)}
              className={`flex items-center px-2.5 text-[8px] font-mono border-r border-[#0d1e2e] h-full whitespace-nowrap transition-colors ${timeHorizon===i?'text-[#7ac8f8] bg-[#08162a]':'text-[#2a5a8a] hover:text-[#4a8abb] hover:bg-[#06101a]'}`}>
              {lbl}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN WORKSPACE */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT PANEL */}
        <div className="w-40 flex-shrink-0 border-r border-[#1a3a5a] bg-[#050c16] overflow-y-auto">
          {OVERLAY_GROUPS.map(g => (
            <div key={g.label}>
              <div className="text-[6px] font-mono uppercase tracking-[0.18em] text-[#1a3a5a] px-3 py-1.5 border-b border-[#0d1e2e] bg-[#050c16] sticky top-0">
                {g.label}
              </div>
              {g.items.map(item => {
                const on = overlays.has(item.id)
                return (
                  <button key={item.id} onClick={()=>toggleOverlay(item.id)}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 border-b border-[#060f18] transition-colors ${on?'bg-[#06101e]':'hover:bg-[#060e18]'}`}>
                    <div className="w-2 h-2 flex-shrink-0 border transition-colors"
                      style={{borderColor:on?item.c:'#1a3a5a',background:on?item.c:'transparent'}}/>
                    <span className="text-[8.5px] font-mono" style={{color:on?item.c:'#2a5a8a'}}>{item.label}</span>
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        {/* CANVAS */}
        <div className="flex-1 relative overflow-hidden bg-[#030810]">
          <div className="absolute inset-0" style={{bottom:'26px'}}>
            <ActiveCanvas/>
          </div>
          {/* Status strip */}
          <div className="absolute bottom-0 left-0 right-0 flex items-center bg-[#030810]/95 border-t border-[#1a3a5a] overflow-x-auto" style={{height:'26px'}}>
            {statusBars.map(({k,v,risk}) => {
              const val=Math.round(v)
              const c=risk?(val>65?'#ef4444':val>45?'#fbbf24':'#4ade80'):(val>60?'#4ade80':val>40?'#fbbf24':'#ef4444')
              return (
                <div key={k} className="flex items-center gap-1.5 px-3 border-r border-[#1a3a5a] h-full flex-shrink-0">
                  <span className="text-[6.5px] font-mono text-[#2a5a8a]">{k}</span>
                  <div className="w-8 h-px" style={{background:`linear-gradient(90deg, ${c} ${val}%, #0d1e2e ${val}%)`}}/>
                  <span className="text-[8px] font-mono font-bold" style={{color:c}}>{val}</span>
                </div>
              )
            })}
            <div className="flex-1"/>
            <span className="text-[6.5px] font-mono text-[#1a3a5a] px-3 flex-shrink-0">{scOpt.label} · {T_LABELS[timeHorizon]}</span>
          </div>
        </div>

        {/* RIGHT INSPECTOR */}
        <div className="w-60 flex-shrink-0 border-l border-[#1a3a5a] bg-[#050c16] overflow-y-auto" style={{fontSize:'8.5px'}}>
          {!selected ? (
            <div>
              <div className="px-3 py-2 border-b border-[#1a3a5a]">
                <div className="text-[6px] font-mono uppercase tracking-[0.16em] text-[#1a3a5a] mb-1">Active Case File</div>
                <div className="font-mono text-[#7ac8f8] leading-snug">{caseLabel}</div>
              </div>
              <div className="px-3 py-2 border-b border-[#1a3a5a]">
                <div className="text-[6px] font-mono uppercase tracking-[0.16em] text-[#1a3a5a] mb-1.5">Scenario</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{background:scOpt.color}}/>
                  <span className="font-mono" style={{color:scOpt.color}}>{scOpt.label}</span>
                </div>
              </div>
              <div className="px-3 py-2 border-b border-[#1a3a5a]">
                <div className="text-[6px] font-mono uppercase tracking-[0.16em] text-[#1a3a5a] mb-2">Core Metrics</div>
                <div className="space-y-2">
                  {[
                    {k:'FDCR',  v:m.FDCR,  risk:false},{k:'G-FDCR',v:m.GFDCR, risk:false},
                    {k:'E-FDCR',v:m.EFDCR, risk:false},{k:'EBDCR', v:m.EBDCR, risk:false},
                    {k:'BTR',   v:m.BTR,   risk:true },{k:'MSJR',  v:m.MSJR,  risk:true },
                    {k:'CFR',   v:m.CFR,   risk:true },{k:'RBR',   v:m.RBR,   risk:true },
                    {k:'BGR',   v:m.BGR,   risk:false},{k:'RCI',   v:m.RCI,   risk:false},
                  ].map(({k,v,risk}) => {
                    const val=Math.round(v)
                    const c=metricColor(k,val)
                    return (
                      <div key={k}>
                        <div className="flex justify-between mb-0.5">
                          <span className="font-mono text-[#2a5a8a]">{k}</span>
                          <span className="font-mono font-bold" style={{color:c}}>{val}</span>
                        </div>
                        <div className="h-px bg-[#0d1e2e]">
                          <div className="h-px" style={{width:`${val}%`,background:c}}/>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
              <div className="px-3 py-2 border-b border-[#1a3a5a]">
                <div className="text-[6px] font-mono uppercase tracking-[0.16em] text-[#1a3a5a] mb-1">Primary Burden Pathway</div>
                <div className="font-mono text-[#ef4444] leading-relaxed text-[8px]">AI Scoring → Classification Gate → Rejection → Exclusion Zone</div>
              </div>
              <div className="px-3 py-2 border-b border-[#1a3a5a]">
                <div className="text-[6px] font-mono uppercase tracking-[0.16em] text-[#1a3a5a] mb-1">Correction Mechanism</div>
                <div className="font-mono text-[#4ade80] leading-relaxed text-[8px]">Democratic Review Gate → Appeal Process → Freedom Space</div>
              </div>
              <div className="px-3 py-2">
                <div className="text-[6.5px] text-[#1a3a5a] font-mono leading-relaxed">Click any node, region, city block, or institutional node to inspect metrics and burden pathway.</div>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-start justify-between gap-2 px-3 py-2 border-b border-[#1a3a5a]">
                <div>
                  <div className="text-[6px] font-mono uppercase tracking-[0.16em] text-[#1a3a5a] mb-0.5">Inspector · {selected.type}</div>
                  <h3 className="font-bold text-[#7ac8f8] text-[10px] leading-tight">{selected.label}</h3>
                </div>
                <button onClick={()=>setSelected(null)} className="text-[#2a5a8a] hover:text-[#7ac8f8] font-mono text-[10px] shrink-0 mt-0.5">✕</button>
              </div>
              <div className="px-3 py-1.5 border-b border-[#1a3a5a]">
                <div className="text-[6px] font-mono uppercase tracking-[0.16em] text-[#1a3a5a] mb-1">Affected Actors</div>
                <div className="font-mono text-[#3a6a8a] text-[8px] leading-snug">{selected.actors}</div>
              </div>
              <div className="px-3 py-2 border-b border-[#1a3a5a]">
                <div className="text-[6px] font-mono uppercase tracking-[0.16em] text-[#1a3a5a] mb-2">Object Metrics</div>
                <div className="space-y-2">
                  {[
                    {k:'FDCR',  v:selected.fdcr,  risk:false},
                    {k:'G-FDCR',v:selected.gfdcr,  risk:false},
                    {k:'E-FDCR',v:selected.efdcr,  risk:false},
                    {k:'EBDCR', v:selected.ebdcr,  risk:false},
                  ].map(({k,v,risk}) => {
                    const c=metricColor(k,v)
                    return (
                      <div key={k}>
                        <div className="flex justify-between mb-0.5">
                          <span className="font-mono text-[#2a5a8a]">{k}</span>
                          <span className="font-mono font-bold" style={{color:c}}>{v}</span>
                        </div>
                        <div className="h-px bg-[#0d1e2e]">
                          <div className="h-px" style={{width:`${Math.min(100,v)}%`,background:c}}/>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
              <div className="px-3 py-2 border-b border-[#1a3a5a]">
                <div className="text-[6px] font-mono uppercase tracking-[0.16em] text-[#1a3a5a] mb-1">Burden Pathway</div>
                <p className="text-[8px] text-[#ef4444] leading-relaxed font-mono">{selected.burdenPath}</p>
              </div>
              <div className="px-3 py-2 border-b border-[#1a3a5a]">
                <div className="text-[6px] font-mono uppercase tracking-[0.16em] text-[#1a3a5a] mb-1">Re-entry Condition</div>
                <p className="text-[8px] text-[#fbbf24] leading-relaxed font-mono">{selected.reentry}</p>
              </div>
              <div className="px-3 py-2">
                <div className="text-[6px] font-mono uppercase tracking-[0.16em] text-[#1a3a5a] mb-1">Correction Mechanism</div>
                <p className="text-[8px] text-[#4ade80] leading-relaxed font-mono">{selected.correction}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* LEGEND */}
      <div className="flex-shrink-0 border-t border-[#1a3a5a] bg-[#050c16] flex items-center overflow-x-auto" style={{height:'30px'}}>
        {[
          {sym:'●',c:'#4ade80',label:'FDCR ≥60 / freedom node'},
          {sym:'●',c:'#fbbf24',label:'FDCR 45–59 / moderate'},
          {sym:'●',c:'#f97316',label:'FDCR 30–44 / risk'},
          {sym:'●',c:'#ef4444',label:'FDCR <30 / high burden'},
          {sym:'—',c:'#ef4444',label:'Burden transfer arc'},
          {sym:'⬡',c:'#f97316',label:'Extraction zone'},
          {sym:'◈',c:'#a78bfa',label:'AI compute / gateway'},
          {sym:'◈',c:'#60a5fa',label:'Climate displacement'},
          {sym:'▬',c:'#4a8abb',label:'Block height = FDCR'},
        ].map((item,i) => (
          <div key={i} className="flex items-center gap-1.5 px-3 border-r border-[#1a3a5a] h-full flex-shrink-0">
            <span className="text-[8px] font-bold" style={{color:item.c}}>{item.sym}</span>
            <span className="text-[6.5px] font-mono text-[#2a5a8a]">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
