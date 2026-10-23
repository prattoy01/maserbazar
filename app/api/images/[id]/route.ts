import {database,errorResponse} from '@/lib/server';
export const dynamic='force-dynamic';
export async function GET(_r:Request,c:{params:Promise<{id:string}>}){try{
 const {id}=await c.params;if(!/^[a-f0-9-]{36}$/.test(id))return new Response('Not found',{status:404});
 const row=await database().prepare('SELECT p.content_type,i.data_base64 FROM product_images p JOIN image_payloads i ON i.id=p.id WHERE p.id=?').bind(id).first<{data_base64:string;content_type:string}>();if(!row)return new Response('Not found',{status:404});
 return new Response(new Uint8Array(Buffer.from(row.data_base64,'base64')).buffer,{headers:{'Content-Type':row.content_type,'X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; sandbox",'Cache-Control':'public, max-age=31536000, immutable','ETag':'"'+id+'"'}});
}catch(e){return errorResponse(e);}}
