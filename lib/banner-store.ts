import 'server-only';
import {database} from './database';
import {defaultBanners,type Banner} from './banners';
export async function readBanners(){
 try{
  const row=await database().prepare('SELECT value,revision FROM homepage_content WHERE id=?').bind('banners').first<{value:string;revision:number}>();
  return {banners:row?JSON.parse(row.value) as Banner[]:defaultBanners,revision:row?.revision||0};
 }catch{
  return {banners:defaultBanners,revision:0};
 }
}
