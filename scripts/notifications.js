import {formatMana,color,CREDIT_COLOR,DEBIT_COLOR,escapeHTML as e} from './core.js';
import {bankMark} from './icons.js';
export function easeCount(before,after,progress){const t=Math.min(1,Math.max(0,progress));return Math.round(before+(after-before)*(1-(1-t)**3));}
export const noticeDuration=r=>r.profile==='cinematic'?4600:4000;
export function countState(r,elapsed){const progress=Math.min(1,Math.max(0,(elapsed-140)/1200));return {progress,total:easeCount(r.before,r.after,progress)};}
export class ManaNotifications{
 constructor({reduced=()=>false}={}){
  this.queue=[];this.current=null;this.reduced=reduced;this.timer=null;this.frame=null;this.counterTimer=null;this.animations=[];this.root=null;this.events=new AbortController();this.media=matchMedia('(prefers-reduced-motion: reduce)');
  window.addEventListener('pagehide',()=>this.destroy(),{signal:this.events.signal});this.media.addEventListener('change',()=>this.reduceCurrent(),{signal:this.events.signal});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&this.current){if(performance.now()-this.started>=this.duration)this.finish();else this.updateCount();}},{signal:this.events.signal});
 }
 enqueue(receipt){this.queue.push(structuredClone(receipt));if(!this.current)this.next();}
 next(){
  const r=this.queue.shift();if(!r)return;this.current=r;const credit=r.direction?r.direction==='credit':r.delta>=0,reduced=this.reduced()||this.media.matches;
  this.started=performance.now();this.duration=reduced?1800:noticeDuration(r);
  this.root=document.createElement('div');this.root.className='mb-notice-layer';this.root.style.setProperty('--mb-notice-color',color(r.color,credit?CREDIT_COLOR:DEBIT_COLOR));
  this.root.innerHTML=`<section class="mb-notice ${credit?'is-credit':'is-debit'} ${reduced?'is-reduced':''}" role="status" aria-live="polite" aria-label="${credit?'Ganho':'Gasto'} de ${formatMana(r.amount)} mana. Saldo compartilhado: ${formatMana(r.after)} mana."><div class="mb-notice-rail"></div><div class="mb-notice-rail right"></div><div class="mb-notice-panel"><div class="mb-notice-scan" aria-hidden="true"></div><header class="mb-notice-topline">${bankMark}<span>BANCO DE MANA <small>CONTA DO GRUPO</small></span><b>${r.preview?'PRÉVIA LOCAL':'TRANSAÇÃO REGISTRADA'}</b><button type="button" class="mb-notice-dismiss" aria-label="Fechar notificação">×</button></header><div class="mb-notice-main"><div class="mb-notice-vault" aria-hidden="true"><svg viewBox="0 0 160 160" fill="none"><path class="mb-vault-frame" d="M80 4 148 43v74l-68 39-68-39V43Z M80 17l56 33v60l-56 33-56-33V50Z"/><path class="mb-vault-circuit" d="M0 80h34l15-25h62l15 25h34M80 0v35M80 125v35M0 110h29l13 15m89-90-13 13"/><g class="mb-vault-mark">${bankMark.replace(/<svg[^>]*>|<\/svg>/g,'')}</g><path class="mb-vault-lock" d="m61 106 13 13 29-31"/></svg></div><div class="mb-notice-heading"><span class="mb-notice-label">${credit?'MANA RECEBIDA':'MANA UTILIZADA'}</span><span class="mb-notice-ref">TX ${String(r.sequence||1).padStart(5,'0')}</span></div><strong class="mb-notice-owner">Saldo de todos os jogadores</strong><div class="mb-notice-total ${String(r.after).length>9?'is-large':''}" aria-hidden="true"><span>SALDO COMPARTILHADO</span><div><strong>${formatMana(reduced?r.after:r.before)}</strong><small>MANA</small></div></div><div class="mb-notice-transfer" aria-hidden="true"><div class="mb-notice-before"><small>ANTES</small><b>${formatMana(r.before)}</b></div><div class="mb-notice-flow">${Array.from({length:7},()=>'<i></i>').join('')}<span>${credit?'ENTRADA':'SAÍDA'}</span></div><div class="mb-notice-delta"><small>${credit?'ADICIONADO':'REMOVIDO'}</small><div><span>${credit?'+':'−'}</span><strong>${formatMana(r.amount)}</strong><em>mana</em></div></div></div><div class="mb-notice-meter" aria-hidden="true">${Array.from({length:24},(_,i)=>`<i style="--n:${i}"></i>`).join('')}</div><p class="mb-notice-note">${e(r.note||'Reserva compartilhada atualizada.')}</p><div class="mb-notice-seal" aria-hidden="true"><b>✓</b><span>CONFIRMADO</span></div></div><div class="mb-notice-timeline" aria-hidden="true"><span class="mb-notice-step"><b>01</b> REGISTRADO</span><span class="mb-notice-track"><i></i></span><span class="mb-notice-step"><b>02</b> SALDO ATUALIZADO</span><span class="mb-notice-track"><i></i></span><span class="mb-notice-step"><b>03</b> CONFIRMADO</span></div><div class="mb-notice-progress" aria-hidden="true"><i></i></div></div></section>`;
  if(reduced){this.root.style.setProperty('--mb-count',1);this.root.querySelector('.mb-notice').classList.add('is-settled');}
  document.body.append(this.root);this.root.querySelector('.mb-notice-dismiss').onclick=()=>this.finish();
  // Start completion and the counter before decorative motion. A failed effect cannot stall values.
  this.timer=setTimeout(()=>this.finish(),this.duration);
  if(!reduced){this.updateCount();this.counterTimer=setInterval(()=>{if(performance.now()-this.lastCountTick>=80)this.updateCount();},50);this.scheduleFrame();this.animate(credit);}
 }
 updateCount(){
  if(!this.root||!this.current)return;this.lastCountTick=performance.now();const state=countState(this.current,this.lastCountTick-this.started);
  this.root.querySelector('.mb-notice-total strong').textContent=formatMana(state.total);this.root.style.setProperty('--mb-count',state.progress);this.root.querySelector('.mb-notice').classList.toggle('is-settled',state.progress>=1);
  if(state.progress>=1){clearInterval(this.counterTimer);this.counterTimer=null;cancelAnimationFrame(this.frame);this.frame=null;}
  return state.progress;
 }
 scheduleFrame(){try{this.frame=requestAnimationFrame(()=>{this.frame=null;if(this.current&&this.updateCount()<1)this.scheduleFrame();});}catch{this.frame=null;}}
 animate(credit){
  const play=(selector,frames,duration,delay=0,options={})=>{for(const el of this.root.querySelectorAll(selector))try{this.animations.push(el.animate(frames,{duration,delay,fill:'both',easing:'cubic-bezier(.16,1,.3,1)',...options}));}catch{/* Decorative motion is optional; the count and deadline already run. */}};
  play('.mb-notice-panel',[{opacity:0,transform:'translateY(12px) scale(.97)',clipPath:'inset(42% 0)'},{opacity:1,transform:'translateY(0) scale(1)',clipPath:'inset(0% 0)'}],300);
  play('.mb-notice-rail',[{opacity:0,transform:'scaleY(0)'},{opacity:1,transform:'scaleY(1)'}],340,40);
  play('.mb-notice-topline,.mb-notice-heading',[{opacity:0,transform:'translateX(-10px)'},{opacity:1,transform:'translateX(0)'}],260,70);
  play('.mb-notice-total',[{opacity:.3,transform:'translateY(7px)'},{opacity:1,transform:'translateY(0)'}],300,100);
  play('.mb-notice-transfer,.mb-notice-note',[{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],300,160);
  play('.mb-notice-scan',[{transform:'translateX(-100%)',opacity:0},{opacity:1,offset:.3},{transform:'translateX(100%)',opacity:0}],650,100);
  play('.mb-vault-frame',[{strokeDashoffset:500,opacity:.1},{strokeDashoffset:0,opacity:.6}],1100,70,{easing:'ease-out'});
  play('.mb-vault-mark',[{opacity:0,transform:'translate(46px, 31px) scale(1.4)'},{opacity:.5,transform:'translate(46px, 35px) scale(1.4)'}],550,240);
  play('.mb-vault-lock',[{strokeDashoffset:70,opacity:0},{strokeDashoffset:0,opacity:1}],300,1320);
  for(const [i,el]of [...this.root.querySelectorAll('.mb-notice-flow i')].entries())try{this.animations.push(el.animate([{opacity:.15,transform:'scaleX(.35)'},{opacity:1,transform:'scaleX(1)',offset:.5},{opacity:.25,transform:'scaleX(.6)'}],{duration:620,delay:220+(credit?i:6-i)*75,fill:'both',iterations:2}));}catch{}
  play('.mb-notice-seal',[{opacity:0,transform:'translateX(12px)'},{opacity:1,transform:'translateX(0)'}],260,1340);
  for(const [i,el]of [...this.root.querySelectorAll('.mb-notice-step')].entries())try{this.animations.push(el.animate([{opacity:.3},{opacity:1}],{duration:180,delay:120+i*590,fill:'both'}));}catch{}
  play('.mb-notice-track i',[{transform:'scaleX(0)'},{transform:'scaleX(1)'}],1100,160);
  play('.mb-notice-progress i',[{transform:'scaleX(1)'},{transform:'scaleX(0)'}],this.duration,0,{easing:'linear'});
  play('.mb-notice-panel',[{opacity:1,transform:'translateY(0)',clipPath:'inset(0% 0)'},{opacity:0,transform:'translateY(-8px)',clipPath:'inset(42% 0)'}],280,this.duration-280,{fill:'forwards',easing:'ease-in'});
  play('.mb-notice-rail',[{opacity:1},{opacity:0}],240,this.duration-240,{fill:'forwards'});
 }
 reduceCurrent(){if(!this.current||!this.root||!(this.reduced()||this.media.matches))return;this.stopMotion();this.root.querySelector('.mb-notice').classList.add('is-reduced','is-settled');this.root.querySelector('.mb-notice-total strong').textContent=formatMana(this.current.after);this.root.style.setProperty('--mb-count',1);clearTimeout(this.timer);this.timer=setTimeout(()=>this.finish(),1800);}
 stopMotion(){cancelAnimationFrame(this.frame);this.frame=null;clearInterval(this.counterTimer);this.counterTimer=null;for(const a of this.animations)a.cancel();this.animations=[];}
 finish(){clearTimeout(this.timer);this.stopMotion();this.root?.remove();this.root=null;this.current=null;this.timer=null;this.next();}
 destroy(){this.queue=[];this.finish();this.events.abort();}
}
