'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { useAudit } from '@/lib/auditContext'

// ── Types ─────────────────────────────────────────────────────────────────────
type LayerId    = 'planetary' | 'urban' | 'body' | 'flow'
type ScenarioId = 'current' | 'reform' | 'managerial'
type TH         = 0 | 1 | 2 | 3 | 4 | 5

interface Obj {
  id: string; label: string; type: string; actors: string
  fdcr: number; gfdcr: number; efdcr: number; ebdcr: number
  burden: string; reentry: string; correction: string
}

// ── Statics ───────────────────────────────────────────────────────────────────
const LAYERS = [
  { id:'planetary' as LayerId, label:'Planetary View'     },
  { id:'urban'     as LayerId, label:'Urban-Nature'       },
  { id:'body'      as LayerId, label:'Body-Lifeworld'     },
  { id:'flow'      as LayerId, label:'Institutional Flow' },
]
const SCENARIOS = [
  { id:'current'    as ScenarioId, label:'Current System',             color:'#fbbf24' },
  { id:'reform'     as ScenarioId, label:'Freedom-Generative Reform',  color:'#4ade80' },
  { id:'managerial' as ScenarioId, label:'Managerial Intensification', color:'#ef4444' },
]
const TH_LABELS = ['Immediate','1 yr','5 yr','10 yr','25 yr','Future gen.']

const OVERLAYS = [
  { group:'Metrics', items:[
    {id:'FDCR',c:'#4ade80'},{id:'GFDCR',c:'#4ade80'},{id:'EFDCR',c:'#34d399'},
    {id:'EBDCR',c:'#34d399'},{id:'BGR',c:'#60a5fa'},{id:'RCI',c:'#60a5fa'},
  ]},
  { group:'Risk', items:[
    {id:'MSJR',c:'#ef4444'},{id:'CFR',c:'#ef4444'},{id:'RBR',c:'#f97316'},
    {id:'BTR',c:'#f97316'},{id:'EER',c:'#fbbf24'},{id:'EPBTM',c:'#fbbf24'},
  ]},
  { group:'Thematic', items:[
    {id:'urban_body',c:'#f97316'},{id:'spatial_class',c:'#ef4444'},
    {id:'eco_extract',c:'#f97316'},{id:'reentry',c:'#fbbf24'},{id:'future_gen',c:'#a78bfa'},
  ]},
]

// ── Metric math ───────────────────────────────────────────────────────────────
const cl = (v:number) => Math.max(3,Math.min(97,v))
function calc(base:Record<string,number>, sc:ScenarioId, th:TH) {
  const s = sc==='reform'?8:sc==='managerial'?-10:0
  const t = th*(sc==='reform'?1.8:sc==='managerial'?-2.2:-0.6)
  const rs = -s*0.9, rt = -t*0.9
  return {
    FDCR:cl(base.FDCR+s+t), GFDCR:cl(base.GFDCR+s+t),
    EFDCR:cl(base.EFDCR+s*0.85+t), EBDCR:cl(base.EBDCR+s*0.75+t*0.8),
    BTR:cl(base.BTR+rs+rt), MSJR:cl(base.MSJR+rs+rt),
    CFR:cl(base.CFR+rs*0.9+rt), RBR:cl(base.RBR+rs*0.8+rt*0.9),
    BGR:cl(base.BGR+s*0.7+t*0.6), RCI:cl(base.RCI+s*0.6+t*0.5),
  }
}
const fc = (v:number) => v>=60?'#4ade80':v>=45?'#fbbf24':v>=30?'#f97316':'#ef4444'
const rc = (v:number) => v>70?'#ef4444':v>50?'#f97316':v>35?'#fbbf24':'#4ade80'
const mc = (k:string,v:number) => ['BTR','MSJR','CFR','RBR','EER','EPBTM'].includes(k)?rc(v):fc(v)

// ── Globe math ─────────────────────────────────────────────────────────────────
const GCX=355,GCY=235,GR=178,GL0=18
const ortho=(lat:number,lon:number)=>{
  const φ=lat*Math.PI/180, λ=(lon-GL0)*Math.PI/180
  return {x:GCX+GR*Math.cos(φ)*Math.sin(λ), y:GCY-GR*Math.sin(φ), vis:Math.cos(φ)*Math.cos(λ)>-0.05}
}

// Continental outlines (simplified lat/lon polylines)
const CONT_PATHS: Array<{id:string;pts:Array<[number,number]>}> = [
  {id:'NA', pts:[[70,-140],[68,-100],[60,-90],[55,-80],[48,-65],[42,-70],[35,-75],[25,-80],[18,-92],[15,-88],[10,-84],[9,-79],[12,-72],[17,-67],[25,-78],[32,-80],[38,-75],[42,-70],[49,-67],[60,-64],[70,-80],[70,-140]]},
  {id:'SA', pts:[[12,-72],[8,-60],[2,-52],[0,-50],[-5,-35],[-10,-37],[-15,-39],[-23,-43],[-33,-54],[-42,-63],[-54,-68],[-55,-65],[-45,-65],[-35,-57],[-22,-41],[-5,-35],[0,-50],[5,-52],[8,-60],[12,-72]]},
  {id:'EU', pts:[[70,25],[60,28],[55,22],[50,20],[46,22],[44,28],[37,22],[36,6],[43,-8],[47,-2],[52,2],[52,5],[55,8],[57,10],[60,28],[65,24],[70,25]]},
  {id:'AF', pts:[[37,10],[30,32],[22,37],[12,42],[2,41],[-4,39],[-10,40],[-26,33],[-34,27],[-34,18],[-28,17],[-20,13],[-6,10],[0,9],[4,8],[3,2],[4,-5],[4,-2],[5,2],[8,3],[15,0],[22,10],[30,32],[37,10]]},
  {id:'AS', pts:[[70,25],[70,142],[60,142],[55,132],[42,132],[38,120],[35,122],[22,112],[12,110],[2,105],[1,104],[0,105],[-8,115],[-8,142],[0,142],[10,127],[18,112],[22,112],[35,122],[42,132],[55,132],[60,142],[70,142],[70,25]]},
  {id:'OC', pts:[[-10,130],[-10,152],[-25,154],[-38,146],[-38,140],[-35,136],[-22,114],[-15,127],[-10,130]]},
]

const REGIONS=[
  {id:'NA',label:'North America',  lat:42, lon:-100,b:61},
  {id:'EU',label:'Europe',         lat:51, lon:12,  b:57},
  {id:'AS',label:'Asia-Pacific',   lat:28, lon:108, b:43},
  {id:'LA',label:'Latin America',  lat:-12,lon:-65, b:37},
  {id:'AF',label:'Africa',         lat:-5, lon:22,  b:27},
  {id:'ME',label:'Middle East',    lat:27, lon:46,  b:32},
  {id:'SA',label:'South Asia',     lat:22, lon:82,  b:34},
]
const BURDEN_ARCS=[
  {from:'NA',to:'AF',w:3.5},{from:'EU',to:'AF',w:2.8},
  {from:'NA',to:'LA',w:2.2},{from:'EU',to:'LA',w:1.8},
  {from:'AS',to:'SA',w:1.6},{from:'ME',to:'AF',w:1.4},
]
const EXTRACT=[
  {lat:-3,lon:23,label:'Congo Basin'},{lat:-5,lon:-60,label:'Amazon'},
  {lat:25,lon:50,label:'Gulf'},{lat:14,lon:5,label:'Sahel'},
]
const COMPUTE=[{lat:37,lon:-122,label:'AI/US'},{lat:35,lon:110,label:'AI/CN'},{lat:53,lon:10,label:'AI/EU'}]
const CLIMATE=[{lat:-10,lon:175,label:'Pacific'},{lat:16,lon:12,label:'Sahel-D'},{lat:11,lon:105,label:'Mekong'}]
const FUTGEN=[{lat:55,lon:25},{lat:-20,lon:135},{lat:12,lon:15}]

// ── Urban isometric ────────────────────────────────────────────────────────────
// Each cell: origin at bottom-front corner of block
// SX=step in screen-x per col/row, SY=step in screen-y per col/row
const U={OX:345,OY:155,SX:26,SY:13}
const isoFront=(c:number,r:number)=>({x:U.OX+(c-r)*U.SX, y:U.OY+(c+r)*U.SY})

function cellH(c:number,r:number,sc:ScenarioId,th:TH):number {
  const dist=Math.sqrt((c-3.5)**2+(r-2.5)**2)
  const h=((c*7+r*13)%17)/17
  const base=Math.max(6,Math.min(90,65-dist*8+h*22-4))
  const sm=sc==='reform'?10:sc==='managerial'?-14:0
  const tm=th*(sc==='reform'?1.5:sc==='managerial'?-1.8:-0.4)
  return Math.max(6,Math.min(90,base+sm+tm))
}

function bclr(v:number,green:boolean,eco:boolean):{top:string;L:string;R:string} {
  if(eco)  return {top:'#0e3a16',L:'#082510',R:'#041408'}
  if(green)return {top:'#143a20',L:'#0c2614',R:'#07160b'}
  if(v>=70)return {top:'#1a3820',L:'#112414',R:'#0a1409'}
  if(v>=55)return {top:'#232c12',L:'#161c0c',R:'#0d1107'}
  if(v>=40)return {top:'#382610',L:'#241808',R:'#160e05'}
  if(v>=25)return {top:'#381610',L:'#240e08',R:'#160805'}
  return         {top:'#2e0c0c',L:'#1e0808',R:'#120404'}
}

const GREEN_SET=new Set([7,14,21,28,35,42,33,34])
const ECO_SET  =new Set([38,39,46,47])
const RENT_SET =new Set([0,1,2,8,9,10])
const SURV_POS =[{c:2,r:4},{c:4,r:5}]
const CIVIC:{[k:string]:{sym:string;color:string;label:string}}= {
  '1_1':{sym:'H',color:'#34d399',label:'Hospital'},
  '5_1':{sym:'S',color:'#60a5fa',label:'School'},
  '3_3':{sym:'W',color:'#a78bfa',label:'Welfare'},
  '6_4':{sym:'R',color:'#fbbf24',label:'Re-entry'},
}

// ── Body-Lifeworld nodes ───────────────────────────────────────────────────────
interface BNode{id:string;label:string;x:number;y:number;r:number;color:string;type:string;bl:number}
const BN:BNode[]=[
  {id:'SUBJECT',  label:'Subject Body',   x:355,y:240,r:18,color:'#7ac8f8',type:'actor',   bl:55},
  {id:'SLEEP',    label:'Sleep',          x:210,y:142,r:11,color:'#4a6a8a',type:'sustain', bl:40},
  {id:'COMMUTE',  label:'Commute',        x:500,y:142,r:10,color:'#6a5030',type:'burden',  bl:72},
  {id:'WORK',     label:'Work',           x:190,y:218,r:12,color:'#3a5a72',type:'burden',  bl:68},
  {id:'CARE',     label:'Care labour',    x:520,y:218,r:10,color:'#5a4880',type:'burden',  bl:74},
  {id:'HEALTH',   label:'Health',         x:355,y:112,r:10,color:'#2a7060',type:'sustain', bl:48},
  {id:'WAIT',     label:'Wait/queue',     x:260,y:310,r:9, color:'#7a4810',type:'burden',  bl:80},
  {id:'APPEAL',   label:'Appeal',         x:450,y:310,r:9, color:'#2a6a40',type:'freedom', bl:28},
  {id:'SURV',     label:'Surveillance',   x:235,y:360,r:15,color:'#c83020',type:'barrier', bl:84},
  {id:'CLASS',    label:'Classification', x:475,y:360,r:15,color:'#c86020',type:'barrier', bl:80},
  {id:'INSTPRES', label:'Inst. pressure', x:355,y:358,r:10,color:'#a05010',type:'barrier', bl:70},
  {id:'RECOV',    label:'Recovery',       x:540,y:288,r:8, color:'#2a8050',type:'freedom', bl:25},
  {id:'TEMPORAL', label:'Time compress',  x:170,y:308,r:8, color:'#8060a0',type:'compress',bl:68},
  {id:'FREE',     label:'Freedom',        x:355,y:418,r:12,color:'#4ade80',type:'freedom', bl:18},
]
const BE=[
  {from:'SUBJECT',to:'SLEEP',    t:'sustain',w:1.5},{from:'SUBJECT',to:'COMMUTE',  t:'burden', w:2  },
  {from:'SUBJECT',to:'WORK',     t:'burden', w:2  },{from:'SUBJECT',to:'CARE',     t:'burden', w:1.5},
  {from:'SUBJECT',to:'HEALTH',   t:'sustain',w:1.5},{from:'SUBJECT',to:'WAIT',     t:'burden', w:1.5},
  {from:'SUBJECT',to:'APPEAL',   t:'freedom',w:1  },{from:'SURV',   to:'SUBJECT',  t:'barrier',w:2.5},
  {from:'CLASS',  to:'SUBJECT',  t:'barrier',w:2.5},{from:'INSTPRES',to:'SUBJECT', t:'barrier',w:1.5},
  {from:'TEMPORAL',to:'WORK',    t:'compress',w:1 },{from:'TEMPORAL',to:'WAIT',    t:'compress',w:1 },
  {from:'SURV',   to:'CLASS',    t:'barrier',w:1.5},{from:'WAIT',   to:'APPEAL',   t:'neutral', w:1 },
  {from:'APPEAL', to:'FREE',     t:'freedom',w:1.2},{from:'SLEEP',  to:'RECOV',    t:'sustain', w:1 },
  {from:'SUBJECT',to:'FREE',     t:'freedom',w:1  },
]
const EC:{[k:string]:string}={
  freedom:'#4ade80',burden:'#ef4444',barrier:'#f97316',
  sustain:'#3a6a9a',neutral:'#2a4a6a',compress:'#a060c0',
}

// Time ring (24h)
const TR=[
  {label:'Sleep',   h:7,  c:'#1a3a6a'},
  {label:'Commute', h:2.5,c:'#5a3a10'},
  {label:'Work',    h:8,  c:'#1a3a5a'},
  {label:'Care',    h:2.5,c:'#3a2860'},
  {label:'Wait',    h:1.5,c:'#5a2808'},
  {label:'Appeal',  h:0.5,c:'#0a3a20'},
  {label:'Free',    h:2,  c:'#0a2e18'},
]

// ── Institutional flow ─────────────────────────────────────────────────────────
interface FN{id:string;label:string;x:number;y:number;shape:string;color:string;tag?:string;tagLabel?:string}
const FNS:FN[]=[
  {id:'ENTRY',   label:'Entry',              x:355,y:44, shape:'diamond',color:'#8060c0'},
  {id:'APP',     label:'Application Screen', x:355,y:98, shape:'rect',   color:'#3a6a9a'},
  {id:'DATA',    label:'Data Intake',        x:355,y:155,shape:'rect',   color:'#3a6a9a',tag:'TEI',tagLabel:'Testimony Erasure'},
  {id:'AI',      label:'AI Scoring',         x:355,y:218,shape:'circle', color:'#c83020',tag:'CFR',tagLabel:'Classification Fixation'},
  {id:'CLASS',   label:'Classification',     x:355,y:282,shape:'rect',   color:'#c06020',tag:'CFR',tagLabel:'Classification Fixation'},
  {id:'DEMO',    label:'Democratic Review',  x:185,y:218,shape:'circle', color:'#2a8040',tag:'COR',tagLabel:'Correction Mechanism'},
  {id:'BURO',    label:'Bureau Review',      x:185,y:282,shape:'rect',   color:'#5a5030',tag:'MSJR',tagLabel:'Responsibility Displacement'},
  {id:'APPROVE', label:'Approval',           x:185,y:358,shape:'diamond',color:'#2a8040'},
  {id:'REJECT',  label:'Rejection',          x:510,y:358,shape:'rect',   color:'#c83020',tag:'RBR',tagLabel:'Re-entry Blockage'},
  {id:'APPEAL',  label:'Appeal',             x:560,y:218,shape:'circle', color:'#3a6a9a'},
  {id:'REENTRY', label:'Re-entry Gate',      x:185,y:432,shape:'rect',   color:'#a07020',tag:'RBR',tagLabel:'Re-entry Blockage'},
  {id:'EXCL',    label:'Exclusion',          x:510,y:432,shape:'rect',   color:'#c83020'},
]
const FE=[
  {from:'ENTRY',  to:'APP',    t:'neutral',pct:''},
  {from:'APP',    to:'DATA',   t:'neutral',pct:''},
  {from:'DATA',   to:'AI',     t:'neutral',pct:''},
  {from:'AI',     to:'CLASS',  t:'neutral',pct:''},
  {from:'AI',     to:'DEMO',   t:'freedom',pct:'25%'},
  {from:'CLASS',  to:'BURO',   t:'neutral',pct:''},
  {from:'BURO',   to:'APPROVE',t:'freedom',pct:'35%'},
  {from:'BURO',   to:'REJECT', t:'burden', pct:'65%'},
  {from:'DEMO',   to:'APPROVE',t:'freedom',pct:''},
  {from:'REJECT', to:'APPEAL', t:'neutral',pct:'25%'},
  {from:'APPEAL', to:'APPROVE',t:'freedom',pct:'30%'},
  {from:'APPEAL', to:'EXCL',   t:'barrier',pct:'70%'},
  {from:'APPROVE',to:'REENTRY',t:'neutral',pct:''},
  {from:'REJECT', to:'EXCL',   t:'barrier',pct:'75%'},
]

// ── Inspector presets ─────────────────────────────────────────────────────────
const PRESETS:{[k:string]:Partial<Obj>}={
  'p-AF':{label:'Africa',type:'Global Region',actors:'Sub-Saharan & North African populations',fdcr:27,gfdcr:24,efdcr:19,ebdcr:16,burden:'NA→AF (EP-BTM primary), EU→AF (secondary), ME→AF (tertiary). Highest burden reception globally.',reentry:'Structural exclusion from global governance. Debt obligation limits sovereign re-entry.',correction:'Extraction reparations, debt cancellation, climate adaptation finance, technology transfer.'},
  'p-NA':{label:'North America',type:'Global Region',actors:'US/Canada/Indigenous populations',fdcr:61,gfdcr:58,efdcr:48,ebdcr:44,burden:'NA exports burden to AF (primary) and LA (secondary) via extraction supply chains.',reentry:'High classification risk for racialised and Indigenous subjects.',correction:'Supply chain accountability, carbon pricing, technology transfer obligations.'},
  'p-EU':{label:'Europe',type:'Global Region',actors:'EU and European populations',fdcr:57,gfdcr:55,efdcr:44,ebdcr:40,burden:'EU→AF colonial legacy, EU→LA debt burden arc.',reentry:'AI-driven border classification: high CFR. Asylum classification risk.',correction:'Colonial reparations, climate finance, migration CFR reduction.'},
  'p-AS':{label:'Asia-Pacific',type:'Global Region',actors:'East and Southeast Asian populations',fdcr:43,gfdcr:40,efdcr:35,ebdcr:31,burden:'Climate displacement from Pacific. Manufacturing burden from Global North.',reentry:'High surveillance infrastructure. AI classification at scale.',correction:'Pacific climate adaptation finance. Surveillance accountability.'},
  'p-LA':{label:'Latin America',type:'Global Region',actors:'Latin American & Caribbean populations',fdcr:37,gfdcr:34,efdcr:30,ebdcr:27,burden:'NA→LA and EU→LA extraction and debt burden.',reentry:'Debt burden limits institutional re-entry.',correction:'Debt restructuring, extraction revenue repatriation.'},
  'p-ME':{label:'Middle East',type:'Global Region',actors:'MENA populations',fdcr:32,gfdcr:29,efdcr:26,ebdcr:22,burden:'ME→AF petroleum-linked burden. Climate risk compounding.',reentry:'Conflict-linked classification constrains re-entry.',correction:'Transition finance, democratic review mechanisms.'},
  'p-SA':{label:'South Asia',type:'Global Region',actors:'South Asian populations',fdcr:34,gfdcr:31,efdcr:27,ebdcr:24,burden:'Climate displacement burden. AI classification from northern-built systems.',reentry:'Climate displacement constrains re-entry.',correction:'Climate adaptation finance, AI accountability.'},
  'f-AI':{label:'AI Scoring Engine',type:'Algorithmic System',actors:'All applicants (automated)',fdcr:22,gfdcr:20,efdcr:18,ebdcr:15,burden:'AI Scoring → Classification → Rejection → Exclusion Zone',reentry:'Prior AI score persists. Audit unavailable to subject.',correction:'Mandatory explainability. Democratic review gate. Subject contestation right.'},
  'f-DEMO':{label:'Democratic Review',type:'Correction Mechanism',actors:'Review panel; subject',fdcr:72,gfdcr:68,efdcr:62,ebdcr:58,burden:'Bypassed in 75% of cases (current). Redirects to Approval when active.',reentry:'Democratic review activation enables re-entry bypass of AI pipeline.',correction:'Make democratic review mandatory for all AI-scored cases.'},
  'f-EXCL':{label:'Exclusion Zone',type:'Terminal Outcome',actors:'Excluded subjects',fdcr:8,gfdcr:7,efdcr:6,ebdcr:5,burden:'Terminal burden sink. No outgoing pathways.',reentry:'No automatic expiry. No appeal within exclusion zone.',correction:'Mandatory appeal access. Time-limited classification expiry. Democratic override trigger.'},
  'f-DATA':{label:'Data Intake',type:'Data Processing',actors:'Subject (passive)',fdcr:40,gfdcr:37,efdcr:32,ebdcr:29,burden:'Surveillance data aggregated. Lifeworld testimony excluded from record.',reentry:'Data record influences all future re-entry assessments.',correction:'Data minimisation. Subject audit right. Testimony inclusion requirement.'},
  'b-SURV':{label:'Surveillance',type:'Barrier Node',actors:'All subjects',fdcr:20,gfdcr:18,efdcr:15,ebdcr:13,burden:'Surveillance → AI pipeline → Classification Gate → Subject Body',reentry:'Prior surveillance record constrains re-entry. No subject audit.',correction:'Data minimisation. Subject right to audit. Surveillance accountability.'},
  'b-FREE':{label:'Freedom Space',type:'Target State',actors:'~25% of subject population',fdcr:78,gfdcr:74,efdcr:68,ebdcr:62,burden:'No outgoing burden. Correction destination.',reentry:'Accessed via successful appeal or classification bypass.',correction:'Remove upstream surveillance and classification barriers.'},
  'b-SUBJECT':{label:'Subject Body',type:'Actor Node',actors:'All subjects',fdcr:47,gfdcr:44,efdcr:40,ebdcr:36,burden:'Central convergence: surveillance, classification, care, commute, institutional pressure.',reentry:'Re-entry capacity determined by freedom-space access and barrier reduction.',correction:'Reduce burden node intensities upstream. Expand Freedom Space access.'},
}

function mkObj(id:string, p:Partial<Obj>):Obj {
  return {id,label:p.label??id,type:p.type??'Node',actors:p.actors??'Subject population',
    fdcr:p.fdcr??45,gfdcr:p.gfdcr??42,efdcr:p.efdcr??40,ebdcr:p.ebdcr??38,
    burden:p.burden??'Burden pathway under analysis.',reentry:p.reentry??'Re-entry conditions apply.',
    correction:p.correction??'Democratic oversight required.'}
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function SimPage() {
  const { scoreResult, loadDemoCase } = useAudit()
  const [layer,     setLayer]     = useState<LayerId>('planetary')
  const [scenario,  setScenario]  = useState<ScenarioId>('current')
  const [th,        setTH]        = useState<TH>(0)
  const [overlays,  setOverlays]  = useState(()=>new Set(['FDCR','BTR','eco_extract','spatial_class']))
  const [sel,       setSel]       = useState<Obj|null>(null)
  const [tick,      setTick]      = useState(0)

  useEffect(()=>{ if(!scoreResult) loadDemoCase('ai_hiring') },[]) // eslint-disable-line
  useEffect(()=>{ const id=setInterval(()=>setTick(t=>(t+1)%600),90); return()=>clearInterval(id) },[])

  const toggleOv=(id:string)=>setOverlays(p=>{const n=new Set(p);n.has(id)?n.delete(id):n.add(id);return n})

  const baseM=useMemo(()=>{
    if(!scoreResult) return{FDCR:47,GFDCR:44,EFDCR:41,EBDCR:38,BTR:58,MSJR:62,CFR:55,RBR:51,BGR:42,RCI:38}
    return{FDCR:scoreResult.fdcr,GFDCR:scoreResult.gfdcr,
      EFDCR:scoreResult.ecoScores?.['E-FDCR']??41,EBDCR:scoreResult.ecoScores?.EBDCR??38,
      BTR:(scoreResult.metrics as any)?.BTR??58,MSJR:(scoreResult.metrics as any)?.MSJR??62,
      CFR:(scoreResult.metrics as any)?.CFR??55,RBR:(scoreResult.metrics as any)?.RBR??51,
      BGR:(scoreResult.metrics as any)?.BGR??42,RCI:(scoreResult.metrics as any)?.RCI??38}
  },[scoreResult])
  const m=useMemo(()=>calc(baseM,scenario,th),[baseM,scenario,th])

  function pick(presetKey:string,fallback:Partial<Obj>){
    const p=PRESETS[presetKey]??fallback
    setSel(mkObj(presetKey,p))
  }

  const dOff=-(tick*0.9)
  const pulse=0.5+0.5*Math.sin(tick*0.13)
  const scOpt=SCENARIOS.find(s=>s.id===scenario)!

  // ── PLANETARY ──────────────────────────────────────────────────────────────
  const PlanetaryCanvas=useCallback(()=>{
    const lats=[-60,-30,0,30,60]
    const lons=[-90,-30,30,90]
    function contD(pts:Array<[number,number]>){
      return pts.map(([lat,lon],i)=>{
        const p=ortho(lat,lon)
        return(i===0?'M':p.vis?'L':'M')+`${p.x.toFixed(1)},${p.y.toFixed(1)}`
      }).join(' ')
    }
    const regions=REGIONS.map(r=>{
      const sm=scenario==='reform'?8:scenario==='managerial'?-10:0
      const tm=th*(scenario==='reform'?1.8:scenario==='managerial'?-2.2:-0.6)
      const adj=Math.max(5,Math.min(95,r.b+sm+tm))
      return{...r,adj,...ortho(r.lat,r.lon)}
    })
    return(
      <svg viewBox="0 0 710 476" className="w-full h-full" style={{background:'#020810'}}>
        <defs>
          <radialGradient id="gBg" cx="38%" cy="33%">
            <stop offset="0%" stopColor="#0d2040"/>
            <stop offset="65%" stopColor="#060e22"/>
            <stop offset="100%" stopColor="#020610"/>
          </radialGradient>
          <radialGradient id="gAtm" cx="50%" cy="50%">
            <stop offset="68%" stopColor="transparent"/>
            <stop offset="100%" stopColor="#0a2850" stopOpacity="0.45"/>
          </radialGradient>
          <filter id="gGlow4"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <filter id="gGlow2"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <clipPath id="gClip"><circle cx={GCX} cy={GCY} r={GR}/></clipPath>
          <style>{`.ga{stroke-dasharray:9 5;stroke-dashoffset:${dOff}}.gb{stroke-dasharray:4 8;stroke-dashoffset:${dOff*0.6}}`}</style>
        </defs>
        {/* atmosphere */}
        <circle cx={GCX} cy={GCY} r={GR+36} fill="url(#gAtm)"/>
        <circle cx={GCX} cy={GCY} r={GR+20} fill="none" stroke="#0a3060" strokeWidth="1.5" opacity="0.35"/>
        {/* globe body */}
        <circle cx={GCX} cy={GCY} r={GR} fill="url(#gBg)"/>
        {/* latitude lines */}
        {lats.map(lat=>{const φ=lat*Math.PI/180;const y=GCY-GR*Math.sin(φ);const hw=GR*Math.cos(φ);return<line key={lat} x1={GCX-hw} y1={y} x2={GCX+hw} y2={y} stroke="#0c1e36" strokeWidth="0.8" opacity="0.7"/>})}
        {/* longitude ellipses */}
        {lons.map(lon=>{const λ=(lon-GL0)*Math.PI/180;const rx=Math.abs(GR*Math.sin(λ));return rx>4?<ellipse key={lon} cx={GCX} cy={GCY} rx={rx} ry={GR} fill="none" stroke="#0c1e36" strokeWidth="0.8" opacity="0.7" clipPath="url(#gClip)"/>:null})}
        {/* equator */}
        <line x1={GCX-GR} y1={GCY} x2={GCX+GR} y2={GCY} stroke="#142840" strokeWidth="1.2" opacity="0.6"/>
        {/* continental shapes */}
        {CONT_PATHS.map(ct=><path key={ct.id} d={contD(ct.pts)} fill="#0c1e32" stroke="#1a3050" strokeWidth="0.9" opacity="0.85" clipPath="url(#gClip)"/>)}
        {/* burden arcs (animated dashes) */}
        {BURDEN_ARCS.map((arc,i)=>{
          const A=regions.find(r=>r.id===arc.from)!,B=regions.find(r=>r.id===arc.to)!
          if(!A.vis||!B.vis) return null
          const mx=(A.x+B.x)/2,my=(A.y+B.y)/2-75
          return<g key={i}>
            <path d={`M${A.x},${A.y} Q${mx},${my} ${B.x},${B.y}`} fill="none" stroke="#ef4444" strokeWidth={arc.w} opacity="0.35" className="ga"/>
            <path d={`M${A.x},${A.y} Q${mx},${my} ${B.x},${B.y}`} fill="none" stroke="#f87171" strokeWidth={arc.w*0.4} opacity="0.65" className="ga"/>
          </g>
        })}
        {/* extraction zones */}
        {overlays.has('eco_extract')&&EXTRACT.map((z,i)=>{const p=ortho(z.lat,z.lon);if(!p.vis)return null;return<g key={i} style={{cursor:'pointer'}} onClick={()=>pick('p-extr',{label:z.label,type:'Extraction Zone',fdcr:18,gfdcr:16,efdcr:13,ebdcr:11,burden:`${z.label}: resource extraction burden exported northward.`,reentry:'Excluded from formal governance of extraction proceeds.',correction:'Extraction reparations, revenue repatriation mandate.'})}>
          <circle cx={p.x} cy={p.y} r={(6+pulse*4)} fill="#f97316" opacity="0.12"/>
          <circle cx={p.x} cy={p.y} r="7" fill="#f97316" opacity="0.9" filter="url(#gGlow2)"/>
          <text x={p.x+10} y={p.y+3} fontSize="7.5" fill="#f97316" fontFamily="monospace" opacity="0.85">⬡ {z.label}</text>
        </g>})}
        {/* AI compute nodes */}
        {overlays.has('FDCR')&&COMPUTE.map((n,i)=>{const p=ortho(n.lat,n.lon);if(!p.vis)return null;return<g key={i} style={{cursor:'pointer'}} onClick={()=>pick('p-ai',{label:n.label,type:'AI Compute Node',fdcr:25,gfdcr:22,efdcr:20,ebdcr:18,burden:'AI compute concentrated in Global North; classification burden exported globally.',reentry:'AI-scored subjects have no audit access to scoring logic.',correction:'Explainability mandate, distributed governance, subject contestation right.'})}>
          <circle cx={p.x} cy={p.y} r={5+pulse*3} fill="none" stroke="#a78bfa" strokeWidth="1.2" opacity="0.5"/>
          <circle cx={p.x} cy={p.y} r="6" fill="#a78bfa" opacity="0.9" filter="url(#gGlow2)"/>
          <text x={p.x+9} y={p.y+3} fontSize="7.5" fill="#a78bfa" fontFamily="monospace">◈ {n.label}</text>
        </g>})}
        {/* climate displacement */}
        {overlays.has('future_gen')&&CLIMATE.map((z,i)=>{const p=ortho(z.lat,z.lon);if(!p.vis)return null;return<g key={i}><circle cx={p.x} cy={p.y} r="6" fill="#60a5fa" opacity="0.85" filter="url(#gGlow2)"/><text x={p.x+9} y={p.y+3} fontSize="7" fill="#60a5fa" fontFamily="monospace">◈ {z.label}</text></g>})}
        {/* future-gen burden dotted rings */}
        {overlays.has('future_gen')&&FUTGEN.map((z,i)=>{const p=ortho(z.lat,z.lon);if(!p.vis)return null;return<g key={i}><circle cx={p.x} cy={p.y} r="8" fill="none" stroke="#a78bfa" strokeWidth="1.5" className="gb" opacity="0.7"/><circle cx={p.x} cy={p.y} r="3" fill="#a78bfa" opacity="0.6"/></g>})}
        {/* regional nodes */}
        {regions.map(r=>{if(!r.vis)return null;const color=fc(r.adj);const nr=8+(r.adj/100)*10;const isSel=sel?.id===`p-${r.id}`;return<g key={r.id} style={{cursor:'pointer'}} onClick={()=>pick(`p-${r.id}`,{label:r.label,fdcr:Math.round(r.adj)})}>
          {isSel&&<circle cx={r.x} cy={r.y} r={nr+9} fill="none" stroke="#7ac8f8" strokeWidth="2" opacity="0.9"/>}
          <circle cx={r.x} cy={r.y} r={nr+5} fill={color} opacity="0.1"/>
          <circle cx={r.x} cy={r.y} r={nr} fill={color} opacity="0.92" filter="url(#gGlow4)"/>
          <text x={r.x} y={r.y-nr-6} textAnchor="middle" fontSize="8.5" fill={color} fontFamily="monospace" fontWeight="700">{r.id} {Math.round(r.adj)}</text>
        </g>})}
        {/* globe rim + ticks */}
        <circle cx={GCX} cy={GCY} r={GR} fill="none" stroke="#1e3a58" strokeWidth="1.5" opacity="0.7"/>
        {[0,45,90,135,180,225,270,315].map(a=>{const rad=a*Math.PI/180;return<line key={a} x1={GCX+(GR)*Math.cos(rad)} y1={GCY+(GR)*Math.sin(rad)} x2={GCX+(GR+7)*Math.cos(rad)} y2={GCY+(GR+7)*Math.sin(rad)} stroke="#1e3a58" strokeWidth="0.9"/>})}
        {/* legend */}
        <text x="18" y="440" fontSize="7" fill="#1a3a5a" fontFamily="monospace">● Node size = FDCR  — Red = EP-BTM burden arc  ⬡ Orange = extraction  ◈ Purple = AI compute  ◈ Blue = climate  ◯ Purple dotted = future-gen burden</text>
      </svg>
    )
  },[scenario,th,overlays,sel,dOff,pulse])

  // ── URBAN-NATURE ──────────────────────────────────────────────────────────
  const UrbanCanvas=useCallback(()=>{
    const cells:{col:number;row:number;idx:number}[]=[]
    for(let r=0;r<6;r++) for(let c=0;c<8;c++) cells.push({col:c,row:r,idx:r*8+c})
    cells.sort((a,b)=>(a.col+a.row)-(b.col+b.row))
    const pt=(arr:{x:number;y:number}[])=>arr.map(p=>`${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
    // commute route: front-centre diagonal
    const cRoute=[0,1,2,3,4,5].map(i=>isoFront(i,i))
    const cRoute2=[7,7,7,7,7,7].map((_,i)=>isoFront(7,i))

    return(
      <svg viewBox="0 0 710 476" className="w-full h-full" style={{background:'#020810'}}>
        <defs>
          <filter id="uGlow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <style>{`.uca{stroke-dasharray:7 5;stroke-dashoffset:${dOff}}`}</style>
        </defs>
        {/* ground plane tint */}
        <rect x="0" y="0" width="710" height="476" fill="#020810"/>
        {/* subtle ground grid */}
        {Array.from({length:14},(_,i)=><line key={i} x1={U.OX+(i-5)*U.SX*2} y1={U.OY-50} x2={U.OX+(i-5)*U.SX*2-7*U.SX} y2={U.OY-50+7*U.SY*2} stroke="#08182a" strokeWidth="0.5" opacity="0.5"/>)}
        {/* commute routes */}
        {overlays.has('urban_body')&&<>
          <polyline points={cRoute.map(f=>`${f.x},${f.y-3}`).join(' ')} fill="none" stroke="#7a5020" strokeWidth="3" opacity="0.6" className="uca"/>
          <polyline points={cRoute2.map(f=>`${f.x},${f.y-3}`).join(' ')} fill="none" stroke="#7a5020" strokeWidth="2.5" opacity="0.5" className="uca"/>
        </>}
        {/* rent burden zone glow */}
        {overlays.has('spatial_class')&&<ellipse cx={isoFront(1,0).x} cy={isoFront(1,0).y+10} rx="70" ry="40" fill="#ef4444" opacity="0.05"/>}
        {/* heat burden zone */}
        {overlays.has('urban_body')&&<><ellipse cx={U.OX-30} cy={U.OY+90} rx="75" ry="40" fill="#f97316" opacity="0.07"/><ellipse cx={U.OX+110} cy={U.OY+110} rx="55" ry="35" fill="#f97316" opacity="0.07"/></>}
        {/* blocks */}
        {cells.map(({col,row,idx})=>{
          const v=cellH(col,row,scenario,th)
          const h=v*0.7+5
          const f=isoFront(col,row)
          const green=GREEN_SET.has(idx), eco=ECO_SET.has(idx), rent=RENT_SET.has(idx)
          const civic=CIVIC[`${col}_${row}`]
          const isSurv=SURV_POS.some(s=>s.c===col&&s.r===row)
          const clr=bclr(v,green,eco)
          const isSel=sel?.id===`u-${col}-${row}`

          const tN={x:f.x,         y:f.y-2*U.SY-h}
          const tE={x:f.x+U.SX,   y:f.y-U.SY-h}
          const tS={x:f.x,         y:f.y-h}
          const tW={x:f.x-U.SX,   y:f.y-U.SY-h}
          const gE={x:f.x+U.SX,   y:f.y-U.SY}
          const gS={x:f.x,         y:f.y}
          const gW={x:f.x-U.SX,   y:f.y-U.SY}
          return(
            <g key={idx} style={{cursor:'pointer'}} onClick={()=>pick(`u-${col}-${row}`,{
              label:civic?civic.label:eco?'Eco-Repair Zone':green?'Green Corridor':rent?'Rent Burden Zone':`District ${col},${row}`,
              type:civic?civic.label:eco?'Ecological Repair':green?'Green Corridor':rent?'Rent Zone':'Urban District',
              actors:'Urban subject population',
              fdcr:Math.round(v),gfdcr:Math.round(v*0.93),efdcr:Math.round(v*0.88),ebdcr:Math.round(v*0.82),
              burden:v<40?'Low-FDCR district: surveillance density high, subject classification burden elevated.':eco?'Ecological repair zone: buffer against urban heat and ecological extraction.':'Moderate burden pathway.',
              reentry:rent?'High rent burden constrains re-entry to formal housing and welfare systems.':civic?.label==='Re-entry'?'Re-entry administrative office: classification score continues to influence outcome.':'Standard re-entry conditions.',
              correction:v<40?'Urban FDCR uplift via welfare access, school investment, re-entry office.':eco?'Expand ecological repair corridors. Mandate green buffer zones.':'Maintain civic institutions and green corridors.',
            })}>
              <polygon points={pt([tW,tS,gS,gW])} fill={clr.L} stroke="#020810" strokeWidth="0.5"/>
              <polygon points={pt([tE,tS,gS,gE])} fill={clr.R} stroke="#020810" strokeWidth="0.5"/>
              <polygon points={pt([tN,tE,tS,tW])} fill={isSel?'#162840':clr.top} stroke={isSel?'#7ac8f8':'#020810'} strokeWidth={isSel?1.2:0.5}/>
              {/* overlays on top face */}
              {isSurv&&overlays.has('spatial_class')&&<polygon points={pt([tN,tE,tS,tW])} fill="#ef4444" opacity="0.55"/>}
              {v<35&&!green&&overlays.has('urban_body')&&<polygon points={pt([tN,tE,tS,tW])} fill="#f97316" opacity="0.28"/>}
              {rent&&overlays.has('spatial_class')&&<polygon points={pt([tN,tE,tS,tW])} fill="#ef4444" opacity="0.18"/>}
              {eco&&<polygon points={pt([tN,tE,tS,tW])} fill="#4ade80" opacity="0.2"/>}
              {/* roof markers */}
              {civic&&<text x={tN.x} y={tN.y-9} textAnchor="middle" fontSize="10" fill={civic.color} fontFamily="monospace" fontWeight="700" filter="url(#uGlow)">{civic.sym}</text>}
              {green&&!civic&&<circle cx={tN.x} cy={tN.y-4} r="3.5" fill="#4ade80" opacity="0.75" filter="url(#uGlow)"/>}
              {isSurv&&<text x={tN.x} y={tN.y-9} textAnchor="middle" fontSize="9" fill="#ef4444" fontFamily="monospace" filter="url(#uGlow)">⬡</text>}
              {rent&&overlays.has('spatial_class')&&<text x={tN.x} y={tN.y-9} textAnchor="middle" fontSize="8" fill="#ef4444" fontFamily="monospace">$</text>}
            </g>
          )
        })}
        {/* legend */}
        <text x="18" y="434" fontSize="7" fill="#1a3a5a" fontFamily="monospace">▬ Height = FDCR density  ■ Green = ecological corridor  ◉ Green dot = eco-repair  ⬡ Red = surveillance  $ = rent burden  H/S/W/R = civic nodes  — Dashed = commute route</text>
      </svg>
    )
  },[scenario,th,overlays,sel,dOff])

  // ── BODY-LIFEWORLD ─────────────────────────────────────────────────────────
  const BodyCanvas=useCallback(()=>{
    const nMap=Object.fromEntries(BN.map(n=>[n.id,n]))
    const sm=scenario==='reform'?-10:scenario==='managerial'?12:0
    const tm=th*(scenario==='reform'?-1.5:scenario==='managerial'?2:0.3)
    const bl=(base:number)=>Math.max(5,Math.min(98,base+sm+tm))

    // Time ring geometry
    const RCX=610,RCY=110,RR=60,RW=20
    let ang=-Math.PI/2
    const ringPaths=TR.map(s=>{
      const frac=s.h/24,s0=ang,s1=ang+frac*2*Math.PI; ang=s1
      const x1=RCX+RR*Math.cos(s0),y1=RCY+RR*Math.sin(s0)
      const x2=RCX+RR*Math.cos(s1),y2=RCY+RR*Math.sin(s1)
      const xi1=RCX+(RR-RW)*Math.cos(s0),yi1=RCY+(RR-RW)*Math.sin(s0)
      const xi2=RCX+(RR-RW)*Math.cos(s1),yi2=RCY+(RR-RW)*Math.sin(s1)
      const lg=frac>.5?1:0
      return{...s,d:`M${x1},${y1} A${RR},${RR} 0 ${lg},1 ${x2},${y2} L${xi2},${yi2} A${RR-RW},${RR-RW} 0 ${lg},0 ${xi1},${yi1} Z`,midA:s0+(s1-s0)/2}
    })

    return(
      <svg viewBox="0 0 710 476" className="w-full h-full" style={{background:'#020810'}}>
        <defs>
          <filter id="bGlow5"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <filter id="bGlow2"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <style>{`.bda{stroke-dasharray:7 4;stroke-dashoffset:${dOff}}.bdc{stroke-dasharray:3 7;stroke-dashoffset:${dOff*0.6}}`}</style>
          {[['arrN','#2a5a8a'],['arrF','#4ade80'],['arrB','#ef4444'],['arrBr','#f97316'],['arrC','#a060c0'],['arrS','#3a6a9a']].map(([id,c])=>(
            <marker key={id} id={id} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill={c} opacity="0.75"/></marker>
          ))}
        </defs>
        <rect x="0" y="0" width="710" height="476" fill="#020810"/>

        {/* field rings */}
        {[185,125,75].map((r,i)=><circle key={i} cx={355} cy={240} r={r} fill="none" stroke="#0a1e32" strokeWidth="0.9" opacity={0.35-i*0.08}/>)}

        {/* axes */}
        <line x1="105" y1="240" x2="610" y2="240" stroke="#0a1e32" strokeWidth="0.7" opacity="0.5"/>
        <line x1="355" y1="75"  x2="355" y2="445" stroke="#0a1e32" strokeWidth="0.7" opacity="0.5"/>
        <text x="355" y="70"  textAnchor="middle" fontSize="7" fill="#182838" fontFamily="monospace">↑ health · reproduction · autonomy</text>
        <text x="355" y="458" textAnchor="middle" fontSize="7" fill="#182838" fontFamily="monospace">↓ classification · exclusion · erasure</text>
        <text x="103" y="243" textAnchor="end"    fontSize="7" fill="#182838" fontFamily="monospace">← work · institutional</text>
        <text x="612" y="243" textAnchor="start"  fontSize="7" fill="#182838" fontFamily="monospace">recovery · appeal →</text>

        {/* institutional pressure zone */}
        {overlays.has('spatial_class')&&<>
          <ellipse cx="355" cy="358" rx="140" ry="52" fill="#c06020" opacity="0.07"/>
          <ellipse cx="355" cy="358" rx="85"  ry="30" fill="#c83020" opacity="0.07"/>
        </>}
        {/* temporal compression band */}
        <rect x="130" y="282" width="88" height="65" rx="3" fill="#6040a0" opacity="0.06"/>
        <text x="174" y="308" textAnchor="middle" fontSize="6.5" fill="#7060a0" fontFamily="monospace" opacity="0.55">temporal</text>
        <text x="174" y="318" textAnchor="middle" fontSize="6.5" fill="#7060a0" fontFamily="monospace" opacity="0.55">compression</text>

        {/* edges */}
        {BE.map((e,i)=>{
          const A=nMap[e.from],B=nMap[e.to]; if(!A||!B) return null
          const mx=(A.x+B.x)/2+(A.y-B.y)*0.17, my=(A.y+B.y)/2+(B.x-A.x)*0.17
          const ec=EC[e.t]
          const mk=e.t==='freedom'?'url(#arrF)':e.t==='burden'?'url(#arrB)':e.t==='barrier'?'url(#arrBr)':e.t==='compress'?'url(#arrC)':e.t==='sustain'?'url(#arrS)':'url(#arrN)'
          return<path key={i} d={`M${A.x},${A.y} Q${mx},${my} ${B.x},${B.y}`} fill="none" stroke={ec} strokeWidth={e.w} opacity="0.6" markerEnd={mk} className={e.t==='barrier'?'bda':e.t==='compress'?'bdc':''}/>
        })}

        {/* nodes */}
        {BN.map(n=>{
          const load=bl(n.bl)
          const isBar=n.type==='barrier'
          const isFr=n.type==='freedom'
          const nc=isBar?rc(load):isFr?fc(100-load):n.color
          const isSel=sel?.id===`b-${n.id}`
          return(
            <g key={n.id} style={{cursor:'pointer'}} onClick={()=>pick(`b-${n.id}`,PRESETS[`b-${n.id}`]??{label:n.label,type:isBar?'Barrier Node':isFr?'Freedom Node':'Lifeworld Node',actors:'Subject population',fdcr:Math.round(100-n.bl*0.55),gfdcr:Math.round(100-n.bl*0.58),efdcr:Math.round(100-n.bl*0.62),ebdcr:Math.round(100-n.bl*0.66),burden:`${n.label}: ${isBar?'barrier node — restricts subject freedom.':isFr?'freedom node — target state.':'lifeworld node — burden accumulation site.'}`,reentry:'Re-entry conditions determined by node type and upstream barriers.',correction:isBar?'Remove barrier via policy reform and democratic oversight.':'Maintain and expand freedom nodes.'})}>
              {isBar&&<circle cx={n.x} cy={n.y} r={n.r+11} fill="none" stroke={n.color} strokeWidth="1.5" opacity="0.35" className="bda"/>}
              {isSel&&<circle cx={n.x} cy={n.y} r={n.r+9} fill="none" stroke="#7ac8f8" strokeWidth="2" opacity="0.9"/>}
              <circle cx={n.x} cy={n.y} r={n.r+4} fill={nc} opacity="0.1"/>
              <circle cx={n.x} cy={n.y} r={n.r} fill={nc} opacity={isBar?0.92:0.85} filter="url(#bGlow2)"/>
              {/* load bar */}
              {n.r>=9&&<rect x={n.x-n.r*0.65} y={n.y+2} width={n.r*1.3*(load/100)} height="3" fill={rc(load)} opacity="0.65" rx="1.5"/>}
              <text x={n.x} y={n.type==='actor'?n.y-n.r-8:n.y+n.r+11} textAnchor="middle" fontSize={n.type==='actor'?'10':'7.5'} fill={nc} fontFamily="monospace" fontWeight={n.type==='actor'||isBar?'700':'400'}>{n.label}</text>
            </g>
          )
        })}

        {/* daily time ring */}
        <text x={RCX} y={RCY-RR-14} textAnchor="middle" fontSize="6.5" fill="#1a3050" fontFamily="monospace" letterSpacing="2">24H FIELD</text>
        {ringPaths.map((s,i)=><path key={i} d={s.d} fill={s.c} stroke="#020810" strokeWidth="1.2" opacity="0.88"/>)}
        {ringPaths.map((s,i)=>s.h>1.5?<text key={i} x={RCX+(RR-RW/2)*Math.cos(s.midA)} y={RCY+(RR-RW/2)*Math.sin(s.midA)+3} textAnchor="middle" fontSize="6" fill="#8090a0" fontFamily="monospace">{s.label}</text>:null)}
        <text x={RCX} y={RCY+5}  textAnchor="middle" fontSize="9"   fill="#2a4a6a" fontFamily="monospace">{Math.round(m.FDCR)}</text>
        <text x={RCX} y={RCY+15} textAnchor="middle" fontSize="6.5" fill="#1a3050" fontFamily="monospace">FDCR</text>

        {/* burden panel */}
        {overlays.has('urban_body')&&<g>
          <rect x="14" y="28" width="152" height="60" fill="#050e18" stroke="#1a3a5a" strokeWidth="0.8"/>
          <text x="22" y="43" fontSize="6.5" fill="#1a3a5a" fontFamily="monospace">BODY BURDEN METRICS</text>
          <text x="22" y="59" fontSize="9" fill="#ef4444" fontFamily="monospace" fontWeight="700">BTR {Math.round(m.BTR)}</text>
          <text x="82" y="59" fontSize="9" fill="#f97316" fontFamily="monospace" fontWeight="700">CFR {Math.round(m.CFR)}</text>
          <text x="22" y="76" fontSize="9" fill="#4ade80" fontFamily="monospace" fontWeight="700">FDCR {Math.round(m.FDCR)}</text>
          <text x="82" y="76" fontSize="9" fill="#60a5fa" fontFamily="monospace" fontWeight="700">BGR {Math.round(m.BGR)}</text>
        </g>}

        <text x="14" y="462" fontSize="6.5" fill="#1a3050" fontFamily="monospace">● Red = barrier  ● Green = freedom  ● Blue = sustain  ● Purple = compress  ■ Bar inside node = burden load</text>
      </svg>
    )
  },[scenario,th,overlays,sel,dOff,m.FDCR,m.BTR,m.CFR,m.BGR,pulse])

  // ── INSTITUTIONAL FLOW ─────────────────────────────────────────────────────
  const FlowCanvas=useCallback(()=>{
    const nMap=Object.fromEntries(FNS.map(n=>[n.id,n]))
    const bypassR=scenario==='reform'?'45%':scenario==='managerial'?'92%':'75%'
    const approveR=scenario==='reform'?'55%':scenario==='managerial'?'22%':'35%'

    function drawNode(n:FN,isSel:boolean){
      const sw=isSel?2:0.6; const sc=isSel?'#7ac8f8':n.color
      if(n.shape==='circle') return<circle cx={n.x} cy={n.y} r="22" fill={n.color} opacity="0.9" stroke={sc} strokeWidth={sw}/>
      if(n.shape==='diamond') return<polygon points={`${n.x},${n.y-25} ${n.x+30},${n.y} ${n.x},${n.y+25} ${n.x-30},${n.y}`} fill={n.color} opacity="0.9" stroke={sc} strokeWidth={sw}/>
      return<rect x={n.x-30} y={n.y-16} width="60" height="32" fill={n.color} opacity="0.9" stroke={sc} strokeWidth={sw}/>
    }

    return(
      <svg viewBox="0 0 710 476" className="w-full h-full" style={{background:'#020810'}}>
        <defs>
          <filter id="fGlow"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <style>{`.fda{stroke-dasharray:8 5;stroke-dashoffset:${dOff}}`}</style>
          {[['fa','#2a5a8a'],['faF','#4ade80'],['faB','#ef4444'],['faBr','#f97316']].map(([id,c])=>(
            <marker key={id} id={id} markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill={c} opacity="0.85"/></marker>
          ))}
        </defs>
        <rect x="0" y="0" width="710" height="476" fill="#020810"/>

        {/* stage bands */}
        {[66,128,190,254,320,392].map((y,i)=><line key={i} x1="58" y1={y} x2="652" y2={y} stroke="#0a1c2e" strokeWidth="0.6" opacity="0.5"/>)}
        {['ENTRY','INTAKE','AI PROCESS','CLASSIFICATION','REVIEW','OUTCOME'].map((lbl,i)=>{
          const ys=[22,98,160,224,288,358]; return<text key={i} x="65" y={ys[i]} fontSize="6" fill="#1a3050" fontFamily="monospace" letterSpacing="1">{lbl}</text>
        })}

        {/* risk zone halos */}
        <ellipse cx="355" cy="215" rx="100" ry="60" fill="#ef4444" opacity="0.04"/>
        <ellipse cx="510" cy="394" rx="90"  ry="58" fill="#ef4444" opacity="0.05"/>

        {/* edges */}
        {FE.map((e,i)=>{
          const A=nMap[e.from],B=nMap[e.to]; if(!A||!B) return null
          const dx=B.x-A.x
          const mx=(A.x+B.x)/2+(Math.abs(dx)>40?0:dx>0?38:-38)
          const my=(A.y+B.y)/2+(Math.abs(dx)>40?-18:0)
          const ec=EC[e.t]??'#2a5a8a'
          const mk=e.t==='freedom'?'url(#faF)':e.t==='burden'?'url(#faB)':e.t==='barrier'?'url(#faBr)':'url(#fa)'
          return<g key={i}>
            <path d={`M${A.x},${A.y} Q${mx},${my} ${B.x},${B.y}`} fill="none" stroke={ec} strokeWidth="2.2" opacity="0.65" markerEnd={mk} className={e.t==='barrier'?'fda':''}/>
            {e.pct&&<text x={mx} y={my-5} textAnchor="middle" fontSize="7.5" fill={ec} fontFamily="monospace" opacity="0.9">{e.pct}</text>}
          </g>
        })}

        {/* nodes */}
        {FNS.map(n=>{
          const isSel=sel?.id===`f-${n.id}`
          const isAI=n.id==='AI'
          const fdcr=n.color==='#2a8040'?70:n.color==='#c83020'?22:n.color==='#c06020'?32:50
          return(
            <g key={n.id} style={{cursor:'pointer'}} onClick={()=>pick(`f-${n.id}`,PRESETS[`f-${n.id}`]??{label:n.label,type:'Institutional Node',actors:'Subject applicants',fdcr,gfdcr:Math.round(fdcr*0.93),efdcr:Math.round(fdcr*0.88),ebdcr:Math.round(fdcr*0.82),burden:`${n.label}: institutional flow node in classification pipeline.`,reentry:'Classification record from this node persists into re-entry.',correction:'Democratic oversight and subject appeal required.'})}>
              {isAI&&<circle cx={n.x} cy={n.y} r={28+pulse*5} fill="none" stroke="#c83020" strokeWidth="1.2" opacity="0.35"/>}
              {isSel&&<circle cx={n.x} cy={n.y} r={(n.shape==='circle'?22:n.shape==='diamond'?25:24)+10} fill="none" stroke="#7ac8f8" strokeWidth="2" opacity="0.9"/>}
              <g filter="url(#fGlow)">{drawNode(n,isSel)}</g>
              {/* tag badge */}
              {n.tag&&<g>
                <rect x={n.x+24} y={n.y-11} width={n.tag.length*6+6} height="16" fill="#020810" stroke={n.color==='#c83020'?'#ef4444':n.color==='#c06020'?'#f97316':n.color==='#5a5030'?'#fbbf24':n.color==='#2a8040'?'#4ade80':'#a78bfa'} strokeWidth="0.8" rx="2"/>
                <text x={n.x+27} y={n.y+1} fontSize="7" fill={n.color==='#c83020'?'#ef4444':n.color==='#c06020'?'#f97316':n.color==='#5a5030'?'#fbbf24':n.color==='#2a8040'?'#4ade80':'#a78bfa'} fontFamily="monospace" fontWeight="700">{n.tag}</text>
              </g>}
              <text x={n.x} y={n.shape==='rect'?n.y+32:n.y+35} textAnchor="middle" fontSize="7.5" fill={n.color} fontFamily="monospace" fontWeight={['AI','CLASS','EXCL'].includes(n.id)?'700':'400'}>{n.label}</text>
            </g>
          )
        })}

        {/* metric panels */}
        <g><rect x="14" y="196" width="148" height="44" fill="#050e18" stroke="#1a3a5a" strokeWidth="0.7"/><text x="22" y="210" fontSize="6" fill="#d0a020" fontFamily="monospace">RESPONSIBILITY DISPLACEMENT</text><text x="22" y="230" fontSize="13" fill="#ef4444" fontFamily="monospace" fontWeight="700">MSJR {Math.round(m.MSJR)}</text></g>
        <g><rect x="558" y="196" width="140" height="44" fill="#050e18" stroke="#1a3a5a" strokeWidth="0.7"/><text x="566" y="210" fontSize="6" fill="#f07030" fontFamily="monospace">CLASSIFICATION FIXATION</text><text x="566" y="230" fontSize="13" fill="#ef4444" fontFamily="monospace" fontWeight="700">CFR {Math.round(m.CFR)}</text></g>
        <g><rect x="14" y="348" width="148" height="44" fill="#050e18" stroke="#1a3a5a" strokeWidth="0.7"/><text x="22" y="362" fontSize="6" fill="#40a060" fontFamily="monospace">DEMOCRATIC REVIEW BYPASS</text><text x="22" y="382" fontSize="13" fill="#fbbf24" fontFamily="monospace" fontWeight="700">{bypassR}</text></g>
        <g><rect x="14" y="415" width="148" height="44" fill="#050e18" stroke="#1a3a5a" strokeWidth="0.7"/><text x="22" y="429" fontSize="6" fill="#e07030" fontFamily="monospace">RE-ENTRY BLOCKAGE</text><text x="22" y="449" fontSize="13" fill="#f97316" fontFamily="monospace" fontWeight="700">RBR {Math.round(m.RBR)}</text></g>
        <g><rect x="558" y="348" width="140" height="44" fill="#050e18" stroke="#1a3a5a" strokeWidth="0.7"/><text x="566" y="362" fontSize="6" fill="#40a060" fontFamily="monospace">APPROVAL RATE</text><text x="566" y="382" fontSize="13" fill="#4ade80" fontFamily="monospace" fontWeight="700">{approveR}</text></g>
        <g><rect x="558" y="415" width="140" height="44" fill="#050e18" stroke="#1a3a5a" strokeWidth="0.7"/><text x="566" y="429" fontSize="6" fill="#c03020" fontFamily="monospace">EXCLUSION RATE</text><text x="566" y="449" fontSize="13" fill="#ef4444" fontFamily="monospace" fontWeight="700">{100-parseInt(approveR)}%</text></g>

        <text x="14" y="469" fontSize="6.5" fill="#1a3050" fontFamily="monospace">CFR=Classification Fixation · RBR=Re-entry Blockage · MSJR=Responsibility Displacement · TEI=Testimony Erasure · COR=Correction Mechanism</text>
      </svg>
    )
  },[scenario,th,sel,dOff,m.MSJR,m.CFR,m.RBR,pulse])

  const Canvas=layer==='planetary'?PlanetaryCanvas:layer==='urban'?UrbanCanvas:layer==='body'?BodyCanvas:FlowCanvas

  const statBars=[
    {k:'FDCR',v:m.FDCR,r:false},{k:'G-FDCR',v:m.GFDCR,r:false},
    {k:'E-FDCR',v:m.EFDCR,r:false},{k:'EBDCR',v:m.EBDCR,r:false},
    {k:'BTR',v:m.BTR,r:true},{k:'MSJR',v:m.MSJR,r:true},
    {k:'CFR',v:m.CFR,r:true},{k:'RBR',v:m.RBR,r:true},
  ]

  return(
    <div className="bg-[#020810] flex flex-col overflow-hidden" style={{height:'100vh',marginLeft:'-24px',marginRight:'-24px',marginTop:'-32px'}}>

      {/* TOP BAR */}
      <div className="flex items-stretch border-b border-[#1a3a50] bg-[#040c16] flex-shrink-0 overflow-x-auto" style={{height:'42px'}}>
        <div className="flex items-center gap-2 px-4 border-r border-[#1a3a50] flex-shrink-0">
          <span className="text-[6.5px] font-mono uppercase tracking-[0.22em] text-[#1a3a50]">FEDS</span>
          <div className="w-px h-3 bg-[#1a3a50]"/>
          <span className="text-[6.5px] font-mono text-[#2a5a7a] uppercase tracking-wider">Simulation Theater</span>
          <div className="w-1.5 h-1.5 rounded-full bg-[#4ade80] flex-shrink-0" style={{boxShadow:`0 0 ${4+pulse*5}px #4ade80`}}/>
        </div>
        <div className="flex items-stretch border-r border-[#1a3a50] flex-shrink-0">
          <div className="flex items-center px-2 border-r border-[#0d1e2e]"><span className="text-[6px] font-mono uppercase tracking-[0.18em] text-[#1a3a50]">Mode</span></div>
          {LAYERS.map(lm=>(
            <button key={lm.id} onClick={()=>{setLayer(lm.id);setSel(null)}}
              className={`px-3 text-[8.5px] font-mono border-r border-[#0d1e2e] h-full whitespace-nowrap transition-colors ${layer===lm.id?'text-[#7ac8f8] bg-[#071628]':'text-[#2a5a7a] hover:text-[#4a8ab0] hover:bg-[#060e1c]'}`}>
              {lm.label}
            </button>
          ))}
        </div>
        <div className="flex items-stretch border-r border-[#1a3a50] flex-shrink-0">
          <div className="flex items-center px-2 border-r border-[#0d1e2e]"><span className="text-[6px] font-mono uppercase tracking-[0.18em] text-[#1a3a50]">Scenario</span></div>
          {SCENARIOS.map(s=>(
            <button key={s.id} onClick={()=>setScenario(s.id)}
              className={`flex items-center gap-1.5 px-3 text-[8.5px] font-mono border-r border-[#0d1e2e] h-full whitespace-nowrap transition-colors ${scenario===s.id?'bg-[#071628]':'hover:bg-[#060e1c]'}`}
              style={{color:scenario===s.id?s.color:'#2a5a7a'}}>
              {scenario===s.id&&<div className="w-1.5 h-1.5 rounded-full" style={{background:s.color}}/>}
              {s.label}
            </button>
          ))}
        </div>
        <div className="flex items-stretch flex-1">
          <div className="flex items-center px-2 border-r border-[#0d1e2e] flex-shrink-0"><span className="text-[6px] font-mono uppercase tracking-[0.18em] text-[#1a3a50]">T</span></div>
          {TH_LABELS.map((lbl,i)=>(
            <button key={i} onClick={()=>setTH(i as TH)}
              className={`px-2.5 text-[8px] font-mono border-r border-[#0d1e2e] h-full whitespace-nowrap transition-colors ${th===i?'text-[#7ac8f8] bg-[#071628]':'text-[#2a5a7a] hover:text-[#4a8ab0] hover:bg-[#060e1c]'}`}>
              {lbl}
            </button>
          ))}
        </div>
      </div>

      {/* WORKSPACE */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT */}
        <div className="w-40 flex-shrink-0 border-r border-[#1a3a50] bg-[#040c16] overflow-y-auto">
          {OVERLAYS.map(g=>(
            <div key={g.group}>
              <div className="text-[6px] font-mono uppercase tracking-[0.18em] text-[#1a3a50] px-3 py-1.5 border-b border-[#0d1e2e] bg-[#040c16] sticky top-0">{g.group}</div>
              {g.items.map(item=>{const on=overlays.has(item.id);return(
                <button key={item.id} onClick={()=>toggleOv(item.id)}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 border-b border-[#060e18] transition-colors ${on?'bg-[#060f1e]':'hover:bg-[#060d18]'}`}>
                  <div className="w-2 h-2 flex-shrink-0 border" style={{borderColor:on?item.c:'#1a3a50',background:on?item.c:'transparent'}}/>
                  <span className="text-[8.5px] font-mono" style={{color:on?item.c:'#2a5a7a'}}>{item.id}</span>
                </button>
              )})}
            </div>
          ))}
        </div>

        {/* CANVAS */}
        <div className="flex-1 relative overflow-hidden bg-[#020810]">
          <div className="absolute inset-0" style={{bottom:'26px'}}>
            <Canvas/>
          </div>
          <div className="absolute bottom-0 left-0 right-0 flex items-center border-t border-[#1a3a50] bg-[#020810]/95 overflow-x-auto" style={{height:'26px'}}>
            {statBars.map(({k,v,r})=>{
              const val=Math.round(v)
              const c=r?(val>65?'#ef4444':val>45?'#fbbf24':'#4ade80'):(val>60?'#4ade80':val>40?'#fbbf24':'#ef4444')
              return(
                <div key={k} className="flex items-center gap-1.5 px-3 border-r border-[#1a3a50] h-full flex-shrink-0">
                  <span className="text-[6.5px] font-mono text-[#2a5a7a]">{k}</span>
                  <div className="w-8 h-px" style={{background:`linear-gradient(90deg,${c} ${val}%,#0d1e30 ${val}%)`}}/>
                  <span className="text-[8.5px] font-mono font-bold" style={{color:c}}>{val}</span>
                </div>
              )
            })}
            <div className="flex-1"/>
            <span className="text-[6.5px] font-mono text-[#1a3a50] px-3 flex-shrink-0">{scOpt.label} · {TH_LABELS[th]}</span>
          </div>
        </div>

        {/* RIGHT INSPECTOR */}
        <div className="w-60 flex-shrink-0 border-l border-[#1a3a50] bg-[#040c16] overflow-y-auto" style={{fontSize:'8.5px'}}>
          {!sel?(
            <div>
              <div className="px-3 py-2 border-b border-[#1a3a50]">
                <div className="text-[6px] font-mono uppercase tracking-[0.16em] text-[#1a3a50] mb-1">Active Case</div>
                <div className="font-mono text-[#7ac8f8] leading-snug text-[8.5px]">{scoreResult?scoreResult.report.target:'Case 001 — AI Hiring System (Demo)'}</div>
              </div>
              <div className="px-3 py-2 border-b border-[#1a3a50]">
                <div className="text-[6px] font-mono uppercase tracking-[0.16em] text-[#1a3a50] mb-2">Scenario Metrics</div>
                <div className="space-y-2">
                  {([['FDCR',m.FDCR,false],['G-FDCR',m.GFDCR,false],['E-FDCR',m.EFDCR,false],['EBDCR',m.EBDCR,false],['BTR',m.BTR,true],['MSJR',m.MSJR,true],['CFR',m.CFR,true],['RBR',m.RBR,true],['BGR',m.BGR,false],['RCI',m.RCI,false]] as [string,number,boolean][]).map(([k,v,r])=>{
                    const val=Math.round(v); const c=mc(k,val)
                    return<div key={k}><div className="flex justify-between mb-0.5"><span className="font-mono text-[#2a5a7a]">{k}</span><span className="font-mono font-bold" style={{color:c}}>{val}</span></div><div className="h-px bg-[#0d1e2e]"><div className="h-px" style={{width:`${val}%`,background:c}}/></div></div>
                  })}
                </div>
              </div>
              <div className="px-3 py-2 border-b border-[#1a3a50]">
                <div className="text-[6px] font-mono uppercase tracking-[0.16em] text-[#1a3a50] mb-1">Primary Burden Pathway</div>
                <div className="font-mono text-[#ef4444] text-[8px] leading-relaxed">AI Scoring → Classification → Rejection → Exclusion Zone</div>
              </div>
              <div className="px-3 py-2 border-b border-[#1a3a50]">
                <div className="text-[6px] font-mono uppercase tracking-[0.16em] text-[#1a3a50] mb-1">Correction Mechanism</div>
                <div className="font-mono text-[#4ade80] text-[8px] leading-relaxed">Democratic Review → Appeal → Freedom Space</div>
              </div>
              <div className="px-3 py-2"><div className="text-[6.5px] text-[#1a3a50] font-mono leading-relaxed">Click any node, region, city block, or institutional node to inspect.</div></div>
            </div>
          ):(
            <div>
              <div className="flex items-start justify-between gap-2 px-3 py-2 border-b border-[#1a3a50]">
                <div>
                  <div className="text-[6px] font-mono uppercase tracking-[0.16em] text-[#1a3a50] mb-0.5">{sel.type}</div>
                  <h3 className="font-bold text-[#7ac8f8] text-[10.5px] leading-tight">{sel.label}</h3>
                </div>
                <button onClick={()=>setSel(null)} className="text-[#2a5a7a] hover:text-[#7ac8f8] font-mono text-[10px] shrink-0 mt-0.5">✕</button>
              </div>
              <div className="px-3 py-1.5 border-b border-[#1a3a50]">
                <div className="text-[6px] font-mono uppercase tracking-[0.16em] text-[#1a3a50] mb-1">Affected Actors</div>
                <div className="font-mono text-[#3a6a8a] text-[8px] leading-snug">{sel.actors}</div>
              </div>
              <div className="px-3 py-2 border-b border-[#1a3a50]">
                <div className="text-[6px] font-mono uppercase tracking-[0.16em] text-[#1a3a50] mb-2">Object Metrics</div>
                <div className="space-y-2">
                  {([['FDCR',sel.fdcr],['G-FDCR',sel.gfdcr],['E-FDCR',sel.efdcr],['EBDCR',sel.ebdcr]] as [string,number][]).map(([k,v])=>{
                    const c=fc(v)
                    return<div key={k}><div className="flex justify-between mb-0.5"><span className="font-mono text-[#2a5a7a]">{k}</span><span className="font-mono font-bold" style={{color:c}}>{v}</span></div><div className="h-px bg-[#0d1e2e]"><div className="h-px" style={{width:`${Math.min(100,v)}%`,background:c}}/></div></div>
                  })}
                </div>
              </div>
              <div className="px-3 py-2 border-b border-[#1a3a50]">
                <div className="text-[6px] font-mono uppercase tracking-[0.16em] text-[#1a3a50] mb-1">Burden Pathway</div>
                <p className="text-[8px] text-[#ef4444] leading-relaxed font-mono">{sel.burden}</p>
              </div>
              <div className="px-3 py-2 border-b border-[#1a3a50]">
                <div className="text-[6px] font-mono uppercase tracking-[0.16em] text-[#1a3a50] mb-1">Re-entry Condition</div>
                <p className="text-[8px] text-[#fbbf24] leading-relaxed font-mono">{sel.reentry}</p>
              </div>
              <div className="px-3 py-2">
                <div className="text-[6px] font-mono uppercase tracking-[0.16em] text-[#1a3a50] mb-1">Correction Mechanism</div>
                <p className="text-[8px] text-[#4ade80] leading-relaxed font-mono">{sel.correction}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* LEGEND */}
      <div className="flex-shrink-0 border-t border-[#1a3a50] bg-[#040c16] flex items-center overflow-x-auto" style={{height:'30px'}}>
        {[
          {sym:'●',c:'#4ade80',label:'FDCR ≥60 / freedom'},
          {sym:'●',c:'#fbbf24',label:'FDCR 45–59'},
          {sym:'●',c:'#f97316',label:'FDCR 30–44'},
          {sym:'●',c:'#ef4444',label:'FDCR <30 / high burden'},
          {sym:'—',c:'#ef4444',label:'Burden transfer'},
          {sym:'⬡',c:'#f97316',label:'Extraction zone'},
          {sym:'◈',c:'#a78bfa',label:'AI compute / gateway'},
          {sym:'◈',c:'#60a5fa',label:'Climate displacement'},
          {sym:'▬',c:'#4a8ab0',label:'Block height = FDCR'},
        ].map((item,i)=>(
          <div key={i} className="flex items-center gap-1.5 px-3 border-r border-[#1a3a50] h-full flex-shrink-0">
            <span className="text-[9px] font-bold" style={{color:item.c}}>{item.sym}</span>
            <span className="text-[6.5px] font-mono text-[#2a5a7a]">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
