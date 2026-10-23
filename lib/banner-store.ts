import 'server-only';
import {database} from './database';
import {defaultBanners,type Banner} from './banners';
export async function readBanners(){const row=await database().prepare('SELECT value,revision FROM homepage_content WHERE id=?').bind('banners').first<{value:string;revision:number}>();return {banners:row?JSON.parse(row.value) as Banner[]:defaultBanners,revision:row?.revision||0};}
