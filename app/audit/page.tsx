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
import { ECO_VARIABLES, ECO_VARIABLE_CATEGORIES } from '@/data/ecologicalVariables'
import { QUESTIONS } from '@/data/questions'

const STEPS = [
  { key: 'workbench.step.1' },
  { key: 'workbench.step.2' },
  { key: 'workbench.step.3' },
  { key: 'workbench.step.4' },
  { key: 'workbench.step.5' },
  { key: 'workbench.step.6' },
]

export default function AuditWorkbenchPage() {
  const { t, runAudit } = useAudit()
  const router = useRouter()
  const [step, setStep] = useState(0)

  const next = () => {
    if (step === STEPS.length - 1) {
      runAudit()
      router.push('/dashboard')
    } else {
      setStep((s) => s + 1)
    }
  }
  const back = () => setStep((s) => Math.max(0, s - 1))

  return (
    <div className="space-y-8">
      {/* Page header */}
      <header className="border-b border-[#e2e8f0] pb-6 space-y-1">
        <div className="text-[10px] uppercase tracking-widest text-gray-400">FEDS Studio</div>
        <h1 className="text-2xl font-bold tracking-tight text-[#1a3a5c]">{t('workbench.title')}</h1>
        <p className="text-sm text-gray-500 max-w-2xl">{t('workbench.subtitle')}</p>
      </header>

      {/* Step rail */}
      <div className="flex flex-wrap gap-2">
        {STEPS.map((s, i) => (
          <button
            key={s.key}
            onClick={() => setStep(i)}
            className={`border px-3 py-1.5 text-xs font-mono transition-colors ${
              i === step
                ? 'border-[#1a3a5c] bg-[#1a3a5c] text-white'
                : i < step
                ? 'border-[#1a3a5c] text-[#1a3a5c]'
                : 'border-[#e2e8f0] text-gray-400'
            }`}
          >
            {t(s.key)}
          </button>
        ))}
      </div>

      {/* Step content */}
      <div className="min-h-[300px] border border-[#e2e8f0] p-6">
        {step === 0 && <TargetInput />}
        {step === 1 && <CategorySelector />}
        {step === 2 && <LayerSelector />}
        {step === 3 && <SubjectSelector />}
        {step === 4 && (
          <div className="space-y-6">
            <div className="space-y-2">
              {VARIABLE_CATEGORIES.map((c) => {
                const vars = VARIABLES.filter((v) => v.category === c.id)
                if (vars.length === 0) return null
                return <VariableGroup key={c.id} categoryId={c.id} variables={vars} />
              })}
            </div>
            <div className="border-t border-[#e2e8f0] pt-4 space-y-2">
              <div className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-3">
                Ecological Variable Categories (ECO_A – ECO_D)
              </div>
              {ECO_VARIABLE_CATEGORIES.map((c) => {
                const vars = ECO_VARIABLES.filter((v) => v.category === c.id)
                if (vars.length === 0) return null
                return <VariableGroup key={c.id} categoryId={c.id} variables={vars} />
              })}
            </div>
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

      {/* Navigation */}
      <div className="flex items-center justify-between border-t border-[#e2e8f0] pt-4">
        <button
          onClick={back}
          disabled={step === 0}
          className="border border-[#e2e8f0] px-4 py-2 text-xs text-gray-600 disabled:opacity-30 hover:border-[#1a3a5c] hover:text-[#1a3a5c] transition-colors"
        >
          {t('common.back')}
        </button>
        <button
          onClick={next}
          className="bg-[#1a3a5c] px-5 py-2 text-xs font-medium text-white hover:bg-[#0f2440] transition-colors"
        >
          {step === STEPS.length - 1 ? t('workbench.generate') : t('common.next')}
        </button>
      </div>
    </div>
  )
}
