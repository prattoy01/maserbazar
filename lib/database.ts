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

const migratedClients=new WeakSet<Client>();
const migrationPromises=new WeakMap<Client,Promise<void>>();

async function ensureMigrated(client:Client){
 if(migratedClients.has(client))return;
 let p=migrationPromises.get(client);
 if(!p){
  p=(async()=>{
   let names:string[]=[];
   const drizzleDir=path.join(process.cwd(),'drizzle');
   try{
    names=(await readdir(drizzleDir)).filter(n=>/^\d+.*\.sql$/.test(n)).sort();
   }catch{
    migratedClients.add(client);
    return;
   }
   if(!names.length){
    migratedClients.add(client);
    return;
   }
   let applied=new Set<string>();
   try{
    const existing=await client.execute('SELECT name FROM _vercel_migrations');
    applied=new Set(existing.rows.map(r=>String(r.name)));
    if(names.every(n=>applied.has(n))){
     migratedClients.add(client);
     return;
    }
   }catch(e){
    const msg=e instanceof Error?e.message:String(e);
    if(/SERVER_ERROR|502|503|401|403|404|fetch failed|ENOTFOUND|ECONNREFUSED/i.test(msg))throw e;
    await client.execute('CREATE TABLE IF NOT EXISTS _vercel_migrations (name TEXT PRIMARY KEY, hash TEXT NOT NULL, applied_at TEXT NOT NULL)');
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
     // Ignore if read-only
    }
   }
   migratedClients.add(client);
  })().catch(err=>{
   migrationPromises.delete(client);
   throw err;
  });
  migrationPromises.set(client,p);
 }
 await p;
}

let fallbackClient:Client|null=null;
let remoteFailedUntil=0;

function isRemoteTemporarilyDown():boolean{
 return Date.now()<remoteFailedUntil;
}

function markRemoteDown():void{
 remoteFailedUntil=Date.now()+15_000;
}

function getLocalFallbackClient():Client{
 if(!fallbackClient){
  const dir=process.env.VERCEL?'/tmp/.local':'.local';
  mkdirSync(dir,{recursive:true});
  fallbackClient=createClient({url:`file:${dir}/store.db`,intMode:'number'});
 }
 return fallbackClient;
}

function isRemoteDownError(e:unknown):boolean{
 const msg=e instanceof Error?e.message:String(e);
 return /SERVER_ERROR|502|503|401|403|404|fetch failed|ENOTFOUND|ECONNREFUSED|no route configured/i.test(msg);
}

class Prepared {
 constructor(readonly db:Database,readonly sql:string,readonly args:InValue[]=[]){}
 bind(...args:InValue[]){return new Prepared(this.db,this.sql,args);}
 statement():InStatement{return {sql:this.sql,args:this.args};}
 async all<T=Row>(){
  return this.db.executePrepared<T>(this.statement());
 }
 async first<T=Row>():Promise<T|null>{return (await this.all<T>()).results[0]??null;}
 async run(){return this.all();}
}

class Database {
 constructor(private readonly remoteClient:Client|null){}
 prepare(sql:string){return new Prepared(this,sql);}
 async executePrepared<T=Row>(stmt:InStatement):Promise<Reply<T>>{
  if(this.remoteClient&&!isRemoteTemporarilyDown()){
   try{
    await ensureMigrated(this.remoteClient);
    return reply<T>(await this.remoteClient.execute(stmt));
   }catch(e){
    if(!isRemoteDownError(e))throw e;
    markRemoteDown();
   }
  }
  const local=getLocalFallbackClient();
  await ensureMigrated(local);
  return reply<T>(await local.execute(stmt));
 }
 async batch<T=Row>(statements:Prepared[]):Promise<Reply<T>[]>{
  const raw=statements.map(s=>s.statement());
  if(this.remoteClient&&!isRemoteTemporarilyDown()){
   try{
    await ensureMigrated(this.remoteClient);
    const results=await this.remoteClient.batch(raw,'write');
    return results.map(result=>reply<T>(result));
   }catch(e){
    if(!isRemoteDownError(e))throw e;
    markRemoteDown();
   }
  }
  const local=getLocalFallbackClient();
  await ensureMigrated(local);
  const results=await local.batch(raw,'write');
  return results.map(result=>reply<T>(result));
 }
}

let cached:{url:string;token:string|undefined;db:Database}|undefined;
export function database(){
 const rawUrl=process.env.TURSO_DATABASE_URL||'file:.local/store.db',token=process.env.TURSO_AUTH_TOKEN;
 const isLocalFile=rawUrl.startsWith('file:')||!token;
 if(!cached||cached.url!==rawUrl||cached.token!==token){
  if(isLocalFile){
   cached={url:rawUrl,token,db:new Database(null)};
  }else{
   cached={url:rawUrl,token,db:new Database(createRemoteClient({url:rawUrl,authToken:token,intMode:'number'}))};
  }
 }
 return cached.db;
}
