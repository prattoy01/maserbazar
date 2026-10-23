import {createClient} from '@libsql/client';
import {createHash} from 'node:crypto';
import {readFile,readdir,mkdir} from 'node:fs/promises';

const url=process.env.TURSO_DATABASE_URL||'file:.local/store.db';
if(url.startsWith('file:'))await mkdir('.local',{recursive:true});
const db=createClient({url,authToken:process.env.TURSO_AUTH_TOKEN});
try{
 await db.execute('CREATE TABLE IF NOT EXISTS _vercel_migrations (name TEXT PRIMARY KEY, hash TEXT NOT NULL, applied_at TEXT NOT NULL)');
 const names=(await readdir('drizzle')).filter(n=>/^\d+.*\.sql$/.test(n)).sort();
 for(const name of names){
  const sql=await readFile('drizzle/'+name,'utf8'),hash=createHash('sha256').update(sql).digest('hex');
  const previous=await db.execute({sql:'SELECT hash FROM _vercel_migrations WHERE name=?',args:[name]});
  if(previous.rows.length){if(previous.rows[0].hash!==hash)throw new Error('An applied migration changed: '+name);continue;}
  const statements=sql.split('--> statement-breakpoint').map(s=>s.trim()).filter(Boolean);
  await db.batch([...statements,{sql:'INSERT INTO _vercel_migrations (name,hash,applied_at) VALUES (?,?,?)',args:[name,hash,new Date().toISOString()]}],'write');
  console.log('Applied '+name);
 }
 console.log('Database migrations are up to date.');
}finally{db.close();}
