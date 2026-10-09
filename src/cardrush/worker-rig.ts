/** Twelve independently replaceable painted pieces, articulated at shoulders, elbows, hips and knees. */
const names=['head','torso','upper-arm-l','upper-arm-r','forearm-l','forearm-r','thigh-l','thigh-r','shin-l','shin-r','shoulder-l','shoulder-r'];
const pieces=new Map<string,HTMLImageElement>();
for(const name of names){const img=new Image();img.src=`${import.meta.env.BASE_URL}cardrush/worker/${name}.png`;pieces.set(name,img);}
export function rigReady(){return [...pieces.values()].every(i=>i.complete&&i.naturalWidth>0);}
export function drawWorker(c:CanvasRenderingContext2D,e:{x:number;y:number;seed:number;hit:number;hp:number;max:number},time:number){if(!rigReady())return false;
 const walk=Math.sin(time*5+e.seed),recoil=e.hit/.13;
 c.save();c.translate(e.x,e.y);c.fillStyle='#342f3428';c.beginPath();c.ellipse(0,36,18,5,0,0,Math.PI*2);c.fill();c.translate(0,Math.abs(walk)*1.4);c.rotate(walk*.025-recoil*.18);if(recoil>.2)c.filter=`brightness(${1+recoil*.8})`;
 const part=(name:string,x:number,y:number,w:number,h:number)=>{c.drawImage(pieces.get(name)!,x,y,w,h);};
 const chain=(side:string,x:number,y:number,angle:number,upper:string,lower:string,w:number,len:number,lowerLen:number)=>{c.save();c.translate(x,y);c.rotate(angle);part(upper+'-'+side,-w/2,-2,w,len+4);c.translate(0,len);c.rotate(-angle*.6+.12);part(lower+'-'+side,-w/2,-3,w,lowerLen+4);c.restore();};
 chain('l',-7,12,walk*.18,'thigh','shin',13,12,17);chain('r',7,12,-walk*.18,'thigh','shin',13,12,17);
 chain('l',-12,-12,.18+walk*.11+recoil*.4,'upper-arm','forearm',11,13,19);chain('r',12,-12,-.18-walk*.11-recoil*.4,'upper-arm','forearm',11,13,19);
 part('torso',-16,-19,32,39);part('shoulder-l',-19,-18,13,14);part('shoulder-r',7,-18,13,14);
 c.save();c.translate(0,-24);c.rotate(-walk*.025+recoil*.22);part('head',-11,-15,22,27);c.restore();c.filter='none';
 if(e.hp<e.max&&e.hp>0){c.fillStyle='#b59d79';c.fillRect(-14,-44,28,3);c.fillStyle='#963b32';c.fillRect(-14,-44,28*e.hp/e.max,3);}c.restore();return true;}
