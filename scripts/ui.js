import {ID,amount,color,CREDIT_COLOR,DEBIT_COLOR,formatMana,ensure} from './core.js';
import {activeGM} from './service.js';
import {bankView} from './view.js';
export class BankApp extends foundry.applications.api.ApplicationV2 {
 static DEFAULT_OPTIONS={id:'holosuite-mana-bank',classes:['mb-app'],window:{title:'Banco Mana',icon:'fa-solid fa-building-columns',resizable:true},position:{width:1000,height:850}};
 constructor(service,notifications,options={}){
  super(options);this.service=service;this.notifications=notifications;
  this.bankState={accountId:null,direction:game.user.isGM?'credit':'debit',accent:color(game.settings.get(ID,'noticeColor')),amount:'',note:'',status:null,busy:false,revision:0};
  this.unsubscribe=null;this.timer=null;this.controller=null;
 }
 async _renderHTML(){
  const s=this.bankState,isGM=game.user.isGM,users=this.service.users;
  if(!isGM){s.accountId=game.user.id;s.direction='debit';s.accent=DEBIT_COLOR;}
  else if(!users.some(u=>u.id===s.accountId))s.accountId=users[0]?.id||null;
  const account=s.accountId?this.service.balance(s.accountId):{balance:0,revision:0};s.revision=account.revision;
  return bankView({...s,isGM,users:users.map(u=>({...u,balance:this.service.balance(u.id).balance})),user:game.users.get(s.accountId),account,online:!!activeGM()?.active});
 }
 _replaceHTML(result,content){
  const focus=content.contains(document.activeElement)?{name:document.activeElement.name,start:document.activeElement.selectionStart,end:document.activeElement.selectionEnd}:null;
  const scroll=content.querySelector('.mb-account-list')?.scrollTop||0;
  this.controller?.abort();this.controller=new AbortController();content.innerHTML=result;
  const options={signal:this.controller.signal};
  content.addEventListener('click',e=>this.onClick(e).catch(error=>this.showError(error)),options);
  content.addEventListener('input',e=>this.onInput(e),options);
  content.addEventListener('submit',e=>{e.preventDefault();this.submit().catch(error=>this.showError(error));},options);
  if(content.querySelector('.mb-account-list'))content.querySelector('.mb-account-list').scrollTop=scroll;
  if(focus?.name){const input=content.querySelector(`[name="${focus.name}"]`);input?.focus();if(input&&typeof focus.start==='number')try{input.setSelectionRange(focus.start,focus.end);}catch{}}
 }
 _onRender(){if(!this.unsubscribe)this.unsubscribe=this.service.subscribe(()=>this.refresh());}
 _onClose(){this.unsubscribe?.();this.unsubscribe=null;clearTimeout(this.timer);this.controller?.abort();}
 refresh(){if(!this.rendered)return;clearTimeout(this.timer);this.timer=setTimeout(()=>this.render().catch(error=>ui.notifications.error(error.message)),40);}
 onInput(event){
  const s=this.bankState;if(s.busy)return;
  if(event.target.name==='amount')s.amount=event.target.value;
  if(event.target.name==='note')s.note=event.target.value;
  if(event.target.name==='accent'&&game.user.isGM){s.accent=color(event.target.value);this.element.querySelector('.mb-custom-color')?.style.setProperty('--mb-picked-color',s.accent);for(const button of this.element.querySelectorAll('.mb-swatches>button'))button.setAttribute('aria-pressed',String(button.dataset.value.toLowerCase()===s.accent));game.settings.set(ID,'noticeColor',s.accent);}
 }
 async onClick(event){
  const button=event.target.closest('[data-mb]');if(!button||this.bankState.busy||button.disabled)return;
  const s=this.bankState,action=button.dataset.mb;
  ensure(game.user.isGM,'Este controle é exclusivo do mestre.');
  if(action==='account'){s.accountId=button.dataset.id;s.amount='';s.note='';s.status=null;}
  else if(action==='direction'){s.direction=button.dataset.value;s.status=null;}
  else if(action==='color'){s.accent=color(button.dataset.value);await game.settings.set(ID,'noticeColor',s.accent);}
  else if(action==='preview'){
   const value=/^[1-9]\d*$/.test(s.amount)?Math.min(Number(s.amount),999999999999):250,before=s.direction==='debit'?Math.max(value,this.service.balance(s.accountId).balance):this.service.balance(s.accountId).balance,delta=s.direction==='credit'?value:-value;
   this.notifications.enqueue({accountName:game.users.get(s.accountId)?.name||'Jogador',delta,amount:Math.abs(delta),before,after:before+delta,color:s.accent,preview:true});return;
  }
  this.refresh();
 }
 showError(error){this.bankState.status={text:error.message,error:true};this.refresh();}
 async submit(){
  const s=this.bankState;if(s.busy)return;
  try{
   const units=amount(s.amount);ensure(s.accountId,'Selecione a conta de um jogador.');
   ensure(s.direction==='credit'||units<=this.service.balance(s.accountId).balance,'Saldo de mana insuficiente.');
   s.busy=true;s.status=null;await this.render();
   const receipt=await this.service.request({accountId:s.accountId,direction:s.direction,amount:units,note:s.note,color:s.accent,revision:s.revision});
   s.amount='';s.note='';s.status={text:`${formatMana(receipt.amount)} mana ${receipt.delta>0?'adicionada à':'removida da'} conta.`};
  }catch(error){s.status={text:error.message,error:true};}
  finally{s.busy=false;this.refresh();}
 }
}
