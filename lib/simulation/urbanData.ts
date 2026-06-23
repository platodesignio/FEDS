import type { ScenarioType, TimeHorizon } from './simTypes'

export const GRID = { cols: 9, rows: 7, tileW: 60, tileH: 34, originX: 100, originY: 80 }

export function isoOrigin(col: number, row: number): { x: number; y: number } {
  const x = GRID.originX + (col - row) * (GRID.tileW / 2)
  const y = GRID.originY + (col + row) * (GRID.tileH / 2)
  return { x, y }
}

export const ZONE_MAP: Record<string, 'residential' | 'institutional' | 'green' | 'surveillance' | 'transit' | 'exclusion' | 'ecoRepair' | 'industrial'> = {
  '0,0': 'green', '1,0': 'green', '2,0': 'residential', '3,0': 'residential', '4,0': 'institutional',
  '5,0': 'institutional', '6,0': 'surveillance', '7,0': 'industrial', '8,0': 'industrial',
  '0,1': 'green', '1,1': 'residential', '2,1': 'residential', '3,1': 'residential', '4,1': 'transit',
  '5,1': 'institutional', '6,1': 'surveillance', '7,1': 'industrial', '8,1': 'exclusion',
  '0,2': 'ecoRepair', '1,2': 'residential', '2,2': 'residential', '3,2': 'transit', '4,2': 'residential',
  '5,2': 'residential', '6,2': 'institutional', '7,2': 'surveillance', '8,2': 'exclusion',
  '0,3': 'ecoRepair', '1,3': 'green', '2,3': 'residential', '3,3': 'residential', '4,3': 'residential',
  '5,3': 'transit', '6,3': 'residential', '7,3': 'institutional', '8,3': 'exclusion',
  '0,4': 'green', '1,4': 'green', '2,4': 'residential', '3,4': 'residential', '4,4': 'surveillance',
  '5,4': 'residential', '6,4': 'residential', '7,4': 'exclusion', '8,4': 'exclusion',
  '0,5': 'green', '1,5': 'residential', '2,5': 'residential', '3,5': 'institutional', '4,5': 'surveillance',
  '5,5': 'residential', '6,5': 'exclusion', '7,5': 'exclusion', '8,5': 'industrial',
  '0,6': 'green', '1,6': 'residential', '2,6': 'transit', '3,6': 'transit', '4,6': 'transit',
  '5,6': 'transit', '6,6': 'industrial', '7,6': 'industrial', '8,6': 'industrial',
}

const BASE_FDCR: Record<string, number> = {
  green: 72, ecoRepair: 68, residential: 52, transit: 48, institutional: 44,
  surveillance: 28, exclusion: 18, industrial: 38,
}

export function cellFDCR(col: number, row: number, scenario: ScenarioType, th: TimeHorizon): number {
  const key = `${col},${row}`
  const zone = ZONE_MAP[key] ?? 'residential'
  const base = BASE_FDCR[zone] ?? 50
  const thBonus: Record<TimeHorizon, number> = { immediate: 0, '1y': 0, '5y': 1, '10y': 2, '25y': 3, future: 4 }
  const t = thBonus[th]
  if (scenario === 'freedomReform') return Math.min(97, base + 8 + t * 2)
  if (scenario === 'managerialIntensification') return Math.max(3, base - 10 - t * 2)
  return Math.max(3, base - t * 0.5)
}

export const CIVIC_NODES: Record<string, { symbol: string; label: string }> = {
  '4,0': { symbol: '⚖', label: 'Court' },
  '5,1': { symbol: '🏥', label: 'Clinic' },
  '6,2': { symbol: '🏫', label: 'School' },
  '7,3': { symbol: '🏛', label: 'Registry' },
  '3,5': { symbol: '📋', label: 'Benefits' },
}

export const GREEN_CELLS: Set<string> = new Set([
  '0,0', '1,0', '0,1', '0,2', '0,3', '1,3', '0,4', '1,4', '0,5', '0,6', '1,1',
])

export const TRANSIT_ROUTE: Array<[number, number]> = [
  [2, 6], [3, 6], [4, 6], [5, 6], [4, 5], [4, 4], [4, 3], [3, 3], [3, 2], [3, 1],
]

export const COMMUTE_DIAG: Array<{ from: [number, number]; to: [number, number]; burden: number }> = [
  { from: [1, 1], to: [5, 1], burden: 72 },
  { from: [2, 2], to: [6, 2], burden: 65 },
  { from: [1, 3], to: [7, 3], burden: 80 },
  { from: [1, 5], to: [5, 5], burden: 58 },
]
