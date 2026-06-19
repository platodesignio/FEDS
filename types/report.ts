export interface ReportSection {
  title: string
  titleJa: string
  content: string
}

export interface AuditReport {
  generatedAt: string
  target: string
  category: string
  layers: string[]
  subjects: string[]
  fdcr: number
  gfdcr: number
  judgment: string
  sections: ReportSection[]
}
