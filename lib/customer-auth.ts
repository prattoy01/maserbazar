import {expectedOrigin} from './request-origin';
import {cookies} from 'next/headers';
import {database} from './database';
import bcrypt from 'bcryptjs';

export const SESSION_COOKIE='mb_session';
const SESSION_SECONDS=7*24*60*60;
const utf8=new TextEncoder();
export type Customer={userId:string;email:string;fullName:string;authVersion:number};
export class AuthError extends Error{constructor(message:string,public status=400){super(message);}}
export const authDB=database;
export function randomToken(){const b=crypto.getRandomValues(new Uint8Array(32));return Array.from(b,n=>n.toString(16).padStart(2,'0')).join('');}
export async function tokenHash(value:string){const b=await crypto.subtle.digest('SHA-256',utf8.encode(value));return Array.from(new Uint8Array(b),n=>n.toString(16).padStart(2,'0')).join('');}
export function passwordValid(value:unknown):value is string{return typeof value==='string'&&value.length>=15&&utf8.encode(value).length<=72;}
export function normalizeEmail(value:unknown){return typeof value==='string'?value.trim().toLowerCase():'';}
export function validEmail(value:string){return value.length<=254&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);}
export async function hashPassword(password:string){return bcrypt.hash(password,12);}
// Fixed valid bcrypt hash avoids skipping expensive verification for unknown accounts.
const DUMMY_HASH='$2b$12$YFRKIOha1qdsiS0oymlG1Op1JrkHY4loEQCVVE9Vp8YGh57zFJO5y';
export async function checkPassword(password:string,hash:string|null){return bcrypt.compare(password,hash||DUMMY_HASH);}
export async function customer(){
 const token=(await cookies()).get(SESSION_COOKIE)?.value;if(!token||!/^[a-f0-9]{64}$/.test(token))return null;
 const row=await authDB().prepare('SELECT c.id,c.email,c.name,c.auth_version FROM customer_sessions s JOIN customers c ON c.id=s.customer_id AND c.auth_version=s.auth_version WHERE s.token_hash=? AND s.expires_at>?').bind(await tokenHash(token),Date.now()).first<{id:string;email:string;name:string;auth_version:number}>();
 return row?{userId:row.id,email:row.email,fullName:row.name,authVersion:row.auth_version}:null;
}
export async function createSession(userId:string,passwordHash:string){
 const token=randomToken(),db=authDB();
 const inserted=await db.prepare('INSERT INTO customer_sessions (token_hash,customer_id,auth_version,expires_at) SELECT ?,id,auth_version,? FROM customers WHERE id=? AND password_hash=?').bind(await tokenHash(token),Date.now()+SESSION_SECONDS*1000,userId,passwordHash).run();
 if(inserted.meta.changes!==1)throw new AuthError('অ্যাকাউন্ট পরিবর্তিত হয়েছে। আবার লগইন করুন।',401);
 await db.prepare('DELETE FROM customer_sessions WHERE expires_at<=?').bind(Date.now()).run();return token;
}
export function sessionCookie(request:Request,token:string){return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${token?SESSION_SECONDS:0}${process.env.VERCEL||new URL(request.url).protocol==='https:'?'; Secure':''}`;}
export function authResponse(data:unknown,status=200,request?:Request,token?:string){return Response.json(data,{status,headers:{'Cache-Control':'no-store',...(request&&token!==undefined?{'Set-Cookie':sessionCookie(request,token)}:{})}});}
export function mutationOrigin(request:Request){if(request.headers.get('origin')!==expectedOrigin(request)||request.headers.get('sec-fetch-site')==='cross-site')throw new AuthError('অনুরোধটি অনুমোদিত নয়।',403);}
export async function parseBody(request:Request){const raw=await request.text();if(utf8.encode(raw).length>4096)throw new AuthError('তথ্য খুব বড়।');try{const b=JSON.parse(raw);if(!b||typeof b!=='object'||Array.isArray(b))throw new Error();return b as Record<string,unknown>;}catch{throw new AuthError('সঠিক তথ্য দিন।');}}
export async function rateLimit(key:string,maximum:number){
 const now=Date.now(),expiry=now+15*60*1000;
 const row=await authDB().prepare('INSERT INTO auth_limits (key,attempts,expires_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET attempts=CASE WHEN auth_limits.expires_at<=? THEN 1 ELSE auth_limits.attempts+1 END,expires_at=CASE WHEN auth_limits.expires_at<=? THEN ? ELSE auth_limits.expires_at END RETURNING attempts').bind(key,expiry,now,now,expiry).first<{attempts:number}>();
 if(!row||row.attempts>maximum)throw new AuthError('অনেকবার চেষ্টা হয়েছে। ১৫ মিনিট পরে আবার চেষ্টা করুন।',429);
 await authDB().prepare('DELETE FROM auth_limits WHERE expires_at<=?').bind(now).run();
}
export async function guardAttempts(request:Request,email:string,action:string){
 // Vercel overwrites x-vercel-forwarded-for; never trust arbitrary forwarded headers.
 const ip=process.env.VERCEL?(request.headers.get('x-vercel-forwarded-for')?.split(',')[0].trim()||'unknown-vercel-ip'):'local-preview';
 await rateLimit(await tokenHash('ip:'+action+':'+ip),action==='signup'?8:40);
 await rateLimit(await tokenHash('account:'+action+':'+email),action==='signup'?5:10);
}
export function authFailure(error:unknown){if(error instanceof AuthError)return authResponse({error:error.message},error.status);console.error('Customer authentication unavailable');return authResponse({error:'এখন সংযোগ পাওয়া যাচ্ছে না। আবার চেষ্টা করুন।'},503);}
