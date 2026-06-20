'use client'

import Link from 'next/link'
import { useAudit } from '@/lib/auditContext'
import { ScenarioId } from '@/types/scenario'
import ScenarioComparison from '@/components/ScenarioComparison'
import { colorForPositive, colorForRisk } from '@/components/ScoreCard'

const SCENARIO_ORDER: ScenarioId[] = ['current', 'reform', 'managerial']

function reformDirection(ms: Record<string, number>): string {
  if (ms.MSJR > 70 && ms.CFCS < 40) return 'scenarios.reform_direction.high_msjr'
  if (ms.RCI < 30 && ms.RBR > 70)   return 'scenarios.reform_direction.low_rci'
  if (ms.CFR > 70)                    return 'scenarios.reform_direction.high_cfr'
  return 'scenarios.reform_direction.default'
}

export default function ScenarioLabPage() {
  const { scoreResult, t, locale, loadDemoCase, demoCases } = useAudit()

  /* ── Empty state ────────────────────────────────────────────────────── */
  if (!scoreResult) {
    return (
      <div className="space-y-8">
        <header className="border-b border-[#e2e8f0] pb-6 space-y-1">
          <div className="text-[10px] uppercase tracking-widest text-gray-400">FEDS Studio</div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1a3a5c]">{t('lab.title')}</h1>
          <p className="text-sm text-gray-500 max-w-2xl">{t('lab.subtitle')}</p>
        </header>

        <div className="border border-[#e2e8f0] p-6 space-y-5">
          <h2 className="text-sm font-semibold text-[#1a3a5c]">{t('lab.empty.title')}</h2>
          <p className="text-sm text-gray-600 max-w-2xl">{t('lab.empty.body')}</p>

          {/* Three scenario descriptions */}
          <div className="border border-[#e2e8f0] divide-y divide-[#e2e8f0]">
            {[
              {
                id: 'current',
                desc: locale === 'ja'
                  ? '現在の変数値でシステムを評価します。基準ケース。'
                  : 'Evaluates the system with current variable values as entered. Baseline case.',
              },
              {
                id: 'reform',
                desc: locale === 'ja'
                  ? 'ポジティブ指標+15、リスク指標−15のシフトで自由生成的改革方向を推定します。'
                  : 'Estimates a freedom-generative reform trajectory: positive metrics +15, risk metrics −15.',
              },
              {
                id: 'managerial',
                desc: locale === 'ja'
                  ? '管理的強化シナリオ：ポジティブ指標−15、リスク指標+15。自由閉鎖軌跡の推定。'
                  : 'Models managerial intensification: positive metrics −15, risk metrics +15. Freedom-closing trajectory.',
              },
            ].map(({ id, desc }) => (
              <div key={id} className="flex gap-4 px-4 py-3">
                <span className="font-mono text-xs text-gray-400 shrink-0 pt-0.5 w-8">
                  {id === 'current' ? 'A' : id === 'reform' ? 'B' : 'C'}
                </span>
                <div>
                  <div className="text-xs font-semibold text-[#1a3a5c] mb-0.5">{t(`scenarios.${id}`)}</div>
                  <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 flex-wrap pt-1">
            <Link
              href="/audit"
              className="inline-block bg-[#1a3a5c] px-4 py-2 text-xs font-medium text-white hover:bg-[#0f2440] transition-colors"
            >
              {t('workbench.title')} →
            </Link>
            <Link
              href="/dashboard"
              className="inline-block border border-[#e2e8f0] px-4 py-2 text-xs text-gray-600 hover:border-[#1a3a5c] hover:text-[#1a3a5c] transition-colors"
            >
              {t('nav.dashboard')}
            </Link>
          </div>
        </div>

        {/* Case file loaders */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t('console.case_files')}</h3>
          <div className="border border-[#e2e8f0] divide-y divide-[#e2e8f0]">
            {demoCases.map((dc) => (
              <div key={dc.id} className="flex items-start justify-between gap-4 px-4 py-3">
                <div>
                  <div className="text-[10px] font-mono text-gray-400 uppercase tracking-wide mb-0.5">
                    {t('console.case_file')} {dc.caseNumber}
                  </div>
                  <div className="text-xs font-semibold text-[#1a3a5c]">
                    {locale === 'ja' ? dc.labelJa : dc.label}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {locale === 'ja' ? dc.centralTensionJa : dc.centralTension}
                  </p>
                </div>
                <button
                  onClick={() => loadDemoCase(dc.id)}
                  className="shrink-0 text-[10px] border border-[#1a3a5c] px-3 py-1 text-[#1a3a5c] hover:bg-[#1a3a5c] hover:text-white transition-colors"
                >
                  {t('console.open_case_file')}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  /* ── With data ──────────────────────────────────────────────────────── */
  const scenarios = scoreResult.scenarios
  const curMs = scenarios.current.metrics as unknown as Record<string, number>
  const directionKey = reformDirection(curMs)

  return (
    <div className="space-y-8">
      <header className="border-b border-[#e2e8f0] pb-6 space-y-1">
        <div className="text-[10px] uppercase tracking-widest text-gray-400">FEDS Studio</div>
        <h1 className="text-2xl font-bold tracking-tight text-[#1a3a5c]">{t('lab.title')}</h1>
        <p className="text-sm text-gray-500 max-w-2xl">{t('lab.subtitle')}</p>
      </header>

      {/* ── Three-column scenario header ── */}
      <div className="grid gap-px bg-[#e2e8f0] md:grid-cols-3 border border-[#e2e8f0]">
        {SCENARIO_ORDER.map((id) => {
          const s = scenarios[id]
          const isBase = id === 'current'
          const diff = Math.round(s.fdcr - scenarios.current.fdcr)
          const gDiff = Math.round(s.gfdcr - scenarios.current.gfdcr)
          return (
            <div
              key={id}
              className={`bg-white p-5 space-y-4 ${isBase ? '' : ''}`}
            >
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-1">
                  {id === 'current' ? 'A — Baseline' : id === 'reform' ? 'B — Reform' : 'C — Managerial'}
                </div>
                <h2 className="text-xs font-bold text-[#1a3a5c] uppercase tracking-wide">{t(`scenarios.${id}`)}</h2>
              </div>

              {/* FDCR + G-FDCR */}
              <div className="flex gap-5 items-end border-b border-[#e2e8f0] pb-4">
                <div>
                  <div className="text-[10px] font-mono text-gray-400 uppercase tracking-wide">FDCR</div>
                  <div className="font-mono text-3xl font-bold leading-none" style={{ color: colorForPositive(s.fdcr) }}>
                    {Math.round(s.fdcr)}
                  </div>
                  {!isBase && (
                    <div className="font-mono text-xs mt-1" style={{ color: diff > 0 ? '#15803d' : '#b91c1c' }}>
                      {diff > 0 ? '+' : ''}{diff}
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-[10px] font-mono text-gray-400 uppercase tracking-wide">G-FDCR</div>
                  <div className="font-mono text-3xl font-bold leading-none" style={{ color: colorForPositive(s.gfdcr) }}>
                    {Math.round(s.gfdcr)}
                  </div>
                  {!isBase && (
                    <div className="font-mono text-xs mt-1" style={{ color: gDiff > 0 ? '#15803d' : '#b91c1c' }}>
                      {gDiff > 0 ? '+' : ''}{gDiff}
                    </div>
                  )}
                </div>
              </div>

              {/* Judgment */}
              <div className="text-[10px] font-mono text-gray-500 uppercase tracking-wide px-2 py-1 bg-[#f8fafc] border border-[#e2e8f0]">
                {t(`judgment.${s.judgment}`)}
              </div>

              {/* Key metric grid */}
              <div className="space-y-1">
                {(['MSJR', 'RCI', 'BGR', 'DRR', 'CFR', 'RBR'] as const).map((metric) => {
                  const ms2 = s.metrics as unknown as Record<string, number>
                  const v = Math.round(ms2[metric] ?? 50)
                  const isRisk = ['MSJR', 'CFR', 'RBR'].includes(metric)
                  return (
                    <div key={metric} className="flex items-center gap-2 text-[10px] font-mono">
                      <span className="text-gray-400 w-10 shrink-0">{metric}</span>
                      <div className="flex-1 h-1 bg-[#e2e8f0]">
                        <div
                          className="h-1"
                          style={{
                            width: `${v}%`,
                            background: isRisk ? colorForRisk(v) : colorForPositive(v),
                          }}
                        />
                      </div>
                      <span className="w-6 text-right" style={{ color: isRisk ? colorForRisk(v) : colorForPositive(v) }}>
                        {v}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Recommended reform direction ── */}
      <div className="border border-[#e2e8f0] p-4 space-y-2">
        <h2 className="text-[10px] font-mono uppercase tracking-widest text-gray-400">{t('scenarios.reform_direction')}</h2>
        <p className="text-sm text-gray-700 leading-relaxed">{t(directionKey)}</p>
      </div>

      {/* ── Full metric comparison table ── */}
      <div>
        <h2 className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-3">{t('scenarios.metric_comparison')}</h2>
        <div className="overflow-x-auto border border-[#e2e8f0]">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                <th className="px-4 py-2 text-left font-mono text-[10px] uppercase tracking-wide text-gray-400 w-32">Metric</th>
                <th className="px-4 py-2 text-right font-mono text-[10px] uppercase tracking-wide text-gray-500">A — Current</th>
                <th className="px-4 py-2 text-right font-mono text-[10px] uppercase tracking-wide text-gray-500">B — Reform</th>
                <th className="px-4 py-2 text-right font-mono text-[10px] uppercase tracking-wide text-gray-500">C — Mgmt</th>
                <th className="px-4 py-2 text-right font-mono text-[10px] uppercase tracking-wide text-gray-300">B−A</th>
                <th className="px-4 py-2 text-right font-mono text-[10px] uppercase tracking-wide text-gray-300">C−A</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0]">
              {[
                { id: 'FDCR',  risk: false, custom: true },
                { id: 'CFCS',  risk: false }, { id: 'DER',  risk: false },
                { id: 'RCI',   risk: false }, { id: 'BGR',  risk: false },
                { id: 'DRR',   risk: false }, { id: 'BDER', risk: false },
                { id: 'MSJR',  risk: true  }, { id: 'CFR',  risk: true  },
                { id: 'RBR',   risk: true  }, { id: 'EIR',  risk: true  },
                { id: 'BTR',   risk: true  }, { id: 'CDR',  risk: true  },
                { id: 'EER',   risk: true  },
              ].map(({ id, risk, custom }) => {
                const vals = SCENARIO_ORDER.map((sid) => {
                  if (custom && id === 'FDCR') return Math.round(scenarios[sid].fdcr)
                  const ms2 = scenarios[sid].metrics as unknown as Record<string, number>
                  return Math.round(ms2[id] ?? 50)
                })
                const rDiff = vals[1] - vals[0]
                const mDiff = vals[2] - vals[0]
                return (
                  <tr key={id} className="hover:bg-[#f8fafc]">
                    <td className="px-4 py-2 font-mono text-[10px] font-bold text-[#1a3a5c] uppercase tracking-wide">
                      {id}
                    </td>
                    {vals.map((v, i) => (
                      <td
                        key={i}
                        className="px-4 py-2 text-right font-mono text-xs"
                        style={{ color: risk ? colorForRisk(v) : colorForPositive(v) }}
                      >
                        {v}
                      </td>
                    ))}
                    {[rDiff, mDiff].map((d, i) => (
                      <td
                        key={i}
                        className="px-4 py-2 text-right font-mono text-xs"
                        style={{
                          color: risk
                            ? (d < 0 ? '#15803d' : d > 0 ? '#b91c1c' : '#d1d5db')
                            : (d > 0 ? '#15803d' : d < 0 ? '#b91c1c' : '#d1d5db'),
                        }}
                      >
                        {d > 0 ? '+' : ''}{d}
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ScenarioComparison />

      {/* ── Switch case file ── */}
      <div className="border-t border-[#e2e8f0] pt-6 space-y-3">
        <h3 className="text-[10px] font-mono uppercase tracking-widest text-gray-400">{t('scenarios.load_different')}</h3>
        <div className="flex flex-wrap gap-2">
          {demoCases.map((dc) => (
            <button
              key={dc.id}
              onClick={() => loadDemoCase(dc.id)}
              className="text-[10px] font-mono border border-[#e2e8f0] px-3 py-1.5 text-gray-500 hover:border-[#1a3a5c] hover:text-[#1a3a5c] transition-colors"
            >
              {t('console.case_file')} {dc.caseNumber} — {locale === 'ja' ? dc.labelJa : dc.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
