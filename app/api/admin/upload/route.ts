import {adminDenied} from '@/lib/admin-auth';
import {database,sameOrigin,errorResponse} from '@/lib/server';
export const dynamic='force-dynamic';
const maximum=3*1024*1024;
export async function POST(r:Request){try{
 sameOrigin(r);const denied=adminDenied(r);if(denied)return denied;
 if(Number(r.headers.get('content-length'))>maximum+65536)return Response.json({error:'ছবি সর্বোচ্চ ৩ এমবি হতে পারে।'},{status:413});
 // Bound the stream before multipart parsing so untrusted file data cannot fill server memory.
 const reader=r.body?.getReader();if(!reader)return Response.json({error:'একটি ছবি নির্বাচন করুন।'},{status:400});
 const chunks:Uint8Array[]=[];let length=0;
 while(true){const {done,value}=await reader.read();if(done)break;length+=value.byteLength;if(length>maximum+65536){await reader.cancel();return Response.json({error:'ছবি সর্বোচ্চ ৩ এমবি হতে পারে।'},{status:413});}chunks.push(value);}
 const payload=new Uint8Array(length);let offset=0;for(const chunk of chunks){payload.set(chunk,offset);offset+=chunk.length;}
 const form=await new Response(payload,{headers:{'Content-Type':r.headers.get('content-type')||''}}).formData(),file=form.get('file');
 if(file instanceof File&&file.size>maximum)return Response.json({error:'ছবি সর্বোচ্চ ৩ এমবি হতে পারে।'},{status:413});
 if(!(file instanceof File)||file.size<12)return Response.json({error:'একটি JPG, PNG বা WebP ছবি দিন (সর্বোচ্চ ৩ এমবি)।'},{status:400});
 const bytes=new Uint8Array(await file.arrayBuffer());
 const png=bytes.slice(0,8).every((n,i)=>n===[137,80,78,71,13,10,26,10][i]),jpg=bytes[0]===255&&bytes[1]===216&&bytes[2]===255,webp=String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP';
 const contentType=png?'image/png':jpg?'image/jpeg':webp?'image/webp':'';
 if(!contentType)return Response.json({error:'ছবির ফরম্যাট সঠিক নয়। JPG, PNG বা WebP দিন।'},{status:400});
 const id=crypto.randomUUID(),key='products/'+id;
 const db=database();await db.batch([db.prepare('INSERT INTO product_images (id,object_key,content_type,size,created_at) VALUES (?,?,?,?,?)').bind(id,key,contentType,file.size,new Date().toISOString()),db.prepare('INSERT INTO image_payloads (id,data_base64) VALUES (?,?)').bind(id,Buffer.from(bytes).toString('base64'))]);
 return Response.json({url:'/api/images/'+id},{status:201});
}catch(e){return errorResponse(e);}}
