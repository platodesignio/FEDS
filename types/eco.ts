export interface EcoScores {
  EBDE: number      // Ecological Bio-Divisional Efficacy
  EBDCR: number     // Ecological Bio-Divisional Correctness Rate
  'E-FDCR': number  // Ecological Freedom-Evolution Dialectical Correctness Rate
  'EP-BTM': number  // Eco-Planetary Burden Transfer Matrix (scalar)
  ecoRiskPenalty: number
  ecoPlanetaryRiskPenalty: number
  ecoCorrections: string[]
  ecoJudgments: string[]
}
