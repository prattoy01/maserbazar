export function adminDenied(r:Request){
 const key=process.env.ADMIN_KEY;
 if(!key)return Response.json({error:'স্টোর পরিচালনার জন্য অ্যাক্সেস কী সেট করা হয়নি।'},{status:503});
 if(r.headers.get('authorization')!==`Bearer ${key}`)return Response.json({error:'অ্যাক্সেস কী সঠিক নয়।'},{status:403});
 return null;
}
