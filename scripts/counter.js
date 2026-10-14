import {formatMana} from './core.js';
export const COUNT_DELAY=380,COUNT_MS=1900,COUNTER_FRAMES=120;
export function counterFrames(amount,frames=COUNTER_FRAMES){return Array.from({length:frames+1},(_,i)=>Math.round(Math.abs(amount)*i/frames));}
// Own rendering loop: a busy Foundry document cannot stall the numeric canvas.
export const COUNTER_WORKER=`
let stopped=false;
onmessage=({data})=>{
 if(data.stop){stopped=true;return;}
 const {canvas,width,height,font,color,amount,start,duration,dpr}=data;
 const ctx=canvas.getContext('2d',{alpha:true,desynchronized:true});
 if(!ctx){postMessage({error:true});close();return;}
 ctx.scale(dpr,dpr);ctx.font=font;ctx.fillStyle=color;ctx.textBaseline='alphabetic';
 const format=new Intl.NumberFormat('pt-BR',{maximumFractionDigits:0});let last=-1,frames=0;
 const tick=()=>{
  if(stopped)return;
  const progress=Math.min(1,Math.max(0,(Date.now()-start)/duration)),value=Math.round(amount*progress);
  if(value!==last){ctx.clearRect(0,0,width,height);ctx.fillText(format.format(value),2,height*.77);last=value;frames++;}
  if(frames%8===0||progress>=1)postMessage({value,progress,frames,at:Date.now()});
  if(progress<1){if(typeof requestAnimationFrame==='function')requestAnimationFrame(tick);else setTimeout(tick,16);}else setTimeout(()=>close(),32);
 };tick();
};`;
export class ManaCounter{
 constructor(host,amount,{delay=COUNT_DELAY,duration=COUNT_MS,origin=document.timeline.currentTime}={}){
  this.host=host;this.amount=Math.abs(amount);this.animations=[];this.worker=null;this.url=null;this.frames=0;this.mode='static';
  host.innerHTML='<span class="mb-counter-text">0</span>';this.text=host.firstElementChild;this.value=0;host.dataset.value='0';
  const style=getComputedStyle(host),fontSize=parseFloat(style.fontSize),height=fontSize*1.2;
  const probe=document.createElement('canvas'),context=probe.getContext('2d');if(context)context.font=`500 ${fontSize}px ${style.fontFamily}`;
  const width=Math.ceil((context?context.measureText(formatMana(this.amount)).width:formatMana(this.amount).length*fontSize*.63)+7);host.style.width=width+'px';host.style.height=height+'px';
  if(typeof Worker==='function'&&typeof probe.transferControlToOffscreen==='function'){
   try{
    const canvas=document.createElement('canvas'),dpr=Math.min(devicePixelRatio||1,2);canvas.className='mb-counter-canvas';canvas.setAttribute('aria-hidden','true');canvas.width=Math.ceil(width*dpr);canvas.height=Math.ceil(height*dpr);canvas.style.width=width+'px';canvas.style.height=height+'px';
    host.append(canvas);const offscreen=canvas.transferControlToOffscreen();this.url=URL.createObjectURL(new Blob([COUNTER_WORKER],{type:'text/javascript'}));this.worker=new Worker(this.url);
    const start=Date.now()+delay;
    this.worker.onmessage=({data})=>{if(data.error){this.fallback({delay:Math.max(0,start-Date.now()),duration,origin});return;}this.frames=data.frames;host.dataset.frames=String(data.frames);};
    this.worker.onerror=event=>{event.preventDefault();this.fallback({delay:Math.max(0,start-Date.now()),duration,origin});};
    this.worker.postMessage({canvas:offscreen,width,height,font:`500 ${fontSize}px ${style.fontFamily}`,color:style.color,amount:this.amount,start,duration,dpr},[offscreen]);
    this.mode='worker';host.classList.add('has-canvas');host.dataset.counterMode=this.mode;return;
   }catch{this.stopWorker();host.querySelector('canvas')?.remove();}
  }
  this.fallback({delay,duration,origin});
 }
 stopWorker(){if(this.worker){this.worker.onmessage=null;this.worker.onerror=null;this.worker.terminate();}this.worker=null;if(this.url)URL.revokeObjectURL(this.url);this.url=null;}
 fallback({delay=COUNT_DELAY,duration=COUNT_MS,origin=document.timeline.currentTime}={}){
  this.stopWorker();this.host.querySelector('canvas')?.remove();this.host.classList.remove('has-canvas');
  if(this.mode==='sprite')return;
  const viewport=document.createElement('span');viewport.className='mb-counter-viewport';viewport.setAttribute('aria-hidden','true');const strip=document.createElement('span');strip.className='mb-counter-strip';strip.innerHTML=counterFrames(this.amount).map(n=>`<span>${formatMana(n)}</span>`).join('');viewport.append(strip);this.host.append(viewport);
  try{const animation=strip.animate([{transform:'translate3d(0,0,0)'},{transform:`translate3d(0,-${COUNTER_FRAMES*1.2}em,0)`}],{duration,delay,easing:`steps(${COUNTER_FRAMES},end)`,fill:'both'});if(origin!==null)animation.startTime=origin;this.animations.push(animation);this.mode='sprite';this.host.classList.add('has-sprite');}
  catch{viewport.remove();this.mode='text';}
  this.host.dataset.counterMode=this.mode;
 }
 setValue(value){const next=Math.abs(value);if(this.value===next)return;this.value=next;this.text.textContent=formatMana(next);this.host.dataset.value=String(next);}
 settle(){this.stopWorker();for(const a of this.animations)a.cancel();this.animations=[];this.host.classList.remove('has-canvas','has-sprite');this.host.classList.add('is-final');this.host.style.width='';this.host.style.height='';this.setValue(this.amount);}
 destroy(){this.stopWorker();for(const a of this.animations)a.cancel();this.animations=[];}
}
