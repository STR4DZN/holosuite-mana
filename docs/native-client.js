// Foundry 13 contract simulation. Each iframe is an independent client realm.
import {ID} from '../scripts/core.js';
const who=new URL(location.href).searchParams.get('user'),server=parent.bankServer,callbacks=new Map(),localSettings=new Map(),definitions=new Map(),messages=new Map(),apps=[],errors=[];
class Collection extends Map{[Symbol.iterator](){return this.values();}}
globalThis.Hooks={on(name,fn){const list=callbacks.get(name)||[];list.push(fn);callbacks.set(name,list);},once(name,fn){this.on(name,(...args)=>{if(fn){const call=fn;fn=null;return call(...args);}});},async callAll(name,...args){await Promise.all((callbacks.get(name)||[]).map(fn=>fn(...args)));}};
class ApplicationV2{
 #state=0;#element=null;
 get state(){return this.#state;}get rendered(){return this.#state===2;}get element(){return this.#element;}
 constructor(){apps.push(this);}
 async render(){if(!this.#element){this.#element=document.createElement('section');this.#element.className='mb-app client-app';this.#element.innerHTML='<div class="window-content"></div>';document.body.append(this.#element);}this.#element.hidden=false;this.#state=1;this._replaceHTML(await this._renderHTML(),this.#element.querySelector('.window-content'));this.#state=2;this._onRender?.();return this;}
 async close(){this._onClose?.();this.#state=0;this.#element.hidden=true;return this;}
 bringToFront(){}
}
const users=new Collection(server.users.map(u=>[u.id,structuredClone(u)]));users.activeGM=users.get('master');
function wrap(message){return {id:message.id,get user(){return users.get(message.user);},getFlag:(scope,key)=>message.flags?.[scope]?.[key],update:change=>server.updateChat(who,message.id,structuredClone(change))};}
globalThis.foundry={applications:{api:{ApplicationV2}},utils:{randomID:()=>crypto.randomUUID().replaceAll('-','').slice(0,16)}};
globalThis.game={user:users.get(who),users,messages,modules:new Map([[ID,{}],['holosuite-core',{api:{registerApp(entry){document.querySelector('#launcher').textContent=entry.title;document.querySelector('#launcher').onclick=entry.open;client.registration=entry;return true;}}}]]),settings:{
 register(scope,key,config){definitions.set(key,config);localSettings.set(key,structuredClone(key==='ledger'?server.ledger:config.default));},
 get:(scope,key)=>localSettings.get(key),
 async set(scope,key,value){if(key==='ledger')return server.setLedger(who,structuredClone(value));localSettings.set(key,value);definitions.get(key)?.onChange?.(value);return value;}
}};
globalThis.ui={notifications:{error:message=>errors.push(message)}};
globalThis.ChatMessage={create:(payload,options)=>server.createChat(who,structuredClone(payload),options)};
const transactions=[];const observer=new MutationObserver(records=>{for(const record of records)for(const node of record.addedNodes)if(node.nodeType===1&&node.matches('.mb-notice-layer'))transactions.push({color:node.style.getPropertyValue('--mb-notice-color'),text:node.textContent});});observer.observe(document.body,{childList:true});
const client={who,errors,apps,transactions,registration:null,async setLedger(value){localSettings.set('ledger',structuredClone(value));definitions.get('ledger').onChange(localSettings.get('ledger'));},async chatAdded(value,sender){const copy=structuredClone(value);messages.set(copy.id,wrap(copy));await Hooks.callAll('createChatMessage',messages.get(copy.id),{},sender);return messages.get(copy.id);},async chatUpdated(value,sender){const copy=structuredClone(value);messages.set(copy.id,wrap(copy));await Hooks.callAll('updateChatMessage',messages.get(copy.id),{}, {},sender);},async roleChange(id,active){users.get(id).active=active;users.activeGM=users.get('master').active?users.get('master'):null;await Hooks.callAll('userConnected',users.get(id),active);},open:()=>game.modules.get(ID).api.open(),balance:id=>game.modules.get(ID).api.getBalance(id),api:()=>game.modules.get(ID).api,async close(){for(const app of apps)await app.close();},async clearNotices(){for(let i=0;i<400;i++){const btn=document.querySelector('.mb-notice-dismiss');if(!btn)break;btn.click();}await new Promise(resolve=>setTimeout(resolve,0));}};
server.clients.set(who,client);await import('../scripts/main.js');await Hooks.callAll('init');await Hooks.callAll('ready');globalThis.bankNative=client;client.ready=true;
