'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAudit } from '@/lib/auditContext'
import TargetInput from '@/components/TargetInput'
import CategorySelector from '@/components/CategorySelector'
import LayerSelector from '@/components/LayerSelector'
import SubjectSelector from '@/components/SubjectSelector'
import VariableGroup from '@/components/VariableGroup'
import AuditQuestion from '@/components/AuditQuestion'
import { VARIABLES, VARIABLE_CATEGORIES } from '@/data/variables'
import { QUESTIONS } from '@/data/questions'

const STEP_KEYS = ['step.target', 'step.category', 'step.layers', 'step.subjects', 'step.variables', 'step.questions']

export default function AuditPage() {
  const { t, runAudit } = useAudit()
  const router = useRouter()
  const [step, setStep] = useState(0)

  const next = () => {
    if (step === STEP_KEYS.length - 1) {
      runAudit()
      router.push('/dashboard')
    } else {
      setStep((s) => s + 1)
    }
  }
  const back = () => setStep((s) => Math.max(0, s - 1))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {STEP_KEYS.map((k, i) => (
          <div
            key={k}
            className={`border px-3 py-1 text-xs ${
              i === step ? 'border-[#1a3a5c] bg-[#1a3a5c] text-white' : 'border-[#e2e8f0] text-gray-600'
            }`}
          >
            {i + 1}. {t(k)}
          </div>
        ))}
      </div>

      <div className="min-h-[300px]">
        {step === 0 && <TargetInput />}
        {step === 1 && <CategorySelector />}
        {step === 2 && <LayerSelector />}
        {step === 3 && <SubjectSelector />}
        {step === 4 && (
          <div className="space-y-2">
            {VARIABLE_CATEGORIES.map((c) => {
              const vars = VARIABLES.filter((v) => v.category === c.id)
              if (vars.length === 0) return null
              return <VariableGroup key={c.id} categoryId={c.id} variables={vars} />
            })}
          </div>
        )}
        {step === 5 && (
          <div className="space-y-3">
            {QUESTIONS.map((q) => (
              <AuditQuestion key={q.id} question={q} />
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <button
          onClick={back}
          disabled={step === 0}
          className="border border-[#e2e8f0] px-4 py-2 text-sm text-gray-700 disabled:opacity-40"
        >
          {t('common.back')}
        </button>
        <button onClick={next} className="bg-[#1a3a5c] px-4 py-2 text-sm text-white">
          {step === STEP_KEYS.length - 1 ? t('common.run_audit') : t('common.next')}
        </button>
      </div>
    </div>
  )
}
