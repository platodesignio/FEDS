import { ActorImpact, ActorStatus } from '@/types/actor'
import { MetricScores } from '@/types/metric'
import { clamp } from './normalization'

function statusFor(actor: string, net: number, impact: Partial<ActorImpact>): ActorStatus {
  if (actor === 'Ecosystems' || actor === 'Non-human life') return 'Non-Human Affected Subject'
  if (actor === 'Future generations') return 'Future Generation Affected Subject'
  if ((impact.democraticVoice ?? 50) < 25) return 'Voice-Excluded Subject'
  if ((impact.reEntryCapacity ?? 50) < 25) return 'Re-entry Blocked Subject'
  if ((impact.responsibilityBurden ?? 0) > 60 && net < 0) return 'Burden Receiver'
  if (net >= 20) return 'Direct Winner'
  if (net <= -20) return 'Direct Loser'
  if (net < 0 && (impact.bodilyBurden ?? 0) > 50) return 'Hidden Loser'
  if (net < 10 && (impact.ecologicalBurden ?? 0) > 55) return 'Delayed Loser'
  if (net > 0 && (impact.classificationExposure ?? 0) > 55) return 'Short-Term Winner / Long-Term Loser'
  return net >= 0 ? 'Direct Winner' : 'Direct Loser'
}

export function computeActorImpacts(
  subjects: string[],
  metrics: MetricScores,
  fdcr: number
): ActorImpact[] {
  const ms = metrics as unknown as Record<string, number>
  return subjects.map((actor) => {
    let freedomGain = (fdcr * 0.4 + ms.CFCS * 0.25 + ms.DER * 0.2 + ms.RCI * 0.15)
    let freedomLoss = (ms.CFR * 0.4 + ms.RBR * 0.35 + ms.MTR * 0.25)
    let bodilyBurden = clamp(ms.BBI * 0.6 + (100 - ms.BGR) * 0.4, 0, 100)
    let reEntryCapacity = ms.RCI
    let democraticVoice = clamp(ms.DRR * 0.6 + ms.LSAR * 0.4, 0, 100)
    let responsibilityBurden = ms.RDR
    let classificationExposure = clamp(ms.CFR * 0.6 + ms.MTR * 0.4, 0, 100)
    let temporalBurden = clamp(ms.TCR * 0.6 + ms.BBI * 0.4, 0, 100)
    let epistemicInjusticeExposure = ms.EIR
    let ecologicalBurden = clamp(ms.EER * 0.6 + ms.BTR * 0.4, 0, 100)

    // Actor-specific modifiers
    if (actor === 'Migrants' || actor === 'Refugees') {
      classificationExposure = clamp(classificationExposure + 15, 0, 100)
      democraticVoice = clamp(democraticVoice - 20, 0, 100)
      freedomLoss = clamp(freedomLoss + 8, 0, 100)
    }
    if (actor === 'Workers' || actor === 'Gig workers' || actor === 'Care workers') {
      bodilyBurden = clamp(bodilyBurden + 15, 0, 100)
      responsibilityBurden = clamp(responsibilityBurden + 12, 0, 100)
    }
    if (actor === 'Future generations') {
      ecologicalBurden = clamp(ecologicalBurden + 20, 0, 100)
      reEntryCapacity = clamp(reEntryCapacity - 25, 0, 100)
      democraticVoice = clamp(democraticVoice - 30, 0, 100)
    }
    if (actor === 'Ecosystems' || actor === 'Non-human life') {
      ecologicalBurden = clamp(ms.EER * 0.5 + ms.BTR * 0.3 + ms.PPR * 0.2, 0, 100)
      democraticVoice = 0
      freedomGain = clamp(freedomGain * 0.3, 0, 100)
    }
    if (actor === 'Incarcerated persons' || actor === 'Applicants') {
      reEntryCapacity = clamp(reEntryCapacity - 12, 0, 100)
      classificationExposure = clamp(classificationExposure + 10, 0, 100)
    }

    freedomGain = clamp(freedomGain, 0, 100)
    freedomLoss = clamp(freedomLoss, 0, 100)

    const netImpact = Math.round(
      freedomGain - freedomLoss - bodilyBurden * 0.3 - responsibilityBurden * 0.2
    )

    const partial = {
      bodilyBurden,
      reEntryCapacity,
      democraticVoice,
      responsibilityBurden,
      classificationExposure,
      ecologicalBurden,
    }
    const status = statusFor(actor, netImpact, partial)

    return {
      actor,
      freedomGain: Math.round(freedomGain),
      freedomLoss: Math.round(freedomLoss),
      bodilyBurden: Math.round(bodilyBurden),
      reEntryCapacity: Math.round(reEntryCapacity),
      democraticVoice: Math.round(democraticVoice),
      responsibilityBurden: Math.round(responsibilityBurden),
      classificationExposure: Math.round(classificationExposure),
      temporalBurden: Math.round(temporalBurden),
      epistemicInjusticeExposure: Math.round(epistemicInjusticeExposure),
      ecologicalBurden: Math.round(ecologicalBurden),
      netImpact,
      status,
    }
  })
}
