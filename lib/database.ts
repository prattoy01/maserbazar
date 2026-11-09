import 'server-only';
import {createClient, type Client, type InStatement, type InValue, type ResultSet} from '@libsql/client';
import {createClient as createRemoteClient} from '@libsql/client/web';
import {createHash} from 'node:crypto';
import {mkdirSync} from 'node:fs';
import {readFile,readdir} from 'node:fs/promises';
import path from 'node:path';

// Preserve the existing statement API and transaction boundaries on Turso/libSQL.
type Row=Record<string,unknown>;
type Reply<T>={results:T[];meta:{changes:number};success:true};
function reply<T>(result:ResultSet):Reply<T>{
 return {results:result.rows.map(row=>Object.fromEntries(Object.entries(row))) as T[],meta:{changes:result.rowsAffected},success:true};
}

let migrationPromise:Promise<void>|null=null;
async function ensureMigrated(client:Client){
 if(!migrationPromise){
  migrationPromise=(async()=>{
   let names:string[]=[];
   const drizzleDir=path.join(process.cwd(),'drizzle');
   try{
    names=(await readdir(drizzleDir)).filter(n=>/^\d+.*\.sql$/.test(n)).sort();
   }catch{
    return;
   }
   if(!names.length)return;
   let applied=new Set<string>();
   try{
    const existing=await client.execute('SELECT name FROM _vercel_migrations');
    applied=new Set(existing.rows.map(r=>String(r.name)));
    if(names.every(n=>applied.has(n)))return;
   }catch{
    try{
     await client.execute('CREATE TABLE IF NOT EXISTS _vercel_migrations (name TEXT PRIMARY KEY, hash TEXT NOT NULL, applied_at TEXT NOT NULL)');
    }catch{
     return;
    }
   }
   for(const name of names){
    if(applied.has(name))continue;
    const sql=await readFile(path.join(drizzleDir,name),'utf8'),hash=createHash('sha256').update(sql).digest('hex');
    const statements=sql.split('--> statement-breakpoint').map(s=>s.trim()).filter(Boolean);
    for(const stmt of statements){
     try{await client.execute(stmt);}catch(e){
      const msg=e instanceof Error?e.message:'';
      if(!/already exists|duplicate column/i.test(msg))throw e;
     }
    }
    try{
     await client.execute({sql:'INSERT OR IGNORE INTO _vercel_migrations (name,hash,applied_at) VALUES (?,?,?)',args:[name,hash,new Date().toISOString()]});
    }catch{
     // Ignore if database is temporarily read-only
    }
   }
  })().catch(err=>{
   migrationPromise=null;
   throw err;
  });
 }
 await migrationPromise;
}

class Prepared {
 constructor(readonly client:Client,readonly sql:string,readonly args:InValue[]=[]){}
 bind(...args:InValue[]){return new Prepared(this.client,this.sql,args);}
 statement():InStatement{return {sql:this.sql,args:this.args};}
 async all<T=Row>(){
  await ensureMigrated(this.client);
  return reply<T>(await this.client.execute(this.statement()));
 }
 async first<T=Row>():Promise<T|null>{return (await this.all<T>()).results[0]??null;}
 async run(){return this.all();}
}
class Database {
 constructor(readonly client:Client){}
 prepare(sql:string){return new Prepared(this.client,sql);}
 async batch<T=Row>(statements:Prepared[]):Promise<Reply<T>[]>{
  await ensureMigrated(this.client);
  const results=await this.client.batch(statements.map(s=>s.statement()),'write');
  return results.map(result=>reply<T>(result));
 }
}
let cached:{url:string;token:string|undefined;db:Database}|undefined;
export function database(){
 const url=process.env.TURSO_DATABASE_URL||'file:.local/store.db',token=process.env.TURSO_AUTH_TOKEN;
 if(process.env.VERCEL&&url.startsWith('file:'))throw new Error('A remote database is required on Vercel');
 if(!url.startsWith('file:')&&!token)throw new Error('Database token is not configured');
 if(!cached||cached.url!==url||cached.token!==token){
  const isLocalFile=url.startsWith('file:');
  if(isLocalFile)mkdirSync('.local',{recursive:true});
  const connect=isLocalFile?createClient:createRemoteClient;
  cached={url,token,db:new Database(connect({url,authToken:token,intMode:'number'}))};
 }
 return cached.db;
}
