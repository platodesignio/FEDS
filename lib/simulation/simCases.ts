import type { CaseFile } from './simTypes'
export const CASES: CaseFile[] = [
  { id:'ai_hiring', label:'Case 001 — AI Hiring System', description:'Automated hiring classification with demographic pattern risk.', baseMetrics:{ FDCR:47, GFDCR:44, EFDCR:41, EBDCR:38, BGR:42, RCI:38, MSJR:62, CFR:55, RBR:51, BTR:58, EER:45, EPBTM:61, DRR:48, FGR:52 } },
  { id:'welfare_gate', label:'Case 002 — Welfare Classification Gate', description:'Automated welfare eligibility with re-entry blockage.', baseMetrics:{ FDCR:39, GFDCR:36, EFDCR:33, EBDCR:30, BGR:35, RCI:32, MSJR:71, CFR:68, RBR:72, BTR:65, EER:38, EPBTM:55, DRR:41, FGR:48 } },
  { id:'border_ai', label:'Case 003 — Border AI Screening', description:'AI-mediated border classification with testimony erasure.', baseMetrics:{ FDCR:31, GFDCR:28, EFDCR:25, EBDCR:22, BGR:28, RCI:24, MSJR:78, CFR:74, RBR:80, BTR:72, EER:35, EPBTM:68, DRR:35, FGR:44 } },
]
export const DEFAULT_CASE = CASES[0]
