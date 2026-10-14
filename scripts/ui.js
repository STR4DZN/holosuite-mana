import {ID,amount,color,DEBIT_COLOR,formatMana,ensure} from './core.js';
import {activeGM} from './service.js';
import {bankView} from './view.js';
export class BankApp extends foundry.applications.api.ApplicationV2 {
 static DEFAULT_OPTIONS={id:'holosuite-mana-bank',classes:['mb-app'],window:{title:'Banco de Mana · Reserva de mana',icon:'fa-solid fa-building-columns',resizable:true},position:{width:1060,height:840}};
 constructor(service,notifications,options={}){
  super(options);this.service=service;this.notifications=notifications;
  this.bankState={tab:'reserve',confirmClear:false,historyFilter:'all',page:0,profile:'tactical',direction:game.user.isGM?'credit':'debit',accent:color(game.settings.get(ID,'noticeColor')),amount:'',note:'',status:null,busy:false,revision:0};
  this.unsubscribe=null;this.timer=null;this.controller=null;this.motion=[];this.balanceFrame=null;this.previousBalance=null;this.balanceTransition=null;this.balanceTimer=null;this.lastTab=null;
 }
 async _renderHTML(){
  const s=this.bankState;if(!game.user.isGM){s.direction='debit';s.accent=DEBIT_COLOR;}
  const account=this.service.balance();s.revision=account.revision;
  return bankView({...s,isGM:game.user.isGM,users:this.service.users,account,transactions:this.service.data.transactions,online:!!activeGM()?.active});
 }
 _replaceHTML(result,content){
  const focus=content.contains(document.activeElement)?{name:document.activeElement.name,action:document.activeElement.dataset.mb,value:document.activeElement.dataset.value,start:document.activeElement.selectionStart,end:document.activeElement.selectionEnd}:null;
  const scroll=content.querySelector('.mb-main')?.scrollTop||0,entrance=this.lastTab!==this.bankState.tab;
  this.cancelMotion();this.controller?.abort();this.controller=new AbortController();content.innerHTML=result;
  const options={signal:this.controller.signal};
  content.addEventListener('click',e=>this.onClick(e).catch(error=>this.showError(error)),options);
  content.addEventListener('input',e=>this.onInput(e),options);
  content.addEventListener('submit',e=>{e.preventDefault();this.submit().catch(error=>this.showError(error));},options);
  content.querySelector('.mb-main').scrollTop=entrance?0:scroll;
  let input;if(focus?.name)input=content.querySelector(`[name="${focus.name}"]`);else if(focus?.action)input=[...content.querySelectorAll('[data-mb]')].find(el=>el.dataset.mb===focus.action&&el.dataset.value===focus.value);
  input?.focus({preventScroll:true});if(input&&typeof focus?.start==='number')try{input.setSelectionRange(focus.start,focus.end);}catch{}
  const reduced=game.settings.get(ID,'reduceMotion')||matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!reduced){
   if(entrance){for(const [i,el] of [...content.querySelectorAll('[data-enter]')].entries())this.motion.push(el.animate([{opacity:0,transform:'translateY(18px)'},{opacity:1,transform:'translateY(0)'}],{duration:600,delay:i*65,easing:'cubic-bezier(.16,1,.3,1)'}));
   }
   const value=content.querySelector('.mb-balance-value'),before=this.previousBalance,after=this.service.balance().balance;
   if(value&&((before!==null&&before!==after)||this.balanceTransition?.target===after)){
    if(this.balanceTransition?.target!==after)this.balanceTransition={from:before,target:after,start:performance.now()};const transition=this.balanceTransition;
    const tick=()=>{const t=Math.min(1,(performance.now()-transition.start)/550);value.textContent=formatMana(Math.round(transition.from+(after-transition.from)*(1-(1-t)**3)));if(t>=1){clearInterval(this.balanceTimer);this.balanceTimer=null;this.balanceTransition=null;}return t;};
    const frame=()=>{this.balanceFrame=null;if(tick()<1)try{this.balanceFrame=requestAnimationFrame(frame);}catch{}};tick();this.balanceTimer=setInterval(tick,50);try{this.balanceFrame=requestAnimationFrame(frame);}catch{}
   }
  }
  this.previousBalance=this.service.balance().balance;this.lastTab=this.bankState.tab;
 }
 cancelMotion(){clearInterval(this.balanceTimer);this.balanceTimer=null;this.motion.forEach(a=>a.cancel());this.motion=[];cancelAnimationFrame(this.balanceFrame);this.balanceFrame=null;}
 motionPreferenceChanged(){
  const reduced=game.settings.get(ID,'reduceMotion')||matchMedia('(prefers-reduced-motion: reduce)').matches;
  this.element?.querySelector('.mb-bank')?.classList.toggle('is-reduced',reduced);
  if(reduced){this.cancelMotion();this.balanceTransition=null;const value=this.element?.querySelector('.mb-balance-value');if(value)value.textContent=formatMana(this.service.balance().balance);}
 }
 _onRender(){this.motionPreferenceChanged();if(!this.unsubscribe)this.unsubscribe=this.service.subscribe(()=>this.refresh());}
 _onClose(){this.unsubscribe?.();this.unsubscribe=null;clearTimeout(this.timer);this.controller?.abort();this.cancelMotion();this.lastTab=null;}
 refresh(){if(!this.rendered)return;clearTimeout(this.timer);this.timer=setTimeout(()=>this.render().catch(error=>ui.notifications.error(error.message)),40);}
 onInput(event){
  const s=this.bankState;if(s.busy)return;
  if(event.target.name==='amount')s.amount=event.target.value;
  if(event.target.name==='note')s.note=event.target.value;
  if(event.target.name==='accent'&&game.user.isGM){s.accent=color(event.target.value);this.element.querySelector('.mb-custom-color')?.style.setProperty('--mb-picked-color',s.accent);const hex=this.element.querySelector('.mb-color-hex');if(hex)hex.textContent=s.accent.toUpperCase();for(const button of this.element.querySelectorAll('.mb-swatches>button'))button.setAttribute('aria-pressed',String(button.dataset.value.toLowerCase()===s.accent));game.settings.set(ID,'noticeColor',s.accent).catch(error=>this.showError(error));}
 }
 async onClick(event){
  const button=event.target.closest('[data-mb]');if(!button||this.bankState.busy||button.disabled)return;
  const s=this.bankState,action=button.dataset.mb;
  if(action==='tab'){s.tab=button.dataset.value;}
  else if(action==='filter'){s.historyFilter=button.dataset.value;s.page=0;}
  else if(action==='page'){s.page=Math.max(0,Number(button.dataset.value));}
  else if(action==='amount'){s.amount=button.dataset.value;s.status=null;}
  else{
   ensure(game.user.isGM,'Este controle é exclusivo do mestre.');
   if(action==='clear-history'){s.confirmClear=true;s.status=null;}
   else if(action==='clear-cancel')s.confirmClear=false;
   else if(action==='clear-confirm'){
    s.busy=true;s.status=null;await this.render();
    try{await this.service.request({action:'clearHistory',revision:s.revision});s.confirmClear=false;s.page=0;s.historyFilter='all';s.status={text:'Histórico do banco apagado. O saldo foi mantido.'};}
    catch(error){s.status={text:error.message,error:true};}
    finally{s.busy=false;this.refresh();}return;
   }
   else if(action==='direction'){s.direction=button.dataset.value;s.status=null;}
   else if(action==='profile')s.profile=button.dataset.value;
   else if(action==='color'){s.accent=color(button.dataset.value);await game.settings.set(ID,'noticeColor',s.accent);}
   else if(action==='preview'){
    const value=/^[1-9]\d{0,11}$/.test(s.amount)?Number(s.amount):1250,before=this.service.balance().balance,delta=s.direction==='credit'?value:-Math.min(value,before);
    this.notifications.enqueue({direction:s.direction,scope:'shared',accountName:'Saldo de todos os jogadores',senderName:game.user.name,delta,amount:Math.abs(delta),before,after:before+delta,color:s.accent,profile:s.profile,note:s.note||'Recompensa do grupo',sequence:this.service.data.sequence+1,preview:true});return;
   }
  }
  this.refresh();
 }
 showError(error){this.bankState.status={text:error.message,error:true};this.refresh();}
 async submit(){
  const s=this.bankState;if(s.busy)return;
  try{
   const units=amount(s.amount);ensure(s.direction==='credit'||units<=this.service.balance().balance,'Saldo de mana insuficiente.');
   const revision=s.revision;s.busy=true;s.status=null;await this.render();
   const receipt=await this.service.request({accountId:'shared',direction:s.direction,amount:units,note:s.note,color:s.accent,profile:s.profile,revision});
   s.amount='';s.note='';s.status={text:`${formatMana(receipt.amount)} mana ${receipt.delta>0?'adicionada à':'removida da'} reserva do grupo.`};
  }catch(error){s.status={text:error.message,error:true};}
  finally{s.busy=false;this.refresh();}
 }
}
