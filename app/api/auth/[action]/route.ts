import {cookies} from 'next/headers';
import {AuthError,authDB,authFailure,authResponse,checkPassword,createSession,customer,guardAttempts,hashPassword,mutationOrigin,normalizeEmail,parseBody,passwordValid,randomToken,SESSION_COOKIE,tokenHash,validEmail} from '@/lib/customer-auth';
export const dynamic='force-dynamic';
type Context={params:Promise<{action:string}>};
export async function GET(_r:Request,context:Context){try{if((await context.params).action!=='me')return authResponse({error:'পাওয়া যায়নি।'},404);const u=await customer();const row=u?await authDB().prepare('SELECT password_hash FROM customers WHERE id=?').bind(u.userId).first<{password_hash:string}>():null;return authResponse({user:u?{id:u.userId,name:u.fullName,email:u.email,hasPassword:!row?.password_hash.startsWith('!social:')}:null});}catch(e){return authFailure(e);}}
export async function POST(request:Request,context:Context){try{
 mutationOrigin(request);const action=(await context.params).action;
 if(action==='logout'){const token=(await cookies()).get(SESSION_COOKIE)?.value;if(token)await authDB().prepare('DELETE FROM customer_sessions WHERE token_hash=?').bind(await tokenHash(token)).run();return authResponse({ok:true},200,request,'');}
 if(!['signup','login','recover','password'].includes(action))return authResponse({error:'পাওয়া যায়নি।'},404);
 const b=await parseBody(request),email=normalizeEmail(b.email),password=b.password;
 if(action!=='password'&&!validEmail(email))throw new AuthError('সঠিক ইমেইল ঠিকানা দিন।');
 if(action==='login'){
  if(typeof password!=='string'||new TextEncoder().encode(password).length>72)throw new AuthError('ইমেইল বা পাসওয়ার্ড সঠিক নয়।',401);
  await guardAttempts(request,email,action);
  const row=await authDB().prepare('SELECT id,name,email,password_hash FROM customers WHERE email=?').bind(email).first<{id:string;name:string;email:string;password_hash:string}>();
  const match=await checkPassword(password,row?.password_hash||null);if(!row||!match)throw new AuthError('ইমেইল বা পাসওয়ার্ড সঠিক নয়।',401);
  return authResponse({user:{id:row.id,name:row.name,email:row.email}},200,request,await createSession(row.id,row.password_hash));
 }
 if(!passwordValid(password))throw new AuthError('পাসওয়ার্ড অন্তত ১৫ অক্ষরের হতে হবে এবং ৭২ বাইটের মধ্যে থাকতে হবে।');
 if(action==='signup'){
  const name=typeof b.name==='string'?b.name.trim():'';if(name.length<2||name.length>100)throw new AuthError('আপনার নাম লিখুন।');await guardAttempts(request,email,action);
  const id='customer-'+crypto.randomUUID(),recoveryCode=randomToken(),hash=await hashPassword(password);
  const row=await authDB().prepare('INSERT INTO customers (id,email,name,password_hash,recovery_hash,auth_version,created_at) VALUES (?,?,?,?,?,1,?) ON CONFLICT(email) DO NOTHING').bind(id,email,name,hash,await tokenHash(recoveryCode),Date.now()).run();
  if(row.meta.changes!==1)throw new AuthError('এই ইমেইল দিয়ে অ্যাকাউন্ট তৈরি করা যাচ্ছে না। লগইন বা অ্যাকাউন্ট পুনরুদ্ধার করুন।',409);
  return authResponse({user:{id,name,email},recoveryCode},201,request,await createSession(id,hash));
 }
 if(action==='recover'){
  await guardAttempts(request,email,action);const code=typeof b.recoveryCode==='string'?b.recoveryCode.replace(/[\s-]/g,'').toLowerCase():'';if(!/^[a-f0-9]{64}$/.test(code))throw new AuthError('ইমেইল বা রিকভারি কোড সঠিক নয়।',401);
  const oldHash=await tokenHash(code),recoveryCode=randomToken(),hash=await hashPassword(password),db=authDB();
  const results=await db.batch([db.prepare('UPDATE customers SET password_hash=?,recovery_hash=?,auth_version=auth_version+1 WHERE email=? AND recovery_hash=?').bind(hash,await tokenHash(recoveryCode),email,oldHash),db.prepare('DELETE FROM customer_sessions WHERE customer_id IN (SELECT id FROM customers WHERE email=? AND password_hash=?)').bind(email,hash)]);
  if(results[0].meta.changes!==1)throw new AuthError('ইমেইল বা রিকভারি কোড সঠিক নয়।',401);
  return authResponse({ok:true,recoveryCode},200,request,'');
 }
 const u=await customer();if(!u)throw new AuthError('পাসওয়ার্ড বদলাতে লগইন করুন।',401);await guardAttempts(request,u.email,'password');
 const old=await authDB().prepare('SELECT password_hash FROM customers WHERE id=?').bind(u.userId).first<{password_hash:string}>();
 if(typeof b.currentPassword!=='string'||b.currentPassword.length>1000||!old||!await checkPassword(b.currentPassword,old.password_hash))throw new AuthError('বর্তমান পাসওয়ার্ড সঠিক নয়।',401);
 const hash=await hashPassword(password),recoveryCode=randomToken(),results=await authDB().batch([authDB().prepare('UPDATE customers SET password_hash=?,recovery_hash=?,auth_version=auth_version+1 WHERE id=? AND auth_version=?').bind(hash,await tokenHash(recoveryCode),u.userId,u.authVersion),authDB().prepare('DELETE FROM customer_sessions WHERE customer_id=? AND auth_version<=?').bind(u.userId,u.authVersion)]);
 if(results[0].meta.changes!==1)throw new AuthError('অ্যাকাউন্ট পরিবর্তিত হয়েছে। আবার লগইন করুন।',409);
 return authResponse({ok:true,recoveryCode},200,request,'');
}catch(e){return authFailure(e);}}
