import 'server-only';
import {database} from './database';
import {defaultCategorySettings,type CategorySettings} from './category-settings';
export async function readCategorySettings(){
 try{
  const row=await database().prepare('SELECT value,revision FROM homepage_content WHERE id=?').bind('categories').first<{value:string;revision:number}>();
  return {settings:row?JSON.parse(row.value) as CategorySettings:defaultCategorySettings,revision:row?.revision||0};
 }catch{
  return {settings:defaultCategorySettings,revision:0};
 }
}
