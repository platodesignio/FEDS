export interface LayerDef {
  id: string
  label: string
  labelJa: string
}

export const LAYERS: LayerDef[] = [
  { id: 'body', label: 'Body', labelJa: '身体' },
  { id: 'individual', label: 'Individual Lifeworld', labelJa: '個人の生活世界' },
  { id: 'social', label: 'Social / Relational', labelJa: '社会・関係' },
  { id: 'institutional', label: 'Institutional / Bureaucratic', labelJa: '制度・官僚' },
  { id: 'political', label: 'Political / Democratic', labelJa: '政治・民主' },
  { id: 'urban', label: 'Urban / Spatial', labelJa: '都市・空間' },
  { id: 'historical', label: 'Historical / Cultural', labelJa: '歴史・文化' },
  { id: 'ecological', label: 'Ecological / Whole-System', labelJa: '生態・全体系' },
  { id: 'international', label: 'International / Geopolitical', labelJa: '国際・地政学' },
  { id: 'technological', label: 'Technological / Infrastructural', labelJa: '技術・インフラ' },
  { id: 'crossborder', label: 'Cross-Border Lifeworld', labelJa: '越境生活世界' },
  { id: 'future', label: 'Future Generations', labelJa: '未来世代' },
  { id: 'planetary', label: 'Planetary / Ecological', labelJa: '惑星・生態' },
]
