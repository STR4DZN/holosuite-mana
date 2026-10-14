export const ID='holosuite-mana';
export const MAX_MANA=999999999999;
export const CREDIT_COLOR='#60f5c5',DEBIT_COLOR='#ff5b78';
export const ensure=(condition,message)=>{if(!condition)throw new Error(message);};
export const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const formatMana=value=>new Intl.NumberFormat('pt-BR',{maximumFractionDigits:0}).format(value);
export function amount(value){
 const raw=String(value).trim();ensure(/^[1-9]\d{0,11}$/.test(raw),'Informe uma quantidade inteira de mana maior que zero.');
 const number=Number(raw);ensure(Number.isSafeInteger(number)&&number<=MAX_MANA,'Quantidade de mana acima do limite.');return number;
}
export function color(value,fallback=CREDIT_COLOR){return /^#[a-f\d]{6}$/i.test(String(value))?String(value).toLowerCase():fallback;}
export function emptyLedger(){return {schema:1,sequence:0,accounts:{},transactions:[]};}
export function ledger(value){
 if(!value)return emptyLedger();ensure(value.schema===1&&Number.isSafeInteger(value.sequence)&&value.sequence>=0&&value.accounts&&Array.isArray(value.transactions),'Os dados do banco precisam ser verificados pelo mestre.');return value;
}
export function account(data,userId){
 const a=Object.hasOwn(data.accounts,userId)?data.accounts[userId]:{balance:0,revision:0};
 ensure(Number.isSafeInteger(a.balance)&&a.balance>=0&&a.balance<=MAX_MANA&&Number.isSafeInteger(a.revision)&&a.revision>=0,'Saldo inválido. Procure o mestre.');return a;
}
export function transact(current,request,{sender,target,requestId,chatId,now=Date.now()}={}){
 const input=ledger(current);ensure(sender?.active,'O solicitante não está conectado.');
 ensure(target&&!target.isGM&&target.role!==0,'Selecione a conta de um jogador.');
 ensure(/^[a-zA-Z0-9]{1,32}$/.test(target.id),'Conta inválida.');
 ensure(sender.isGM||sender.id===target.id,'Você só pode gastar a mana da sua conta.');
 ensure(request.direction==='debit'||request.direction==='credit','Operação inválida.');
 ensure(sender.isGM||request.direction==='debit','Somente o mestre pode adicionar mana.');
 ensure(typeof requestId==='string'&&/^[a-zA-Z0-9]{1,32}$/.test(requestId),'Solicitação inválida.');
 const duplicate=input.transactions.find(t=>t.requestId===requestId);
 if(duplicate){ensure(duplicate.senderId===sender.id,'Solicitação pertence a outro usuário.');return {ledger:input,receipt:duplicate,duplicate:true};}
 const units=amount(request.amount),before=account(input,target.id);
 ensure(request.revision===before.revision,'O saldo mudou. Confira o valor atualizado e confirme novamente.');
 const delta=request.direction==='credit'?units:-units,after=before.balance+delta;
 ensure(after>=0,'Saldo de mana insuficiente.');ensure(after<=MAX_MANA,'A conta ultrapassaria o limite de mana.');
 ensure(Number.isSafeInteger(input.sequence+1)&&Number.isSafeInteger(before.revision+1),'Limite de operações atingido.');
 ensure(input.transactions.filter(t=>!t.chatPosted).length<100,'O chat está indisponível. Aguarde o mestre restabelecer os registros do banco.');
 const next=structuredClone(input);
 const receipt={requestId,chatId,senderId:sender.id,accountId:target.id,accountName:String(target.name||'Jogador').slice(0,80),
  direction:request.direction,amount:units,delta,before:before.balance,after,color:sender.isGM?color(request.color,delta>0?CREDIT_COLOR:DEBIT_COLOR):DEBIT_COLOR,
  note:String(request.note||'').trim().slice(0,120),sequence:input.sequence+1,revision:before.revision+1,createdAt:now,chatPosted:false};
 next.sequence=receipt.sequence;next.accounts[target.id]={balance:after,revision:receipt.revision};
 next.transactions=[...next.transactions.slice(-299).filter(t=>t.chatPosted),...next.transactions.filter(t=>!t.chatPosted),receipt];
 return {ledger:next,receipt,duplicate:false};
}
export class SerialQueue {
 constructor(){this.tail=Promise.resolve();}
 run(task){const result=this.tail.then(task);this.tail=result.catch(()=>{});return result;}
}
export function receiptHTML(r){
 return `<article class="mb-chat" style="--mb-accent:${color(r.color)}"><header><span>◈</span> BANCO MANA</header><p><strong>${escapeHTML(r.accountName)}</strong> ${r.delta>0?'ganhou':'perdeu'} <b>${formatMana(r.amount)} mana</b>.</p><div class="mb-chat-balance">Saldo: <strong>${formatMana(r.after)} mana</strong></div>${r.note?`<small>${escapeHTML(r.note)}</small>`:''}</article>`;
}
