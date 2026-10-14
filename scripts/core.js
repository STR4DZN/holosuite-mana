export const ID='holosuite-mana';
export const MAX_MANA=999999999999;
export const CREDIT_COLOR='#ffbe62',DEBIT_COLOR='#ff647c';
export const POOL_ID='shared',POOL_NAME='Saldo de todos os jogadores';
export const ensure=(condition,message)=>{if(!condition)throw new Error(message);};
export const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const formatMana=value=>new Intl.NumberFormat('pt-BR',{maximumFractionDigits:0}).format(value);
export function amount(value){
 const raw=String(value).trim();ensure(/^[1-9]\d{0,11}$/.test(raw),'Informe uma quantidade inteira de mana maior que zero.');
 const number=Number(raw);ensure(Number.isSafeInteger(number)&&number<=MAX_MANA,'Quantidade de mana acima do limite.');return number;
}
export function color(value,fallback=CREDIT_COLOR){return /^#[a-f\d]{6}$/i.test(String(value))?String(value).toLowerCase():fallback;}
export function emptyLedger(){return {schema:2,sequence:0,pool:{balance:0,revision:0},transactions:[]};}
export function ledger(value){
 if(!value)return emptyLedger();
 ensure(value.schema===2&&Number.isSafeInteger(value.sequence)&&value.sequence>=0&&Array.isArray(value.transactions),'Os dados do banco precisam ser verificados pelo mestre.');
 validateAccount(value.pool);return value;
}
function validateAccount(a){
 ensure(a&&Number.isSafeInteger(a.balance)&&a.balance>=0&&a.balance<=MAX_MANA&&Number.isSafeInteger(a.revision)&&a.revision>=0,'Saldo inválido. Procure o mestre.');return a;
}
export function account(data){
 return validateAccount(ledger(data).pool);
}
export function transact(current,request,{sender,requestId,chatId,now=Date.now()}={}){
 const input=ledger(current);ensure(sender?.active,'O solicitante não está conectado.');
 ensure(sender.isGM||sender.role>0,'Você não tem acesso à reserva do grupo.');
 ensure(!request.accountId||request.accountId===POOL_ID,'Atualize o aplicativo: agora existe uma única reserva compartilhada.');
 ensure(request.direction==='debit'||request.direction==='credit','Operação inválida.');
 ensure(sender.isGM||request.direction==='debit','Somente o mestre pode adicionar mana.');
 ensure(typeof requestId==='string'&&/^[a-zA-Z0-9]{1,32}$/.test(requestId),'Solicitação inválida.');
 const duplicate=input.transactions.find(t=>t.requestId===requestId);
 if(duplicate){ensure(duplicate.senderId===sender.id,'Solicitação pertence a outro usuário.');return {ledger:input,receipt:duplicate,duplicate:true};}
 const units=amount(request.amount),before=account(input);
 ensure(request.revision===before.revision,'O saldo mudou. Confira o valor atualizado e confirme novamente.');
 const delta=request.direction==='credit'?units:-units,after=before.balance+delta;
 ensure(after>=0,'Saldo de mana insuficiente.');ensure(after<=MAX_MANA,'A reserva ultrapassaria o limite de mana.');
 ensure(Number.isSafeInteger(input.sequence+1)&&Number.isSafeInteger(before.revision+1),'Limite de operações atingido.');
 ensure(input.transactions.filter(t=>!t.chatPosted).length<100,'O chat está indisponível. Aguarde o mestre restabelecer os registros do banco.');
 const next=structuredClone(input);
 const receipt={requestId,chatId,senderId:sender.id,senderName:String(sender.name||'Operador').slice(0,80),accountId:POOL_ID,accountName:POOL_NAME,scope:'shared',
  direction:request.direction,amount:units,delta,before:before.balance,after,color:sender.isGM?color(request.color,delta>0?CREDIT_COLOR:DEBIT_COLOR):DEBIT_COLOR,
  profile:sender.isGM&&request.profile==='tactical'?'tactical':'cinematic',note:String(request.note||'').trim().slice(0,120),sequence:input.sequence+1,revision:before.revision+1,createdAt:now,chatPosted:false};
 next.sequence=receipt.sequence;next.pool={balance:after,revision:receipt.revision};
 next.transactions=[...next.transactions.slice(-299).filter(t=>t.chatPosted),...next.transactions.filter(t=>!t.chatPosted),receipt];
 return {ledger:next,receipt,duplicate:false};
}
export class SerialQueue {
 constructor(){this.tail=Promise.resolve();}
 run(task){const result=this.tail.then(task);this.tail=result.catch(()=>{});return result;}
}
export function receiptHTML(r){
 return `<article class="mb-chat" style="--mb-accent:${color(r.color)}"><header><span>◈</span> BANCO DE MANA</header><p><strong>${escapeHTML(r.accountName)}</strong> ${r.delta>0?'ganhou':'perdeu'} <b>${formatMana(r.amount)} mana</b>.</p><div class="mb-chat-balance">Saldo: <strong>${formatMana(r.after)} mana</strong></div>${r.senderName?`<small>Operação: ${escapeHTML(r.senderName)}</small>`:''}${r.note?`<small>${escapeHTML(r.note)}</small>`:''}</article>`;
}
