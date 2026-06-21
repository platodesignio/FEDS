import { create } from 'zustand'
import type { SimulationState, LayerId, ScenarioId, TimeHorizon, InspectorData } from './types'

export const useSimulationStore = create<SimulationState>((set) => ({
  activeLayer: 'planetary',
  scenario: 'current',
  timeHorizon: 0,
  inspectorOpen: false,
  inspectorData: null,
  visibleLayers: new Set<LayerId>(['planetary', 'urban_nature', 'body_lifeworld', 'institutional_flow']),
  animating: true,

  setActiveLayer: (l: LayerId) => set({ activeLayer: l }),
  setScenario: (s: ScenarioId) => set({ scenario: s }),
  setTimeHorizon: (t: TimeHorizon) => set({ timeHorizon: t }),
  openInspector: (data: InspectorData) => set({ inspectorOpen: true, inspectorData: data }),
  closeInspector: () => set({ inspectorOpen: false, inspectorData: null }),
  toggleLayer: (l: LayerId) =>
    set((state) => {
      const next = new Set(state.visibleLayers)
      next.has(l) ? next.delete(l) : next.add(l)
      return { visibleLayers: next }
    }),
  setAnimating: (a: boolean) => set({ animating: a }),
}))
