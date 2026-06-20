import { TranslationDict } from '@/types/i18n'
import { ALL_METRICS } from './metrics'
import { JUDGMENT_CATEGORIES } from './judgmentCategories'
import { LAYERS } from './layers'
import { CATEGORIES } from './categories'
import { ACTOR_TYPES } from './actors'
import { VARIABLE_CATEGORIES } from './variables'

const base: TranslationDict = {
  // ── Theoretical foundations ──────────────────────────────────────────────
  'theory.section_title': { en: 'Theoretical Foundations', ja: '理論的基盤' },
  'theory.1.en': { en: 'Freedom Dialectical Correctness Rate Audit Theory', ja: 'Freedom Dialectical Correctness Rate Audit Theory' },
  'theory.1.ja': { en: '自由弁証法正答率監査理論', ja: '自由弁証法正答率監査理論' },
  'theory.2.en': { en: 'Bio-Divisional Dialectical Efficacy Theory', ja: 'Bio-Divisional Dialectical Efficacy Theory' },
  'theory.2.ja': { en: '生命分業的弁証法効力論', ja: '生命分業的弁証法効力論' },
  'theory.3.en': { en: 'Bureaucratic Division-of-Labor Metabolic Network Audit Theory through Lifeworld Audit Subjects', ja: 'Bureaucratic Division-of-Labor Metabolic Network Audit Theory through Lifeworld Audit Subjects' },
  'theory.3.ja': { en: '生活世界監査主体による官僚制分業代謝ネットワーク監査理論', ja: '生活世界監査主体による官僚制分業代謝ネットワーク監査理論' },
  'theory.4.en': { en: 'Institutional Translation of the Lifeworld, Reality-Generation through Classification, and Democratic Re-Audit of Freedom-Evolution Direction in AI-Scored Society', ja: 'Institutional Translation of the Lifeworld, Reality-Generation through Classification, and Democratic Re-Audit of Freedom-Evolution Direction in AI-Scored Society' },
  'theory.4.ja': { en: 'AIスコア社会における生活世界の制度的翻訳・分類による現実生成・自由進化方向の民主的再監査', ja: 'AIスコア社会における生活世界の制度的翻訳・分類による現実生成・自由進化方向の民主的再監査' },
  'theory.5.en': { en: 'Dialectical Social Audit Philosophy for Freedom-Generation in the Age of AI', ja: 'Dialectical Social Audit Philosophy for Freedom-Generation in the Age of AI' },
  'theory.5.ja': { en: 'AI時代の自由生成社会監査構想――スコア社会・教育・経済・生命分業・認識的不正義を統合する弁証法的自由監査哲学', ja: 'AI時代の自由生成社会監査構想――スコア社会・教育・経済・生命分業・認識的不正義を統合する弁証法的自由監査哲学' },
  // ── Research tool positioning ────────────────────────────────────────────
  'app.research_positioning': {
    en: 'FEDS Studio is a research audit tool for evaluating whether policies, institutions, AI-scored systems, educational systems, economic arrangements, urban systems, ecological systems, and global infrastructures remain creatively future-challenging while preserving the dialectical correctness of freedom-generation.',
    ja: 'FEDS Studioは、政策・制度・AIスコアシステム・教育システム・経済的配置・都市システム・生態系・グローバルインフラが、自由生成の弁証法的正答性を維持しながら創造的未来挑戦性を保持しているかを評価するための研究監査ツールです。',
  },
  'app.core_question': {
    en: 'Who gains freedom, who loses re-entry, and where is the burden transferred?',
    ja: '誰が自由を得て、誰が再参入を失い、負担はどこへ転嫁されているか？',
  },
  // ── Demo cases ──────────────────────────────────────────────────────────
  'demo.section_title': { en: 'Demo Audit Cases', ja: 'デモ監査ケース' },
  'demo.load': { en: 'Load Demo Case', ja: 'デモケースを読み込む' },
  'demo.description': {
    en: 'Load a pre-configured audit case to explore how FDCR is computed and reported.',
    ja: '事前設定された監査ケースを読み込み、FDCRの算出とレポートの仕組みを確認できます。',
  },
  'demo.ai_hiring.label': { en: 'AI Hiring System', ja: 'AI採用システム' },
  'demo.smart_city.label': { en: 'Smart City Surveillance Policy', ja: 'スマートシティ監視政策' },
  'demo.welfare.label': { en: 'Public Welfare Scoring System', ja: '公的福祉スコアリングシステム' },
  // ── Dashboard empty state ────────────────────────────────────────────────
  'dashboard.empty.title': { en: 'No Audit Data', ja: '監査データなし' },
  'dashboard.empty.body': {
    en: 'Run a new audit or load a demo case to see FDCR, G-FDCR, metric cards, Actor Impact Matrix, Burden Transfer Matrix, and a full written report.',
    ja: '新しい監査を実行するか、デモケースを読み込んでFDCR・G-FDCR・指標カード・当事者影響マトリクス・負担転嫁マトリクス・完全レポートを確認してください。',
  },
  // ── Report empty state ───────────────────────────────────────────────────
  'report.empty.title': { en: 'No Audit Report', ja: '監査レポートなし' },
  'report.empty.body': {
    en: 'Complete an audit to generate a full written report with 25 sections covering FDCR judgment, actor impacts, burden transfer, improvement conditions, and final conclusion.',
    ja: '監査を完了すると、FDCRの判定・当事者影響・負担転嫁・改善条件・最終結論を含む全25セクションの完全レポートが生成されます。',
  },
  // ── Settings ─────────────────────────────────────────────────────────────
  'settings.language': { en: 'Language / 言語', ja: '言語' },
  'settings.weights': { en: 'Scoring Weights', ja: 'スコアリングウェイト' },
  'settings.weights.note': {
    en: 'All weights are provisional heuristic values. They can be recalibrated through expert review, case studies, and empirical validation.',
    ja: 'すべてのウェイトは暫定的なヒューリスティック値です。専門家レビュー・ケーススタディ・実証的検証を通じて再較正可能です。',
  },
  'settings.research_assumptions': { en: 'Research Assumptions', ja: '研究前提' },
  'settings.research_assumptions.note': {
    en: 'FDCR is not a universal truth score. It operates under explicit assumptions about what constitutes freedom-generation, dialectical efficacy, and institutional correctness. These assumptions are revisable.',
    ja: 'FDCRは普遍的な真実スコアではありません。自由生成・弁証法的効力・制度的正答性の定義に関する明示的な前提の下で機能します。これらの前提は改訂可能です。',
  },
  'settings.export': { en: 'Export Settings', ja: 'エクスポート設定' },
  'settings.methodological_notes': { en: 'Methodological Notes', ja: '方法論的注記' },
  'settings.methodological_notes.content': {
    en: 'FEDS Studio uses a weighted composite scoring model. Variables contribute to metrics through affectedMetrics references. Correction rules apply hard caps to FDCR and G-FDCR when critical thresholds are breached. Judgment categories are assigned based on metric threshold combinations. Actor impacts are estimated from metric values with actor-type-specific modifiers. All outputs are operational audit indicators, not causal measurements.',
    ja: 'FEDS Studioは重み付き複合スコアリングモデルを使用します。変数はaffectedMetrics参照を通じて指標に寄与します。修正ルールは、重要な閾値が超過した際にFDCRおよびG-FDCRに上限を適用します。判定カテゴリは指標閾値の組み合わせに基づいて割り当てられます。当事者影響は指標値と主体タイプ固有の修正係数から推定されます。すべての出力は操作的監査指標であり、因果的測定値ではありません。',
  },
  'settings.debug': { en: 'Debug: Raw Audit State', ja: 'デバッグ：監査状態ロー' },
  // ── Dashboard section headings ────────────────────────────────────────────
  'dashboard.corrections': { en: 'Corrections Applied', ja: '適用された修正' },
  'dashboard.judgments': { en: 'Judgment Categories', ja: '判定カテゴリ' },
  'dashboard.layer_matrix': { en: 'Layer Matrix', ja: 'レイヤーマトリクス' },
  'dashboard.actor_matrix': { en: 'Actor Impact Matrix', ja: '当事者影響マトリクス' },
  'dashboard.winner_loser': { en: 'Winner / Loser Distribution', ja: '勝者・敗者分布' },
  'dashboard.burden_matrix': { en: 'Burden Transfer Matrix', ja: '負担転嫁マトリクス' },
  'dashboard.global_flags': { en: 'Global Audit Flags', ja: 'グローバル監査フラグ' },
  'dashboard.local_vs_global': { en: 'Local FDCR vs Global FDCR', ja: 'ローカルFDCR対グローバルFDCR' },
  'dashboard.short_vs_long': { en: 'Short-Term vs Long-Term Impact', ja: '短期対長期影響' },
  'dashboard.positive_metrics': { en: 'Positive Metrics', ja: 'ポジティブ指標' },
  'dashboard.risk_metrics': { en: 'Risk Metrics', ja: 'リスク指標' },
  'dashboard.global_metrics': { en: 'Global Metrics', ja: 'グローバル指標' },
  'dashboard.top_generating': { en: 'Top Freedom-Generating Factors', ja: '上位・自由生成要因' },
  'dashboard.top_closing': { en: 'Top Freedom-Closing Risks', ja: '上位・自由閉鎖リスク' },
  'dashboard.improvement': { en: 'Improvement Conditions', ja: '改善条件' },
  // ── Scenarios ────────────────────────────────────────────────────────────
  'scenarios.title': { en: 'Scenario Comparison', ja: 'シナリオ比較' },
  'scenarios.empty.title': { en: 'Scenario Comparison', ja: 'シナリオ比較' },
  'scenarios.empty.body': {
    en: 'Run an audit or load a demo case to compare three scenarios side by side: Current System, Freedom-Generative Reform, and Managerial Intensification. Each scenario shows FDCR, G-FDCR, key metrics, and recommended reform direction.',
    ja: '監査を実行またはデモケースを読み込むと、現在のシステム・自由生成的改革・管理的強化の3シナリオを並列比較できます。各シナリオにFDCR・G-FDCR・主要指標・推奨改革方向が表示されます。',
  },
  'scenarios.current': { en: 'Current System', ja: '現在のシステム' },
  'scenarios.reform': { en: 'Freedom-Generative Reform', ja: '自由生成的改革' },
  'scenarios.managerial': { en: 'Managerial Intensification', ja: '管理的強化' },
  'scenarios.reform_direction': { en: 'Recommended Reform Direction', ja: '推奨改革方向' },
  'scenarios.metric_comparison': { en: 'Metric Comparison', ja: '指標比較' },
  'scenarios.load_different': { en: 'Compare with a different demo case', ja: '別のデモケースで比較する' },
  'scenarios.reform_direction.high_msjr': {
    en: 'Reduce managerial self-justification by separating efficiency metrics from freedom-generation metrics. Add independent audit body.',
    ja: '効率指標と自由生成指標を分離し、管理的自己正当化を軽減する。独立監査機関を追加する。',
  },
  'scenarios.reform_direction.low_rci': {
    en: 'Urgently add appeal mechanisms, record expiration, and reclassification pathways. The current re-entry blockage is critical.',
    ja: '異議申立・記録失効・再分類経路を緊急追加する。現在の再参入阻止は重大です。',
  },
  'scenarios.reform_direction.high_cfr': {
    en: 'Introduce record expiration, human review requirements, and reduce AI score persistence to break classification fixation.',
    ja: '記録失効・人間レビュー要件を導入し、AIスコア永続性を軽減して分類固定を打破する。',
  },
  'scenarios.reform_direction.default': {
    en: 'Prioritize democratic re-audit (DRR), lifeworld translation quality (LSAR), and bodily generation (BGR). Add burden transfer disclosure and epistemic injustice review.',
    ja: '民主的再監査（DRR）・生活世界翻訳品質（LSAR）・身体生成（BGR）を優先する。負担転嫁開示と認識的不正義レビューを追加する。',
  },
  // ── Home — Research Use ──────────────────────────────────────────────────
  'home.research_use.title': { en: 'Research Use', ja: 'リサーチ用途' },
  'home.research_use.audience': {
    en: 'Designed for independent researchers, policy analysts, AI governance researchers, civic technologists, institutional designers, and critical theory projects.',
    ja: '独立研究者・政策アナリスト・AIガバナンス研究者・市民技術者・制度設計者・批判理論プロジェクトのために設計されています。',
  },
  'home.research_use.purpose': {
    en: 'FEDS Studio is built for analyzing whether creative future-challenge remains aligned with freedom-generation, or whether institutional systems convert freedom into management, classification, optimization, burden transfer, and bureaucratic self-justification.',
    ja: 'FEDS Studioは、創造的未来挑戦が自由生成と整合しているか、あるいは制度的システムが自由を管理・分類・最適化・負担転嫁・官僚的自己正当化に変換しているかを分析するために構築されています。',
  },

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
