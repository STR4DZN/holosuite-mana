import {ID,ensure,MAX_MANA,transact} from './core.js';
// Durable reservation journal. Money and stock are separate Foundry documents;
// an interrupted delivery is retried with the same immutable ID before new spending.
export class BankPurchases {
 constructor(bank){this.bank=bank;this.providers=new Map();}
 register(id,provider){ensure(/^[a-z0-9-]+$/.test(id)&&provider?.withLock&&provider?.prepare&&provider?.apply&&provider?.findReceipt,'Integração de compras inválida.');this.providers.set(id,provider);}
 get entries(){return this.bank.data.purchases||{};}
 async save(next){ensure(game.user.isGM&&game.users.activeGM?.id===game.user.id,'Mestre responsável mudou.');await game.settings.set(ID,'ledger',next);}
 async recover(){for(const entry of Object.values(this.entries).filter(p=>p.status==='reserved'))await this.deliver(entry);}
 async execute(request,sender){
  ensure(sender?.active&&(sender.isGM||sender.role>0),'Jogador indisponível.');
  ensure(/^[a-zA-Z0-9]{1,32}$/.test(request.id),'Compra inválida.');
  const previous=this.entries[request.id];if(previous){ensure(previous.senderId===sender.id,'Compra de outro usuário.');if(previous.status==='complete')return previous.delivery;if(previous.status==='refunded')throw Error(previous.error);return this.deliver(previous);}
  await this.recover();const provider=this.providers.get(request.provider);ensure(provider,'Atualize e ative o módulo da máquina de vendas.');
  return provider.withLock(request,async()=>{
   const data=this.bank.data;ensure(request.revision===data.pool.revision,'O saldo mudou. Confira o valor e tente novamente.');
   const plan=await provider.prepare(request,sender);
   ensure(Number.isSafeInteger(plan.cost)&&plan.cost>=0&&plan.cost<=MAX_MANA,'O preço precisa ser uma quantidade inteira de mana.');
   ensure(plan.cost<=data.pool.balance,'Saldo de mana insuficiente.');
   ensure(Number.isSafeInteger(data.pool.revision+2),'Limite de operações atingido.');
   // Validate financial limits before reserving money or delivering stock.
   if(plan.cost>0)transact(data,{direction:'debit',amount:plan.cost,revision:data.pool.revision},{sender,requestId:request.id,chatId:foundry.utils.randomID()});
   const entry={id:request.id,provider:request.provider,senderId:sender.id,senderName:sender.name,status:'reserved',cost:plan.cost,before:data.pool.balance,revision:data.pool.revision,data:plan.data,createdAt:Date.now()};
   const next=structuredClone(data);next.purchases??={};next.purchases[entry.id]=entry;next.pool.balance-=plan.cost;next.pool.revision++;
   try{await this.save(next);}catch(error){if(!this.entries[entry.id])throw error;}
   return this.deliverLocked(entry,provider);
  });
 }
 async deliver(entry){const provider=this.providers.get(entry.provider);ensure(provider,'Há uma compra em confirmação. Ative a máquina de vendas para concluí-la.');return provider.withLock(entry.data,()=>this.deliverLocked(entry,provider));}
 async deliverLocked(entry,provider){
  let delivery=await provider.findReceipt(entry.data,entry.id);
  if(!delivery){
   try{delivery=await provider.apply(entry.data,entry.id);}
   catch(error){
    delivery=await provider.findReceipt(entry.data,entry.id);
    if(!delivery){
     if(error.safeToRefund){const next=structuredClone(this.bank.data);next.pool.balance+=entry.cost;next.pool.revision++;next.purchases[entry.id].status='refunded';next.purchases[entry.id].error=error.message;await this.save(next);}
     throw error;
    }
   }
  }
  const next=structuredClone(this.bank.data),current=next.purchases[entry.id];if(current.status==='complete')return current.delivery;
  current.status='complete';current.delivery=delivery;delete current.data;
  if(entry.cost>0){
   const baseline=structuredClone(next);baseline.pool={balance:entry.before,revision:entry.revision};
   const output=transact(baseline,{direction:'debit',amount:entry.cost,revision:entry.revision,note:'Compra na máquina de vendas'},{sender:{id:entry.senderId,name:entry.senderName,active:true,role:1},requestId:entry.id,chatId:foundry.utils.randomID()});
   next.sequence=output.ledger.sequence;next.transactions=output.ledger.transactions;
  }
  // Keep completed IDs bounded; old requests are also blocked by their bank revision.
  const done=Object.values(next.purchases).filter(p=>p.status!=='reserved');for(const old of done.slice(0,Math.max(0,done.length-300)))delete next.purchases[old.id];
  try{await this.save(next);}catch(error){if(this.entries[entry.id]?.status!=='complete')throw error;}
  const receipt=this.bank.data.transactions.find(r=>r.requestId===entry.id);if(receipt)try{await this.bank.postChat(receipt);}catch{this.bank.scheduleRetry();}
  return delivery;
 }
}
