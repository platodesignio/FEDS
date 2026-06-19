'use client'

import { useAudit } from '@/lib/auditContext'

interface Props {
  captureId?: string
}

export default function ExportButtons({ captureId }: Props) {
  const { scoreResult, auditState, t } = useAudit()

  const exportJSON = () => {
    const data = JSON.stringify({ auditState, scoreResult }, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'feds-audit.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportPNG = async () => {
    if (!captureId) return
    const el = document.getElementById(captureId)
    if (!el) return
    const html2canvas = (await import('html2canvas')).default
    const canvas = await html2canvas(el)
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = 'feds-audit.png'
    a.click()
  }

  const exportPDF = async () => {
    if (!captureId) return
    const el = document.getElementById(captureId)
    if (!el) return
    const html2canvas = (await import('html2canvas')).default
    const { jsPDF } = await import('jspdf')
    const canvas = await html2canvas(el)
    const img = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'pt', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const imgHeight = (canvas.height * pageWidth) / canvas.width
    pdf.addImage(img, 'PNG', 0, 0, pageWidth, imgHeight)
    pdf.save('feds-audit.pdf')
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button onClick={exportJSON} className="border border-[#1a3a5c] px-3 py-1.5 text-sm text-[#1a3a5c]">
        {t('export.json')}
      </button>
      <button onClick={exportPNG} className="border border-[#1a3a5c] px-3 py-1.5 text-sm text-[#1a3a5c]">
        {t('export.png')}
      </button>
      <button onClick={exportPDF} className="border border-[#1a3a5c] px-3 py-1.5 text-sm text-[#1a3a5c]">
        {t('export.pdf')}
      </button>
    </div>
  )
}
