import { TranslationDict } from '@/types/i18n'
import { ALL_METRICS } from './metrics'
import { JUDGMENT_CATEGORIES } from './judgmentCategories'
import { LAYERS } from './layers'
import { CATEGORIES } from './categories'
import { ACTOR_TYPES } from './actors'
import { VARIABLE_CATEGORIES } from './variables'

const base: TranslationDict = {
  'app.name': { en: 'FEDS Studio', ja: 'FEDS スタジオ' },
  'app.subtitle': { en: 'Freedom Dialectical Correctness Simulator', ja: '自由弁証法正答率シミュレーター' },
  'app.begin_audit': { en: 'Begin Audit', ja: '監査を開始' },
  'app.description': {
    en: 'FEDS Studio audits systems, policies, and technologies for the degree to which they dialectically generate freedom across body, society, institutions, democracy, ecology, and future generations — and the degree to which they transfer hidden burdens.',
    ja: 'FEDSスタジオは、システム・政策・技術が身体・社会・制度・民主・生態・未来世代にわたり自由を弁証法的に生成する度合いと、隠れた負担を転嫁する度合いを監査します。',
  },
  'nav.home': { en: 'Home', ja: 'ホーム' },
  'nav.audit': { en: 'Audit', ja: '監査' },
  'nav.dashboard': { en: 'Dashboard', ja: 'ダッシュボード' },
  'nav.scenarios': { en: 'Scenarios', ja: 'シナリオ' },
  'nav.report': { en: 'Report', ja: 'レポート' },
  'nav.settings': { en: 'Settings', ja: '設定' },
  'notice.no_persons': {
    en: 'No real persons are scored. FEDS audits systems and structures, never individuals.',
    ja: '実在の人物は採点されません。FEDSはシステムと構造のみを監査し、個人を採点しません。',
  },
  'notice.not_absolute': {
    en: 'Scores are not absolute truths. They are operational, revisable indicators within a dialectical framework.',
    ja: 'スコアは絶対的真実ではありません。弁証法的枠組み内の操作的・改訂可能な指標です。',
  },
  'notice.operational': {
    en: 'This is an operational, philosophical instrument — a lens for deliberation, not a verdict.',
    ja: 'これは操作的・哲学的な道具であり、判決ではなく熟議のためのレンズです。',
  },
  'step.target': { en: 'Target', ja: '対象' },
  'step.category': { en: 'Category', ja: 'カテゴリー' },
  'step.layers': { en: 'Layers', ja: 'レイヤー' },
  'step.subjects': { en: 'Subjects', ja: '主体' },
  'step.variables': { en: 'Variables', ja: '変数' },
  'step.questions': { en: 'Questions', ja: '質問' },
  'step.target_prompt': { en: 'What is being audited?', ja: '何を監査しますか?' },
  'export.pdf': { en: 'Export PDF', ja: 'PDF出力' },
  'export.png': { en: 'Export PNG', ja: 'PNG出力' },
  'export.json': { en: 'Export JSON', ja: 'JSON出力' },
  'metric.fdcr.name': { en: 'FDCR', ja: 'FDCR' },
  'metric.fdcr.description': { en: 'Freedom Dialectical Correctness Rate — local generativity of freedom.', ja: '自由弁証法正答率 — 自由の局所的生成度。' },
  'metric.gfdcr.name': { en: 'G-FDCR', ja: 'G-FDCR' },
  'metric.gfdcr.description': { en: 'Global Freedom Dialectical Correctness Rate — planetary-scale correctness net of transfer.', ja: '地球自由弁証法正答率 — 転嫁を差し引いた惑星規模の正答率。' },
  'common.judgment': { en: 'Judgment', ja: '判定' },
  'common.overview': { en: 'Overview', ja: '概要' },
  'common.metrics': { en: 'Metrics', ja: '指標' },
  'common.actor_impact': { en: 'Actor Impact', ja: '当事者影響' },
  'common.global': { en: 'Global', ja: '地球規模' },
  'common.scenarios': { en: 'Scenarios', ja: 'シナリオ' },
  'common.export': { en: 'Export', ja: '出力' },
  'common.next': { en: 'Next', ja: '次へ' },
  'common.back': { en: 'Back', ja: '戻る' },
  'common.run_audit': { en: 'Run Audit', ja: '監査を実行' },
  'common.no_data': { en: 'No audit data — run an audit first.', ja: '監査データがありません — まず監査を実行してください。' },
}

const dict: TranslationDict = { ...base }

for (const m of ALL_METRICS) {
  dict[`metric.${m.id}.name`] = { en: m.name, ja: m.nameJa }
  dict[`metric.${m.id}.description`] = { en: m.description, ja: m.description }
}
for (const j of JUDGMENT_CATEGORIES) {
  dict[`judgment.${j.id}`] = { en: j.name, ja: j.nameJa }
  dict[`judgment.${j.id}.description`] = { en: j.description, ja: j.description }
}
for (const l of LAYERS) {
  dict[`layer.${l.id}`] = { en: l.label, ja: l.labelJa }
}
for (const c of CATEGORIES) {
  dict[`category.${c.id}`] = { en: c.label, ja: c.labelJa }
}
for (const a of ACTOR_TYPES) {
  dict[`actor.${a}`] = { en: a, ja: a }
}
for (const vc of VARIABLE_CATEGORIES) {
  dict[`varcat.${vc.id}`] = { en: vc.label, ja: vc.labelJa }
}

export const translations: TranslationDict = dict
