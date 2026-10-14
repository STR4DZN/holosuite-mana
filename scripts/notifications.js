import {formatMana,color,CREDIT_COLOR,DEBIT_COLOR,escapeHTML as e} from './core.js';
import {bankMark} from './icons.js';
import {ManaCounter,COUNT_DELAY,COUNT_MS} from './counter.js';
export function easeCount(before,after,progress){const t=Math.min(1,Math.max(0,progress));return Math.round(before+(after-before)*t);}
export const noticeDuration=r=>r.profile==='cinematic'?4600:4000;
export function countState(r,elapsed){const progress=Math.min(1,Math.max(0,(elapsed-COUNT_DELAY)/COUNT_MS));return {progress,total:easeCount(r.before,r.after,progress),amount:easeCount(0,r.amount,progress)};}
const emblem=`<svg viewBox="0 0 200 200" fill="none"><g class="mb-reticle-outer"><path d="M100 8 180 54v92l-80 46-80-46V54Z"/><path d="M100 17 172 59v82l-72 42-72-42V59Z" stroke-dasharray="2 6"/><path d="M100 0v22m0 156v22M0 100h22m156 0h22" stroke-width="3"/></g><g class="mb-reticle-inner"><path d="m100 45 48 28v54l-48 28-48-28V73Z"/><path d="m100 64 31 18v36l-31 18-31-18V82Z"/><path d="m100 81 18 10-18 28-18-28Z" fill="currentColor"/></g><g class="mb-reticle-path"><path d="M22 54h23l14-24h26m30 140h25l14-24h24M20 124h19l9 16m104-80 9 16h19"/></g><g fill="currentColor"><rect x="16" y="16" width="24" height="3"/><rect x="160" y="181" width="24" height="3"/><circle cx="28" cy="142" r="3"/><circle cx="172" cy="58" r="3"/></g></svg>`;
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
  this.root.innerHTML=`<section class="mb-notice ${credit?'is-credit':'is-debit'} ${reduced?'is-reduced':''}" role="status" aria-live="polite" aria-label="${credit?'Ganho':'Gasto'} de ${formatMana(r.amount)} mana. Saldo compartilhado: ${formatMana(r.after)} mana."><div class="mb-notice-antenna" aria-hidden="true"><span>MN</span><i></i><b>CONTA / 01</b></div><div class="mb-notice-panel"><div class="mb-notice-noise" aria-hidden="true"></div><div class="mb-notice-scan" aria-hidden="true"></div><div class="mb-notice-slice top"></div><div class="mb-notice-slice bottom"></div><header class="mb-notice-topline">${bankMark}<span>BANCO DE MANA <small>REDE FINANCEIRA DO GRUPO</small></span><b>${r.preview?'PRÉVIA LOCAL':'REGISTRO CONFIRMADO'}</b><button type="button" class="mb-notice-dismiss" aria-label="Fechar notificação">×</button></header><div class="mb-notice-main"><aside class="mb-notice-instrument" aria-hidden="true"><div class="mb-notice-device-id">RESERVA / ÚNICA <b>${credit?'IN':'OUT'}</b></div><div class="mb-notice-reticle">${emblem}</div><div class="mb-notice-wave">${Array.from({length:28},(_,i)=>`<i style="--n:${i};--h:${[25,50,36,78,55,100,44][i%7]}%"></i>`).join('')}</div><div class="mb-notice-device-meta"><span>ACESSO COMPARTILHADO</span><b>TODOS OS JOGADORES</b></div><div class="mb-notice-barcode"></div></aside><div class="mb-notice-readout"><div class="mb-notice-heading"><span class="mb-notice-label">${credit?'RECURSOS RECEBIDOS':'RECURSOS UTILIZADOS'}</span><span class="mb-notice-ref">TX / ${String(r.sequence||1).padStart(5,'0')}</span></div><div class="mb-notice-operation"><span>${credit?'CRÉDITO':'DÉBITO'}</span><i></i><b>MANA</b></div><div class="mb-notice-delta" aria-hidden="true"><span class="mb-notice-sign">${credit?'+':'−'}</span><strong class="mb-notice-counter">${formatMana(reduced?r.amount:0)}</strong></div><div class="mb-notice-meter" aria-hidden="true">${Array.from({length:36},(_,i)=>`<i style="--n:${i}"></i>`).join('')}</div><div class="mb-notice-balance-block" aria-hidden="true"><div class="mb-notice-before"><small>RESERVA ANTERIOR</small><b>${formatMana(r.before)}</b></div><span class="mb-notice-balance-arrow">${credit?'↗':'↘'}</span><div class="mb-notice-total"><span>SALDO DO GRUPO</span><strong>${formatMana(r.after)}</strong><small>MANA</small></div></div><p class="mb-notice-note">${e(r.note||'Movimentação no saldo compartilhado.')}</p><div class="mb-notice-seal" aria-hidden="true"><b>✓</b><span>SALDO ATUALIZADO</span></div></div></div><footer class="mb-notice-timeline" aria-hidden="true"><span class="mb-notice-step"><b>01</b> REGISTRADO</span><span class="mb-notice-track"><i></i></span><span class="mb-notice-step"><b>02</b> RESERVA ATUALIZADA</span><span class="mb-notice-track"><i></i></span><span class="mb-notice-step"><b>03</b> GRUPO NOTIFICADO</span><span class="mb-notice-hazard"></span></footer><div class="mb-notice-progress" aria-hidden="true"><i></i></div></div><div class="mb-notice-caption" aria-hidden="true"><span>RESERVA COMPARTILHADA / MANA</span><span>${credit?'ENTRADA':'SAÍDA'} DE RECURSOS <b>●</b></span></div></section>`;
  document.body.append(this.root);this.root.querySelector('.mb-notice-dismiss').onclick=()=>this.finish();this.timer=setTimeout(()=>this.finish(),this.duration);
  if(reduced){this.root.style.setProperty('--mb-count',1);this.root.querySelector('.mb-notice').classList.add('is-settled');}
  else{
   this.counter=new ManaCounter(this.root.querySelector('.mb-notice-counter'),r.amount,{down:!credit,origin:this.origin});
   this.updateCount();this.counterTimer=setInterval(()=>this.updateCount(),32);this.animate(credit);
  }
 }
 updateCount(){
  if(!this.root||!this.current)return;const state=countState(this.current,performance.now()-this.started);
  this.counter?.setValue(state.amount);this.root.querySelector('.mb-notice-meter').style.setProperty('--mb-count',state.progress);this.root.querySelector('.mb-notice').classList.toggle('is-settled',state.progress>=1);
  if(state.progress>=1){this.counter?.settle();clearInterval(this.counterTimer);this.counterTimer=null;}
  return state.progress;
 }
 animate(credit){
  const play=(selector,frames,duration,delay=0,options={})=>{for(const el of this.root.querySelectorAll(selector))try{const animation=el.animate(frames,{duration,delay,fill:'both',easing:'cubic-bezier(.16,1,.3,1)',...options});if(this.origin!==null)animation.startTime=this.origin;this.animations.push(animation);}catch{}};
  play('.mb-notice-panel',[{opacity:0,transform:'translateY(8px) scaleY(.015)'},{opacity:1,transform:'translateY(0) scaleY(1)'}],310);
  play('.mb-notice-antenna,.mb-notice-caption',[{opacity:0,transform:'translateX(-24px)'},{opacity:1,transform:'translateX(0)'}],280,120);
  play('.mb-notice-slice.top',[{transform:'translateX(-110%)'},{transform:'translateX(110%)'}],510,100);
  play('.mb-notice-slice.bottom',[{transform:'translateX(110%)'},{transform:'translateX(-110%)'}],540,140);
  play('.mb-notice-topline,.mb-notice-heading',[{opacity:0,transform:'translateX(-16px)'},{opacity:1,transform:'translateX(0)'}],270,160);
  play('.mb-notice-readout',[{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],280,200);
  play('.mb-notice-reticle',[{opacity:0,transform:'scale(.75) rotate(-20deg)'},{opacity:1,transform:'scale(1) rotate(0)'}],600,180);
  play('.mb-reticle-outer',[{transform:'rotate(-45deg)'},{transform:'rotate(15deg)'}],2250,210,{easing:'cubic-bezier(.2,.7,.25,1)'});
  play('.mb-reticle-inner',[{opacity:.2,transform:'scale(.8)'},{opacity:1,transform:'scale(1)'}],750,500);
  play('.mb-reticle-path',[{strokeDashoffset:140},{strokeDashoffset:0}],1500,200,{easing:'linear'});
  for(const [i,el]of [...this.root.querySelectorAll('.mb-notice-wave i')].entries())try{const a=el.animate([{transform:'scaleY(.2)',opacity:.3},{transform:'scaleY(1)',opacity:1,offset:.4},{transform:'scaleY(.45)',opacity:.5,offset:.8},{transform:'scaleY(.65)',opacity:.8}],{duration:650,delay:320+(credit?i:27-i)*17,iterations:3,fill:'both',easing:'ease-in-out'});if(this.origin!==null)a.startTime=this.origin;this.animations.push(a);}catch{}
  play('.mb-notice-scan',[{opacity:0,transform:'translateX(-100%)'},{opacity:.45,offset:.4},{opacity:0,transform:'translateX(100%)'}],1250,180,{easing:'linear'});
  play('.mb-notice-balance-block,.mb-notice-note',[{opacity:0,transform:'translateX(12px)'},{opacity:1,transform:'translateX(0)'}],330,450);
  play('.mb-notice-seal',[{opacity:0,transform:'translateY(5px)'},{opacity:1,transform:'translateY(0)'}],220,COUNT_DELAY+COUNT_MS);
  play('.mb-notice-meter',[{opacity:.65},{opacity:1,offset:.4},{opacity:.65}],400,COUNT_DELAY+COUNT_MS);
  for(const [i,el]of [...this.root.querySelectorAll('.mb-notice-step')].entries())try{const a=el.animate([{opacity:.3},{opacity:1}],{duration:160,delay:200+i*1000,fill:'both'});if(this.origin!==null)a.startTime=this.origin;this.animations.push(a);}catch{}
  play('.mb-notice-track i',[{transform:'scaleX(0)'},{transform:'scaleX(1)'}],2100,300,{easing:'linear'});
  play('.mb-notice-progress i',[{transform:'scaleX(1)'},{transform:'scaleX(0)'}],this.duration,0,{easing:'linear'});
  play('.mb-notice-panel',[{opacity:1,transform:'translateY(0) scaleY(1)'},{opacity:0,transform:'translateY(-5px) scaleY(.015)'}],280,this.duration-280,{fill:'forwards',easing:'cubic-bezier(.65,0,.9,.3)'});
  play('.mb-notice-antenna,.mb-notice-caption',[{opacity:1},{opacity:0}],230,this.duration-280,{fill:'forwards'});
 }
 reduceCurrent(){if(!this.current||!this.root||!(this.reduced()||this.media.matches))return;this.stopMotion();this.counter?.settle();this.root.querySelector('.mb-notice').classList.add('is-reduced','is-settled');this.root.style.setProperty('--mb-count',1);clearTimeout(this.timer);this.timer=setTimeout(()=>this.finish(),1800);}
 stopMotion(){cancelAnimationFrame(this.frame);this.frame=null;clearInterval(this.counterTimer);this.counterTimer=null;for(const a of this.animations)a.cancel();this.animations=[];}
 finish(){clearTimeout(this.timer);this.stopMotion();this.counter?.destroy();this.counter=null;this.root?.remove();this.root=null;this.current=null;this.timer=null;this.next();}
 destroy(){this.queue=[];this.finish();this.events.abort();}
}
