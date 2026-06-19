import { AuditQuestion } from '@/types/audit'
import { MetricRef } from '@/types/metric'

function m(metric: string, weight: number, polarity: 'positive' | 'negative' = 'positive'): MetricRef {
  return { metric, weight, polarity }
}

export const QUESTIONS: AuditQuestion[] = [
  { id: 'q1', text: 'To what extent does this system open genuinely new future possibilities rather than managing existing paths?', textJa: 'このシステムは既存の経路を管理するのではなく、真に新しい未来の可能性を開くか。', description: '', category: 'A', affectedMetrics: [m('CFCS', 1.2)] },
  { id: 'q2', text: 'To what extent does this system convert failures and contradictions into learning rather than punishment?', textJa: '失敗や矛盾を罰ではなく学習へ変換するか。', description: '', category: 'B', affectedMetrics: [m('DER', 1.0)] },
  { id: 'q3', text: 'How strong is the possibility for affected subjects to appeal, contest, or request review of decisions?', textJa: '当事者が決定に異議を申し立て、再審を求められる可能性はどの程度か。', description: '', category: 'C', affectedMetrics: [m('RCI', 1.2), m('DRR', 0.8), m('RBR', 1.3, 'negative')] },
  { id: 'q4', text: 'To what extent does the system use safety, fairness, or efficiency language to justify control over affected subjects?', textJa: '安全・公正・効率の言語で当事者への統制を正当化するか。', description: '', category: 'D', affectedMetrics: [m('MSJR', 1.5, 'negative')] },
  { id: 'q5', text: 'How well are bodily pain, time burdens, and care burdens preserved when life is translated into institutional categories?', textJa: '生が制度的カテゴリーに翻訳される際、身体的痛み・時間・ケア負担はどの程度保存されるか。', description: '', category: 'F', affectedMetrics: [m('LSAR', 1.0), m('EIR', 1.0, 'negative')] },
  { id: 'q6', text: 'How much can the public meaningfully contest, audit, and revise this system?', textJa: '公衆はこのシステムをどの程度有意義に争い、監査し、改訂できるか。', description: '', category: 'G', affectedMetrics: [m('DRR', 1.2)] },
  { id: 'q7', text: 'To what extent does this system protect sleep, rest, breath, and bodily recovery?', textJa: '睡眠・休息・呼吸・身体的回復をどの程度保護するか。', description: '', category: 'H', affectedMetrics: [m('BGR', 1.0), m('BBI', 0.8, 'negative')] },
  { id: 'q8', text: 'How invisible or opaque is the labor, ecological cost, or burden transfer this system depends on?', textJa: '依存する労働・生態コスト・負担転嫁はどの程度不可視か。', description: '', category: 'M', affectedMetrics: [m('BTR', 1.5, 'negative'), m('SCDR', 1.0, 'negative')] },
  { id: 'q9', text: 'To what extent does this system impose irreversible classifications that are difficult to exit?', textJa: '退出困難な不可逆的分類をどの程度課すか。', description: '', category: 'E', affectedMetrics: [m('CFR', 1.3, 'negative'), m('RBR', 1.0, 'negative'), m('MTR', 0.8, 'negative')] },
  { id: 'q10', text: 'How strongly does this system transfer its costs to other regions, generations, or vulnerable groups?', textJa: 'コストを他地域・他世代・脆弱集団へどの程度転嫁するか。', description: '', category: 'L', affectedMetrics: [m('BTR', 1.3, 'negative'), m('CDR', 1.0, 'negative'), m('FGR', 0.8, 'negative')] },
  { id: 'q11', text: 'To what extent does this system rely on opaque automated scoring presented as objective truth?', textJa: '客観的真実として提示される不透明な自動採点にどの程度依存するか。', description: '', category: 'E', affectedMetrics: [m('MTR', 1.2, 'negative'), m('TFGR', 1.0, 'negative')] },
  { id: 'q12', text: 'How much time is afforded for reflection, recovery, and appeal before consequences become final?', textJa: '帰結が確定する前に、熟慮・回復・異議のための時間がどの程度与えられるか。', description: '', category: 'C', affectedMetrics: [m('TIGR', 1.0), m('TCR', 1.0, 'negative')] },
  { id: 'q13', text: 'To what extent does the system strengthen living cooperation and care networks?', textJa: '生きた協働とケアネットワークをどの程度強化するか。', description: '', category: 'I', affectedMetrics: [m('BDER', 1.0)] },
  { id: 'q14', text: 'How clearly and fairly is responsibility distributed rather than displaced onto individuals?', textJa: '責任は個人へ転嫁されず、どの程度明確かつ公正に分配されるか。', description: '', category: 'I', affectedMetrics: [m('SRGR', 1.0), m('RDR', 1.0, 'negative')] },
  { id: 'q15', text: 'To what extent does the system silence or discredit the testimony of affected subjects?', textJa: '当事者の証言をどの程度沈黙させ、信用を損なうか。', description: '', category: 'T', affectedMetrics: [m('EIR', 1.2, 'negative')] },
  { id: 'q16', text: 'How much does this system expand policing, surveillance, or coercive state power?', textJa: '取締り・監視・強制的国家権力をどの程度拡大するか。', description: '', category: 'U', affectedMetrics: [m('SRR', 1.2, 'negative'), m('CFR', 0.6, 'negative')] },
  { id: 'q17', text: 'To what extent does this system convert basic needs into market commodities?', textJa: '基本的ニーズをどの程度市場商品へ変換するか。', description: '', category: 'V', affectedMetrics: [m('FMR', 1.2, 'negative')] },
  { id: 'q18', text: 'How heavily does this system externalize energy, compute, and carbon burdens?', textJa: 'エネルギー・計算・炭素負担をどの程度外部化するか。', description: '', category: 'K', affectedMetrics: [m('EER', 1.2, 'negative'), m('EGR', 0.8, 'negative')] },
  { id: 'q19', text: 'To what extent does this system reproduce colonial or historical injustice?', textJa: '植民地的・歴史的不正義をどの程度再生産するか。', description: '', category: 'Q', affectedMetrics: [m('CIR', 1.2, 'negative'), m('HGR', 0.8, 'negative')] },
  { id: 'q20', text: 'How well does this system provide meaningful explanation and accessible information to those affected?', textJa: '当事者に意味ある説明とアクセス可能な情報をどの程度提供するか。', description: '', category: 'J', affectedMetrics: [m('MGR', 1.0), m('IGR', 0.8)] },
  { id: 'q21', text: 'To what extent does this system normalize precarious or insecure conditions as acceptable?', textJa: '不安定な状態をどの程度許容可能なものとして常態化するか。', description: '', category: 'D', affectedMetrics: [m('NPR', 1.2, 'negative')] },
  { id: 'q22', text: 'How well does this system preserve the capacity of future generations to revise and contest it?', textJa: '未来世代が改訂・争訟する能力をどの程度保存するか。', description: '', category: 'L', affectedMetrics: [m('GSR', 1.0, 'negative'), m('FGR', 0.8, 'negative')] },
]
