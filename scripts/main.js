import {ID,CREDIT_COLOR} from './core.js';
import {BankService} from './service.js';
import {BankApp} from './ui.js';
import {ManaNotifications} from './notifications.js';
const service=new BankService();let app,notices;
export async function open(){if(!app)app=new BankApp(service,notices,{position:{width:game.user.isGM?1000:800,height:850}});await app.render({force:true});app.bringToFront();return app;}
function registerHoloSuite(api=game.modules.get('holosuite-core')?.api){
 if(!api?.registerApp)return false;
 api.registerApp({id:ID,title:'Banco Mana',icon:'fa-solid fa-building-columns',premium:false,playerVisible:true,description:'Sua conta de mana. Saldo, gastos e movimentações.',featureId:ID,open:()=>open().catch(error=>ui.notifications.error(error.message))});return true;
}
Hooks.once('init',()=>{
 service.register();
 game.settings.register(ID,'noticeColor',{scope:'client',config:false,type:String,default:CREDIT_COLOR});
 game.settings.register(ID,'reduceMotion',{name:'Banco Mana: reduzir movimentos',hint:'Mantém os avisos e valores finais com menos movimento.',scope:'client',config:true,type:Boolean,default:false});
 Hooks.on('holosuite-core.apiReady',registerHoloSuite);
 game.modules.get(ID).api=Object.freeze({open,getBalance:(userId=game.user.id)=>service.balance(userId).balance,
  debit:(value,{accountId=game.user.id,note='',color}={})=>service.request({accountId,direction:'debit',amount:value,note,color,revision:service.balance(accountId).revision}),
  credit:(accountId,value,{note='',color}={})=>service.request({accountId,direction:'credit',amount:value,note,color,revision:service.balance(accountId).revision})});
});
Hooks.once('ready',()=>{
 notices=new ManaNotifications({reduced:()=>game.settings.get(ID,'reduceMotion')});service.onTransaction=r=>notices.enqueue(r);service.install();registerHoloSuite();
});
