// Foundry 13 contract simulation. Each iframe is an independent client realm.
import {ID} from '../scripts/core.js';
import {decodePacket} from '../scripts/service.js';
const who=new URL(location.href).searchParams.get('user'),server=parent.bankServer,callbacks=new Map(),localSettings=new Map(),definitions=new Map(),messages=new Map(),apps=[],errors=[];
class Collection extends Map{[Symbol.iterator](){return this.values();}}
globalThis.Hooks={on(name,fn){const list=callbacks.get(name)||[];list.push(fn);callbacks.set(name,list);},once(name,fn){this.on(name,(...args)=>{if(fn){const call=fn;fn=null;return call(...args);}});},async callAll(name,...args){await Promise.all((callbacks.get(name)||[]).map(fn=>fn(...args)));}};
class ApplicationV2{
 #state=0;#element=null;
 get state(){return this.#state;}get rendered(){return this.#state===2;}get element(){return this.#element;}
 constructor(){apps.push(this);}
 async render(){if(!this.#element){this.#element=document.createElement('section');this.#element.className='mb-app client-app';this.#element.innerHTML='<div class="window-content"></div>';document.body.append(this.#element);}this.#element.hidden=false;this.#state=1;this._replaceHTML(await this._renderHTML(),this.#element.querySelector('.window-content'));this.#state=2;this._onRender?.();return this;}
 async close(){this._onClose?.();this.#state=0;if(this.#element)this.#element.hidden=true;return this;}
 bringToFront(){}
}
const users=new Collection(server.users.map(u=>[u.id,structuredClone(u)]));users.activeGM=users.get('master');
for(const user of users.values()){user.flags??={};user.getFlag=(scope,key)=>user.flags[scope]?.[key];user.update=(change,options)=>server.updateUser(who,user.id,structuredClone(change),options).then(()=>user);}
const phoneApi={registerApp(entry){client.registration=entry;client.registrationCount++;document.querySelector('#launcher').textContent=entry.title;document.querySelector('#launcher').onclick=entry.open;}};const phoneModule={api:who==='vega'?null:phoneApi};
function wrap(message){return {id:message.id,_source:message,get user(){return users.get(message.user);},getFlag:(scope,key)=>message.flags?.[scope]?.[key],update:change=>server.updateChat(who,message.id,structuredClone(change))};}
globalThis.foundry={applications:{api:{ApplicationV2}},utils:{randomID:()=>crypto.randomUUID().replaceAll('-','').slice(0,16)}};
globalThis.game={user:users.get(who),users,messages,modules:new Map([[ID,{}],['holosuite-core',phoneModule]]),settings:{
 registerMenu(){throw Error('O banco não deve criar botão nas configurações');},
 register(scope,key,config){definitions.set(key,config);localSettings.set(key,structuredClone(key==='ledger'?server.ledger:config.default));},
 get:(scope,key)=>localSettings.get(key),
 async set(scope,key,value){if(key==='ledger')return server.setLedger(who,structuredClone(value));localSettings.set(key,value);definitions.get(key)?.onChange?.(value);return value;}
}};
globalThis.ui={notifications:{error:message=>errors.push(message)},settings:{element:document.querySelector('#settings')}};
globalThis.ChatMessage={create:(payload,options)=>server.createChat(who,structuredClone(payload),options)};
const transactions=[];const observer=new MutationObserver(records=>{for(const record of records)for(const node of record.addedNodes)if(node.nodeType===1&&node.matches('.mb-notice-layer'))transactions.push({color:node.style.getPropertyValue('--mb-notice-color'),text:node.textContent});});observer.observe(document.body,{childList:true});
const client={who,errors,apps,transactions,registration:null,registrationCount:0,async userUpdated(id,change,sender){const user=users.get(id);for(const [path,value]of Object.entries(change)){const [,scope,key]=path.split('.');user.flags[scope]??={};user.flags[scope][key]=structuredClone(value);}await Hooks.callAll('updateUser',user,server.echoFlags?{flags:structuredClone(user.flags)}:structuredClone(change),{},sender);},async setLedger(value){localSettings.set('ledger',structuredClone(value));definitions.get('ledger').onChange(localSettings.get('ledger'));},async chatAdded(value,sender){const copy=structuredClone(value);messages.set(copy.id,wrap(copy));await Hooks.callAll('createChatMessage',messages.get(copy.id),{},sender);return messages.get(copy.id);},async chatUpdated(value,sender){const copy=structuredClone(value),existing=messages.get(copy.id);if(existing)Object.assign(existing._source,copy);else messages.set(copy.id,wrap(copy));await Hooks.callAll('updateChatMessage',messages.get(copy.id),{}, {},sender);},async roleChange(id,active){users.get(id).active=active;users.activeGM=users.get('master').active?users.get('master'):null;await Hooks.callAll('userConnected',users.get(id),active);},open:()=>game.modules.get(ID).api.open(),balance:id=>game.modules.get(ID).api.getBalance(id),api:()=>game.modules.get(ID).api,result:()=>decodePacket(game.user.getFlag(ID,'result')),async close(){for(const app of apps)await app.close();},async clearNotices(){for(let i=0;i<400;i++){const btn=document.querySelector('.mb-notice-dismiss');if(!btn)break;btn.click();}await new Promise(resolve=>setTimeout(resolve,0));}};
server.clients.set(who,client);await import('../scripts/main.js');await Hooks.callAll('init');await Hooks.callAll('ready');phoneModule.api=phoneApi;await Hooks.callAll('holosuite-core.apiReady',phoneApi);await Hooks.callAll('holosuite-core.apiReady',phoneApi);globalThis.bankNative=client;client.ready=true;
