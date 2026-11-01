import {database,errorResponse} from '@/lib/server';
export async function GET(r:Request,c:{params:Promise<{id:string}>}){try{
 const {id}=await c.params;if(!/^[a-f0-9-]{36}$/.test(id))return new Response('Not found',{status:404});
 const etag='"'+id+'"',cacheHeaders={'Cache-Control':'public, max-age=31536000, s-maxage=31536000, immutable','CDN-Cache-Control':'public, s-maxage=31536000, immutable','Vercel-CDN-Cache-Control':'public, s-maxage=31536000, immutable','ETag':etag};
 if(r.headers.get('if-none-match')===etag)return new Response(null,{status:304,headers:cacheHeaders});
 const row=await database().prepare('SELECT p.content_type,i.data_base64 FROM product_images p JOIN image_payloads i ON i.id=p.id WHERE p.id=?').bind(id).first<{data_base64:string;content_type:string}>();if(!row)return new Response('Not found',{status:404});
 return new Response(new Uint8Array(Buffer.from(row.data_base64,'base64')).buffer,{headers:{'Content-Type':row.content_type,'X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; sandbox",...cacheHeaders}});
}catch(e){return errorResponse(e);}}

