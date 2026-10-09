import type {Formation} from './formations';
import {drawWorker} from './worker-rig';
export interface CardVisual{card:{rank:number;suit:number};x:number;y:number;rotation:number;size:number;color:string;pattern:string;type:string;age:number;index:number;count:number;impact:number;formation?:Formation;detached?:boolean;bank?:number}
export interface EnemyVisual{x:number;y:number;hp:number;max:number;seed:number;hit:number}
export interface PresentationAdapter{drawEnemy(ctx:CanvasRenderingContext2D,e:EnemyVisual,time:number):void;drawCard(ctx:CanvasRenderingContext2D,s:CardVisual,face?:boolean):void;drawImpact(ctx:CanvasRenderingContext2D,x:number,y:number,r:number,color:string,pattern:string,alpha:number):void}
const labels=(n:number)=>n===1?'A':n===11?'J':n===12?'Q':n===13?'K':String(n);
/** Replace with sprite/Spine/Three renderers. Coordinates, card identity and combat stay in the engine. */
export const paperPresentation:PresentationAdapter={
 drawEnemy(c,e,time){if(drawWorker(c,e,time))return;const sway=Math.sin(time*5+e.seed)*2;c.save();c.translate(e.x,e.y);c.rotate(sway*.025+e.hit*1.4);
 c.fillStyle='#58473320';c.beginPath();c.ellipse(1,35,17,5,0,0,Math.PI*2);c.fill();
 const poly=(points:number[][],fill:string)=>{c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();c.strokeStyle='#33323b';c.lineWidth=1.2;c.stroke();};
 poly([[-9,21],[-1,24],[-3,36+sway],[-11,37+sway]],'#424052');poly([[2,23],[10,20],[13,35-sway],[5,37-sway]],'#333844');
 poly([[-10,5],[-17,10],[-17,25+sway],[-12,23],[-7,12]],'#859483');poly([[10,5],[16,10],[18,25-sway],[12,23],[6,12]],'#627976');
 poly([[-9,3],[8,3],[12,24],[2,29],[-11,24]],e.hit?'#fff0d4':'#4c5e68');poly([[-9,3],[-3,13],[12,24],[2,29],[-11,24]],'#344453');
 poly([[-10,-11],[-3,-16],[9,-11],[10,1],[2,9],[-8,3]],e.hit?'#fff0d4':'#a2a184');poly([[2,-13],[9,-11],[10,1],[2,9],[-1,0]],'#6d8177');
 poly([[-10,3],[2,7],[10,3],[6,11],[-6,10]],'#9c5a4d');
 c.fillStyle='#252d36';c.fillRect(-7,-4,4,2);c.fillRect(3,-4,4,2);c.strokeStyle='#443a37';c.beginPath();c.moveTo(-2,3);c.lineTo(4,2);c.stroke();
 if(e.hp<e.max){c.fillStyle='#b59d79';c.fillRect(-12,-23,24,3);c.fillStyle='#965644';c.fillRect(-12,-23,24*e.hp/e.max,3);}c.restore();},

 drawCard(c,s,face=true){c.save();c.translate(s.x,s.y);c.rotate(s.rotation+Math.sin(s.age*10+s.index)*.09);c.strokeStyle=s.color;c.lineWidth=1.5;
 if(s.type==='blade'){c.fillStyle=s.color+'35';c.beginPath();c.moveTo(-s.size*1.5,s.size*.5);c.lineTo(0,-s.size*1.5);c.lineTo(s.size*1.5,s.size*.5);c.lineTo(0,-s.size*.65);c.fill();}
 if(s.type==='flower'){c.save();c.rotate(s.age*2);for(let i=0;i<5;i++){c.rotate(Math.PI*2/5);c.beginPath();c.ellipse(0,s.size*.9,s.size*.28,s.size*.6,0,0,Math.PI*2);c.stroke();}c.restore();}
 if(s.type==='flight'){c.fillStyle=s.color+'40';c.beginPath();c.moveTo(0,-s.size);c.lineTo(s.size*1.3,s.size*.6);c.lineTo(0,s.size*.25);c.lineTo(-s.size*1.3,s.size*.6);c.closePath();c.fill();c.stroke();}
 if(s.type==='blast'){c.save();c.rotate(s.age*5);c.setLineDash([5,7]);c.beginPath();c.arc(0,0,s.size*.95,0,Math.PI*2);c.stroke();c.restore();}
 if(!face){c.restore();return;}c.shadowColor='#33251966';c.shadowBlur=3;c.shadowOffsetX=2;c.shadowOffsetY=3;c.fillStyle='#fff4dc';c.strokeStyle='#47342d';c.beginPath();c.roundRect(-s.size/2,-s.size*.7,s.size,s.size*1.4,3);c.fill();c.stroke();c.shadowBlur=0;c.shadowOffsetX=0;c.shadowOffsetY=0;c.fillStyle=s.card.suit%2?'#ad393a':'#282f35';c.textAlign='center';c.font=`bold ${s.size*.55}px Georgia`;c.fillText(labels(s.card.rank),0,0);c.font=`${s.size*.48}px Georgia`;c.fillText(['♠','♥','♣','♦'][s.card.suit],0,s.size*.5);c.restore();},
 drawImpact(c,x,y,r,color,pattern,alpha){c.save();c.translate(x,y);c.globalAlpha=alpha;c.strokeStyle=color;c.fillStyle=color+'18';c.lineWidth=2;
 if(pattern.includes('straight')||pattern==='pair-run'){c.rotate(-.4);for(let i=-1;i<=1;i++){c.beginPath();c.moveTo(-r,i*8);c.quadraticCurveTo(0,-r*.25,r,i*8-5);c.stroke();}}
 else if(pattern.includes('flush')){for(let i=0;i<6;i++){c.rotate(Math.PI/3);c.beginPath();c.ellipse(0,r*.4,r*.2,r*.55,0,0,Math.PI*2);c.stroke();}}
 else{c.beginPath();for(let i=0;i<=24;i++){const a=i*Math.PI/12,d=r*(i%2?.6:1);i?c.lineTo(Math.cos(a)*d,Math.sin(a)*d):c.moveTo(d,0);}c.closePath();c.fill();c.stroke();}c.restore();}
};
