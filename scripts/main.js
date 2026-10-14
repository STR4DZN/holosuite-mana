import {ID,CREDIT_COLOR} from './core.js';
import {BankService} from './service.js';
import {BankApp} from './ui.js';
import {ManaNotifications} from './notifications.js';
const service=new BankService();let app,notices;
export async function open(){if(!app)app=new BankApp(service,notices,{position:{width:1060,height:900}});await app.render({force:true});app.bringToFront();return app;}
class BankLauncher extends foundry.applications.api.ApplicationV2 {render(){return open();}}
function addSettingsButton(application,html){
 const root=html instanceof HTMLElement?html:html?.[0];if(!root||root.querySelector('.mana-bank-launcher'))return;
 const button=document.createElement('button');button.type='button';button.className='mana-bank-launcher';button.innerHTML='<i class="fa-solid fa-building-columns" aria-hidden="true"></i> Banco de Mana';
 button.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();open().catch(error=>ui.notifications.error(error.message));});
 root.prepend(button);
}
Hooks.once('init',()=>{
 service.register();
 game.settings.registerMenu(ID,'openBank',{name:'Banco de Mana',label:'Abrir banco',hint:'Saldo de mana compartilhado por todos os jogadores.',icon:'fa-solid fa-building-columns',type:BankLauncher,restricted:false});
 game.settings.register(ID,'noticeColor',{scope:'client',config:false,type:String,default:CREDIT_COLOR});
 game.settings.register(ID,'reduceMotion',{name:'Banco de Mana: reduzir movimentos',hint:'Mantém os avisos e valores finais com menos movimento.',scope:'client',config:true,type:Boolean,default:false,onChange:()=>{app?.motionPreferenceChanged();notices?.reduceCurrent();}});
 Hooks.on('renderSettings',addSettingsButton);
 game.modules.get(ID).api=Object.freeze({open,getBalance:()=>service.balance().balance,
  debit:(value,{note='',color,profile}={})=>service.request({direction:'debit',amount:value,note,color,profile,revision:service.balance().revision}),
  credit:(value,{note='',color,profile}={})=>service.request({direction:'credit',amount:value,note,color,profile,revision:service.balance().revision})});
});
Hooks.once('ready',()=>{
 notices=new ManaNotifications({reduced:()=>game.settings.get(ID,'reduceMotion')});service.onTransaction=r=>notices.enqueue(r);service.install();
 if(ui.settings?.element)addSettingsButton(ui.settings,ui.settings.element);
 matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',()=>app?.motionPreferenceChanged());
});
