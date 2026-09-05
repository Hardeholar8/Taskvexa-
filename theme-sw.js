self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.mode!=='navigate')return;
  e.respondWith(fetch(r).then(async res=>{
    const ct=res.headers.get('content-type')||'';
    if(!ct.includes('text/html'))return res;
    const text=await res.text();
    if(text.includes('/theme.js'))return new Response(text,{status:res.status,statusText:res.statusText,headers:res.headers});
    const code='<script src="/theme.js"></script>';
    const out=text.includes('</body>')?text.replace('</body>',code+'</body>'):text+code;
    return new Response(out,{status:res.status,statusText:res.statusText,headers:res.headers});
  }).catch(()=>caches.match(r)));
});