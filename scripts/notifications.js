import {formatMana,color,CREDIT_COLOR,DEBIT_COLOR,escapeHTML as e} from './core.js';
import {bankMark} from './icons.js';
import {ManaCounter,COUNT_DELAY,COUNT_MS} from './counter.js';
export function easeCount(before,after,progress){const t=Math.min(1,Math.max(0,progress));return Math.round(before+(after-before)*t);}
export const noticeDuration=r=>r.profile==='cinematic'?4600:4000;
export function countState(r,elapsed){const progress=Math.min(1,Math.max(0,(elapsed-COUNT_DELAY)/COUNT_MS));return {progress,total:easeCount(r.before,r.after,progress),amount:easeCount(0,r.amount,progress)};}
export class ManaNotifications{
 constructor({reduced=()=>false}={}){
  this.queue=[];this.current=null;this.reduced=reduced;this.timer=null;this.frame=null;this.counterTimer=null;this.animations=[];this.root=null;this.counter=null;this.events=new AbortController();this.media=matchMedia('(prefers-reduced-motion: reduce)');
  window.addEventListener('pagehide',()=>this.destroy(),{signal:this.events.signal});this.media.addEventListener('change',()=>this.reduceCurrent(),{signal:this.events.signal});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&this.current){if(performance.now()-this.started>=this.duration)this.finish();else this.updateCount();}},{signal:this.events.signal});
 }
 enqueue(receipt){this.queue.push(structuredClone(receipt));if(!this.current)this.next();}
 next(){
  const r=this.queue.shift();if(!r)return;this.current=r;const credit=r.direction?r.direction==='credit':r.delta>=0,reduced=this.reduced()||this.media.matches;
  this.started=performance.now();this.duration=reduced?1800:noticeDuration(r);this.origin=document.timeline.currentTime;
  const length=formatMana(r.amount).length,counterSize=Math.min(116,530/(length*.61+1));
  this.root=document.createElement('div');this.root.className='mb-notice-layer';this.root.style.setProperty('--mb-notice-color',color(r.color,credit?CREDIT_COLOR:DEBIT_COLOR));this.root.style.setProperty('--mb-counter-size',counterSize+'px');this.root.style.setProperty('--mb-counter-chars',String(length*.61+1));
  this.root.innerHTML=`<section class="mb-notice ${credit?'is-credit':'is-debit'} ${reduced?'is-reduced':''}" role="status" aria-live="polite" aria-label="${credit?'Ganho':'Gasto'} de ${formatMana(r.amount)} mana. Saldo compartilhado: ${formatMana(r.after)} mana."><div class="mb-notice-antenna" aria-hidden="true"><span>MN</span><i></i><b>CONTA / 01</b></div><div class="mb-notice-panel"><div class="mb-notice-noise" aria-hidden="true"></div><div class="mb-notice-edge top" aria-hidden="true"><i></i></div><div class="mb-notice-edge bottom" aria-hidden="true"><i></i></div><header class="mb-notice-topline">${bankMark}<span>BANCO DE MANA <small>REDE FINANCEIRA DO GRUPO</small></span><b>${r.preview?'PRÉVIA LOCAL':'REGISTRO CONFIRMADO'}</b><button type="button" class="mb-notice-dismiss" aria-label="Fechar notificação">×</button></header><div class="mb-notice-main"><div class="mb-notice-latch first" aria-hidden="true"></div><div class="mb-notice-latch last" aria-hidden="true"></div><div class="mb-notice-readout"><div class="mb-notice-heading"><span class="mb-notice-label">${credit?'RECURSOS RECEBIDOS':'RECURSOS UTILIZADOS'}</span><span class="mb-notice-ref">TX / ${String(r.sequence||1).padStart(5,'0')}</span></div><div class="mb-notice-operation"><span>${credit?'CRÉDITO':'DÉBITO'}</span><i></i><b>MANA</b></div><div class="mb-notice-delta" aria-hidden="true"><span class="mb-notice-sign">${credit?'+':'−'}</span><strong class="mb-notice-counter">${formatMana(reduced?r.amount:0)}</strong></div><div class="mb-notice-balance-block" aria-hidden="true"><div class="mb-notice-before"><small>RESERVA ANTERIOR</small><b>${formatMana(r.before)}</b></div><span class="mb-notice-balance-arrow">${credit?'↗':'↘'}</span><div class="mb-notice-total"><span>SALDO DO GRUPO</span><strong>${formatMana(r.after)}</strong><small>MANA</small></div></div><p class="mb-notice-note">${e(r.note||'Movimentação no saldo compartilhado.')}</p><div class="mb-notice-seal" aria-hidden="true"><b><i class="mb-check-short"></i><i class="mb-check-long"></i></b><span>SALDO ATUALIZADO</span></div></div></div><footer class="mb-notice-timeline" aria-hidden="true"><span class="mb-notice-step"><b>01</b> REGISTRADO</span><span class="mb-notice-divider"></span><span class="mb-notice-step"><b>02</b> RESERVA ATUALIZADA</span><span class="mb-notice-divider"></span><span class="mb-notice-step"><b>03</b> GRUPO NOTIFICADO</span><span class="mb-notice-hazard"></span></footer></div><div class="mb-notice-caption" aria-hidden="true"><span>RESERVA COMPARTILHADA / MANA</span><span>${credit?'ENTRADA':'SAÍDA'} DE RECURSOS <b>●</b></span></div></section>`;
  document.body.append(this.root);this.root.querySelector('.mb-notice-dismiss').onclick=()=>this.finish();this.timer=setTimeout(()=>this.finish(),this.duration);
  if(reduced){this.root.querySelector('.mb-notice').classList.add('is-settled');}
  else{
   this.counter=new ManaCounter(this.root.querySelector('.mb-notice-counter'),r.amount,{down:!credit,origin:this.origin});
   this.updateCount();this.counterTimer=setInterval(()=>this.updateCount(),32);this.animate();
  }
 }
 updateCount(){
  if(!this.root||!this.current)return;const state=countState(this.current,performance.now()-this.started);
  this.counter?.setValue(state.amount);this.root.querySelector('.mb-notice').classList.toggle('is-settled',state.progress>=1);
  if(state.progress>=1){this.counter?.settle();clearInterval(this.counterTimer);this.counterTimer=null;}
  return state.progress;
 }
 animate(){
  const travel=this.root.querySelector('.mb-notice-panel').clientWidth+80;
  const play=(selector,frames,duration,delay=0,options={})=>{for(const el of this.root.querySelectorAll(selector))try{const animation=el.animate(frames,{duration,delay,fill:'both',easing:'cubic-bezier(.16,1,.3,1)',...options});if(this.origin!==null)animation.startTime=this.origin;this.animations.push(animation);}catch{}};
  play('.mb-notice-panel',[{opacity:0,transform:'translateY(8px) scaleY(.015)'},{opacity:1,transform:'translateY(0) scaleY(1)'}],310);
  play('.mb-notice-antenna,.mb-notice-caption',[{opacity:0,transform:'translateX(-24px)'},{opacity:1,transform:'translateX(0)'}],280,120);
  play('.mb-notice-topline,.mb-notice-heading',[{opacity:0,transform:'translateX(-16px)'},{opacity:1,transform:'translateX(0)'}],270,160);
  play('.mb-notice-readout',[{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],280,200);
  // Finite accents stay on the frame; the numerical readout remains unobscured.
  play('.mb-notice-latch.first',[{opacity:0,transform:'translate(-5px,-5px)'},{opacity:1,transform:'translate(0,0)'}],360,270);
  play('.mb-notice-latch.last',[{opacity:0,transform:'translate(5px,5px)'},{opacity:1,transform:'translate(0,0)'}],360,340);
  play('.mb-notice-operation>span',[{opacity:0,transform:'translateX(-8px)'},{opacity:1,transform:'translateX(2px)',offset:.75},{opacity:1,transform:'translateX(0)'}],340,260);
  play('.mb-notice-sign',[{opacity:.3,transform:'translateY(4px)'},{opacity:1,transform:'translateY(0)'}],300,300);
  play('.mb-notice-edge.top i',[{opacity:0,transform:'translateX(-80px)'},{opacity:.9,offset:.25},{opacity:.9,offset:.7},{opacity:0,transform:`translateX(${travel}px)`}],1100,350,{easing:'cubic-bezier(.4,0,.2,1)'});
  play('.mb-notice-edge.bottom i',[{opacity:0,transform:`translateX(${travel}px)`},{opacity:.8,offset:.25},{opacity:.8,offset:.7},{opacity:0,transform:'translateX(-80px)'}],800,COUNT_DELAY+COUNT_MS,{easing:'cubic-bezier(.4,0,.2,1)'});
  play('.mb-notice-balance-block,.mb-notice-note',[{opacity:0,transform:'translateX(12px)'},{opacity:1,transform:'translateX(0)'}],330,450);
  play('.mb-notice-seal',[{opacity:0,transform:'translateY(5px)'},{opacity:1,transform:'translateY(0)'}],220,COUNT_DELAY+COUNT_MS);
  play('.mb-check-short',[{transform:'rotate(45deg) scaleX(0)'},{transform:'rotate(45deg) scaleX(1)'}],110,COUNT_DELAY+COUNT_MS+100);
  play('.mb-check-long',[{transform:'rotate(-45deg) scaleX(0)'},{transform:'rotate(-45deg) scaleX(1)'}],180,COUNT_DELAY+COUNT_MS+180);
  play('.mb-notice-seal b',[{opacity:.4,transform:'scale(.85)'},{opacity:1,transform:'scale(1)'}],280,COUNT_DELAY+COUNT_MS);
  play('.mb-notice-balance-arrow',[{opacity:.5,transform:'translate(0,0)'},{opacity:1,transform:'translate(2px,-2px)',offset:.5},{opacity:1,transform:'translate(0,0)'}],320,COUNT_DELAY+COUNT_MS);
  for(const [i,el]of [...this.root.querySelectorAll('.mb-notice-step')].entries())try{const a=el.animate([{opacity:.3},{opacity:1}],{duration:160,delay:200+i*1000,fill:'both'});if(this.origin!==null)a.startTime=this.origin;this.animations.push(a);}catch{}
  play('.mb-notice-panel',[{opacity:1,transform:'translateY(0) scaleY(1)'},{opacity:0,transform:'translateY(-5px) scaleY(.015)'}],280,this.duration-280,{fill:'forwards',easing:'cubic-bezier(.65,0,.9,.3)'});
  play('.mb-notice-antenna,.mb-notice-caption',[{opacity:1},{opacity:0}],230,this.duration-280,{fill:'forwards'});
 }
 reduceCurrent(){if(!this.current||!this.root||!(this.reduced()||this.media.matches))return;this.stopMotion();this.counter?.settle();this.root.querySelector('.mb-notice').classList.add('is-reduced','is-settled');clearTimeout(this.timer);this.timer=setTimeout(()=>this.finish(),1800);}
 stopMotion(){cancelAnimationFrame(this.frame);this.frame=null;clearInterval(this.counterTimer);this.counterTimer=null;for(const a of this.animations)a.cancel();this.animations=[];}
 finish(){clearTimeout(this.timer);this.stopMotion();this.counter?.destroy();this.counter=null;this.root?.remove();this.root=null;this.current=null;this.timer=null;this.next();}
 destroy(){this.queue=[];this.finish();this.events.abort();}
}
