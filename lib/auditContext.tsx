'use client'

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { AuditState } from '@/types/audit'
import { MetricScores } from '@/types/metric'
import { ActorImpact, BurdenTransferEntry } from '@/types/actor'
import { AuditReport } from '@/types/report'
import { ScenarioId, ScenarioResult } from '@/types/scenario'
import { Locale } from '@/types/i18n'
import { EcoScores } from '@/types/eco'
import { t as translate } from './i18n'
import { computeMetricScores, computeFDCR } from './scoring'
import { computeGFDCR } from './globalScoring'
import { computeEcologicalScores } from './ecologicalScoring'
import { applyCorrections } from './corrections'
import { determineJudgments } from './judgments'
import { computeActorImpacts } from './actorImpact'
import { computeBurdenTransfers } from './burdenTransfer'
import { generateScenarioResults } from './scenario'
import { generateReport } from './reportGenerator'
import { VARIABLES } from '@/data/variables'
import { ECO_VARIABLES } from '@/data/ecologicalVariables'
import { QUESTIONS } from '@/data/questions'
import { DEMO_CASES, DemoCase } from '@/data/demoCases'

export interface ScoreResult {
  metrics: MetricScores
  fdcr: number
  gfdcr: number
  ecoScores: EcoScores
  judgments: string[]
  corrections: string[]
  globalFlags: string[]
  layerCaps: Record<string, number>
  actorImpacts: ActorImpact[]
  burdenTransfers: BurdenTransferEntry[]
  scenarios: Record<ScenarioId, ScenarioResult>
  report: AuditReport
}

interface AuditContextValue {
  auditState: AuditState
  setAuditState: React.Dispatch<React.SetStateAction<AuditState>>
  scoreResult: ScoreResult | null
  runAudit: () => void
  loadDemoCase: (id: string) => void
  demoCases: DemoCase[]
  locale: Locale
  setLocale: (l: Locale) => void
  t: (key: string) => string
}

const ALL_VARIABLES = [...VARIABLES, ...ECO_VARIABLES]

function defaultState(): AuditState {
  const variableValues: Record<string, number> = {}
  for (const v of ALL_VARIABLES) variableValues[v.id] = v.defaultValue
  const questionValues: Record<string, number> = {}
  for (const q of QUESTIONS) questionValues[q.id] = 2
  return {
    target: '',
    category: '',
    layers: [],
    subjects: [],
    variableValues,
    questionValues,
  }
}

const AuditContext = createContext<AuditContextValue | null>(null)

export function AuditProvider({ children }: { children: React.ReactNode }) {
  const [auditState, setAuditState] = useState<AuditState>(defaultState)
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null)
  const [locale, setLocale] = useState<Locale>('en')

  const loadDemoCase = useCallback((id: string) => {
    const demo = DEMO_CASES.find((d) => d.id === id)
    if (!demo) return
    const variableValues: Record<string, number> = {}
    for (const v of ALL_VARIABLES) variableValues[v.id] = v.defaultValue
    const questionValues: Record<string, number> = {}
    for (const q of QUESTIONS) questionValues[q.id] = 2
    const merged: AuditState = {
      ...demo.state,
      variableValues: { ...variableValues, ...demo.state.variableValues },
      questionValues: { ...questionValues, ...demo.state.questionValues },
    }
    setAuditState(merged)
    const metrics = computeMetricScores(merged)
    const rawFdcr = computeFDCR(metrics)
    const rawGfdcr = computeGFDCR(metrics, rawFdcr)
    const corr = applyCorrections(rawFdcr, rawGfdcr, metrics, merged.category)
    const ecoScores = computeEcologicalScores(metrics, corr.fdcr, corr.gfdcr, merged.subjects)
    const judgments = determineJudgments(corr.fdcr, corr.gfdcr, metrics, merged.category, corr.corrections, ecoScores)
    const actorImpacts = computeActorImpacts(merged.subjects, metrics, corr.fdcr)
    const burdenTransfers = computeBurdenTransfers(metrics, merged.subjects, merged.category)
    const scenarios = generateScenarioResults(merged, metrics, corr.fdcr, corr.gfdcr)
    const report = generateReport(merged, metrics, corr.fdcr, corr.gfdcr, judgments, actorImpacts, burdenTransfers, locale, ecoScores)
    setScoreResult({ metrics, fdcr: corr.fdcr, gfdcr: corr.gfdcr, ecoScores, judgments, corrections: corr.corrections, globalFlags: corr.globalFlags, layerCaps: corr.layerCaps, actorImpacts, burdenTransfers, scenarios, report })
  }, [locale])

  const runAudit = useCallback(() => {
    setAuditState((state) => {
      const metrics = computeMetricScores(state)
      const rawFdcr = computeFDCR(metrics)
      const rawGfdcr = computeGFDCR(metrics, rawFdcr)
      const corr = applyCorrections(rawFdcr, rawGfdcr, metrics, state.category)
      const ecoScores = computeEcologicalScores(metrics, corr.fdcr, corr.gfdcr, state.subjects)
      const judgments = determineJudgments(corr.fdcr, corr.gfdcr, metrics, state.category, corr.corrections, ecoScores)
      const actorImpacts = computeActorImpacts(state.subjects, metrics, corr.fdcr)
      const burdenTransfers = computeBurdenTransfers(metrics, state.subjects, state.category)
      const scenarios = generateScenarioResults(state, metrics, corr.fdcr, corr.gfdcr)
      const report = generateReport(state, metrics, corr.fdcr, corr.gfdcr, judgments, actorImpacts, burdenTransfers, locale, ecoScores)
      setScoreResult({ metrics, fdcr: corr.fdcr, gfdcr: corr.gfdcr, ecoScores, judgments, corrections: corr.corrections, globalFlags: corr.globalFlags, layerCaps: corr.layerCaps, actorImpacts, burdenTransfers, scenarios, report })
      return state
    })
  }, [locale])

  const t = useCallback((key: string) => translate(key, locale), [locale])

  const value = useMemo<AuditContextValue>(
    () => ({ auditState, setAuditState, scoreResult, runAudit, loadDemoCase, demoCases: DEMO_CASES, locale, setLocale, t }),
    [auditState, scoreResult, runAudit, loadDemoCase, locale, t]
  )

  return <AuditContext.Provider value={value}>{children}</AuditContext.Provider>
}

export function useAudit(): AuditContextValue {
  const ctx = useContext(AuditContext)
  if (!ctx) throw new Error('useAudit must be used within AuditProvider')
  return ctx
}
