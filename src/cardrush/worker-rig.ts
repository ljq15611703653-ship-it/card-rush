import {enemyTypes,type EnemyKind} from './enemies';
/** Twelve independently replaceable painted pieces, articulated at shoulders, elbows, hips and knees. */
const names=['head','torso','upper-arm-l','upper-arm-r','forearm-l','forearm-r','thigh-l','thigh-r','shin-l','shin-r','shoulder-l','shoulder-r'];
const pieces=new Map<string,HTMLImageElement>();
for(const name of names){const img=new Image();img.src=`${import.meta.env.BASE_URL}cardrush/worker/${name}.png`;pieces.set(name,img);}
export function rigReady(){return [...pieces.values()].every(i=>i.complete&&i.naturalWidth>0);}
export function drawWorker(c:CanvasRenderingContext2D,e:{kind?:EnemyKind;x:number;y:number;seed:number;hit:number;hp:number;max:number},time:number){if(!rigReady())return false;
 const walk=Math.sin(time*5+e.seed),recoil=e.hit/.13;
 c.save();c.translate(e.x,e.y);const spec=enemyTypes[e.kind??'walker'];c.scale(spec.scale,spec.scale);c.fillStyle='#342f3428';c.beginPath();c.ellipse(0,36,18,5,0,0,Math.PI*2);c.fill();c.translate(0,Math.abs(walk)*1.4);c.rotate(walk*.025-recoil*.18);if(recoil>.2)c.filter=`brightness(${1+recoil*.8})`;
 const part=(name:string,x:number,y:number,w:number,h:number)=>{c.drawImage(pieces.get(name)!,x,y,w,h);};
 const chain=(side:string,x:number,y:number,angle:number,upper:string,lower:string,w:number,len:number,lowerLen:number)=>{c.save();c.translate(x,y);c.rotate(angle);part(upper+'-'+side,-w/2,-2,w,len+4);c.translate(0,len);c.rotate(-angle*.6+.12);part(lower+'-'+side,-w/2,-3,w,lowerLen+4);c.restore();};
 chain('l',-7,12,walk*.18,'thigh','shin',13,12,17);chain('r',7,12,-walk*.18,'thigh','shin',13,12,17);
 chain('l',-12,-12,.18+walk*.11+recoil*.4,'upper-arm','forearm',11,13,19);chain('r',12,-12,-.18-walk*.11-recoil*.4,'upper-arm','forearm',11,13,19);
 part('torso',-16,-19,32,39);part('shoulder-l',-19,-18,13,14);part('shoulder-r',7,-18,13,14);
 // Accessories share the torso transform, with painted planes and small mechanical details.
 const plate=(pts:number[][],light:string,dark:string)=>{const g=c.createLinearGradient(-16,-20,16,20);g.addColorStop(0,light);g.addColorStop(.5,dark);g.addColorStop(1,'#292f36');c.fillStyle=g;c.strokeStyle='#302d30';c.lineWidth=1;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();c.save();c.clip();c.globalAlpha=.32;c.globalCompositeOperation='multiply';c.drawImage(pieces.get('shoulder-l')!,-21,-24,43,48);c.restore();c.stroke();c.save();c.clip();c.strokeStyle='#d6cbb0';c.globalAlpha=.35;c.lineWidth=.5;for(let k=0;k<9;k++){const x=-15+(k*11%29),y=-16+(k*7%27);c.beginPath();c.moveTo(x,y);c.lineTo(x+2,y-2);c.stroke();}c.restore();};
 const rivet=(x:number,y:number)=>{c.fillStyle='#cfb99a';c.beginPath();c.arc(x,y,.9,0,Math.PI*2);c.fill();c.fillStyle='#343334';c.fillRect(x-.35,y-.25,.7,.5);};
 if(e.kind==='armored'){
  plate([[-17,-17],[-6,-20],[-4,-11],[-13,-6],[-19,-10]],'#a9a99d','#5d7076');
  plate([[7,-20],[18,-16],[19,-8],[12,-6],[5,-12]],'#b5b5a3','#52646d');
  plate([[-12,-15],[0,-18],[12,-14],[10,7],[0,14],[-11,6]],'#a9b3ad','#50616a');
  plate([[0,-16],[10,-12],[8,6],[0,11]],'#768a8b','#394a55');
  c.strokeStyle='#b3b8a5';c.lineWidth=.8;c.beginPath();c.moveTo(-10,-12);c.lineTo(-7,4);c.lineTo(-1,8);c.stroke();
  c.strokeStyle='#2a343c';for(let y=-6;y<5;y+=4){c.beginPath();c.moveTo(-7,y);c.lineTo(7,y+1);c.stroke();}
  for(const [x,y] of [[-9,-12],[8,-11],[-8,4],[7,5]])rivet(x,y);
 }
 if(e.kind==='volatile'){
  c.strokeStyle='#513f31';c.lineWidth=3;c.beginPath();c.moveTo(-11,-18);c.lineTo(10,16);c.moveTo(11,-18);c.lineTo(-10,16);c.stroke();
  for(const x of [-12,11]){c.save();c.translate(x,0);c.rotate(x<0?-.2:.2);const g=c.createRadialGradient(-2,-4,1,0,0,12);g.addColorStop(0,'#e4c984');g.addColorStop(.4,'#9b803c');g.addColorStop(.8,'#605434');g.addColorStop(1,'#343c32');c.fillStyle=g;c.strokeStyle='#493d2e';c.lineWidth=1.2;c.beginPath();c.moveTo(0,-12);c.bezierCurveTo(9,-11,9,8,2,12);c.bezierCurveTo(-7,15,-10,-6,0,-12);c.fill();c.stroke();
   c.strokeStyle='#746434';c.lineWidth=.7;for(let k=0;k<3;k++){c.beginPath();c.moveTo(-3+k*2,-7);c.bezierCurveTo(3+k,0,-2+k,3,2,8);c.stroke();}
   c.fillStyle='#574d39';c.fillRect(-5,-10,9,3);c.fillRect(-5,7,10,2);rivet(-3,-9);rivet(2,8);c.restore();}
 }
 if(e.kind==='brute'){plate([[-18,-16],[-8,-20],[-6,-9],[-17,-5]],'#9b8874','#5f5151');plate([[8,-19],[19,-15],[18,-5],[7,-8]],'#ac9275','#615352');c.strokeStyle='#513f35';c.lineWidth=3;c.beginPath();c.moveTo(-11,-14);c.lineTo(9,17);c.stroke();rivet(-9,-12);rivet(7,13);}
 if(e.kind==='runner'){c.strokeStyle='#937551';c.lineWidth=2;c.beginPath();c.moveTo(-10,-15);c.lineTo(8,17);c.stroke();plate([[-5,-6],[2,-8],[6,0],[-1,3]],'#bc9f70','#6e5a42');rivet(0,-3);}
 c.save();c.translate(0,-24);c.rotate(-walk*.025+recoil*.22);part('head',-11,-15,22,27);c.restore();c.filter='none';if(e.kind&&e.kind!=='walker'){c.fillStyle=spec.color;c.font='bold 9px sans-serif';c.textAlign='center';c.fillText(spec.name,0,-48);}
 if(e.hp<e.max&&e.hp>0){c.fillStyle='#b59d79';c.fillRect(-14,-44,28,3);c.fillStyle='#963b32';c.fillRect(-14,-44,28*e.hp/e.max,3);}c.restore();return true;}
