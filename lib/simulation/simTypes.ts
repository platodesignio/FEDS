export type SimMode = 'planetary' | 'urban' | 'body' | 'flow' | 'integrated'
export type ScenarioType = 'current' | 'freedomReform' | 'managerialIntensification'
export type TimeHorizon = 'immediate' | '1y' | '5y' | '10y' | '25y' | 'future'
export type MetricKey = 'FDCR' | 'GFDCR' | 'EFDCR' | 'EBDCR' | 'BGR' | 'RCI' | 'MSJR' | 'CFR' | 'RBR' | 'BTR' | 'EER' | 'EPBTM' | 'DRR' | 'FGR'

export interface SimMetrics {
  FDCR: number; GFDCR: number; EFDCR: number; EBDCR: number
  BGR: number; RCI: number; MSJR: number; CFR: number
  RBR: number; BTR: number; EER: number; EPBTM: number
  DRR: number; FGR: number
}

export interface SimObject {
  id: string; label: string; objectType: string; systemLayer: SimMode
  metrics: Partial<SimMetrics>; affectedActors: string; affectedScale: string
  burdenPathway: string; reentryCondition: string; classificationRisk: string
  lifeworldImpact: string; ecologicalImpact: string; correctionMechanism: string
  scenarioInterpretation: string
}

export interface SimFlow {
  id: string; source: string; target: string
  flowType: 'burden' | 'freedom' | 'barrier' | 'neutral' | 'compress'
  severity: number; opacity: number
  reversibility: 'reversible' | 'constrained' | 'terminal'
  affectedLayer: string; explanation: string
}

export interface PlanetaryNode extends SimObject {
  lat: number; lon: number
  nodeCategory: 'region' | 'extraction' | 'compute' | 'climate' | 'waste' | 'futureGen' | 'logistics'
}

export interface UrbanCell {
  col: number; row: number; fdcr: number
  zoneType: 'residential' | 'institutional' | 'green' | 'surveillance' | 'transit' | 'exclusion' | 'ecoRepair' | 'industrial'
  civic?: string; rentBurden: number; heatBurden: number; survDensity: number
}

export interface BodyNode extends SimObject {
  x: number; y: number; r: number; color: string
  nodeRole: 'actor' | 'sustain' | 'burden' | 'barrier' | 'freedom' | 'compress'
  baseLoad: number
}

export interface FlowNode extends SimObject {
  x: number; y: number; shape: 'diamond' | 'rect' | 'circle' | 'hexagon'; color: string
  tagCode?: string; tagLabel?: string
}

export interface CaseFile {
  id: string; label: string; description: string; baseMetrics: SimMetrics
}
