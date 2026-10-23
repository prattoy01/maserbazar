import {departments} from './departments';
export type CategoryTile={id:string;name:string;en:string;image:string;active:boolean};
export type CategorySettings={initialCount:number;items:CategoryTile[]};
export const defaultCategorySettings:CategorySettings={initialCount:4,items:departments.map(({id,name,en,image})=>({id,name,en,image,active:true}))};
export function validCategorySettings(v:unknown):v is CategorySettings{
 if(!v||typeof v!=='object')return false;
 const s=v as CategorySettings;
 if(!Number.isInteger(s.initialCount)||s.initialCount<1||s.initialCount>20||!Array.isArray(s.items)||s.items.length!==departments.length)return false;
 const seen=new Set();
 return s.items.every(c=>{
  if(!c||typeof c.id!=='string'||seen.has(c.id)||!departments.some(d=>d.id===c.id))return false;seen.add(c.id);
  if(typeof c.active!=='boolean'||typeof c.name!=='string'||!c.name.trim()||c.name.length>80||typeof c.en!=='string'||!c.en.trim()||c.en.length>80||typeof c.image!=='string'||c.image.length>1000)return false;
  if(/^\/api\/images\/[a-f0-9-]{36}$/.test(c.image))return true;
  try{const url=new URL(c.image);return url.protocol==='https:'&&!url.username&&!url.password;}catch{return false;}
 });
}
