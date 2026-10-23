import 'server-only';
import {createHmac} from 'node:crypto';
import {authDB,AuthError,createSession,normalizeEmail,randomToken,tokenHash,validEmail} from './customer-auth';

export type Provider='google'|'facebook';
export function providerConfig(provider:Provider){
 const id=provider==='google'?process.env.GOOGLE_CLIENT_ID:process.env.FACEBOOK_APP_ID;
 const secret=provider==='google'?process.env.GOOGLE_CLIENT_SECRET:process.env.FACEBOOK_APP_SECRET;
 const origin=process.env.AUTH_ORIGIN;
 if(!id||!secret||!origin)throw new AuthError('এই লগইন পদ্ধতি এখনো চালু হয়নি। ইমেইল দিয়ে লগইন করুন।',503);
 const url=new URL(origin);
 if(url.origin!==origin||(!['http://127.0.0.1:5174','http://localhost:5174','http://127.0.0.1:3000','http://localhost:3000'].includes(origin)&&url.protocol!=='https:'))throw new Error('Invalid AUTH_ORIGIN');
 const version=process.env.FACEBOOK_GRAPH_VERSION;
 if(provider==='facebook'&&(!version||!/^v\d+\.\d+$/.test(version)))throw new Error('Configure FACEBOOK_GRAPH_VERSION');
 return {id,secret,origin,redirect:origin+'/api/auth/social/'+provider+'/callback',graph:'https://graph.facebook.com/'+version};
}
export function availableProviders(){return {google:!!(process.env.AUTH_ORIGIN&&process.env.GOOGLE_CLIENT_ID&&process.env.GOOGLE_CLIENT_SECRET),facebook:!!(process.env.AUTH_ORIGIN&&process.env.FACEBOOK_APP_ID&&process.env.FACEBOOK_APP_SECRET&&process.env.FACEBOOK_GRAPH_VERSION)};}
async function json(url:string,options:RequestInit={}){
 const r=await fetch(url,{...options,cache:'no-store',signal:AbortSignal.timeout(15000)});
 if(!r.ok)throw new Error('Provider request failed');
 return await r.json();
}
export async function providerIdentity(provider:Provider,code:string){
 const c=providerConfig(provider);
 const params=new URLSearchParams({client_id:c.id,client_secret:c.secret,redirect_uri:c.redirect,code,grant_type:'authorization_code'});
 const token=await json(provider==='google'?'https://oauth2.googleapis.com/token':c.graph+'/oauth/access_token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:params});
 if(typeof token.access_token!=='string')throw new Error('Missing access token');
 if(provider==='google'){
  const profile=await json('https://openidconnect.googleapis.com/v1/userinfo',{headers:{Authorization:'Bearer '+token.access_token}});
  if(profile.email_verified!==true)throw new AuthError('যাচাই করা ইমেইল প্রয়োজন।',400);
  return {subject:profile.sub,email:profile.email,name:profile.name};
 }
 const debug=new URL(c.graph+'/debug_token');
 debug.searchParams.set('input_token',token.access_token);debug.searchParams.set('access_token',c.id+'|'+c.secret);
 const {data}=await json(debug.href);
 if(!data?.is_valid||String(data.app_id)!==c.id||!data.user_id)throw new Error('Invalid Facebook token');
 const profileUrl=new URL(c.graph+'/me');profileUrl.searchParams.set('fields','id,name,email');
 profileUrl.searchParams.set('appsecret_proof',createHmac('sha256',c.secret).update(token.access_token).digest('hex'));
 const profile=await json(profileUrl.href,{headers:{Authorization:'Bearer '+token.access_token}});
 if(profile.id!==data.user_id)throw new Error('Facebook identity mismatch');
 return {subject:profile.id,email:profile.email,name:profile.name};
}
export async function socialSession(provider:Provider,identity:{subject:unknown;email:unknown;name:unknown},linkId:string|null){
 const db=authDB();
 if(typeof identity.subject!=='string'||!identity.subject||identity.subject.length>255)throw new Error('Invalid subject');
 let row=await db.prepare('SELECT c.id,c.password_hash FROM customer_identities i JOIN customers c ON c.id=i.customer_id WHERE i.provider=? AND i.subject=?').bind(provider,identity.subject).first<{id:string;password_hash:string}>();
 if(row&&linkId&&row.id!==linkId)throw new AuthError('এই সামাজিক অ্যাকাউন্ট অন্য অ্যাকাউন্টে যুক্ত আছে।',409);
 if(!row){
  const email=normalizeEmail(identity.email);
  if(!validEmail(email))throw new AuthError('ইমেইল পাওয়া যায়নি। ইমেইল দিয়ে অ্যাকাউন্ট খুলুন।',400);
  const existing=await db.prepare('SELECT id,password_hash FROM customers WHERE email=?').bind(email).first<{id:string;password_hash:string}>();
  if(!linkId&&existing)throw new AuthError('এই ইমেইলে অ্যাকাউন্ট আছে। প্রথমে ইমেইল দিয়ে লগইন করে Google বা Facebook যুক্ত করুন।',409);
  if(linkId){
   row=await db.prepare('SELECT id,password_hash FROM customers WHERE id=?').bind(linkId).first<{id:string;password_hash:string}>();
   if(!row)throw new Error('Account no longer exists');
   await db.prepare('INSERT INTO customer_identities (provider,subject,customer_id) VALUES (?,?,?)').bind(provider,identity.subject,row.id).run();
  }else{
   const id='customer-'+crypto.randomUUID(),hash='!social:'+randomToken();
   const name=typeof identity.name==='string'?identity.name.trim().slice(0,100):'Customer';
   await db.batch([
    db.prepare('INSERT INTO customers (id,email,name,password_hash,recovery_hash,auth_version,created_at) VALUES (?,?,?,?,?,1,?)').bind(id,email,name||'Customer',hash,await tokenHash(randomToken()),Date.now()),
    db.prepare('INSERT INTO customer_identities (provider,subject,customer_id) VALUES (?,?,?)').bind(provider,identity.subject,id),
   ]);
   row={id,password_hash:hash};
  }
 }
 return createSession(row.id,row.password_hash);
}
