import * as T from 'three';
import type {Formation} from './formations';
/** Persistent filled geometry accompanies each physical volley, never creates extra card faces. */
export class FlightFX{
 private groups=new Map<Formation,T.Group>();
 constructor(private scene:T.Scene){}
 private leaf(){const s=new T.Shape();s.moveTo(0,-5);s.bezierCurveTo(-19,5,-20,30,0,40);s.bezierCurveTo(20,30,19,5,0,-5);return new T.ShapeGeometry(s,8);}
 update(formations:Set<Formation>,H:number){for(const [f,g]of this.groups)if(!formations.has(f)){this.scene.remove(g);g.traverse(o=>{if(o instanceof T.Mesh){o.geometry.dispose();(o.material as T.Material).dispose();}});this.groups.delete(f);}
 for(const f of formations){let g=this.groups.get(f);if(!g){g=new T.Group();this.scene.add(g);this.groups.set(f,g);const flower=f.pattern.includes('flush'),bomb=['bomb','chain-bomb','full-house'].includes(f.pattern),plane=f.pattern.startsWith('airplane'),blade=f.pattern==='straight'||f.pattern==='pair-run';const count=flower?f.count:plane?2:bomb?5:blade?2:3;
 for(let i=0;i<count;i++){let geo:T.BufferGeometry;if(flower)geo=this.leaf();else if(bomb)geo=new T.IcosahedronGeometry(10,1);else{const s=new T.Shape();s.moveTo(-8,5);s.quadraticCurveTo(-32,-25,0,-80);s.quadraticCurveTo(-13,-22,8,5);s.closePath();geo=new T.ShapeGeometry(s);}const color=flower?(i%2?0xf075a9:0xc04878):bomb?(i%2?0xffa441:0xe15b23):plane?0x79b7d9:blade?0x64b8a4:0xa184c4;const mesh=new T.Mesh(geo,new T.MeshBasicMaterial({color,transparent:true,opacity:flower?.48:bomb?.7:.35,side:T.DoubleSide,depthWrite:false}));g.add(mesh);}}
 g.position.set(f.x,H-f.y,12);g.rotation.z=-f.angle-Math.PI/2;const flower=f.pattern.includes('flush'),bomb=['bomb','chain-bomb','full-house'].includes(f.pattern),plane=f.pattern.startsWith('airplane');g.children.forEach((o,i)=>{const m=o as T.Mesh;
 if(flower){const a=i*Math.PI*2/f.count+f.age*.75,r=8+Math.min(1,f.age/.35)*29;m.position.set(Math.cos(a)*r,Math.sin(a)*r,0);m.rotation.z=a-Math.PI/2;m.rotation.x=Math.sin(f.age*4+i)*.3;m.scale.setScalar(.7+Math.min(1,f.age/.3)*.6);}
 else if(bomb){const a=i*Math.PI*2/5+f.age*5,r=19*(1-Math.min(1,f.age/.2))+3;m.position.set(Math.cos(a)*r,Math.sin(a)*r,0);m.rotation.set(f.age*5,i+f.age*3,0);m.scale.setScalar(.7+Math.sin(f.age*22)*.15);}
 else if(plane){m.position.set((i?1:-1)*f.count*9,-15,0);m.rotation.y=f.turn*.22;m.rotation.z=i?-.3:.3;m.scale.set(1.4,1.3,1);}
 else{m.position.set((i-(g!.children.length-1)/2)*20,-14,0);m.rotation.z=Math.sin(f.age*8+i)*.12;m.scale.set(1,1+Math.sin(f.age*9)*.15,1);}});
 }}
}
