// Next's Node server may use localhost in request.url even when the browser
// requested 127.0.0.1. Compare the browser Origin against the actual Host.
export function expectedOrigin(request:Request){
 const authority=request.headers.get('host')||new URL(request.url).host;
 if(!authority||/[\s/@\\]/.test(authority))throw new Error('Invalid host');
 const protocol=process.env.VERCEL?'https:':new URL(request.url).protocol;
 return new URL(protocol+'//'+authority).origin;
}
