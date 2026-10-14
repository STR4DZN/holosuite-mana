import {ID,ensure,ledger,emptyLedger,account,transact,clearHistory,SerialQueue,receiptHTML} from './core.js';
export const activeGM=()=>game.users.activeGM;
export class BankService {
 constructor(){this.queue=new SerialQueue();this.pending=new Map();this.observers=new Set();this.retryTimer=null;this.onTransaction=()=>{};this.lastSequence=0;}
 get data(){return ledger(game.settings.get(ID,'ledger'));}
 get users(){return [...game.users].filter(u=>!u.isGM&&u.role!==0);}
 balance(){return account(this.data);}
 subscribe(fn){this.observers.add(fn);return ()=>this.observers.delete(fn);}
 changed(value){
  const data=ledger(value);for(const fn of this.observers){try{fn();}catch(error){console.warn('Banco de Mana: falha ao atualizar uma janela.',error);}}
  const receipts=data.transactions.filter(t=>t.sequence>this.lastSequence).sort((a,b)=>a.sequence-b.sequence);
  this.lastSequence=Math.max(this.lastSequence,data.sequence);
  for(const receipt of receipts){try{this.onTransaction(structuredClone(receipt));}catch(error){console.warn('Banco de Mana: falha visual; o saldo foi preservado.',error);}}
  this.checkPending(data);
 }
 register(){game.settings.register(ID,'ledger',{scope:'world',config:false,type:Object,default:emptyLedger(),onChange:value=>this.changed(value)});}
 install(){
  this.lastSequence=this.data.sequence;
  Hooks.on('updateUser',(user,changes,options,userId)=>{
   // Read the operation payload, never a flag left on the document by an earlier update.
   const request=changes.flags?.[ID]?.request??changes[`flags.${ID}.request`];
   if(request?.version===3&&user.id===userId&&request.authorityId===game.user.id&&game.user.isGM&&activeGM()?.id===game.user.id){
    this.queue.run(()=>this.process(user,structuredClone(request),userId)).catch(error=>console.error('Banco de Mana:',error));
   }
   const result=changes.flags?.[ID]?.result??changes[`flags.${ID}.result`],pending=result&&this.pending.get(result.id);
   if(user.id===game.user.id&&pending?.authorityId===userId)this.finish(result.id,result.ok?null:new Error(result.error),result.receipt);
  });
  for(const event of ['userConnected','updateUser','createUser','deleteUser'])Hooks.on(event,()=>{for(const fn of this.observers){try{fn();}catch(error){console.warn('Banco de Mana: janela indisponível.',error);}}if(game.user.id===activeGM()?.id)this.retryChats();});
  if(game.user.id===activeGM()?.id)this.retryChats();
 }
 checkPending(data=this.data){for(const [id,p] of this.pending){
  const receipt=data.transactions.find(t=>t.requestId===id&&t.senderId===game.user.id);
  if(receipt)this.finish(id,null,receipt);
  else if(data.lastClear?.requestId===id&&data.lastClear.senderId===game.user.id)this.finish(id,null,{cleared:true,count:data.lastClear.count});
 }}
 finish(id,error,receipt){const p=this.pending.get(id);if(!p)return;clearTimeout(p.timer);this.pending.delete(id);error?p.reject(error):p.resolve(receipt);}
 async request(payload){
  const gm=activeGM();ensure(gm?.active,'É necessário um mestre conectado para movimentar mana.');
  ensure(game.user.isGM||(payload.action!=='clearHistory'&&payload.direction==='debit'),'Somente o mestre pode adicionar mana ou limpar o histórico.');
  const id=foundry.utils.randomID(),request={...payload,id,action:payload.action||'transaction',accountId:'shared',version:3,authorityId:gm.id};
  let resolve,reject;const response=new Promise((yes,no)=>{resolve=yes;reject=no;});
  const timer=setTimeout(()=>this.finish(id,new Error('A confirmação não chegou. Confira o saldo antes de repetir.')),20000);
  this.pending.set(id,{resolve,reject,timer,authorityId:gm.id});
  try{game.user.update({[`flags.${ID}.request`]:request},{diff:false}).then(()=>this.checkPending()).catch(error=>{this.checkPending();this.finish(id,error);});}
  catch(error){this.checkPending();this.finish(id,error);}
  return response;
 }
 async process(user,request,userId){
  let result;
  try{
   ensure(game.user.isGM&&activeGM()?.id===game.user.id,'O mestre responsável mudou. Confira o saldo antes de repetir.');
   ensure(user.id===userId,'Solicitação de outro usuário.');
   ensure(JSON.stringify(request).length<=4096&&request.version===3&&request.authorityId===game.user.id,'Solicitação inválida.');
   const sender=game.users.get(userId);
   if(request.action==='clearHistory'){
    ensure(sender?.active&&sender.isGM,'Somente o mestre pode limpar o histórico.');
    // Flush public receipts before clearing, so a confirmed payment cannot lose its chat record.
    for(const receipt of this.data.transactions.filter(r=>!r.chatPosted))await this.postChat(receipt);
    const output=clearHistory(this.data,request,{sender,requestId:request.id});
    if(!output.duplicate){ensure(activeGM()?.id===game.user.id,'O mestre responsável mudou.');await game.settings.set(ID,'ledger',output.ledger);}
    result={id:request.id,ok:true,receipt:{cleared:true,count:output.count}};
   }else{
    ensure(request.action==='transaction','Operação inválida.');
    const output=transact(this.data,request,{sender,requestId:request.id,chatId:foundry.utils.randomID()});
    if(!output.duplicate){ensure(activeGM()?.id===game.user.id,'O mestre responsável mudou.');await game.settings.set(ID,'ledger',output.ledger);}
    result={id:request.id,ok:true,receipt:output.receipt};
    try{await this.postChat(output.receipt);}catch(error){console.warn('Banco de Mana: saldo salvo; chat pendente.',error);this.scheduleRetry();}
   }
  }catch(error){
   const committed=this.data.transactions.find(t=>t.requestId===request.id&&t.senderId===userId),cleared=this.data.lastClear;
   if(committed){result={id:request.id,ok:true,receipt:committed};this.scheduleRetry();}
   else if(cleared?.requestId===request.id&&cleared.senderId===userId)result={id:request.id,ok:true,receipt:{cleared:true,count:cleared.count}};
   else result={id:request.id,ok:false,error:error.message};
  }
  try{await user.update({[`flags.${ID}.result`]:result},{diff:false});}
  catch(error){console.warn('Banco de Mana: confirmação indisponível; os dados salvos permanecem autoritativos.',error);}
 }
 async postChat(receipt){
  ensure(game.user.isGM&&activeGM()?.id===game.user.id,'Mestre responsável indisponível.');
  const current=this.data.transactions.find(r=>r.requestId===receipt.requestId);if(!current||current.chatPosted)return;
  if(!game.messages.get(current.chatId))await ChatMessage.create({_id:current.chatId,user:game.user.id,speaker:{alias:'Banco de Mana'},whisper:[],content:receiptHTML(current),flags:{[ID]:{receipt:{requestId:current.requestId,sequence:current.sequence}}}},{keepId:true});
  ensure(activeGM()?.id===game.user.id,'O mestre responsável mudou.');
  const next=structuredClone(this.data),r=next.transactions.find(t=>t.requestId===current.requestId);if(r){r.chatPosted=true;await game.settings.set(ID,'ledger',next);}
 }
 scheduleRetry(){clearTimeout(this.retryTimer);this.retryTimer=setTimeout(()=>this.retryChats(),10000);}
 retryChats(){return this.queue.run(async()=>{
  if(game.user.id!==activeGM()?.id)return;
  for(const receipt of this.data.transactions.filter(t=>!t.chatPosted)){try{await this.postChat(receipt);}catch(error){console.warn('Banco de Mana: registro pendente.',error);this.scheduleRetry();break;}}
 });}
}
