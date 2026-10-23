import 'server-only';
import {createClient, type Client, type InStatement, type InValue, type ResultSet} from '@libsql/client';
import {createClient as createRemoteClient} from '@libsql/client/web';

// Preserve the existing statement API and transaction boundaries on Turso/libSQL.
type Row=Record<string,unknown>;
type Reply<T>={results:T[];meta:{changes:number};success:true};
function reply<T>(result:ResultSet):Reply<T>{
 return {results:result.rows.map(row=>Object.fromEntries(Object.entries(row))) as T[],meta:{changes:result.rowsAffected},success:true};
}
class Prepared {
 constructor(readonly client:Client,readonly sql:string,readonly args:InValue[]=[]){}
 bind(...args:InValue[]){return new Prepared(this.client,this.sql,args);}
 statement():InStatement{return {sql:this.sql,args:this.args};}
 async all<T=Row>(){return reply<T>(await this.client.execute(this.statement()));}
 async first<T=Row>():Promise<T|null>{return (await this.all<T>()).results[0]??null;}
 async run(){return this.all();}
}
class Database {
 constructor(readonly client:Client){}
 prepare(sql:string){return new Prepared(this.client,sql);}
 async batch<T=Row>(statements:Prepared[]):Promise<Reply<T>[]>{
  const results=await this.client.batch(statements.map(s=>s.statement()),'write');
  return results.map(result=>reply<T>(result));
 }
}
let cached:{url:string;token:string|undefined;db:Database}|undefined;
export function database(){
 const url=process.env.TURSO_DATABASE_URL,token=process.env.TURSO_AUTH_TOKEN;
 if(!url)throw new Error('Database is not configured');
 if(process.env.VERCEL&&url.startsWith('file:'))throw new Error('A remote database is required on Vercel');
 if(!url.startsWith('file:')&&!token)throw new Error('Database token is not configured');
 if(!cached||cached.url!==url||cached.token!==token){
  const connect=url.startsWith('file:')?createClient:createRemoteClient;
  cached={url,token,db:new Database(connect({url,authToken:token,intMode:'number'}))};
 }
 return cached.db;
}
