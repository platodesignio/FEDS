export interface CategoryDef {
  id: string
  label: string
  labelJa: string
}

export const CATEGORIES: CategoryDef[] = [
  { id: 'ai_scoring', label: 'AI scoring system', labelJa: 'AIスコアリングシステム' },
  { id: 'policy', label: 'Public policy', labelJa: '公共政策' },
  { id: 'law', label: 'Law / regulation', labelJa: '法・規制' },
  { id: 'institution', label: 'Institution / bureaucracy', labelJa: '制度・官僚機構' },
  { id: 'platform', label: 'Digital platform', labelJa: 'デジタルプラットフォーム' },
  { id: 'urban_plan', label: 'Urban / infrastructure plan', labelJa: '都市・インフラ計画' },
  { id: 'corporate', label: 'Corporate practice', labelJa: '企業慣行' },
  { id: 'technology', label: 'Technology / infrastructure', labelJa: '技術・インフラ' },
  { id: 'social_norm', label: 'Social norm / cultural practice', labelJa: '社会規範・文化慣行' },
  { id: 'economic', label: 'Economic system / market', labelJa: '経済システム・市場' },
]
