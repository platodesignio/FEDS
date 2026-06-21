export type ScenarioId = 'current' | 'reform' | 'managerial'
export type LayerId =
  | 'planetary'
  | 'urban_nature'
  | 'body_lifeworld'
  | 'institutional_flow'

export type TimeHorizon = 0 | 1 | 2 | 3 | 4 | 5

export interface BaseMetrics {
  FDCR: number
  GFDCR: number
  BTR: number
  MSJR: number
  CFR: number
  RBR: number
  BGR: number
  DER: number
  CFCS: number
  RCI: number
  [key: string]: number
}

export interface EcoMetrics {
  'E-FDCR': number
  EBDCR: number
  EBDE: number
  'EP-BTM': number
}

export interface TrajectoryPoint {
  t: number
  fdcr: number
  eFdcr: number
  btr: number
  msjr: number
  bgr: number
  cfr: number
  rbr: number
  ebdcr: number
  epBtm: number
}

export interface TrajectoryResult {
  points: TrajectoryPoint[]
  scenario: ScenarioId
  finalFDCR: number
  trend: 'improving' | 'stable' | 'deteriorating'
  criticalThreshold: number | null
}

export interface SimNode {
  id: string
  label: string
  labelJa: string
  x: number
  y: number
  z: number
  value: number
  type: 'actor' | 'institution' | 'zone' | 'barrier' | 'gateway' | 'region'
  color?: string
}

export interface SimEdge {
  from: string
  to: string
  weight: number
  type: 'burden' | 'freedom' | 'neutral' | 'barrier'
}

export interface InspectorData {
  id: string
  label: string
  labelJa: string
  metrics: Record<string, number>
  description: string
  descriptionJa: string
  layer: LayerId
}

export interface SimulationState {
  activeLayer: LayerId
  scenario: ScenarioId
  timeHorizon: TimeHorizon
  inspectorOpen: boolean
  inspectorData: InspectorData | null
  visibleLayers: Set<LayerId>
  animating: boolean

  setActiveLayer: (l: LayerId) => void
  setScenario: (s: ScenarioId) => void
  setTimeHorizon: (t: TimeHorizon) => void
  openInspector: (data: InspectorData) => void
  closeInspector: () => void
  toggleLayer: (l: LayerId) => void
  setAnimating: (a: boolean) => void
}
