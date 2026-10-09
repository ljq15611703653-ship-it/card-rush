export interface Card {id:number;rank:number;suit:number}
export type Family='core'|'gate'|'wall';
export const families={core:'发射核心',gate:'数字门',wall:'盾墙'};
export const variants:Record<Family,string[]>= {core:['basic','burst','shotgun','cannon','beam'],gate:['multiply','split','fire','frost','pierce'],wall:['heavy','thorn','bomb','regen','slow']};
export const names:Record<string,string>={'core-basic':'脉冲机炮','core-burst':'连发核心','core-shotgun':'散射核心','core-cannon':'爆破核心','core-beam':'激光核心','gate-multiply':'倍率门','gate-split':'分裂门','gate-fire':'烈焰门','gate-frost':'寒霜门','gate-pierce':'穿透门','wall-heavy':'重甲盾墙','wall-thorn':'反伤盾墙','wall-bomb':'爆破盾墙','wall-regen':'修复盾墙','wall-slow':'寒霜盾墙'};
export const descriptions:Record<string,string>={'core-basic':'稳定发射单颗子弹','core-burst':'每次连续发射三颗子弹','core-shotgun':'每次发射五颗扇形弹丸','core-cannon':'发射范围爆炸炮弹','core-beam':'持续照射最近的敌人','gate-multiply':'经过的攻击伤害 × 投入牌数','gate-split':'经过的攻击分成三路，单路伤害降低','gate-fire':'经过的攻击附带燃烧','gate-frost':'经过的攻击减速敌人','gate-pierce':'经过的子弹额外穿透两个敌人；激光伤害提高','wall-heavy':'高耐久，阻挡僵尸','wall-thorn':'受攻击时反伤','wall-bomb':'被摧毁时范围爆炸','wall-regen':'缓慢恢复自身耐久','wall-slow':'减慢附近僵尸'};
export const recipeNames=['散牌','一对 / 飞机','顺子 / 连对','炸弹 / 葫芦','同花 / 同花顺'];
export interface PokerPattern {id:string;name:string;index:number;factor:number;volley:number;detail:string;resolved?:Pick<Card,'rank'|'suit'>[]}
const consecutive=(rs:number[])=>rs.length>0&&rs.every((n,i)=>i===0||n===rs[i-1]+1);
const straightRanks=(rs:number[])=>consecutive(rs)||rs[0]===1&&consecutive([...rs.slice(1),14]);
/** Entire selection must satisfy the named shape; no best-three-card subset. */
function analyzeNatural(cards:Pick<Card,'rank'|'suit'>[]):PokerPattern {
 const n=cards.length,counts=new Map<number,number>();cards.forEach(c=>counts.set(c.rank,(counts.get(c.rank)??0)+1));
 const ranks=[...counts.keys()].sort((a,b)=>a-b),groups=[...counts.values()].sort((a,b)=>b-a);
 const flush=n>=3&&cards.every(c=>c.suit===cards[0].suit),straight=n>=3&&ranks.length===n&&straightRanks(ranks);
 const make=(id:string,name:string,index:number,factor:number,volley=1,detail='所有投入牌的点数均计入威力。'):PokerPattern=>({id,name,index,factor,volley,detail});
 if(flush&&straight)return make('straight-flush',n===5&&ranks.join(',')==='1,10,11,12,13'?'皇家同花顺':`${n} 张同花顺`,4,1.65+.14*(n-3),Math.max(1,n-3),'连续光束；顺子越长，光束越粗、威力越高。');
 if(n>=8&&n%4===0&&groups.every(c=>c===4)&&consecutive(ranks))return make('chain-bomb',`${n/4} 连炸`,3,2+.35*(n/4-2),n/4,'连续发射爆炸炮弹。');
 if(n===4&&groups[0]===4)return make('bomb','四张炸弹',3,1.85,1,'大范围爆炸炮弹。');
 const triples=ranks.filter(r=>counts.get(r)===3),others=ranks.filter(r=>counts.get(r)!==3);
 if(triples.length>=2&&consecutive(triples)){
  const k=triples.length;
  if(n===k*3)return make('airplane',`${k} 连飞机`,1,1.4+.12*(k-2),k,'按三发一组，连续发射多组子弹。');
  if(n===k*4&&others.length===k&&others.every(r=>counts.get(r)===1))return make('airplane-single',`飞机带单翼 · ${k} 连`,1,1.5+.12*(k-2),k+1,'机群连射，单翼提供追加发射。');
  if(n===k*5&&others.length===k&&others.every(r=>counts.get(r)===2))return make('airplane-pair',`飞机带双翼 · ${k} 连`,1,1.65+.12*(k-2),k+2,'机群连射，双翼提供更多追加发射。');
 }
 if(n>=6&&n%2===0&&groups.every(c=>c===2)&&consecutive(ranks))return make('pair-run',`${n/2} 连对`,2,1.3+.1*(n/2-3),n/2,'成对散射，连对越长，散射弹丸越多。');
 if(n===5&&groups.join(',')==='3,2')return make('full-house','葫芦 · 三带二',3,1.55,1,'主炮爆炸后追加两颗小弹。');
 if(n===4&&groups.join(',')==='3,1')return make('triple-single','三带一',1,1.2,1,'三连发后追加一颗子弹。');
 if(n===3&&groups[0]===3)return make('triple','豹子 · 三条',3,1.45,1,'重型爆破核心。');
 if(n===6&&groups.join(',')==='4,1,1')return make('four-single','四带二',3,1.55,1,'爆炸主炮与两颗伴随子弹。');
 if(n===8&&groups.join(',')==='4,2,2')return make('four-pair','四带两对',3,1.7,1,'爆炸主炮与四颗伴随子弹。');
 if(flush)return make('flush',`${n} 张同花`,4,1.25+.1*(n-3),1,'同花激光，投入越多，光束越强。');
 if(straight)return make('straight',`${n} 张顺子`,2,1.15+.1*(n-3),Math.max(1,n-2),'扇形散射，顺子越长，弹丸越多。');
 if(n===4&&groups.join(',')==='2,2'||n===5&&groups.join(',')==='2,2,1')return make('two-pair','两对',1,1.2,2,'两组交替连射。');
 if(n>=3&&n<=5&&groups[0]===2&&groups.slice(1).every(c=>c===1))return make('pair','一对',1,1.05,1,'三连发攻击。');
 return make('high','散牌',0,1,1,'未构成完整特殊牌型；全部按散牌计入点数，不截取其中的顺子或同花。');
}
export function pokerOptions(cards:Pick<Card,'rank'|'suit'>[]):PokerPattern[] {
 const js=cards.map((c,i)=>c.rank===0?i:-1).filter(i=>i>=0);
 if(!js.length)return [analyzeNatural(cards)];
 const options=new Map<string,PokerPattern>(),trial=cards.map(c=>({...c}));
 const real=cards.filter(c=>c.rank!==0),flushSuit=real[0]?.suit??0;
 const remember=()=>{for(const flush of [false,true]){js.forEach((i,j)=>trial[i].suit=flush?flushSuit:(flushSuit+j+1)%4);const p=analyzeNatural(trial),old=options.get(p.id);if(!old||cardTotal(trial)>cardTotal(old.resolved??[]))options.set(p.id,{...p,resolved:trial.map(c=>({...c}))});}};
 if(js.length<=3){const visit=(depth:number)=>{if(depth===js.length){remember();return;}for(let r=1;r<=13;r++){trial[js[depth]].rank=r;visit(depth+1);}};visit(0);}
 else {
  // Large wildcard hands use complete rank templates rather than exponential enumeration.
  const templates:number[][]=[];const n=cards.length;
  for(let a=1;a<=13;a++){
   templates.push(Array(n).fill(a));
   for(const group of [1,2,3,4])if(n%group===0){const ranks=Array.from({length:n/group},(_,i)=>a+i);if(ranks.at(-1)!<=13)templates.push(ranks.flatMap(r=>Array(group).fill(r)));}
   for(let b=1;b<=13;b++)if(a!==b){for(const k of [2,3,4])if(n>k)templates.push([...Array(k).fill(a),...Array(n-k).fill(b)]);}
  }
  for(const template of templates){const remain=[...template];let fits=true;for(const c of real){const i=remain.indexOf(c.rank);if(i<0){fits=false;break;}remain.splice(i,1);}if(fits&&remain.length===js.length){js.forEach((i,j)=>trial[i].rank=remain[j]);remember();}}
 }
 // 散牌永远是可选保底，Joker 作 K 点数，仍不自动挑出子牌型。
 const fallback=cards.map(c=>c.rank===0?{rank:13,suit:4}:c);
 options.set('high',{id:'high',name:'散牌',index:0,factor:1,volley:1,detail:'按普通装置制造。Joker 按 K 的 13 点计入。',resolved:fallback});
 return [...options.values()].sort((a,b)=>b.factor*cardTotal(b.resolved??cards)-a.factor*cardTotal(a.resolved??cards));
}
export const analyze=(cards:Pick<Card,'rank'|'suit'>[])=>pokerOptions(cards)[0];
export const pattern=(cards:Card[])=>analyze(cards).index;
export function craft(f:Family,cards:Card[],chosen?:PokerPattern):string|null {if(cards.length<(f==='gate'?2:3))return null;if(cards.length===2)return 'gate-multiply';return f+'-'+variants[f][(chosen??analyze(cards)).index];}
export const cardTotal=(cards:Pick<Card,'rank'>[])=>cards.reduce((sum,c)=>sum+c.rank,0);
export const cardPower=(cards:Pick<Card,'rank'>[])=>cardTotal(cards)/21;
export const rankText=(n:number)=>n===0?'JOKER':n===1?'A':n===11?'J':n===12?'Q':n===13?'K':String(n);
export const suitText=['♠','♥','♣','♦','★','☆'];
