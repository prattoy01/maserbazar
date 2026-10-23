import {database,readCart,products} from '@/lib/server';
import {bundles} from '@/lib/shopping';
export async function addCollection(userId:string,b:Record<string,unknown>){
 const db=database();
 if(typeof b.requestId!=='string'||!/^[a-f0-9-]{36}$/.test(b.requestId))return Response.json({error:'অনুরোধটি সঠিক নয়।'},{status:400});
 const done=await db.prepare('SELECT warnings FROM cart_actions WHERE user_id=? AND request_id=? AND applied=1').bind(userId,b.requestId).first<{warnings:string}>();
 if(done)return Response.json({items:await readCart(userId),warnings:JSON.parse(done.warnings)});
 let wanted:{id:string;quantity:number}[]=[];const warnings:string[]=[];
 if(b.type==='reorder'){
  if(typeof b.orderId!=='string')return Response.json({error:'অর্ডার নির্বাচন করুন।'},{status:400});
  const order=await db.prepare('SELECT items FROM orders WHERE id=? AND user_id=?').bind(b.orderId,userId).first<{items:string}>();
  if(!order)return Response.json({error:'অর্ডারটি পাওয়া যায়নি।'},{status:404});
  wanted=JSON.parse(order.items);
 }else{
  const bundle=bundles.find(p=>p.id===b.bundleId);
  if(!bundle||!Array.isArray(b.items)||!b.items.length||b.items.length>bundle.items.length)return Response.json({error:'একটি বাজারের প্যাকেজ নির্বাচন করুন।'},{status:400});
  const ids=new Set<string>();
  for(const item of b.items){if(!item||typeof item.id!=='string'||!bundle.items.some(p=>p.id===item.id)||ids.has(item.id)||!Number.isInteger(item.quantity)||item.quantity<0||item.quantity>20)return Response.json({error:'পণ্যের পরিমাণ ০ থেকে ২০-এর মধ্যে দিন।'},{status:400});ids.add(item.id);wanted.push({id:item.id,quantity:item.quantity});}
 }
 const row=await db.prepare('SELECT items FROM carts WHERE user_id=?').bind(userId).first<{items:string}>(),old=row?.items||'{}',next={...JSON.parse(old)} as Record<string,number>,live=await products();
 const changes:{id:string;quantity:number}[]=[];
 for(const item of wanted){
  if(!Number.isInteger(item.quantity)||item.quantity<1||item.quantity>20){if(item.quantity===0)continue;return Response.json({error:'অর্ডারের পণ্যের পরিমাণ সঠিক নয়।'},{status:400});}
  const p=live.find(p=>p.id===item.id),current=next[item.id]||0,available=p?Math.max(0,Math.min(20,p.stock)-current):0,add=Math.min(item.quantity,available);
  if(b.type==='bundle'&&add<item.quantity)return Response.json({error:'প্যাকেজের কিছু পণ্যের স্টক কম। পরিমাণ কমিয়ে আবার চেষ্টা করুন।'},{status:409});
  if(add<item.quantity)warnings.push((p?.bn||item.id)+(add?' — পাওয়া যাচ্ছে '+add+' প্যাক':' — এখন যোগ করা যায়নি'));
  if(add>0){next[item.id]=current+add;changes.push({id:item.id,quantity:next[item.id]});}
 }
 if(!changes.length)return Response.json({error:'কোনো পণ্য যোগ করা যায়নি। পরিমাণ বা স্টক দেখুন।',warnings},{status:409});
 const id=crypto.randomUUID(),conditions=changes.map(()=>'(SELECT stock FROM products WHERE id=? AND active=1)>=?').join(' AND '),args=changes.flatMap(i=>[i.id,i.quantity]),time=new Date().toISOString();
 const insert=db.prepare(`INSERT INTO cart_actions (id,user_id,request_id,warnings,applied,created_at) SELECT ?,?,?,?,0,? WHERE COALESCE((SELECT items FROM carts WHERE user_id=?),'{}')=? AND ${conditions} ON CONFLICT(user_id,request_id) DO NOTHING`).bind(id,userId,b.requestId,JSON.stringify(warnings),time,userId,old,...args);
 await db.batch([insert,db.prepare('INSERT INTO carts (user_id,items,updated_at) SELECT ?,?,? WHERE EXISTS (SELECT 1 FROM cart_actions WHERE id=? AND applied=0) ON CONFLICT(user_id) DO UPDATE SET items=excluded.items,updated_at=excluded.updated_at').bind(userId,JSON.stringify(next),time,id),db.prepare('UPDATE cart_actions SET applied=1 WHERE id=?').bind(id)]);
 const result=await db.prepare('SELECT warnings FROM cart_actions WHERE user_id=? AND request_id=? AND applied=1').bind(userId,b.requestId).first<{warnings:string}>();
 if(!result)return Response.json({error:'কার্ট বা স্টক পরিবর্তিত হয়েছে। কার্ট আপডেট করে আবার চেষ্টা করুন।'},{status:409});
 return Response.json({items:await readCart(userId),warnings:JSON.parse(result.warnings),review:true});
}
