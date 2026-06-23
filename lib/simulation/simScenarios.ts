import type { ScenarioType, TimeHorizon, SimMetrics } from './simTypes'
const TH_IDX: Record<TimeHorizon,number> = { immediate:0,'1y':1,'5y':2,'10y':3,'25y':4,future:5 }
const cl = (v:number) => Math.max(3, Math.min(97, v))
export function applyScenario(base: SimMetrics, scenario: ScenarioType, th: TimeHorizon): SimMetrics {
  const t = TH_IDX[th]
  if (scenario === 'freedomReform') {
    const b=[0,2,5,8,12,15][t], r=[0,2,4,7,10,13][t]
    return { FDCR:cl(base.FDCR+b), GFDCR:cl(base.GFDCR+b), EFDCR:cl(base.EFDCR+b*0.9), EBDCR:cl(base.EBDCR+b*0.8), BGR:cl(base.BGR+b*0.85), RCI:cl(base.RCI+b*0.9), MSJR:cl(base.MSJR-r), CFR:cl(base.CFR-r*0.95), RBR:cl(base.RBR-r), BTR:cl(base.BTR-r*0.9), EER:cl(base.EER-r*0.7), EPBTM:cl(base.EPBTM-r*0.6), DRR:cl(base.DRR+b*0.95), FGR:cl(base.FGR+b*0.85) }
  }
  if (scenario === 'managerialIntensification') {
    const w=[0,2,5,9,14,18][t], r=[0,2,4,8,12,16][t]
    return { FDCR:cl(base.FDCR-r), GFDCR:cl(base.GFDCR-r), EFDCR:cl(base.EFDCR-r*0.9), EBDCR:cl(base.EBDCR-r*0.8), BGR:cl(base.BGR-r*0.85), RCI:cl(base.RCI-r*0.9), MSJR:cl(base.MSJR+w), CFR:cl(base.CFR+w*0.95), RBR:cl(base.RBR+w), BTR:cl(base.BTR+w*0.9), EER:cl(base.EER+w*0.8), EPBTM:cl(base.EPBTM+w*0.7), DRR:cl(base.DRR-r*0.95), FGR:cl(base.FGR-r*1.1) }
  }
  const d=[0,-0.5,-1,-1.5,-2,-3][t]
  return { FDCR:cl(base.FDCR+d), GFDCR:cl(base.GFDCR+d), EFDCR:cl(base.EFDCR+d), EBDCR:cl(base.EBDCR+d), BGR:cl(base.BGR+d*0.8), RCI:cl(base.RCI+d*0.8), MSJR:cl(base.MSJR-d*0.5), CFR:cl(base.CFR-d*0.5), RBR:cl(base.RBR-d*0.4), BTR:cl(base.BTR-d*0.4), EER:cl(base.EER-d*0.6), EPBTM:cl(base.EPBTM-d*0.7), DRR:cl(base.DRR+d*0.8), FGR:cl(base.FGR+d) }
}
export const TH_ALL: TimeHorizon[] = ['immediate','1y','5y','10y','25y','future']
export const TH_LABELS: Record<TimeHorizon,string> = { immediate:'Immediate','1y':'1 yr','5y':'5 yr','10y':'10 yr','25y':'25 yr',future:'Future gen.' }
export const SC_LABELS: Record<ScenarioType,string> = { current:'Current System', freedomReform:'Freedom-Generative Reform', managerialIntensification:'Managerial Intensification' }
export const SC_COLORS: Record<ScenarioType,string> = { current:'#fbbf24', freedomReform:'#4ade80', managerialIntensification:'#ef4444' }
