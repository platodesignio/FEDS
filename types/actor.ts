export type ActorStatus =
  | 'Direct Winner'
  | 'Direct Loser'
  | 'Hidden Loser'
  | 'Delayed Loser'
  | 'Short-Term Winner / Long-Term Loser'
  | 'Burden Receiver'
  | 'Voice-Excluded Subject'
  | 'Re-entry Blocked Subject'
  | 'Non-Human Affected Subject'
  | 'Future Generation Affected Subject'

export interface ActorImpact {
  actor: string
  freedomGain: number
  freedomLoss: number
  bodilyBurden: number
  reEntryCapacity: number
  democraticVoice: number
  responsibilityBurden: number
  classificationExposure: number
  temporalBurden: number
  epistemicInjusticeExposure: number
  ecologicalBurden: number
  netImpact: number
  status: ActorStatus
}

export interface BurdenTransferEntry {
  from: string
  to: string
  burdenType: string
  magnitude: number
  visibility: 'visible' | 'semi-visible' | 'invisible'
}
