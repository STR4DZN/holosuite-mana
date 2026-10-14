import {formatMana,color,CREDIT_COLOR,DEBIT_COLOR,escapeHTML as e} from './core.js';
import {bankMark} from './icons.js';
export function easeCount(before,after,progress){const t=Math.min(1,Math.max(0,progress));return Math.round(before+(after-before)*(1-Math.pow(1-t,4)));}
export class ManaNotifications {
 constructor({reduced=()=>false}={}){this.queue=[];this.current=null;this.reduced=reduced;this.timer=null;this.frame=null;this.animations=[];this.root=null;this.events=new AbortController();window.addEventListener('pagehide',()=>this.destroy(),{signal:this.events.signal});}
 enqueue(receipt){this.queue.push(structuredClone(receipt));if(!this.current)this.next();}
 next(){
  const r=this.queue.shift();if(!r)return;this.current=r;const credit=r.delta>=0,reduced=this.reduced()||matchMedia('(prefers-reduced-motion: reduce)').matches;
  this.root=document.createElement('div');this.root.className='mb-notice-layer';this.root.style.setProperty('--mb-notice-color',color(r.color,credit?CREDIT_COLOR:DEBIT_COLOR));
  this.root.innerHTML=`<section class="mb-notice ${credit?'is-credit':'is-debit'} ${reduced?'is-reduced':''}" aria-label="${e(r.accountName)} ${credit?'ganhou':'perdeu'} ${formatMana(r.amount)} mana. Saldo: ${formatMana(r.after)} mana." role="status" aria-live="polite"><div class="mb-notice-halo" aria-hidden="true"></div><div class="mb-notice-orbit" aria-hidden="true"><svg viewBox="0 0 500 500"><circle cx="250" cy="250" r="224"/><circle cx="250" cy="250" r="208"/><path d="M250 9v22m241 219h-22M250 491v-22M9 250h22"/></svg></div><div class="mb-notice-particles" aria-hidden="true">${Array.from({length:18},(_,i)=>`<i style="--angle:${i*20}deg;--distance:${90+(i%4)*25}px;--delay:${(i%6)*55}ms"></i>`).join('')}</div><div class="mb-notice-panel"><div class="mb-notice-scan" aria-hidden="true"></div><div class="mb-notice-corner tl"></div><div class="mb-notice-corner tr"></div><div class="mb-notice-corner bl"></div><div class="mb-notice-corner br"></div><header>${bankMark}<span>BANCO MANA <b>◇</b> ${r.preview?'PRÉVIA LOCAL':'MOVIMENTAÇÃO CONFIRMADA'}</span><button type="button" class="mb-notice-dismiss" aria-label="Fechar notificação">×</button></header><div class="mb-notice-body"><span class="mb-notice-owner">${e(r.accountName)}</span><span class="mb-notice-label">${credit?'MANA RECEBIDA':'MANA REMOVIDA'}</span><div class="mb-notice-delta" aria-hidden="true"><span>${credit?'+':'−'}</span><strong>${reduced?formatMana(r.amount):'0'}</strong><small>MANA</small></div><div class="mb-notice-rule" aria-hidden="true"><i></i><span>◈</span><i></i></div><div class="mb-notice-total"><span>SALDO EM CONTA</span><strong aria-hidden="true">${formatMana(reduced?r.after:r.before)}</strong><small>mana</small></div></div><footer><span>${r.preview?'Somente você está vendo este teste.':credit?'Saldo atualizado. A missão continua.':'Débito confirmado. Saldo atualizado.'}</span><div class="mb-notice-progress"><i></i></div></footer></div></section>`;
  document.body.append(this.root);this.root.querySelector('.mb-notice-dismiss').onclick=()=>this.finish();
  const duration=reduced?2000:this.queue.length>3?2600:4600;
  if(!reduced)this.animate(r,duration);
  this.timer=setTimeout(()=>this.finish(),duration);
 }
 animate(r,duration){
  const animate=(selector,frames,options)=>{const el=this.root?.querySelector(selector);if(el)this.animations.push(el.animate(frames,{fill:'both',...options}));};
  animate('.mb-notice-panel',[{opacity:0,transform:'translateY(24px) scale(.93)',clipPath:'inset(49% 0 49% 0)'},{opacity:1,transform:'translateY(0) scale(1)',clipPath:'inset(0% 0 0% 0)'}],{duration:650,easing:'cubic-bezier(.16,1,.3,1)'});
  animate('.mb-notice-orbit',[{opacity:0,transform:'scale(.65) rotate(-75deg)'},{opacity:.7,offset:.3},{opacity:.2,transform:'scale(1.12) rotate(35deg)'}],{duration:1800,easing:'cubic-bezier(.2,.8,.3,1)'});
  animate('.mb-notice-halo',[{opacity:0,transform:'scale(.5)'},{opacity:.38,offset:.3},{opacity:.1,transform:'scale(1.25)'}],{duration:1600});
  animate('.mb-notice-scan',[{transform:'translateY(-120%)',opacity:0},{opacity:.9,offset:.2},{transform:'translateY(500%)',opacity:0}],{duration:1050,delay:180});
  animate('.mb-notice-delta',[{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:550,delay:250,easing:'ease-out'});
  animate('.mb-notice-progress i',[{transform:'scaleX(1)'},{transform:'scaleX(0)'}],{duration:duration-500,delay:450});
  animate('.mb-notice-panel',[{opacity:1,transform:'translateY(0) scale(1)'},{opacity:0,transform:'translateY(-12px) scale(.98)'}],{duration:350,delay:duration-350,easing:'ease-in',fill:'forwards'});
  for(const el of this.root.querySelectorAll('.mb-notice-particles i'))this.animations.push(el.animate([{opacity:0,transform:'rotate(var(--angle)) translateX(120px) scaleX(.2)'},{opacity:.9,offset:.25},{opacity:0,transform:'rotate(var(--angle)) translateX(calc(180px + var(--distance))) scaleX(2)'}],{duration:950,delay:250+parseInt(el.style.getPropertyValue('--delay')),fill:'both',easing:'ease-out'}));
  const delta=this.root.querySelector('.mb-notice-delta strong'),total=this.root.querySelector('.mb-notice-total strong'),start=performance.now();
  const tick=now=>{const t=(now-start-450)/1300;delta.textContent=formatMana(easeCount(0,r.amount,t));total.textContent=formatMana(easeCount(r.before,r.after,t));if(t<1&&this.current===r)this.frame=requestAnimationFrame(tick);else this.frame=null;};
  this.frame=requestAnimationFrame(tick);
 }
 finish(){clearTimeout(this.timer);cancelAnimationFrame(this.frame);this.animations.forEach(a=>a.cancel());this.animations=[];this.root?.remove();this.root=null;this.current=null;this.frame=null;this.timer=null;this.next();}
 destroy(){this.queue=[];this.finish();this.events.abort();}
}
