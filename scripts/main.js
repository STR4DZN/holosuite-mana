import {ID,CREDIT_COLOR} from './core.js';
import {BankService} from './service.js';
import {BankApp} from './ui.js';
import {ManaNotifications} from './notifications.js';
const service=new BankService();let app,notices;
export async function open(){if(!app)app=new BankApp(service,notices,{position:{width:1060,height:840}});await app.render({force:true});app.bringToFront();return app;}
function registerHoloSuite(api=game.modules.get('holosuite-core')?.api){
 if(!api?.registerApp)return false;
 api.registerApp({id:ID,title:'Hollow Switch',icon:'fa-solid fa-building-columns',premium:false,playerVisible:true,description:'Reserva compartilhada de mana do esquadrão.',featureId:ID,open:()=>open().catch(error=>ui.notifications.error(error.message))});return true;
}
Hooks.once('init',()=>{
 service.register();
 game.settings.register(ID,'noticeColor',{scope:'client',config:false,type:String,default:CREDIT_COLOR});
 game.settings.register(ID,'reduceMotion',{name:'Banco Mana: reduzir movimentos',hint:'Mantém os avisos e valores finais com menos movimento.',scope:'client',config:true,type:Boolean,default:false});
 Hooks.on('holosuite-core.apiReady',registerHoloSuite);
 game.modules.get(ID).api=Object.freeze({open,getBalance:()=>service.balance().balance,
  debit:(value,{note='',color,profile}={})=>service.request({direction:'debit',amount:value,note,color,profile,revision:service.balance().revision}),
  credit:(value,{note='',color,profile}={})=>service.request({direction:'credit',amount:value,note,color,profile,revision:service.balance().revision})});
});
Hooks.once('ready',()=>{
 notices=new ManaNotifications({reduced:()=>game.settings.get(ID,'reduceMotion')});service.onTransaction=r=>notices.enqueue(r);service.install();registerHoloSuite();
});
