export interface MetricRef {
  metric: string
  weight: number
  polarity: 'positive' | 'negative'
}

export interface MetricScores {
  // Positive metrics
  CFCS: number; DER: number; RCI: number; BGR: number
  IGR: number; PDFS: number; MGR: number; TFGR: number
  'D-RGR': number; SRGR: number; TIGR: number
  BDER: number; LSAR: number; DRR: number; EGR: number; HGR: number
  // Risk metrics
  MSJR: number; CFR: number; RBR: number; RDR: number
  BBI: number; TCR: number; MTR: number; EER: number
  EIR: number; SRR: number; FMR: number; NPR: number; GSR: number
  // Global positive
  PRCI: number; GDRR: number; CBRI: number; SCTR: number; PAI: number
  // Global risk
  BTR: number; CDR: number; SCDR: number; CIR: number
  FGR: number; PPR: number; GDDR: number; DCR: number
  // Daoist lens
  DPS: number; WWR: number; LRI: number
  // Extra referenced
  ILBR: number
}
