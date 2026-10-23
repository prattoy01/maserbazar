import {adminDenied} from '@/lib/admin-auth';
import {database,sameOrigin,errorResponse} from '@/lib/server';
import {readCategorySettings} from '@/lib/category-store';
import {validCategorySettings} from '@/lib/category-settings';
export const dynamic='force-dynamic';
export async function GET(r:Request){try{const denied=adminDenied(r);if(denied)return denied;return Response.json(await readCategorySettings(),{headers:{'Cache-Control':'no-store'}});}catch(e){return errorResponse(e);}}
export async function PUT(r:Request){try{
 const denied=adminDenied(r);if(denied)return denied;sameOrigin(r);
 const raw=await r.text();if(raw.length>40000)return Response.json({error:'তথ্য খুব বড়।'},{status:413});
 let b;try{b=JSON.parse(raw);}catch{return Response.json({error:'সঠিক তথ্য দিন।'},{status:400});}
 if(!b||!validCategorySettings(b.settings)||!Number.isInteger(b.revision)||b.revision<0)return Response.json({error:'নাম, ছবি ও শুরুতে দেখানোর সংখ্যা যাচাই করুন।'},{status:400});
 const db=database();for(const c of b.settings.items){if(c.image.startsWith('/api/images/')&&!await db.prepare('SELECT id FROM product_images WHERE id=?').bind(c.image.split('/').pop()!).first())return Response.json({error:'আপলোড করা ছবিটি পাওয়া যায়নি।'},{status:400});}
 const result=await db.prepare('UPDATE homepage_content SET value=?,revision=revision+1 WHERE id=? AND revision=?').bind(JSON.stringify(b.settings),'categories',b.revision).run();
 if(result.meta.changes!==1)return Response.json({error:'তালিকা পরিবর্তিত হয়েছে। রিফ্রেশ করে আবার চেষ্টা করুন।'},{status:409});
 return Response.json({settings:b.settings,revision:b.revision+1},{headers:{'Cache-Control':'no-store'}});
 }catch(e){return errorResponse(e);}}
