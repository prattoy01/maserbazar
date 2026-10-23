import {adminDenied} from '@/lib/admin-auth';
import {database,errorResponse,sameOrigin} from '@/lib/server';
import {readBanners} from '@/lib/banner-store';
import {validateBanners} from '@/lib/banners';
export const dynamic='force-dynamic';
export async function GET(r:Request){try{const denied=adminDenied(r);if(denied)return denied;return Response.json(await readBanners(),{headers:{'Cache-Control':'no-store'}});}catch(e){return errorResponse(e);}}
export async function PUT(r:Request){try{
 const denied=adminDenied(r);if(denied)return denied;sameOrigin(r);
 const raw=await r.text();if(raw.length>50000)return Response.json({error:'তথ্য খুব বড়।'},{status:413});
 let b;try{b=JSON.parse(raw);}catch{return Response.json({error:'সঠিক তথ্য দিন।'},{status:400});}
 if(!b||typeof b!=='object'||!validateBanners(b.banners)||!Number.isInteger(b.revision)||b.revision<0)return Response.json({error:'ব্যানারের নাম, ক্যাটেগরি ও ছবির লিংক যাচাই করুন। সর্বোচ্চ ২০টি ব্যানার রাখা যাবে।'},{status:400});
 const db=database();
 for(const banner of b.banners){if(banner.image.startsWith('/api/images/')&&!await db.prepare('SELECT id FROM product_images WHERE id=?').bind(banner.image.split('/').pop()!).first())return Response.json({error:'আপলোড করা ছবি পাওয়া যায়নি।'},{status:400});}
 const result=await db.prepare('UPDATE homepage_content SET value=?,revision=revision+1 WHERE id=? AND revision=?').bind(JSON.stringify(b.banners), 'banners',b.revision).run();
 if(result.meta.changes!==1)return Response.json({error:'অন্য কেউ ব্যানার পরিবর্তন করেছেন। তালিকা রিফ্রেশ করে আবার চেষ্টা করুন।'},{status:409});
 return Response.json({banners:b.banners,revision:b.revision+1},{headers:{'Cache-Control':'no-store'}});
 }catch(e){return errorResponse(e);}}
