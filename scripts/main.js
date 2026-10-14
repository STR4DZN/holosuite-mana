import {ID,CREDIT_COLOR} from './core.js';
import {BankService} from './service.js';
import {BankApp} from './ui.js';
import {ManaNotifications} from './notifications.js';
const service=new BankService();let app,notices;
export async function open(){if(!app)app=new BankApp(service,notices,{position:{width:1060,height:900}});await app.render({force:true});app.bringToFront();return app;}
let registeredApi,registeredFunction;
function registerPhone(api){
 api=api?.registerApp?api:game.modules.get('holosuite-core')?.api;
 if(!api?.registerApp)return false;
 if(registeredApi===api&&registeredFunction===api.registerApp)return true;
 api.registerApp({id:ID,title:'Banco de Mana',icon:'mb-bank-app-glyph',premium:false,playerVisible:true,description:'Saldo de mana compartilhado por todos os jogadores.',featureId:ID,open:()=>open().catch(error=>ui.notifications.error(error.message))});
 registeredApi=api;registeredFunction=api.registerApp;return true;
}
Hooks.once('init',()=>{
 service.register();
 game.settings.register(ID,'noticeColor',{scope:'client',config:false,type:String,default:CREDIT_COLOR});
 game.settings.register(ID,'reduceMotion',{name:'Banco de Mana: reduzir movimentos',hint:'Mantém os avisos e valores finais com menos movimento.',scope:'client',config:true,type:Boolean,default:false,onChange:()=>{app?.motionPreferenceChanged();notices?.reduceCurrent();}});
 Hooks.on('holosuite-core.apiReady',registerPhone);
 game.modules.get(ID).api=Object.freeze({open,getBalance:()=>service.balance().balance,
  registerPurchaseProvider:(id,provider)=>{service.purchases.register(id,provider);if(game.user.isGM)service.retryChats();},
  purchase:payload=>service.request({...payload,action:'purchase',revision:service.balance().revision}),
  hasPendingPurchase:(provider,sceneId,regionId)=>Object.values(service.purchases.entries).some(p=>p.status==='reserved'&&p.provider===provider&&p.data?.sceneId===sceneId&&p.data?.regionId===regionId),
  clearHistory:()=>service.request({action:'clearHistory',revision:service.balance().revision}),
  debit:(value,{note='',color,profile}={})=>service.request({direction:'debit',amount:value,note,color,profile,revision:service.balance().revision}),
  credit:(value,{note='',color,profile}={})=>service.request({direction:'credit',amount:value,note,color,profile,revision:service.balance().revision})});
});
Hooks.once('ready',()=>{
 notices=new ManaNotifications({reduced:()=>game.settings.get(ID,'reduceMotion')});service.onTransaction=r=>notices.enqueue(r);service.install();
 registerPhone();Hooks.callAll('mana-bank.ready',game.modules.get(ID).api);
 matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',()=>app?.motionPreferenceChanged());
});
