import {database,identity,sameOrigin,errorResponse} from '@/lib/server';
import {areas} from '@/lib/catalog';
import {deliveryChoices} from '@/lib/shopping';
export const dynamic='force-dynamic';
const fail=(error:string,status=400)=>Response.json({error},{status});
export async function GET(){try{
 const u=await identity(),db=database();
 const [addresses,wishes]=await db.batch([
  db.prepare('SELECT id,label,name,phone,address,area,is_default FROM saved_addresses WHERE user_id=? ORDER BY is_default DESC,created_at DESC').bind(u.userId),
  db.prepare('SELECT product_id FROM wishlist WHERE user_id=? ORDER BY created_at DESC').bind(u.userId),
 ]);
 return Response.json({addresses:addresses.results,wishlist:wishes.results.map(w=>(w as {product_id:string}).product_id),deliveryChoices:deliveryChoices()},{headers:{'Cache-Control':'no-store'}});
}catch(e){return errorResponse(e);}}
export async function POST(r:Request){try{
 sameOrigin(r);const u=await identity(),db=database(),raw=await r.text();if(raw.length>4000)return fail('তথ্য খুব বড়।');
 const b=JSON.parse(raw);if(!b||typeof b!=='object'||Array.isArray(b))return fail('সঠিক তথ্য দিন।');
 if(b.type==='wishlist'){
  if(typeof b.productId!=='string'||typeof b.saved!=='boolean')return fail('পণ্য নির্বাচন করুন।');
  if(b.saved){const p=await db.prepare('SELECT id FROM products WHERE id=? AND active=1').bind(b.productId).first();if(!p)return fail('পণ্যটি এখন পাওয়া যাচ্ছে না।',404);
   await db.prepare('INSERT INTO wishlist (id,user_id,product_id,created_at) VALUES (?,?,?,?) ON CONFLICT(user_id,product_id) DO NOTHING').bind(crypto.randomUUID(),u.userId,b.productId,new Date().toISOString()).run();
  }else await db.prepare('DELETE FROM wishlist WHERE user_id=? AND product_id=?').bind(u.userId,b.productId).run();
  return Response.json({ok:true});
 }
 if(b.type==='remove_address'){
  if(typeof b.id!=='string')return fail('ঠিকানা নির্বাচন করুন।');
  const result=await db.prepare('DELETE FROM saved_addresses WHERE id=? AND user_id=?').bind(b.id,u.userId).run();
  return result.meta.changes?Response.json({ok:true}):fail('ঠিকানাটি পাওয়া যায়নি।',404);
 }
 if(b.type!=='save_address')return fail('সঠিক তথ্য দিন।');
 const text=(value:unknown)=>typeof value==='string'?value.trim():'';
 const id=text(b.id),label=text(b.label),name=text(b.name),phone=text(b.phone).replace(/\s/g,''),address=text(b.address),area=text(b.area);
 if(label.length<1||label.length>50||name.length<2||name.length>100||!/^(?:\+?88)?01[3-9]\d{8}$/.test(phone)||address.length<8||address.length>400||!areas.includes(area)||typeof b.isDefault!=='boolean')return fail('নাম, মোবাইল নম্বর, এলাকা ও সম্পূর্ণ ঠিকানা সঠিকভাবে লিখুন।');
 if(id&&!await db.prepare('SELECT id FROM saved_addresses WHERE id=? AND user_id=?').bind(id,u.userId).first())return fail('ঠিকানাটি পাওয়া যায়নি।',404);
 const addressId=id||crypto.randomUUID();
 const save=id?db.prepare('UPDATE saved_addresses SET label=?,name=?,phone=?,address=?,area=?,is_default=? WHERE id=? AND user_id=?').bind(label,name,phone,address,area,b.isDefault?1:0,id,u.userId):db.prepare('INSERT INTO saved_addresses (id,user_id,label,name,phone,address,area,is_default,created_at) SELECT ?,?,?,?,?,?,?,?,? WHERE (SELECT COUNT(*) FROM saved_addresses WHERE user_id=?)<10').bind(addressId,u.userId,label,name,phone,address,area,b.isDefault?1:0,new Date().toISOString(),u.userId);
 const results=await db.batch([save,...(b.isDefault?[db.prepare('UPDATE saved_addresses SET is_default=0 WHERE user_id=? AND id<>? AND EXISTS (SELECT 1 FROM saved_addresses WHERE id=? AND user_id=? AND is_default=1)').bind(u.userId,addressId,addressId,u.userId)]:[])]);
 if(results[0].meta.changes!==1)return fail('সর্বোচ্চ ১০টি ঠিকানা সংরক্ষণ করা যাবে।',409);
 return Response.json({ok:true,id:addressId});
}catch(e){if(e instanceof SyntaxError)return fail('সঠিক তথ্য দিন।');return errorResponse(e);}}
