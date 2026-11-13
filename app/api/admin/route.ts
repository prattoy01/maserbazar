import {adminDenied as authorized} from '@/lib/admin-auth';
import {database,products,errorResponse,sameOrigin} from '@/lib/server';
import {categories} from '@/lib/catalog';
import {readCategorySettings} from '@/lib/category-store';
import {readPaymentSettings} from '@/lib/payment-store';
export const dynamic='force-dynamic';
function fail(message:string,status=400){return Response.json({error:message},{status});}
export async function GET(r:Request){try{const d=authorized(r);if(d)return d;const rows=await database().prepare('SELECT id,customer_name,phone,address,area,total,status,payment,trx_id,payment_status,created_at,items,delivery_date,delivery_slot FROM orders ORDER BY created_at DESC LIMIT 100').all();const catSettings=(await readCategorySettings()).settings;const paySettings=(await readPaymentSettings()).settings;return Response.json({products:await products(true),orders:rows.results,categorySettings:catSettings,paymentSettings:paySettings},{headers:{'Cache-Control':'no-store'}});}catch(e){return errorResponse(e);}}
export async function POST(r:Request){try{
 sameOrigin(r);const denied=authorized(r);if(denied)return denied;
 const raw=await r.text();if(raw.length>6000)return fail('তথ্য খুব বড়।');let b:Record<string,unknown>;try{b=JSON.parse(raw);if(!b||typeof b!=='object'||Array.isArray(b))return fail('সঠিক তথ্য দিন।');}catch{return fail('সঠিক তথ্য দিন।');}
 const db=database();
 if(b.type==='create_product'||b.type==='update_product'){
  const create=b.type==='create_product',id=typeof b.id==='string'?b.id.trim().toLowerCase():'',name=typeof b.name==='string'?b.name.trim():'',bn=typeof b.bn==='string'?b.bn.trim():'',unit=typeof b.unit==='string'?b.unit.trim():'',image=typeof b.image==='string'?b.image.trim():'',price=b.price,originalPrice=b.originalPrice,stock=b.stock;
  if((!create&&!id)||(id&&!/^[a-z0-9][a-z0-9-]{1,63}$/.test(id)))return fail('পণ্য কোডে ২–৬৪টি ছোট ইংরেজি অক্ষর, সংখ্যা বা হাইফেন ব্যবহার করুন।');
  if(name.length<2||name.length>140||bn.length<2||bn.length>140||unit.length<1||unit.length>80)return fail('বাংলা ও ইংরেজি নাম এবং প্যাকের পরিমাণ সঠিকভাবে লিখুন।');
  const catSettings=(await readCategorySettings()).settings;
  if(!catSettings.items.some(c=>c.id===b.category)&&!categories.slice(3).some(c=>c.id===b.category))return fail('একটি পণ্যের ক্যাটেগরি নির্বাচন করুন।');
  if(typeof price!=='number'||!Number.isInteger(price)||price<1||price>99999||typeof originalPrice!=='number'||!Number.isInteger(originalPrice)||originalPrice<price||originalPrice>99999||typeof stock!=='number'||!Number.isInteger(stock)||stock<0||stock>99999)return fail('মূল্য ও স্টক পূর্ণ সংখ্যা হতে হবে। আগের মূল্য বিক্রয়মূল্যের চেয়ে কম হতে পারবে না।');
  if(typeof b.active!=='boolean'||typeof b.popular!=='boolean')return fail('পণ্যের দৃশ্যমানতা নির্বাচন করুন।');
  const threshold=b.lowStockThreshold===undefined?5:b.lowStockThreshold;if(typeof threshold!=='number'||!Number.isInteger(threshold)||threshold<0||threshold>99999)return fail('স্টক সতর্কতার সীমা ০–৯৯৯৯৯-এর মধ্যে দিন।');
  if(image.startsWith('/api/images/')){if(!/^\/api\/images\/[a-f0-9-]{36}$/.test(image)||!await db.prepare('SELECT id FROM product_images WHERE id=?').bind(image.split('/').pop()!).first())return fail('আপলোড করা ছবিটি পাওয়া যায়নি।');}
  else if(image&&image!=='/product-placeholder.svg'){try{const url=new URL(image);if(url.protocol!=='https:'||url.username||url.password||image.length>1000)return fail('ছবি আপলোড করুন অথবা একটি HTTPS লিংক দিন।');}catch{return fail('ছবি আপলোড করুন অথবা একটি HTTPS লিংক দিন।');}}
  const productId=id||'p-'+crypto.randomUUID().slice(0,8),values=[name,bn,String(b.category),unit,image||'/product-placeholder.svg',price,originalPrice,stock,b.active?1:0,b.popular?1:0,threshold];
  const result=create?await db.prepare('INSERT INTO products (name,bn,category,unit,image,price,original_price,stock,active,popular,low_stock_threshold,id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING').bind(...values,productId).run():await db.prepare('UPDATE products SET name=?,bn=?,category=?,unit=?,image=?,price=?,original_price=?,stock=?,active=?,popular=?,low_stock_threshold=? WHERE id=?').bind(...values,productId).run();
  if(result.meta.changes!==1)return fail(create?'এই পণ্য কোডটি ব্যবহার করা হয়েছে। অন্য কোড দিন।':'পণ্যটি পাওয়া যায়নি।',create?409:404);
  return Response.json({ok:true,id:productId},{status:create?201:200});
 }
 if(b.type==='product'&&typeof b.id==='string'&&Number.isInteger(b.price)&&Number(b.price)>0&&Number(b.price)<100000&&Number.isInteger(b.stock)&&Number(b.stock)>=0&&Number(b.stock)<100000){const result=await db.prepare('UPDATE products SET price=?,stock=? WHERE id=?').bind(Number(b.price),Number(b.stock),b.id).run();if(!result.meta.changes)return fail('পণ্যটি পাওয়া যায়নি।',404);return Response.json({ok:true});}
 if(b.type==='category_offer'){
  const cat=typeof b.category==='string'?b.category.trim():'',mode=b.mode,val=typeof b.value==='number'?b.value:Number(b.value);
  const catSettings=(await readCategorySettings()).settings;
  if(cat!=='all'&&!catSettings.items.some(c=>c.id===cat)&&!categories.slice(3).some(c=>c.id===cat))return fail('একটি সঠিক ক্যাটেগরি নির্বাচন করুন।');
  if(mode!=='percent'&&mode!=='flat'&&mode!=='clear')return fail('অফারের ধরন নির্বাচন করুন।');
  if(mode==='percent'&&(!Number.isFinite(val)||val<1||val>90))return fail('ছাড়ের হার ১% থেকে ৯০%-এর মধ্যে হতে হবে।');
  if(mode==='flat'&&(!Number.isFinite(val)||val<1||val>50000))return fail('ছাড়ের পরিমাণ ১ থেকে ৫০০০০ টাকার মধ্যে হতে হবে।');
  await products(true);
  const rows=cat==='all'?await db.prepare('SELECT id,price,original_price FROM products').all<{id:string;price:number;original_price:number}>():await db.prepare('SELECT id,price,original_price FROM products WHERE category=?').bind(cat).all<{id:string;price:number;original_price:number}>();
  if(!rows.results.length)return fail('এই ক্যাটেগরিতে কোনো পণ্য নেই।',404);
  const stmts=rows.results.map(row=>{
   const base=Math.max(row.price,row.original_price);
   const nextPrice=mode==='clear'?base:mode==='percent'?Math.max(1,Math.round(base*(100-val)/100)):Math.max(1,Math.round(base-val));
   return db.prepare('UPDATE products SET price=?,original_price=? WHERE id=?').bind(nextPrice,base,row.id);
  });
  await db.batch(stmts);
  return Response.json({ok:true,updated:rows.results.length});
 }
 if(b.type==='order'&&typeof b.id==='string'&&typeof b.status==='string'){
  const row=await db.prepare('SELECT status FROM orders WHERE id=?').bind(b.id).first<{status:string}>(),steps=['received','confirmed','packing','out_for_delivery','delivered'];if(!row||steps.indexOf(b.status)!==steps.indexOf(row.status)+1)return fail('অর্ডারের পরবর্তী ধাপ নির্বাচন করুন।');
  const result=await db.prepare('UPDATE orders SET status=? WHERE id=? AND status=?').bind(b.status,b.id,row.status).run();if(result.meta.changes!==1)return fail('অর্ডারটি পরিবর্তিত হয়েছে। আপডেট করে আবার চেষ্টা করুন।',409);return Response.json({ok:true});
 }
 if(b.type==='verify_payment'&&typeof b.id==='string'&&typeof b.paymentStatus==='string'){
  if(!['verified','rejected','pending'].includes(b.paymentStatus))return fail('পেমেন্টের অবস্থা সঠিক নয়।');
  const row=await db.prepare('SELECT status,payment FROM orders WHERE id=?').bind(b.id).first<{status:string;payment:string}>();
  if(!row)return fail('অর্ডারটি পাওয়া যায়নি।',404);
  const nextOrderStatus=b.paymentStatus==='verified'&&row.status==='received'?'confirmed':row.status;
  const result=await db.prepare('UPDATE orders SET payment_status=?,status=? WHERE id=?').bind(b.paymentStatus,nextOrderStatus,b.id).run();
  if(result.meta.changes!==1)return fail('পেমেন্ট আপডেট করা যায়নি।',409);
  return Response.json({ok:true});
 }
 if(b.type==='payment_settings'){
  const merchantName=typeof b.merchantName==='string'?b.merchantName.trim():'';
  const merchantNumber=typeof b.merchantNumber==='string'?b.merchantNumber.trim():'';
  const qrImage=typeof b.qrImage==='string'?b.qrImage.trim():'';
  const noteBn=typeof b.noteBn==='string'?b.noteBn.trim():'';
  const noteEn=typeof b.noteEn==='string'?b.noteEn.trim():'';
  if(!merchantName||merchantName.length>120)return fail('মার্চেন্টের নাম সঠিকভাবে লিখুন।');
  if(merchantNumber.length>60)return fail('মার্চেন্ট নম্বর সঠিকভাবে লিখুন।');
  if(qrImage.startsWith('/api/images/')){
   if(!/^\/api\/images\/[a-f0-9-]{36}$/.test(qrImage)||!await db.prepare('SELECT id FROM product_images WHERE id=?').bind(qrImage.split('/').pop()!).first())return fail('আপলোড করা QR ছবিটি পাওয়া যায়নি।');
  }else if(qrImage){
   try{const url=new URL(qrImage);if(url.protocol!=='https:'||qrImage.length>1000)return fail('QR কোডের ছবি আপলোড করুন অথবা HTTPS লিংক দিন।');}catch{return fail('QR কোডের ছবি আপলোড করুন অথবা HTTPS লিংক দিন।');}
  }
  const payload=JSON.stringify({merchantName,merchantNumber,qrImage,noteBn,noteEn});
  await db.prepare('INSERT INTO homepage_content (id,value,revision) VALUES (?,?,1) ON CONFLICT(id) DO UPDATE SET value=excluded.value,revision=homepage_content.revision+1').bind('payment_settings',payload).run();
  return Response.json({ok:true});
 }
 return fail('সঠিক তথ্য দিন।');
}catch(e){return errorResponse(e);}}

