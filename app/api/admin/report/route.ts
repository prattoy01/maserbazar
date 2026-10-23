import {adminDenied} from '@/lib/admin-auth';
import {database,errorResponse} from '@/lib/server';
export const dynamic='force-dynamic';
export async function GET(r:Request){try{
 const denied=adminDenied(r);if(denied)return denied;
 const requested=Number(new URL(r.url).searchParams.get('days')||30),days=[7,30,90].includes(requested)?requested:30;
 const today=new Date(Date.now()+21600000),start=new Date(Date.UTC(today.getUTCFullYear(),today.getUTCMonth(),today.getUTCDate()-days+1)-21600000).toISOString(),db=database();
 const [summary,pending,daily,best]=await db.batch([
  db.prepare("SELECT COUNT(*) AS orders,COALESCE(SUM(total),0) AS ordered_total,COALESCE(SUM(CASE WHEN status='delivered' THEN total ELSE 0 END),0) AS completed_total,COALESCE(SUM(CASE WHEN status='delivered' THEN 1 ELSE 0 END),0) AS delivered FROM orders WHERE created_at>=?").bind(start),
  db.prepare("SELECT COUNT(*) AS pending FROM orders WHERE status<>'delivered'"),
  db.prepare("SELECT date(created_at,'+6 hours') AS date,COUNT(*) AS orders,COALESCE(SUM(total),0) AS total,COALESCE(SUM(CASE WHEN status='delivered' THEN total ELSE 0 END),0) AS completed FROM orders WHERE created_at>=? GROUP BY date(created_at,'+6 hours') ORDER BY date").bind(start),
  db.prepare("SELECT json_extract(j.value,'$.id') AS id,json_extract(j.value,'$.bn') AS name,SUM(CAST(json_extract(j.value,'$.quantity') AS INTEGER)) AS quantity,SUM(CAST(json_extract(j.value,'$.quantity') AS INTEGER)*CAST(json_extract(j.value,'$.price') AS INTEGER)) AS total FROM orders o,json_each(CASE WHEN json_valid(o.items) THEN o.items ELSE '[]' END) j WHERE o.created_at>=? AND o.status='delivered' GROUP BY json_extract(j.value,'$.id') ORDER BY quantity DESC LIMIT 8").bind(start),
 ]);
 return Response.json({days,summary:{...(summary.results[0] as Record<string,number>),...(pending.results[0] as Record<string,number>)},daily:daily.results,best:best.results},{headers:{'Cache-Control':'no-store'}});
}catch(e){return errorResponse(e);}}
