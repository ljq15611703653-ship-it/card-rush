/** A volley owns one center and orientation; cards occupy animated local slots until impact. */
export interface Formation{pattern:string;count:number;x:number;y:number;angle:number;age:number;turn:number;detonated:boolean}
export function advanceFormation(f:Formation,dt:number,enemies:{x:number;y:number;hp:number}[]){f.age+=dt;const old=f.angle;
 if(f.pattern.startsWith('airplane')){const target=enemies.filter(e=>e.hp>0).sort((a,b)=>Math.hypot(a.x-f.x,a.y-f.y)-Math.hypot(b.x-f.x,b.y-f.y))[0];if(target){const desired=Math.atan2(target.y-f.y,target.x-f.x),delta=Math.atan2(Math.sin(desired-f.angle),Math.cos(desired-f.angle));f.angle+=Math.max(-dt*2.2,Math.min(dt*2.2,delta));}}
 f.turn=(f.angle-old)/Math.max(dt,.001);const bomb=['bomb','chain-bomb'].includes(f.pattern),speed=bomb&&f.age<.2?120:f.pattern.startsWith('airplane')?440+Math.min(1,f.age)*240:540;f.x+=Math.cos(f.angle)*speed*dt;f.y+=Math.sin(f.angle)*speed*dt;
}
export function formationSlot(f:Formation,i:number){const mid=(f.count-1)/2,t=f.age;let side=(i-mid)*24,along=0,spin=0,bank=0;
 if(f.pattern==='pair'||f.pattern==='two-pair'){const pair=Math.floor(i/2),sign=i%2?1:-1;side=sign*Math.cos(t*12)*25+(pair-(Math.ceil(f.count/2)-1)/2)*48;along=sign*Math.sin(t*12)*9;bank=sign*Math.sin(t*12)*.5;}
 else if(f.pattern==='triple'||f.pattern==='triple-single'){if(i<3){const a=t*7+i*Math.PI*2/3;side=Math.cos(a)*29;along=Math.sin(a)*29;spin=a;}else{side=0;along=-65;}}
 else if(f.pattern==='straight'||f.pattern==='straight-flush'){side=(i-mid)*21;along=(i-mid)*16;spin=(i-mid)*.08;}
 else if(f.pattern==='pair-run'){const sign=i%2?1:-1,pair=Math.floor(i/2);side=sign*(8+Math.abs(Math.sin(t*10-pair*.7))*28);along=-pair*32;bank=sign*Math.sin(t*10-pair*.7)*.6;}
 else if(f.pattern==='flush'){const a=i*Math.PI*2/f.count+t*.75,r=10+Math.min(1,t/.35)*39;side=Math.cos(a)*r;along=Math.sin(a)*r;spin=a;}
 else if(f.pattern==='bomb'||f.pattern==='chain-bomb'){const a=i*Math.PI*2/f.count+t*5,r=30*(1-Math.min(1,t/.2))+6;side=Math.cos(a)*r;along=Math.sin(a)*r;spin=t*4+i*.14;}
 else if(f.pattern==='full-house'){if(i<3){side=(i-1)*21;along=0;}else{side=(i===3?-1:1)*24;along=-105-(i-3)*50;}}
 else if(f.pattern.startsWith('airplane')){side=(i-mid)*27;along=-Math.abs(i-mid)*24;bank=-f.turn*.23;spin=(i-mid)*.04;}
 return {x:f.x-Math.sin(f.angle)*side+Math.cos(f.angle)*along,y:f.y+Math.cos(f.angle)*side+Math.sin(f.angle)*along,rotation:f.angle+Math.PI/2+spin,bank};
}
