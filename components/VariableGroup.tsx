'use client'

import { useState } from 'react'
import { useAudit } from '@/lib/auditContext'
import { VariableSchema } from '@/types/audit'
import VariableSlider from './VariableSlider'

interface Props {
  categoryId: string
  variables: VariableSchema[]
}

export default function VariableGroup({ categoryId, variables }: Props) {
  const [open, setOpen] = useState(false)
  const { t } = useAudit()
  return (
    <div className="border border-[#e2e8f0]">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between bg-gray-50 px-4 py-2 text-left text-sm font-medium text-[#1a3a5c]"
      >
        <span>
          {t(`varcat.${categoryId}`)} ({variables.length})
        </span>
        <span>{open ? '−' : '+'}</span>
      </button>
      {open && <div className="px-4 py-2">{variables.map((v) => <VariableSlider key={v.id} variable={v} />)}</div>}
    </div>
  )
}
