import {cookies} from 'next/headers';
import {authDB,customer,guardAttempts,randomToken,sessionCookie,tokenHash} from '@/lib/customer-auth';
import {expectedOrigin} from '@/lib/request-origin';
import {decodeOAuthState,encodeOAuthState,providerConfig,providerIdentity,socialSession,type Provider} from '@/lib/social-auth';
export const dynamic='force-dynamic';
type Context={params:Promise<{provider:string;step:string}>};
export async function GET(request:Request,context:Context){
 const {provider,step}=await context.params;
 if(!['google','facebook'].includes(provider)||!['start','callback'].includes(step))return new Response(null,{status:404});
 const p=provider as Provider,cookieName='mb_oauth_'+p;
 const secure=process.env.VERCEL||new URL(request.url).protocol==='https:'?'; Secure':'';
 const clear=`${cookieName}=; Path=/api/auth/social/${p}; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
 let reqOrigin=new URL(request.url).origin;
 try{reqOrigin=expectedOrigin(request);}catch{}
 let returnOrigin=reqOrigin;
 try{
  const c=providerConfig(p,request);
  if(step==='start'){
   await guardAttempts(request,p,'social');
   const rawState=randomToken(),u=await customer(),db=authDB();
   await db.prepare('DELETE FROM oauth_attempts WHERE expires_at<=?').bind(Date.now()).run();
   await db.prepare('INSERT INTO oauth_attempts (state_hash,provider,customer_id,expires_at) VALUES (?,?,?,?)').bind(await tokenHash(rawState),p,u?.userId||null,Date.now()+600000).run();
   const state=encodeOAuthState(rawState,reqOrigin,c.origin,c.secret);
   const graphVersion=process.env.FACEBOOK_GRAPH_VERSION?.trim()||'v20.0';
   const url=new URL(p==='google'?'https://accounts.google.com/o/oauth2/v2/auth':'https://www.facebook.com/'+graphVersion+'/dialog/oauth');
   url.search=new URLSearchParams({client_id:c.id,redirect_uri:c.redirect,response_type:'code',scope:p==='google'?'openid email profile':'email,public_profile',state}).toString();
   return new Response(null,{status:303,headers:{Location:url.href,'Cache-Control':'no-store','Set-Cookie':`${cookieName}=${rawState}; Path=/api/auth/social/${p}; HttpOnly; SameSite=Lax; Max-Age=600${secure}`}});
  }
  const url=new URL(request.url),decoded=decodeOAuthState(url.searchParams.get('state'),c.origin,c.secret);
  if(!decoded)throw new Error('Invalid state');
  returnOrigin=decoded.targetOrigin;
  if(reqOrigin!==decoded.targetOrigin){
   return new Response(null,{status:303,headers:{Location:`${decoded.targetOrigin}/api/auth/social/${p}/callback${url.search}`,'Cache-Control':'no-store'}});
  }
  const saved=(await cookies()).get(cookieName)?.value;
  if(saved&&saved!==decoded.rawState)throw new Error('Invalid state');
  if(url.searchParams.has('error')){
   await authDB().prepare('DELETE FROM oauth_attempts WHERE state_hash=? AND provider=?').bind(await tokenHash(decoded.rawState),p).run();
   return new Response(null,{status:303,headers:{Location:returnOrigin+'/login?social=cancelled','Set-Cookie':clear,'Cache-Control':'no-store'}});
  }
  const attempt=await authDB().prepare('DELETE FROM oauth_attempts WHERE state_hash=? AND provider=? AND expires_at>? RETURNING customer_id').bind(await tokenHash(decoded.rawState),p,Date.now()).first<{customer_id:string|null}>();
  if(!attempt)throw new Error('Expired or reused state');
  if(attempt.customer_id&&!saved)throw new Error('Invalid state');
  const u=await customer();
  if(attempt.customer_id&&u?.userId!==attempt.customer_id)throw new Error('Link session changed');
  const code=url.searchParams.get('code');if(!code||code.length>4096)throw new Error('Missing code');
  const token=await socialSession(p,await providerIdentity(p,code,request),attempt.customer_id);
  const headers=new Headers({Location:returnOrigin+'/login','Cache-Control':'no-store'});headers.append('Set-Cookie',clear);headers.append('Set-Cookie',sessionCookie(request,token));
  return new Response(null,{status:303,headers});
 }catch(e){
  const msg=e instanceof Error?e.message:'';
  console.error('Social auth failed:',msg);
  const reason=msg.includes('প্রথমে ইমেইল')?'existing':msg.includes('অন্য অ্যাকাউন্টে')?'linked':msg.includes('যাচাই করা ইমেইল')?'unverified':msg.includes('অনেকবার চেষ্টা')?'ratelimit':msg.includes('চালু হয়নি')?'unavailable':'failed';
  return new Response(null,{status:303,headers:{Location:returnOrigin+'/login?social='+reason,'Set-Cookie':clear,'Cache-Control':'no-store'}});
 }
}
