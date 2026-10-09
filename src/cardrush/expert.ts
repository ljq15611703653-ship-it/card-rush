import {analyze,type Card} from './combat-rules';
export interface Plan{order:number[];ammo:number[];param:number;angle:number;reason:string;pattern:string}
// Only inspect visible hand and enemy positions. Candidate moves are contiguous drags after legal sorts.
export function planMove(hand:Card[],enemies:{x:number;y:number;hp:number}[],W:number,H:number,kind:string,recent?:string[]):Plan|null{
 const counts=new Map<number,number>();hand.forEach(c=>counts.set(c.rank,(counts.get(c.rank)??0)+1));
 const orders=[ [...hand].sort((a,b)=>a.rank-b.rank||a.suit-b.suit),[...hand].sort((a,b)=>counts.get(b.rank)!-counts.get(a.rank)!||a.rank-b.rank),[...hand].sort((a,b)=>a.suit-b.suit||a.rank-b.rank) ];
 const live=enemies.filter(e=>e.hp>0);if(!live.length)return null;
 let best=-Infinity,result:Plan|null=null;
 for(const order of orders)for(let begin=0;begin<order.length;begin++)for(let len=1;len<=Math.min(7,order.length-begin,hand.length-1);len++){
 const cards=order.slice(begin,begin+len),pattern=analyze(cards);if(pattern.id==='high'&&len>1)continue;
 const rest=hand.filter(c=>!cards.some(x=>x.id===c.id));const param=[...rest].sort((a,b)=>b.rank-a.rank)[0];
 for(const target of live){const angle=Math.atan2(target.y-H+35,target.x-W/2),dx=Math.cos(angle),dy=Math.sin(angle);let coverage=0;
 for(const e of live){const along=(e.x-W/2)*dx+(e.y-H+35)*dy,off=Math.abs((e.x-W/2)*dy-(e.y-H+35)*dx);const blast=['bomb','full-house','four-single','four-pair'].includes(pattern.id),wide=pattern.id.includes('flush');const reach=blast?Math.hypot(e.x-target.x,e.y-target.y)<100:along>0&&off<(wide?90:pattern.id==='straight'?38:24);if(reach)coverage+=1+Math.pow(e.y/H,3)*5;}
 const damage=cards.reduce((sum,c)=>sum+c.rank,0)*pattern.factor*(kind==='heavy'?1+param.rank*.22:Math.min(param.rank,5));
 const reserve=rest.filter(c=>c.id!==param.id).reduce((v,c)=>v+((counts.get(c.rank)??0)>1?.12:0),0);
 const name=len===1?'单张':pattern.name;
 const novelty=recent?1+1.8/(1+recent.filter(p=>p===name).length):1;
 const score=(coverage*Math.log2(1+damage)/(1+len*.18)+reserve)*novelty;
 if(score>best){best=score;const name=len===1?'单张':pattern.name;result={order:order.map(c=>c.id),ammo:cards.map(c=>c.id),param:param.id,angle,pattern:name,reason:`${name}打${target.y>H*.65?'近身威胁':'密集线路'}，${param.rank}${kind==='heavy'?'档重击':'轮连击'}，留 ${rest.length-1} 张续牌`};}
 }}return result;
}
