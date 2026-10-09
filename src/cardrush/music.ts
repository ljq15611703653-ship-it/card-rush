export type Cue='select'|'load'|'ready'|'fire'|'hit'|'kill';
export interface AudioDirector{unlock():Promise<void>;setEnabled(v:boolean):void;setPaused(v:boolean):void;cue(kind:Cue,power?:number):boolean;update(dt:number):void;status():unknown;dispose():void}
/** Replace this adapter with sampled instruments without touching combat. Fixed 84 BPM ambient arrangement; combat never changes the score. */
export class PaperMusic implements AudioDirector{
 private ctx:AudioContext|null=null;private master:GainNode|null=null;private timer:number|undefined;private next=0;private tick=0;private energy=0;private enabled=true;private paused=false;private notes=0;private lastHit=0;
 async unlock(){this.ctx??=new AudioContext();if(!this.master){this.master=this.ctx.createGain();const limiter=this.ctx.createDynamicsCompressor();limiter.threshold.value=-16;limiter.ratio.value=8;this.master.gain.value=.25;this.master.connect(limiter).connect(this.ctx.destination);this.next=this.ctx.currentTime+.05;}await this.ctx.resume();if(this.timer===undefined)this.timer=window.setInterval(()=>this.schedule(),25);}
 setEnabled(v:boolean){this.enabled=v;if(this.master&&this.ctx)this.master.gain.setTargetAtTime(v&&!this.paused?.25:0,this.ctx.currentTime,.04);}
 setPaused(v:boolean){this.paused=v;this.setEnabled(this.enabled);}
 private tone(f:number,t:number,d:number,v:number,type:OscillatorType='triangle',end?:number){if(!this.ctx||!this.master)return;const o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(end)o.frequency.exponentialRampToValueAtTime(end,t+d);g.gain.setValueAtTime(.001,t);g.gain.linearRampToValueAtTime(v,t+.008);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g).connect(this.master);o.start(t);o.stop(t+d+.01);this.notes++;}
 private noise(t:number,d:number,v:number){if(!this.ctx||!this.master)return;const b=this.ctx.createBuffer(1,Math.ceil(this.ctx.sampleRate*d),this.ctx.sampleRate),data=b.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*(1-i/data.length);const src=this.ctx.createBufferSource(),filter=this.ctx.createBiquadFilter(),g=this.ctx.createGain();filter.type='highpass';filter.frequency.value=2200;src.buffer=b;g.gain.value=v;src.connect(filter).connect(g).connect(this.master);src.start(t);}
 private schedule(){if(!this.ctx)return;const now=this.ctx.currentTime;if(this.next<now-.2)this.next=now+.025;const step=60/84/2;while(this.next<now+.1){if(this.enabled&&!this.paused){const i=this.tick%32,root=[110,87.307,130.813,97.999][Math.floor(this.tick/32)%4];if(i%8===0){this.tone(root/2,this.next,1.8,.09,'sine');this.tone(root,this.next,2.3,.035,'triangle');this.tone(root*1.5,this.next,2,.023,'sine');}if(i%8===4)this.tone(72,this.next,.16,.07,'sine',40);if(i===2||i===12||i===22)this.tone(root*[2,2.25,1.5][Math.floor(i/10)],this.next,.9,.035,'sine');}this.tick++;this.next+=step;}}

 cue(kind:Cue,power=1){const c=this.ctx;if(!c||!this.enabled||this.paused)return false;const t=c.currentTime;
 if(kind==='select')this.noise(t,.02,.025);
 if(kind==='load')this.noise(t,.055,.13);
 if(kind==='ready'){this.noise(t,.045,.065);}
 if(kind==='fire'){this.energy=Math.min(1,this.energy+.15+power*.025);this.tone(85+power*3,t,.16,.28,'triangle',35);this.noise(t,.04,.07);}
 if(kind==='hit'&&t-this.lastHit>.055){this.noise(t,.03,.07);this.lastHit=t;}
 if(kind==='kill'&&t-this.lastHit>.08){this.noise(t,.045,.045);this.lastHit=t;}return false;}

 update(dt:number){this.energy=Math.max(0,this.energy-dt*.045);}
 status(){return {bpm:84,mode:'ambient-fixed',energy:this.energy,notes:this.notes,state:this.ctx?.state??'locked',enabled:this.enabled,paused:this.paused};}
 dispose(){if(this.timer!==undefined)clearInterval(this.timer);void this.ctx?.close();}
}
