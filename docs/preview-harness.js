// Preview only. Real view, transaction validation and animation; no Foundry connection.
const demoHost=document.querySelector('#demo-app');
const activeGM=()=>game.users.activeGM;
class PreviewApplication {
 #rendered=false;#element=demoHost;
 get state(){return this.#rendered?2:0;}get rendered(){return this.#rendered;}get element(){return this.#element;}
 async render(){this.#rendered=true;this._replaceHTML(await this._renderHTML(),this.#element.querySelector('.window-content'));this._onRender?.();return this;}
 async close(){this._onClose?.();this.#rendered=false;this.#element.hidden=true;return this;}
 bringToFront(){this.#element.hidden=false;}
}
class PreviewUsers extends Map{[Symbol.iterator](){return this.values();}}
const gm={id:'master',name:'Mestre',isGM:true,active:true,role:4},astra={id:'astra',name:'Astra',isGM:false,active:true,role:1},vega={id:'vega',name:'Vega',isGM:false,active:true,role:1},riven={id:'riven',name:'Riven',isGM:false,active:false,role:1},echo={id:'echo',name:'Echo',isGM:false,active:true,role:1};
const users=new PreviewUsers([gm,astra,vega,riven,echo].map(u=>[u.id,u]));users.activeGM=gm;
const settings=new Map([['noticeColor',CREDIT_COLOR],['reduceMotion',false]]);
globalThis.game={user:astra,users,settings:{get:(id,key)=>settings.get(key),async set(id,key,value){settings.set(key,value);return value;}}};
globalThis.foundry={applications:{api:{ApplicationV2:PreviewApplication}}};globalThis.ui={notifications:{error:message=>console.error(message)}};
// UI_CLASS_BOUNDARY
let data;
try{data=JSON.parse(localStorage.getItem('hollow-switch-preview-v2'));}catch{}
if(!data)data={schema:2,sequence:0,pool:{balance:12840,revision:0},transactions:[]};
const observers=new Set(),notifications=new ManaNotifications({reduced:()=>settings.get('reduceMotion')});
const service={get data(){return data;},get users(){return [...users].filter(u=>!u.isGM);},balance(id){return account(data,id);},subscribe(fn){observers.add(fn);return ()=>observers.delete(fn);},async request(payload){
 const result=transact(data,payload,{sender:game.user,requestId:crypto.randomUUID().replaceAll('-','').slice(0,16),chatId:'preview',now:Date.now()});
 data=result.ledger;data.transactions.at(-1).chatPosted=true;localStorage.setItem('hollow-switch-preview-v2',JSON.stringify(data));for(const fn of observers)fn();notifications.enqueue(result.receipt);
 const chat=document.querySelector('#demo-chat');chat.insertAdjacentHTML('afterbegin',receiptHTML(result.receipt));return result.receipt;
}};
const app=new BankApp(service,notifications);
function sizePreview(){demoHost.classList.toggle('is-gm',game.user.isGM);document.querySelector('#demo-role').value=game.user.isGM?'gm':'player';}
async function showRole(isGM){game.user=isGM?gm:astra;app.bankState.direction=isGM?'credit':'debit';app.bankState.accent=isGM?settings.get('noticeColor'):DEBIT_COLOR;app.bankState.status=null;app.bankState.amount='';app.bankState.note='';sizePreview();await app.render();}
async function simulate(direction){
 const currentUser=game.user;game.user=gm;try{await service.request({accountId:'shared',direction,amount:250,note:direction==='credit'?'Recompensa da missão':'Compra no mercado noturno',color:direction==='credit'?settings.get('noticeColor'):DEBIT_COLOR,revision:service.balance('astra').revision});}finally{game.user=currentUser;app.refresh();}
}
document.querySelector('#demo-role').onchange=e=>showRole(e.target.value==='gm');
document.querySelector('#demo-gain').onclick=()=>simulate('credit');document.querySelector('#demo-loss').onclick=()=>simulate('debit');
document.querySelector('#demo-reduced').onchange=e=>settings.set('reduceMotion',e.target.checked);
document.querySelector('#demo-reset').onclick=()=>{localStorage.removeItem('hollow-switch-preview-v2');location.reload();};
sizePreview();await app.render();globalThis.bankPreview={app,service,notifications,showRole,simulate,users,get data(){return data;}};
