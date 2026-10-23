import {expectedOrigin} from './request-origin';
import {database} from './database';
export {database} from './database';
import {customer} from './customer-auth';
import {catalog} from './catalog';
export async function identity(){const u=await customer();if(!u)throw new Error('AUTH');return u;}
export function sameOrigin(request:Request){const o=request.headers.get('origin');if((o&&o!==expectedOrigin(request))||request.headers.get('sec-fetch-site')==='cross-site')throw new Error('ORIGIN');}
export async function products(includeHidden=false){
 const db=database();await db.batch(catalog.map(p=>db.prepare('INSERT OR IGNORE INTO products (id,name,price,original_price,stock,active,bn,category,unit,image,popular) VALUES (?,?,?,?,?,1,?,?,?,?,?)').bind(p.id,p.name,p.price,p.originalPrice,p.stock,p.bn,p.category,p.unit,p.image,p.popular?1:0)));
 const r=await db.prepare('SELECT id,name,price,original_price,stock,active,bn,category,unit,image,popular,low_stock_threshold FROM products').all<{id:string;name:string;price:number;original_price:number;stock:number;active:number;bn:string|null;category:string|null;unit:string|null;image:string|null;popular:number|null;low_stock_threshold:number}>();
 return r.results.filter(row=>includeHidden||row.active===1).map(row=>{const seed=catalog.find(p=>p.id===row.id);return {id:row.id,name:row.name,bn:row.bn??seed?.bn??row.name,category:row.category??seed?.category??'pantry',unit:row.unit??seed?.unit??'১ পিস',image:row.image??seed?.image??'/product-placeholder.svg',popular:row.popular===null?!!seed?.popular:row.popular===1,price:row.price,originalPrice:row.original_price,stock:row.stock,active:row.active===1,lowStockThreshold:row.low_stock_threshold};});
}
export async function readCart(userId:string){const row=await database().prepare('SELECT items FROM carts WHERE user_id=?').bind(userId).first<{items:string}>();return row?JSON.parse(row.items) as Record<string,number>:{};}
export function errorResponse(error:unknown){const c=error instanceof Error?error.message:'';if(c==='AUTH')return Response.json({error:'অর্ডার ও কার্ট সংরক্ষণ করতে সাইন ইন করুন।',signin:true},{status:401});if(c==='ORIGIN')return Response.json({error:'অনুরোধটি অনুমোদিত নয়।'},{status:403});console.error('Store request failed',c);return Response.json({error:'এই মুহূর্তে সংরক্ষণ করা যাচ্ছে না। আবার চেষ্টা করুন।'},{status:503});}
