import {departments} from './departments';
export type Banner={id:string;title:string;en:string;subtitle:string;subtitleEn:string;category:string;theme:'deals'|'cooking'|'care'|'morning'|'plain';image:string;active:boolean;placement:'hero'|'collection'};
export const bannerTargets=[{id:'deals',name:'সেরা অফার'},{id:'popular',name:'সবার পছন্দ'},{id:'breakfast',name:'সকালের প্রয়োজনীয়'},{id:'cooking',name:'প্রতিদিনের রান্না'},{id:'care-deals',name:'ঘর ও নিজের যত্ন'},{id:'monthly',name:'মাসিক বাজার'},{id:'catalog',name:'সব পণ্য'},...departments.map(d=>({id:d.id,name:d.name}))];
export const defaultBanners:Banner[]=[
 {id:'monthly-hero',title:'মাসের বাজার, সাশ্রয় হোক এবার!',en:'Monthly groceries, more savings',subtitle:'প্রয়োজনীয় সব পণ্য',subtitleEn:'Everyday essentials',category:'monthly',theme:'deals',image:'',active:true,placement:'hero'},
 {id:'offers-hero',title:'আজকের সেরা অফার',en:'Today’s best deals',subtitle:'আপনার নিত্যদিনের পণ্যে সাশ্রয়',subtitleEn:'Save on your daily groceries',category:'deals',theme:'care',image:'',active:true,placement:'hero'},
 {id:'offers',title:'আজকের সেরা অফার',en:'Today’s best deals',subtitle:'নিত্যদিনের বাজারে সাশ্রয়',subtitleEn:'Save on everyday favourites',category:'deals',theme:'deals',image:'',active:true,placement:'collection'},
 {id:'popular',title:'সবার পছন্দের পণ্য',en:'Popular products',subtitle:'',subtitleEn:'',category:'popular',theme:'plain',image:'',active:true,placement:'collection'},
 {id:'morning',title:'সকালের প্রয়োজনীয়',en:'Morning essentials',subtitle:'দিনের সুন্দর শুরু',subtitleEn:'A fresh start to your day',category:'breakfast',theme:'morning',image:'',active:true,placement:'collection'},
 {id:'cooking',title:'প্রতিদিনের রান্না',en:'Everyday cooking',subtitle:'ঘরের রান্না, ভালোবাসায়',subtitleEn:'Good food starts at home',category:'cooking',theme:'cooking',image:'',active:true,placement:'collection'},
 {id:'care',title:'ঘর ও নিজের যত্ন',en:'Home & personal care',subtitle:'পরিচ্ছন্ন ঘর, নিজের যত্ন',subtitleEn:'A little care, every day',category:'care-deals',theme:'care',image:'',active:true,placement:'collection'},
];
export function validateBanners(value:unknown):value is Banner[]{
 if(!Array.isArray(value)||value.length>20)return false;
 const ids=new Set();
 return value.every(b=>{
  if(!b||typeof b!=='object'||typeof b.id!=='string'||! /^[a-z0-9-]{1,64}$/.test(b.id)||ids.has(b.id))return false;ids.add(b.id);
  if(!['title','en'].every(k=>typeof b[k]==='string'&&b[k].trim().length>0&&b[k].length<=100)||!['subtitle','subtitleEn'].every(k=>typeof b[k]==='string'&&b[k].length<=180))return false;
  if(!['hero','collection'].includes(b.placement)||typeof b.active!=='boolean'||(!bannerTargets.some(t=>t.id===b.category)&&!/^[a-z0-9][a-z0-9-]{1,63}$/.test(b.category))||!['deals','cooking','care','morning','plain'].includes(b.theme)||typeof b.image!=='string'||b.image.length>1000)return false;
  if(!b.image)return true;
  if(/^\/api\/images\/[a-f0-9-]{36}$/.test(b.image))return true;
  try{const u=new URL(b.image);return u.protocol==='https:'&&!u.username&&!u.password;}catch{return false;}
 });
}
