import {formatMana,color,CREDIT_COLOR,DEBIT_COLOR,escapeHTML as e} from './core.js';
import {bankMark} from './icons.js';
import {reactor} from './view.js';
export function easeCount(before,after,progress){const t=Math.min(1,Math.max(0,progress));return Math.round(before+(after-before)*(1-Math.pow(1-t,4)));}
export class ManaNotifications {
 constructor({reduced=()=>false}={}){this.queue=[];this.current=null;this.reduced=reduced;this.timer=null;this.frame=null;this.animations=[];this.root=null;this.events=new AbortController();window.addEventListener('pagehide',()=>this.destroy(),{signal:this.events.signal});this.media=matchMedia('(prefers-reduced-motion: reduce)');this.media.addEventListener('change',()=>this.reduceCurrent(),{signal:this.events.signal});}
 enqueue(receipt){this.queue.push(structuredClone(receipt));if(!this.current)this.next();}
 next(){
  const r=this.queue.shift();if(!r)return;this.current=r;const credit=r.direction?r.direction==='credit':r.delta>=0,reduced=this.reduced()||matchMedia('(prefers-reduced-motion: reduce)').matches;
  this.root=document.createElement('div');this.root.className='mb-notice-layer';this.root.style.setProperty('--mb-notice-color',color(r.color,credit?CREDIT_COLOR:DEBIT_COLOR));
  this.root.innerHTML=`<section class="mb-notice ${credit?'is-credit':'is-debit'} ${reduced?'is-reduced':''}" aria-label="${e(r.accountName)} ${credit?'ganhou':'perdeu'} ${formatMana(r.amount)} mana. Saldo compartilhado: ${formatMana(r.after)} mana." role="status" aria-live="polite"><div class="mb-notice-halo" aria-hidden="true"></div><div class="mb-notice-orbit" aria-hidden="true"><svg viewBox="0 0 640 640"><circle cx="320" cy="320" r="300"/><circle cx="320" cy="320" r="282"/><path d="M320 4v35m0 562v35M4 320h35m562 0h35M108 108l25 25m374 374 25 25M108 532l25-25m374-374 25-25"/></svg></div><div class="mb-notice-particles" aria-hidden="true">${Array.from({length:28},(_,i)=>`<i style="--angle:${i*360/28}deg;--travel:${230+(i%5)*23}px"></i>`).join('')}</div><div class="mb-notice-rail" aria-hidden="true"></div><div class="mb-notice-rail right" aria-hidden="true"></div><div class="mb-notice-shutter" aria-hidden="true"></div><div class="mb-notice-panel"><div class="mb-notice-scan" aria-hidden="true"></div><header class="mb-notice-topline">${bankMark}<span>BANCO DE MANA <span aria-hidden="true">/</span> SALDO COMPARTILHADO</span><b>${r.preview?'PRÉVIA LOCAL':'MOVIMENTAÇÃO CONFIRMADA'}</b><button type="button" class="mb-notice-dismiss" aria-label="Fechar notificação">×</button></header><div class="mb-notice-main"><div class="mb-notice-schematic" aria-hidden="true">${reactor}</div><div class="mb-notice-heading"><span class="mb-notice-label">${credit?'RECURSOS RECEBIDOS':'RECURSOS UTILIZADOS'}</span><span class="mb-notice-ref">TX / ${String(r.sequence||1).padStart(5,'0')}</span></div><strong class="mb-notice-owner">${e(r.accountName||'Saldo de todos os jogadores')}</strong><div class="mb-notice-delta ${String(r.amount).length>9?'is-large':''}" aria-hidden="true"><span>${credit?'+':'−'}</span><strong>${reduced?formatMana(r.amount):'0'}</strong><small>MANA</small></div><div class="mb-notice-balance-block" aria-hidden="true"><div class="mb-notice-before"><small>SALDO ANTERIOR</small>${formatMana(r.before)}</div><span>→</span><div class="mb-notice-total"><span>RESERVA ATUAL</span><strong>${formatMana(reduced?r.after:r.before)}</strong><small>MANA</small></div></div><p class="mb-notice-note"><span>OP / ${e(r.senderName||'Mestre')}</span>${e(r.note||'Saldo do grupo atualizado.')}</p><div class="mb-notice-seal" aria-hidden="true"><b>✓</b><span>CONFIRMADO</span></div></div><div class="mb-notice-timeline" aria-hidden="true"><span class="mb-notice-step"><b>01</b> SALDO REGISTRADO</span><span class="mb-notice-track"><i></i></span><span class="mb-notice-step"><b>02</b> RESERVA ATUALIZADA</span><span class="mb-notice-track"><i></i></span><span class="mb-notice-step"><b>03</b> ${r.preview?'TESTE LOCAL':'GRUPO NOTIFICADO'}</span></div><footer class="mb-notice-foot"><span>${r.preview?'TESTE VISUAL / NENHUM VALOR ALTERADO':'RESERVA ÚNICA / TODOS OS JOGADORES'}</span><span>BANCO DE MANA <b>◇</b> GRUPO 01</span></footer><div class="mb-notice-progress" aria-hidden="true"><i></i></div></div></section>`;
  document.body.append(this.root);this.root.querySelector('.mb-notice-dismiss').onclick=()=>this.finish();
  const duration=reduced?2200:r.profile==='tactical'||this.queue.length>3?4600:6800;
  if(!reduced)this.animate(r,duration,credit);
  this.timer=setTimeout(()=>this.finish(),duration);
 }
 animate(r,duration,credit){
  const factor=duration/6800,play=(selector,frames,ms,delay=0,options={})=>{for(const el of this.root.querySelectorAll(selector))this.animations.push(el.animate(frames,{duration:ms*factor,delay:delay*factor,fill:'both',easing:'cubic-bezier(.16,1,.3,1)',...options}));};
  play('.mb-notice-shutter',[{opacity:0,transform:'scaleX(0)'},{opacity:1,transform:'scaleX(1)',offset:.3},{opacity:0,transform:'scaleX(1.05)'}],800);
  play('.mb-notice-rail',[{opacity:0,transform:'scaleY(0)'},{opacity:1,transform:'scaleY(1)'}],650,140);
  play('.mb-notice-panel',[{opacity:0,clipPath:'inset(49.8% 0 49.8% 0)',transform:'perspective(900px) rotateX(8deg) scale(.97)'},{opacity:1,clipPath:'inset(0% 0 0% 0)',transform:'perspective(900px) rotateX(0) scale(1)'}],1050,180);
  play('.mb-notice-orbit',[{opacity:0,transform:'scale(.65) rotate(-40deg)'},{opacity:.55,offset:.25},{opacity:.1,transform:'scale(1.12) rotate(55deg)'}],4000,80);
  play('.mb-notice-halo',[{opacity:0,transform:'scale(.6)'},{opacity:.7,offset:.25},{opacity:.15,transform:'scale(1.2)'}],3900,200);
  play('.mb-notice-topline',[{opacity:0,transform:'translateY(-12px)'},{opacity:1,transform:'translateY(0)'}],550,650);
  play('.mb-notice-heading,.mb-notice-owner',[{opacity:0,transform:'translateX(-18px)'},{opacity:1,transform:'translateX(0)'}],650,730);
  play('.mb-notice-schematic',[{opacity:0,transform:'rotate(-55deg) scale(.5)'},{opacity:.3,transform:'rotate(0) scale(1)'}],1750,530);
  play('.mb-notice-schematic .mb-reactor-inner',[{transform:'rotate(35deg)'},{transform:'rotate(0)'}],2200,550);
  play('.mb-notice-delta',[{opacity:0,transform:'translateY(18px) scale(.97)',filter:'blur(5px)'},{opacity:1,transform:'translateY(0) scale(1)',filter:'blur(0px)'}],650,900);
  play('.mb-notice-balance-block',[{opacity:0,transform:'translateX(-12px)'},{opacity:1,transform:'translateX(0)'}],700,1300);
  play('.mb-notice-scan',[{opacity:0,transform:'translateY(-100%)'},{opacity:.9,offset:.3},{opacity:0,transform:'translateY(100%)'}],1500,900);
  for(const [i,el] of [...this.root.querySelectorAll('.mb-notice-particles i')].entries()){
   const near='rotate(var(--angle)) translateX(160px) scaleX(.3)',far='rotate(var(--angle)) translateX(calc(170px + var(--travel))) scaleX(1.8)';
   this.animations.push(el.animate([{opacity:0,transform:credit?far:near},{opacity:.8,offset:.3},{opacity:0,transform:credit?near:far}],{duration:1400*factor,delay:(850+(i%7)*90)*factor,fill:'both',easing:'cubic-bezier(.2,.6,.2,1)'}));
  }
  for(const [i,el] of [...this.root.querySelectorAll('.mb-notice-step')].entries())this.animations.push(el.animate([{opacity:0,transform:'translateY(7px)'},{opacity:1,transform:'translateY(0)'}],{duration:450*factor,delay:(1200+i*650)*factor,fill:'both'}));
  for(const [i,el] of [...this.root.querySelectorAll('.mb-notice-track i')].entries())this.animations.push(el.animate([{transform:'scaleX(0)'},{transform:'scaleX(1)'}],{duration:650*factor,delay:(1550+i*650)*factor,fill:'both',easing:'ease-in-out'}));
  play('.mb-notice-note,.mb-notice-foot',[{opacity:0},{opacity:1}],700,2200);
  play('.mb-notice-seal',[{opacity:0,transform:'rotate(-32deg) scale(1.65)'},{opacity:1,transform:'rotate(-12deg) scale(.96)',offset:.75},{opacity:1,transform:'rotate(-12deg) scale(1)'}],650,2850);
  play('.mb-notice-progress i',[{transform:'scaleX(1)'},{transform:'scaleX(0)'}],duration/factor-950,900,{easing:'linear'});
  play('.mb-notice-panel',[{opacity:1,clipPath:'inset(0% 0 0% 0)',transform:'translateY(0)'},{opacity:0,clipPath:'inset(49.8% 0 49.8% 0)',transform:'translateY(-4px)'}],550,6250,{fill:'forwards',easing:'cubic-bezier(.65,0,.9,.4)'});
  play('.mb-notice-rail',[{opacity:1,transform:'scaleY(1)'},{opacity:0,transform:'scaleY(0)'}],500,6300,{fill:'forwards'});
  const delta=this.root.querySelector('.mb-notice-delta strong'),total=this.root.querySelector('.mb-notice-total strong'),start=performance.now();
  const tick=now=>{const t=(now-start-1000*factor)/(1800*factor);delta.textContent=formatMana(easeCount(0,r.amount,t));total.textContent=formatMana(easeCount(r.before,r.after,t));if(t<1&&this.current===r)this.frame=requestAnimationFrame(tick);else this.frame=null;};this.frame=requestAnimationFrame(tick);
 }
 reduceCurrent(){
  if(!this.current||!this.root||!(this.reduced()||this.media.matches))return;
  cancelAnimationFrame(this.frame);this.frame=null;this.animations.forEach(a=>a.cancel());this.animations=[];
  this.root.querySelector('.mb-notice').classList.add('is-reduced');
  this.root.querySelector('.mb-notice-delta strong').textContent=formatMana(this.current.amount);
  this.root.querySelector('.mb-notice-total strong').textContent=formatMana(this.current.after);
  clearTimeout(this.timer);this.timer=setTimeout(()=>this.finish(),2200);
 }
 finish(){clearTimeout(this.timer);cancelAnimationFrame(this.frame);this.animations.forEach(a=>a.cancel());this.animations=[];this.root?.remove();this.root=null;this.current=null;this.frame=null;this.timer=null;this.next();}
 destroy(){this.queue=[];this.finish();this.events.abort();}
}
