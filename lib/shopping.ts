export const bundles = [
 {id:'kitchen',name:'মাসের রান্নাঘর',en:'Monthly kitchen',description:'তেল, আটা, চিনি ও লবণ',items:[{id:'oil',quantity:1},{id:'atta',quantity:4},{id:'sugar',quantity:2},{id:'salt',quantity:1}]},
 {id:'breakfast',name:'সকালের বাজার',en:'Breakfast essentials',description:'দুধ, ডিম ও পানীয়',items:[{id:'milk',quantity:12},{id:'eggs',quantity:4},{id:'horlicks',quantity:1},{id:'coffee',quantity:8}]},
 {id:'home',name:'ঘরের যত্ন',en:'Home essentials',description:'পরিষ্কার ও ব্যক্তিগত যত্ন',items:[{id:'wheel',quantity:2},{id:'vim',quantity:4},{id:'harpic',quantity:2},{id:'tissue',quantity:2},{id:'soap',quantity:1}]},
];
export type SavedAddress={id:string;label:string;name:string;phone:string;address:string;area:string;is_default:number};
export const deliveryWindows=[{id:'morning',label:'সকাল ১০টা – দুপুর ১টা',start:10},{id:'afternoon',label:'দুপুর ২টা – বিকেল ৫টা',start:14},{id:'evening',label:'সন্ধ্যা ৬টা – রাত ৯টা',start:18}];
export type DeliveryChoice={date:string;slots:{id:string;label:string}[]};
export function deliveryChoices(now=Date.now()):DeliveryChoice[]{
 const shifted=new Date(now+6*60*60*1000),minute=shifted.getUTCHours()*60+shifted.getUTCMinutes();
 return Array.from({length:7},(_,day)=>({date:new Date(Date.UTC(shifted.getUTCFullYear(),shifted.getUTCMonth(),shifted.getUTCDate()+day)).toISOString().slice(0,10),slots:deliveryWindows.filter(s=>day>0||minute<=s.start*60-60).map(({id,label})=>({id,label}))})).filter(d=>d.slots.length>0);
}
