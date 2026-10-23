import {products,errorResponse} from '@/lib/server';
import {readCategorySettings} from '@/lib/category-store';
import {readBanners} from '@/lib/banner-store';
export const dynamic='force-dynamic';
export async function GET(){try{return Response.json({products:await products(),banners:(await readBanners()).banners.filter(b=>b.active),categorySettings:(await readCategorySettings()).settings,demo:true},{headers:{'Cache-Control':'no-store'}});}catch(e){return errorResponse(e);}}
