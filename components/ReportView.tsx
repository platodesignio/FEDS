'use client'

import { useAudit } from '@/lib/auditContext'
import { ActorImpact, BurdenTransferEntry } from '@/types/actor'

// ── helpers ──────────────────────────────────────────────────────────────────
function v(n: number, risk = false): string {
  if (risk) return n > 65 ? '#b91c1c' : n > 45 ? '#d97706' : '#15803d'
  return n > 60 ? '#15803d' : n > 40 ? '#d97706' : '#b91c1c'
}

function Bar({ value, risk = false }: { value: number; risk?: boolean }) {
  const color = v(value, risk)
  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <div className="w-16 h-1 bg-[#e2e8f0] shrink-0">
        <div className="h-1" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="font-mono text-[10px] font-bold" style={{ color }}>{value}</span>
    </div>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="text-left text-[9px] font-mono uppercase tracking-wide text-gray-400 px-3 py-2 border-b border-[#e2e8f0] whitespace-nowrap bg-[#f8fafc]">
      {children}
    </th>
  )
}
function Td({ children, mono = false }: { children: React.ReactNode; mono?: boolean }) {
  return (
    <td className={`px-3 py-2 border-b border-[#e2e8f0] text-xs text-gray-700 ${mono ? 'font-mono' : ''}`}>
      {children}
    </td>
  )
}

function statusColor(status: string): string {
  if (status.includes('Winner') && !status.includes('Long-Term')) return '#15803d'
  if (status.includes('Loser') || status.includes('Blocked') || status.includes('Excluded')) return '#b91c1c'
  if (status.includes('Receiver') || status.includes('Burden')) return '#d97706'
  if (status.includes('Non-Human') || status.includes('Future')) return '#7c3aed'
  return '#64748b'
}

const BURDEN_LAYER: Record<string, string> = {
  'Hidden labor & operational burden': 'Labor / Institutional',
  'Carbon & ecological debt':          'Ecological / Temporal',
  'Displaced responsibility':          'Institutional / Legal',
  'Energy / compute externalization':  'Ecological / Technological',
  'Resource extraction dependency':    'Ecological / Geopolitical',
  'Bodily & temporal burden':          'Bodily / Temporal',
}
const BURDEN_CORRECTION: Record<string, string> = {
  'Hidden labor & operational burden': 'Cross-border accountability + disclosure mandate',
  'Carbon & ecological debt':          'Intergenerational climate audit + PRCI monitoring',
  'Displaced responsibility':          'Institutional liability reassignment + democratic audit',
  'Energy / compute externalization':  'Eco-penalty attribution + EER cap enforcement',
  'Resource extraction dependency':    'Supply chain transparency + extraction sovereignty',
  'Bodily & temporal burden':          'Bodily burden assessment + time-for-repair policy',
}

function visColor(v: string): string {
  if (v === 'invisible') return '#b91c1c'
  if (v === 'semi-visible') return '#d97706'
  return '#15803d'
}

// ── Actor Impact Matrix ───────────────────────────────────────────────────────
function ActorImpactTable({ actors }: { actors: ActorImpact[] }) {
  if (actors.length === 0) return <p className="text-xs text-gray-400 font-mono">No actor data.</p>
  return (
    <div className="overflow-x-auto">
      <table className="w-full border border-[#e2e8f0] text-left text-xs">
        <thead>
          <tr>
            <Th>Actor Group</Th>
            <Th>Freedom Gain</Th>
            <Th>Burden Received</Th>
            <Th>Re-entry Position</Th>
            <Th>Voice Position</Th>
            <Th>Classification Exposure</Th>
            <Th>Net Position</Th>
          </tr>
        </thead>
        <tbody>
          {actors.map((a) => {
            const burden = Math.round((a.bodilyBurden + a.responsibilityBurden) / 2)
            return (
              <tr key={a.actor} className="hover:bg-[#f8fafc]">
                <Td>
                  <div className="font-semibold text-[#1a3a5c]">{a.actor}</div>
                  <div
                    className="text-[9px] font-mono mt-0.5"
                    style={{ color: statusColor(a.status) }}
                  >{a.status}</div>
                </Td>
                <Td><Bar value={a.freedomGain} /></Td>
                <Td><Bar value={burden} risk /></Td>
                <Td><Bar value={a.reEntryCapacity} /></Td>
                <Td><Bar value={a.democraticVoice} /></Td>
                <Td><Bar value={a.classificationExposure} risk /></Td>
                <Td mono>
                  <span
                    className="font-bold"
                    style={{ color: a.netImpact >= 0 ? '#15803d' : '#b91c1c' }}
                  >{a.netImpact > 0 ? '+' : ''}{a.netImpact}</span>
                </Td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ── Burden Transfer Table ─────────────────────────────────────────────────────
function BurdenTransferTable({ transfers }: { transfers: BurdenTransferEntry[] }) {
  if (transfers.length === 0) return (
    <p className="text-xs text-gray-400 font-mono">No burden transfer pathways detected above threshold.</p>
  )
  return (
    <div className="overflow-x-auto">
      <table className="w-full border border-[#e2e8f0] text-left text-xs">
        <thead>
          <tr>
            <Th>Source</Th>
            <Th>Receiver</Th>
            <Th>Transfer Pathway</Th>
            <Th>Affected Layer</Th>
            <Th>Severity</Th>
            <Th>Visibility</Th>
            <Th>Correction Mechanism</Th>
          </tr>
        </thead>
        <tbody>
          {transfers.map((tr, i) => (
            <tr key={i} className="hover:bg-[#f8fafc]">
              <Td><span className="font-semibold text-[#1a3a5c]">{tr.from}</span></Td>
              <Td><span className="font-semibold text-[#b91c1c]">{tr.to}</span></Td>
              <Td>{tr.burdenType}</Td>
              <Td mono>{BURDEN_LAYER[tr.burdenType] ?? '—'}</Td>
              <Td><Bar value={tr.magnitude} risk /></Td>
              <Td mono>
                <span style={{ color: visColor(tr.visibility) }}>{tr.visibility}</span>
              </Td>
              <Td><span className="text-gray-500 text-[10px]">{BURDEN_CORRECTION[tr.burdenType] ?? '—'}</span></Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Ecological Indicators ────────────────────────────────────────────────────
function EcoIndicators({ ecoScores }: { ecoScores: import('@/types/eco').EcoScores }) {
  const indicators = [
    { id: 'E-FDCR',  value: Math.round(ecoScores['E-FDCR']), full: 'Ecological Freedom-Evolution Dialectical Correctness Rate', risk: false },
    { id: 'EBDCR',   value: Math.round(ecoScores.EBDCR),     full: 'Ecological Bio-Divisional Correctness Rate',                risk: false },
    { id: 'EBDE',    value: Math.round(ecoScores.EBDE),      full: 'Ecological Bio-Divisional Efficacy',                        risk: false },
    { id: 'EP-BTM',  value: Math.round(ecoScores['EP-BTM']), full: 'Eco-Planetary Burden Transfer Matrix',                     risk: true  },
  ]
  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="w-full border border-[#e2e8f0] text-left text-xs">
          <thead>
            <tr>
              <Th>Indicator</Th>
              <Th>Score</Th>
              <Th>Level</Th>
              <Th>Full Name</Th>
            </tr>
          </thead>
          <tbody>
            {indicators.map(({ id, value, full, risk }) => (
              <tr key={id} className="hover:bg-[#f8fafc]">
                <Td mono><span className="font-bold text-[#1a3a5c]">{id}</span></Td>
                <Td><Bar value={value} risk={risk} /></Td>
                <Td mono>
                  <span style={{ color: risk
                    ? (value > 65 ? '#b91c1c' : value > 45 ? '#d97706' : '#15803d')
                    : (value > 60 ? '#15803d' : value > 40 ? '#d97706' : '#b91c1c') }}>
                    {risk
                      ? (value > 65 ? 'HIGH TRANSFER' : value > 45 ? 'MODERATE' : 'LOW')
                      : (value > 60 ? 'CORRECT' : value > 40 ? 'CONDITIONAL' : 'FAILURE')}
                  </span>
                </Td>
                <Td>{full}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {ecoScores.ecoCorrections.length > 0 && (
        <div className="border border-amber-200 bg-amber-50 p-3 space-y-1">
          <div className="text-[9px] font-mono uppercase tracking-wide text-amber-600">Ecological Correction Rules Triggered</div>
          {ecoScores.ecoCorrections.map((c, i) => (
            <div key={i} className="text-[10px] font-mono text-amber-700">▸ {c}</div>
          ))}
        </div>
      )}
      {ecoScores.ecoJudgments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {ecoScores.ecoJudgments.map((j) => (
            <div key={j} className="text-[9px] font-mono border border-[#c8e6c8] bg-[#f0fdf0] px-2 py-1 text-[#1a6a1a]">{j}</div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Section wrapper ──────────────────────────────────────────────────────────
function Section({ num, title, titleJa, locale, children }: {
  num: string; title: string; titleJa: string; locale: string; children: React.ReactNode
}) {
  return (
    <section className="border-b border-[#e2e8f0] last:border-0 px-6 py-5 space-y-3">
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-[10px] text-gray-300 shrink-0 w-5">{num}</span>
        <h2 className="text-xs font-bold uppercase tracking-wide text-[#1a3a5c]">
          {locale === 'ja' ? titleJa : title}
        </h2>
        {locale === 'en' && <span className="text-[10px] text-gray-400 font-mono">{titleJa}</span>}
      </div>
      <div className="pl-8">{children}</div>
    </section>
  )
}

// ── Main ReportView ───────────────────────────────────────────────────────────
export default function ReportView() {
  const { scoreResult, locale, t } = useAudit()
  if (!scoreResult) return <p className="text-xs font-mono text-gray-400">{t('common.no_data')}</p>

  const r   = scoreResult.report
  const ms  = scoreResult.metrics as unknown as Record<string, number>
  const eco = scoreResult.ecoScores

  return (
    <article className="space-y-0 border border-[#e2e8f0]">
      {/* Cover sheet */}
      <header className="border-b border-[#e2e8f0] p-6 space-y-4 bg-[#f8fafc]">
        <div className="text-[10px] font-mono uppercase tracking-widest text-gray-400">
          FEDS Studio — {t('dossier.title')}
        </div>
        <h1 className="text-xl font-bold text-[#1a3a5c]">{r.target}</h1>

        {/* Primary indicators */}
        <div className="grid gap-px bg-[#e2e8f0] sm:grid-cols-4 border border-[#e2e8f0]">
          {[
            { label: 'FDCR',     value: r.fdcr,   risk: false },
            { label: 'G-FDCR',   value: r.gfdcr,  risk: false },
            { label: 'E-FDCR',   value: eco ? Math.round(eco['E-FDCR']) : null, risk: false },
            { label: 'EP-BTM',   value: eco ? Math.round(eco['EP-BTM']) : null, risk: true  },
          ].map(({ label, value, risk }) => value !== null && (
            <div key={label} className="bg-white p-3 space-y-1">
              <div className="text-[9px] font-mono uppercase tracking-wide text-gray-400">{label}</div>
              <div className="font-mono text-2xl font-bold" style={{ color: v(value!, risk) }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Judgment */}
        <div className="border border-[#e2e8f0] bg-white px-4 py-2 flex items-center gap-4">
          <span className="text-[9px] font-mono uppercase tracking-wide text-gray-400">Primary Judgment</span>
          <span className="font-mono text-xs font-bold text-[#1a3a5c]">{r.judgment}</span>
          <span className="text-[9px] text-gray-400">{r.category}</span>
        </div>

        <div className="flex flex-wrap gap-4 text-[10px] font-mono text-gray-400">
          {r.layers.length > 0 && <span>Layers: {r.layers.join(' · ')}</span>}
          {r.subjects.length > 0 && <span>Subjects: {r.subjects.join(' · ')}</span>}
          <span>Generated: {new Date(r.generatedAt).toLocaleString()}</span>
        </div>
      </header>

      {/* Text sections from report generator */}
      {r.sections.map((s, i) => {
        // Insert Actor Impact Matrix after section 14 (Who Wins…)
        const insertActorAfter = s.title.startsWith('14.')
        // Insert Burden Transfer after section 16 (Burden Transfer)
        const insertBurdenAfter = s.title.startsWith('16.')
        // Insert Eco indicators after section 26 (Ecological Bio-Div)
        const insertEcoAfter = s.title.startsWith('26.')

        return (
          <div key={i}>
            <Section
              num={String(i + 1).padStart(2, '0')}
              title={s.title}
              titleJa={s.titleJa}
              locale={locale}
            >
              <p className="text-xs leading-relaxed text-gray-700">{s.content}</p>
            </Section>

            {insertActorAfter && scoreResult.actorImpacts.length > 0 && (
              <Section num="15" title="Actor Impact Matrix" titleJa="当事者影響マトリクス" locale={locale}>
                <ActorImpactTable actors={scoreResult.actorImpacts} />
              </Section>
            )}

            {insertBurdenAfter && (
              <Section num="16b" title="Burden Transfer Pathways — Formal Table" titleJa="負担転嫁経路 — 正式テーブル" locale={locale}>
                <BurdenTransferTable transfers={scoreResult.burdenTransfers} />
              </Section>
            )}

            {insertEcoAfter && eco && (
              <Section num="26b" title="Ecological Extension Indicators — Research Table" titleJa="生態的拡張指標 — 研究テーブル" locale={locale}>
                <EcoIndicators ecoScores={eco} />
              </Section>
            )}
          </div>
        )
      })}

      {/* Fallback: if eco sections weren't inserted inline, append at end */}
      {eco && !r.sections.some(s => s.title.startsWith('26.')) && (
        <Section num="26" title="Ecological Extension Indicators" titleJa="生態的拡張指標" locale={locale}>
          <EcoIndicators ecoScores={eco} />
        </Section>
      )}
    </article>
  )
}
