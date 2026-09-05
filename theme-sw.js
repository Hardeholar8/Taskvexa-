const VERSION='taskvexa-theme-v4';
self.addEventListener('install',event=>{event.waitUntil(self.skipWaiting())});
self.addEventListener('activate',event=>{event.waitUntil(self.clients.claim())});
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.mode!=='navigate') return;
  event.respondWith((async()=>{
    try{
      const response=await fetch(request,{cache:'no-store'});
      const type=response.headers.get('content-type')||'';
      if(!type.includes('text/html')) return response;
      const html=await response.text();
      if(html.includes('src="/theme.js"')||html.includes("src='/theme.js'")) return new Response(html,{status:response.status,statusText:response.statusText,headers:response.headers});
      const injected='<script src="/theme.js?v=4"></script>';
      const result=html.includes('</body>')?html.replace('</body>',injected+'</body>'):html+injected;
      return new Response(result,{status:response.status,statusText:response.statusText,headers:response.headers});
    }catch(e){return caches.match(request)}
  })());
});