import {ID,ensure,ledger,emptyLedger,account,transact,SerialQueue,receiptHTML} from './core.js';
export const activeGM=()=>game.users.activeGM;
export class BankService {
 constructor(){this.queue=new SerialQueue();this.pending=new Map();this.observers=new Set();this.retryTimer=null;this.onTransaction=()=>{};this.lastSequence=0;}
 get data(){return ledger(game.settings.get(ID,'ledger'));}
 get users(){return [...game.users].filter(u=>!u.isGM&&u.role!==0);}
 balance(){return account(this.data);}
 subscribe(fn){this.observers.add(fn);return ()=>this.observers.delete(fn);}
 changed(value){
  const data=ledger(value);for(const fn of this.observers){try{fn();}catch(error){console.warn('Banco Mana: falha ao atualizar uma janela.',error);}}
  const newReceipts=data.transactions.filter(t=>t.sequence>this.lastSequence).sort((a,b)=>a.sequence-b.sequence);
  this.lastSequence=Math.max(this.lastSequence,data.sequence);
  for(const receipt of newReceipts){try{this.onTransaction(structuredClone(receipt));}catch(error){console.warn('Banco Mana: falha no aviso visual; o saldo foi preservado.',error);}}
  this.checkPending(data);
 }
 register(){game.settings.register(ID,'ledger',{scope:'world',config:false,type:Object,default:emptyLedger(),onChange:value=>this.changed(value)});}
 install(){
  this.lastSequence=this.data.sequence;
  Hooks.on('createChatMessage',(message,options,userId)=>{
   const request=message.getFlag(ID,'request');if(!request||request.version!==2||request.authorityId!==game.user.id||activeGM()?.id!==game.user.id||!game.user.isGM)return;
   this.queue.run(()=>this.process(message,structuredClone(request),userId)).catch(error=>console.error('Banco Mana:',error));
  });
  Hooks.on('updateChatMessage',(message,changes,options,userId)=>{
   const p=this.pending.get(message.id);if(!p||p.authorityId!==userId)return;
   const result=message.getFlag(ID,'result');if(result)this.finish(message.id,result.ok?null:new Error(result.error),result.receipt);
  });
  for(const event of ['userConnected','updateUser','createUser','deleteUser'])Hooks.on(event,()=>{for(const fn of this.observers)fn();if(game.user.id===activeGM()?.id)this.retryChats();});
  if(game.user.id===activeGM()?.id)this.retryChats();
 }
 checkPending(data=this.data){for(const [id,p] of this.pending){const r=data.transactions.find(t=>t.requestId===id&&t.senderId===game.user.id);if(r)this.finish(id,null,r);}}
 finish(id,error,receipt){const p=this.pending.get(id);if(!p)return;clearTimeout(p.timer);this.pending.delete(id);error?p.reject(error):p.resolve(receipt);}
 async request(payload){
  const gm=activeGM();ensure(gm?.active,'É necessário um mestre conectado para movimentar mana.');
  ensure(game.user.isGM||payload.direction==='debit','Somente o mestre pode adicionar mana.');
  const request={...payload,accountId:'shared',version:2,authorityId:gm.id};
  const message=await ChatMessage.create({user:game.user.id,whisper:[...new Set([game.user.id,gm.id])],content:'<p>Banco Mana · Confirmando movimentação…</p>',flags:{[ID]:{request}}});
  ensure(message,'O Foundry não permitiu enviar a solicitação ao banco.');
  return new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>this.finish(message.id,new Error('A confirmação não chegou. Confira o saldo e o chat antes de repetir.')),20000);
   this.pending.set(message.id,{resolve,reject,timer,authorityId:gm.id});
   this.checkPending();const result=message.getFlag(ID,'result');if(this.pending.has(message.id)&&result)this.finish(message.id,result.ok?null:new Error(result.error),result.receipt);
  });
 }
 async process(message,request,userId){
  let result;
  try{
   ensure(game.user.isGM&&activeGM()?.id===game.user.id,'O mestre responsável mudou. Confira o saldo antes de repetir.');
   const previous=message.getFlag(ID,'result');if(previous)return;
   ensure(JSON.stringify(request).length<=4096,'Solicitação muito grande.');
   ensure(request.version===2,'Atualize o aplicativo para usar a reserva compartilhada.');
   const sender=game.users.get(userId);
   const output=transact(this.data,request,{sender,requestId:message.id,chatId:foundry.utils.randomID()});
   if(!output.duplicate){ensure(activeGM()?.id===game.user.id,'O mestre responsável mudou.');await game.settings.set(ID,'ledger',output.ledger);}
   result={ok:true,receipt:output.receipt};
   try{await this.postChat(output.receipt);}catch(error){console.warn('Banco Mana: saldo salvo; recibo de chat aguardando nova tentativa.',error);this.scheduleRetry();}
  }catch(error){
   const committed=this.data.transactions.find(t=>t.requestId===message.id&&t.senderId===userId);
   result=committed?{ok:true,receipt:committed}:{ok:false,error:error.message};if(committed)this.scheduleRetry();
  }
  try{await message.update({content:result.ok?'<p>Banco Mana · Movimentação confirmada.</p>':'<p>Banco Mana · Movimentação recusada.</p>',[`flags.${ID}.result`]:result});}
  catch(error){console.warn('Banco Mana: confirmação privada indisponível; o saldo permanece autoritativo.',error);}
 }
 async postChat(receipt){
  ensure(game.user.isGM&&activeGM()?.id===game.user.id,'Mestre responsável indisponível.');
  const current=this.data.transactions.find(r=>r.requestId===receipt.requestId);if(!current||current.chatPosted)return;
  if(!game.messages.get(current.chatId))await ChatMessage.create({_id:current.chatId,user:game.user.id,whisper:[],content:receiptHTML(current),flags:{[ID]:{receipt:current}}},{keepId:true});
  ensure(activeGM()?.id===game.user.id,'O mestre responsável mudou.');
  const next=structuredClone(this.data),r=next.transactions.find(t=>t.requestId===current.requestId);if(r){r.chatPosted=true;await game.settings.set(ID,'ledger',next);}
 }
 scheduleRetry(){clearTimeout(this.retryTimer);this.retryTimer=setTimeout(()=>this.retryChats(),10000);}
 retryChats(){return this.queue.run(async()=>{
  if(game.user.id!==activeGM()?.id)return;
  for(const receipt of this.data.transactions.filter(t=>!t.chatPosted)){
   try{await this.postChat(receipt);}catch(error){console.warn('Banco Mana: registro pendente.',error);this.scheduleRetry();break;}
  }
 });}
}
