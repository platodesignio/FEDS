'use client'

import { useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useAudit } from '@/lib/auditContext'
import { useSimulationStore } from '@/lib/simulation/simulationStore'
import type { BaseMetrics, EcoMetrics } from '@/lib/simulation/types'

const SimulationTheater = dynamic(
  () => import('@/components/simulation/three/SimulationTheater'),
  { ssr: false, loading: () => (
    <div
      className="w-full flex items-center justify-center bg-[#04080e] border border-[#1e3a5a]"
      style={{ height: '520px' }}
    >
      <div className="text-[10px] font-mono text-[#2a5a8a] animate-pulse">
        Initialising 3D simulation engine...
      </div>
    </div>
  )}
)

export default function SimulationTheaterPage() {
  const { scoreResult, t, locale, demoCases, loadDemoCase } = useAudit()
  const { scenario, timeHorizon, activeLayer, setScenario, setTimeHorizon } = useSimulationStore()

  useEffect(() => {
    if (!scoreResult) loadDemoCase('ai_hiring')
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const baseMetrics = useMemo<BaseMetrics>(() => {
    if (!scoreResult) return {
      FDCR: 50, GFDCR: 48, BTR: 45, MSJR: 52, CFR: 48, RBR: 43,
      BGR: 55, DER: 50, CFCS: 50, RCI: 50,
    }
    return {
      FDCR:  scoreResult.fdcr,
      GFDCR: scoreResult.gfdcr,
      ...(scoreResult.metrics as unknown as Record<string, number>),
    } as BaseMetrics
  }, [scoreResult])

  const ecoMetrics = useMemo<EcoMetrics>(() => {
    if (!scoreResult?.ecoScores) return { 'E-FDCR': 44, EBDCR: 42, EBDE: 40, 'EP-BTM': 55 }
    return {
      'E-FDCR': scoreResult.ecoScores['E-FDCR'],
      EBDCR:    scoreResult.ecoScores.EBDCR,
      EBDE:     scoreResult.ecoScores.EBDE,
      'EP-BTM': scoreResult.ecoScores['EP-BTM'],
    }
  }, [scoreResult])

  return (
    <div className="bg-[#060c14] min-h-screen text-white -mx-6 -mt-8 px-6 pt-6 pb-12">
      <div className="max-w-6xl mx-auto space-y-5">

        {/* Header */}
        <header className="border-b border-[#1e3a5a] pb-4 flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <div className="text-[8px] font-mono uppercase tracking-[0.2em] text-[#2a5a8a]">
              FEDS Studio — 4-Layer 3D Simulation Theater
            </div>
            <h1 className="text-xl font-bold tracking-tight text-[#7ac8f8]">
              {t('sim.title')}
            </h1>
            {scoreResult && (
              <p className="text-[10px] text-[#3a6a8a]">
                {scoreResult.report.target} · {scoreResult.report.category}
                <span className="ml-3 font-mono text-[#4a8abb]">
                  FDCR {Math.round(scoreResult.fdcr)}
                </span>
              </p>
            )}
          </div>
          <div className="flex gap-2 shrink-0">
            <Link href="/dashboard" className="text-[8px] font-mono border border-[#1e3a5a] px-3 py-1.5 text-[#3a6a8a] hover:border-[#4a8abb] hover:text-[#7ac8f8] transition-colors">
              ← {t('nav.dashboard')}
            </Link>
            <Link href="/report" className="text-[8px] font-mono border border-[#1e3a5a] px-3 py-1.5 text-[#3a6a8a] hover:border-[#4a8abb] hover:text-[#7ac8f8] transition-colors">
              {t('nav.report')} →
            </Link>
          </div>
        </header>

        {/* No data state */}
        {!scoreResult && (
          <div className="border border-[#1e3a5a] bg-[#080e18] p-5 space-y-3">
            <div className="text-[8px] font-mono uppercase tracking-widest text-[#2a5a8a]">Open Case File</div>
            <div className="space-y-2">
              {demoCases.map((dc) => (
                <div key={dc.id} className="flex items-center justify-between gap-4 border border-[#1e3a5a] p-3">
                  <div>
                    <div className="text-[8px] font-mono text-[#2a5a8a] uppercase">Case {dc.caseNumber}</div>
                    <div className="text-xs font-semibold text-[#7ac8f8]">
                      {locale === 'ja' ? dc.labelJa : dc.label}
                    </div>
                  </div>
                  <button
                    onClick={() => loadDemoCase(dc.id)}
                    className="text-[8px] font-mono border border-[#4a8abb] px-3 py-1 text-[#4a8abb] hover:bg-[#0f2535] transition-colors"
                  >
                    Load →
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3D Theater */}
        <div className="border border-[#1e3a5a] overflow-hidden relative">
          <SimulationTheater
            baseMetrics={baseMetrics}
            ecoMetrics={ecoMetrics}
            scenario={scenario}
            timeHorizon={timeHorizon}
            locale={locale}
          />
        </div>

        {/* Eco scores strip */}
        {scoreResult?.ecoScores && (
          <div className="grid gap-px bg-[#1e3a5a] grid-cols-2 sm:grid-cols-4 border border-[#1e3a5a]">
            {[
              { id: 'E-FDCR',  v: ecoMetrics['E-FDCR'], risk: false, desc: 'Ecological Freedom Rate' },
              { id: 'EBDCR',   v: ecoMetrics.EBDCR,     risk: false, desc: 'Eco Bio-Div Correctness' },
              { id: 'EBDE',    v: ecoMetrics.EBDE,       risk: false, desc: 'Eco Bio-Div Efficacy' },
              { id: 'EP-BTM',  v: ecoMetrics['EP-BTM'],  risk: true,  desc: 'Eco Burden Transfer' },
            ].map(({ id, v, risk, desc }) => {
              const val = Math.round(v)
              const color = risk
                ? (val > 65 ? '#ef4444' : val > 45 ? '#fbbf24' : '#4ade80')
                : (val > 60 ? '#4ade80' : val > 40 ? '#fbbf24' : '#ef4444')
              return (
                <div key={id} className="bg-[#080e18] px-4 py-3 space-y-0.5">
                  <div className="text-[8px] font-mono uppercase tracking-widest text-[#2a5a8a]">{id}</div>
                  <div className="font-mono text-2xl font-bold leading-none" style={{ color }}>{val}</div>
                  <div className="text-[8px] text-[#2a5a8a]">{desc}</div>
                </div>
              )
            })}
          </div>
        )}

        {/* Layer guide */}
        <div className="grid gap-px bg-[#1e3a5a] grid-cols-2 md:grid-cols-4 border border-[#1e3a5a]">
          {[
            {
              id: 'planetary',
              label: 'Planetary View',
              labelJa: '惑星ビュー',
              desc: 'Globe-scale burden arcs, regional E-FDCR, ecological pressure zones. Click regions to inspect.',
              descJa: '地球規模の負担弧、地域E-FDCR、生態圧力ゾーン。地域をクリックして詳細を確認。',
            },
            {
              id: 'urban_nature',
              label: 'Urban-Nature',
              labelJa: '都市-自然',
              desc: '8×6 district grid with FDCR density, surveillance pressure, and green corridor mapping.',
              descJa: 'FDCR密度・監視圧力・緑地回廊マッピングを持つ8×6地区グリッド。',
            },
            {
              id: 'body_lifeworld',
              label: 'Body-Lifeworld',
              labelJa: '身体-生活世界',
              desc: 'Dialectical field of bodily freedom, surveillance capture, classification gate, and care labour.',
              descJa: '身体的自由・監視捕捉・分類ゲート・ケア労働の弁証法的場。',
            },
            {
              id: 'institutional_flow',
              label: 'Institutional Flow',
              labelJa: '制度フロー',
              desc: 'Full subject pathway: application → AI scoring → democratic review → approval / rejection / exclusion.',
              descJa: '申請→AIスコアリング→民主的審査→承認/拒否/排除の主体経路全体。',
            },
          ].map((l) => (
            <button
              key={l.id}
              onClick={() => useSimulationStore.getState().setActiveLayer(l.id as any)}
              className={`bg-[#080e18] p-4 text-left space-y-1.5 hover:bg-[#0a1420] transition-colors ${
                activeLayer === l.id ? 'border-l-2 border-[#4a8abb]' : ''
              }`}
            >
              <div className="text-[9px] font-mono font-bold text-[#7ac8f8]">
                {locale === 'ja' ? l.labelJa : l.label}
              </div>
              <p className="text-[9px] text-[#3a6a8a] leading-relaxed">
                {locale === 'ja' ? l.descJa : l.desc}
              </p>
            </button>
          ))}
        </div>

        {/* Method note */}
        <div className="border border-[#1e3a2a] bg-[#060e08] p-3">
          <div className="text-[8px] font-mono uppercase tracking-widest text-[#2a5a8a] mb-1">Methodological Note</div>
          <p className="text-[9px] text-[#3a6a4a] leading-relaxed max-w-3xl">
            {t('sim.method_note')}
          </p>
        </div>
      </div>
    </div>
  )
}
