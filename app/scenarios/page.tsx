'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAudit } from '@/lib/auditContext'
import { ScenarioId } from '@/types/scenario'
import ScenarioComparison from '@/components/ScenarioComparison'
import ScoreCard, { colorForPositive, colorForRisk } from '@/components/ScoreCard'

const SCENARIO_ORDER: ScenarioId[] = ['current', 'reform', 'managerial']

const POSITIVE_METRICS = ['CFCS', 'DER', 'RCI', 'BGR', 'DRR', 'BDER']
const RISK_METRICS    = ['MSJR', 'CFR', 'RBR', 'EIR', 'BTR', 'CDR']

function reformDirection(ms: Record<string, number>): string {
  if (ms.MSJR > 70 && ms.CFCS < 40) return 'scenarios.reform_direction.high_msjr'
  if (ms.RCI < 30 && ms.RBR > 70)   return 'scenarios.reform_direction.low_rci'
  if (ms.CFR > 70)                    return 'scenarios.reform_direction.high_cfr'
  return 'scenarios.reform_direction.default'
}

export default function ScenariosPage() {
  const { scoreResult, t, locale, loadDemoCase, demoCases } = useAudit()
  const router = useRouter()

  function handleLoadDemo(id: string) {
    loadDemoCase(id)
  }

  /* ── Empty state ────────────────────────────────────────────────────── */
  if (!scoreResult) {
    return (
      <div className="space-y-8">
        <div className="border border-[#e2e8f0] p-6 space-y-4">
          <h2 className="text-xl font-bold text-[#1a3a5c]">{t('scenarios.empty.title')}</h2>
          <p className="text-sm text-gray-600 max-w-2xl">{t('scenarios.empty.body')}</p>

          {/* Three scenario descriptions */}
          <div className="grid gap-3 md:grid-cols-3 pt-2">
            {[
              { key: 'scenarios.current', desc: locale === 'ja' ? '現在の変数値でシステムを評価します。' : 'Evaluates the system with current variable values as entered.' },
              { key: 'scenarios.reform',  desc: locale === 'ja' ? 'ポジティブ指標+15、リスク指標−15のシフトで改革方向を推定します。' : 'Estimates a reform trajectory: positive metrics +15, risk metrics −15.' },
              { key: 'scenarios.managerial', desc: locale === 'ja' ? '管理強化シナリオ：ポジティブ指標−15、リスク指標+15。' : 'Models managerial intensification: positive metrics −15, risk metrics +15.' },
            ].map(({ key, desc }) => (
              <div key={key} className="border border-[#e2e8f0] p-4 space-y-1">
                <div className="text-xs uppercase tracking-wide text-gray-400">Scenario</div>
                <div className="text-sm font-semibold text-[#1a3a5c]">{t(key)}</div>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-3 flex-wrap pt-2">
            <Link
              href="/audit"
              className="inline-block bg-[#1a3a5c] px-4 py-2 text-sm font-medium text-white hover:bg-[#0f2440] transition-colors"
            >
              {t('app.begin_audit')} →
            </Link>
          </div>
        </div>

        {/* Demo case loaders */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-[#1a3a5c]">{t('demo.section_title')}</h3>
          <p className="text-xs text-gray-500">{t('demo.description')}</p>
          <div className="grid gap-3 md:grid-cols-3">
            {demoCases.map((dc) => (
              <div key={dc.id} className="border border-[#e2e8f0] p-4 space-y-3">
                <div className="text-xs uppercase tracking-wide text-gray-400">Demo</div>
                <h4 className="text-sm font-semibold text-gray-800">
                  {locale === 'ja' ? dc.labelJa : dc.label}
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {locale === 'ja' ? dc.descriptionJa : dc.description}
                </p>
                <button
                  onClick={() => handleLoadDemo(dc.id)}
                  className="text-xs border border-[#1a3a5c] px-3 py-1.5 text-[#1a3a5c] hover:bg-[#1a3a5c] hover:text-white transition-colors"
                >
                  {t('demo.load')}
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
      <h1 className="text-2xl font-bold text-[#1a3a5c]">{t('scenarios.title')}</h1>

      {/* ── Three-column header ── */}
      <div className="grid gap-3 md:grid-cols-3">
        {SCENARIO_ORDER.map((id) => {
          const s = scenarios[id]
          const isBase = id === 'current'
          const diff = Math.round(s.fdcr - scenarios.current.fdcr)
          const gDiff = Math.round(s.gfdcr - scenarios.current.gfdcr)
          return (
            <div
              key={id}
              className={`border p-4 space-y-4 ${isBase ? 'border-[#1a3a5c]' : 'border-[#e2e8f0]'}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-400 mb-1">Scenario</div>
                  <h2 className="text-sm font-bold text-[#1a3a5c]">{t(`scenarios.${id}`)}</h2>
                </div>
                {!isBase && (
                  <div className="flex gap-1">
                    <span className="font-mono text-xs px-1.5 py-0.5" style={{ color: diff > 0 ? '#15803d' : '#b91c1c', background: diff > 0 ? '#f0fdf4' : '#fef2f2' }}>
                      FDCR {diff > 0 ? '+' : ''}{diff}
                    </span>
                  </div>
                )}
              </div>

              {/* FDCR + G-FDCR */}
              <div className="flex gap-4">
                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide">FDCR</div>
                  <div className="font-mono text-4xl font-bold" style={{ color: colorForPositive(s.fdcr) }}>
                    {Math.round(s.fdcr)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide">G-FDCR</div>
                  <div className="font-mono text-4xl font-bold" style={{ color: colorForPositive(s.gfdcr) }}>
                    {Math.round(s.gfdcr)}
                  </div>
                  {!isBase && (
                    <div className="font-mono text-xs mt-0.5" style={{ color: gDiff > 0 ? '#15803d' : '#b91c1c' }}>
                      {gDiff > 0 ? '+' : ''}{gDiff}
                    </div>
                  )}
                </div>
              </div>

              {/* Judgment */}
              <div className="border border-[#e2e8f0] bg-gray-50 px-2 py-1 text-xs text-[#1a3a5c] font-medium">
                {t(`judgment.${s.judgment}`)}
              </div>

              {/* Key metric grid */}
              <div className="grid grid-cols-2 gap-1 text-xs">
                {(['MSJR', 'RCI', 'BGR', 'DRR', 'CFR', 'RBR'] as const).map((metric) => {
                  const ms2 = s.metrics as unknown as Record<string, number>
                  const v = Math.round(ms2[metric] ?? 50)
                  const isRisk = ['MSJR', 'CFR', 'RBR'].includes(metric)
                  return (
                    <div key={metric} className="flex justify-between border border-[#e2e8f0] px-2 py-1">
                      <span className="font-mono text-gray-500">{metric}</span>
                      <span className="font-mono font-semibold" style={{ color: isRisk ? colorForRisk(v) : colorForPositive(v) }}>
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
        <h2 className="text-sm font-semibold text-[#1a3a5c]">{t('scenarios.reform_direction')}</h2>
        <p className="text-sm text-gray-700 leading-relaxed">{t(directionKey)}</p>
      </div>

      {/* ── Full metric comparison table ── */}
      <div>
        <h2 className="text-sm font-semibold text-[#1a3a5c] mb-3">{t('scenarios.metric_comparison')}</h2>
        <div className="overflow-x-auto">
          <table className="w-full border border-[#e2e8f0] text-xs">
            <thead>
              <tr className="border-b border-[#e2e8f0] bg-gray-50">
                <th className="px-3 py-2 text-left font-medium text-gray-600 w-28">Metric</th>
                {SCENARIO_ORDER.map((id) => (
                  <th key={id} className="px-3 py-2 text-right font-medium text-[#1a3a5c]">
                    {t(`scenarios.${id}`)}
                  </th>
                ))}
                <th className="px-3 py-2 text-right font-medium text-gray-400">Reform Δ</th>
                <th className="px-3 py-2 text-right font-medium text-gray-400">Mgmt Δ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0]">
              {[
                { id: 'FDCR',  label: 'FDCR (composite)', risk: false, custom: true },
                { id: 'CFCS',  risk: false }, { id: 'DER',  risk: false },
                { id: 'RCI',   risk: false }, { id: 'BGR',  risk: false },
                { id: 'DRR',   risk: false }, { id: 'BDER', risk: false },
                { id: 'MSJR',  risk: true  }, { id: 'CFR',  risk: true  },
                { id: 'RBR',   risk: true  }, { id: 'EIR',  risk: true  },
                { id: 'BTR',   risk: true  }, { id: 'CDR',  risk: true  },
                { id: 'EER',   risk: true  },
              ].map(({ id, risk, custom, label }) => {
                const vals = SCENARIO_ORDER.map((sid) => {
                  if (custom && id === 'FDCR') return Math.round(scenarios[sid].fdcr)
                  const ms2 = scenarios[sid].metrics as unknown as Record<string, number>
                  return Math.round(ms2[id] ?? 50)
                })
                const rDiff = vals[1] - vals[0]
                const mDiff = vals[2] - vals[0]
                return (
                  <tr key={id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 font-mono font-semibold text-[#1a3a5c]">
                      {label ?? id}
                    </td>
                    {vals.map((v, i) => (
                      <td
                        key={i}
                        className="px-3 py-2 text-right font-mono"
                        style={{ color: risk ? colorForRisk(v) : colorForPositive(v) }}
                      >
                        {v}
                      </td>
                    ))}
                    {[rDiff, mDiff].map((d, i) => (
                      <td
                        key={i}
                        className="px-3 py-2 text-right font-mono"
                        style={{
                          color: risk
                            ? (d < 0 ? '#15803d' : d > 0 ? '#b91c1c' : '#9ca3af')
                            : (d > 0 ? '#15803d' : d < 0 ? '#b91c1c' : '#9ca3af'),
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

      {/* ── Switch demo ── */}
      <div className="border-t border-[#e2e8f0] pt-6 space-y-3">
        <h3 className="text-sm font-semibold text-[#1a3a5c]">{t('scenarios.load_different')}</h3>
        <div className="flex flex-wrap gap-2">
          {demoCases.map((dc) => (
            <button
              key={dc.id}
              onClick={() => loadDemoCase(dc.id)}
              className="text-xs border border-[#e2e8f0] px-3 py-1.5 text-gray-600 hover:border-[#1a3a5c] hover:text-[#1a3a5c] transition-colors"
            >
              {locale === 'ja' ? dc.labelJa : dc.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
