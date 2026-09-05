const VERSION='taskvexa-theme-v5';
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.mode!=='navigate') return;
  event.respondWith((async()=>{
    try{
      const response=await fetch(request,{cache:'no-store'});
      const type=response.headers.get('content-type')||'';
      if(!type.includes('text/html')) return response;
      const html=await response.text();
      const bootstrap='<script>(function(){try{var t=localStorage.getItem("taskvexa-theme");if(t==="light"){document.documentElement.classList.add("tvx-light");document.documentElement.style.background="#f5f7fb"}}catch(e){}})();</script>';
      const style='<style id="taskvexa-theme-sw-style">html.tvx-light,html.tvx-light body,body.tvx-light,body.light{background:#f5f7fb!important;color:#111827!important;color-scheme:light!important}html.tvx-light header,body.tvx-light header,body.light header,html.tvx-light nav,body.tvx-light nav,body.light nav{background:#fff!important;color:#111827!important;border-color:#d9e0ea!important}html.tvx-light input,html.tvx-light textarea,html.tvx-light select,body.tvx-light input,body.tvx-light textarea,body.tvx-light select,body.light input,body.light textarea,body.light select{background:#fff!important;color:#111827!important;border-color:#cbd5e1!important}html.tvx-light .card,html.tvx-light .task,html.tvx-light .box,html.tvx-light .loading,html.tvx-light .empty,html.tvx-light .modalbox,html.tvx-light .banner,html.tvx-light .service,body.tvx-light .card,body.tvx-light .task,body.tvx-light .box,body.tvx-light .loading,body.tvx-light .empty,body.tvx-light .modalbox,body.tvx-light .banner,body.tvx-light .service,body.light .card,body.light .task,body.light .box,body.light .loading,body.light .empty,body.light .modalbox,body.light .banner,body.light .service{background:#fff!important;color:#111827!important;border-color:#d9e0ea!important}html.tvx-light .desc,html.tvx-light .muted,html.tvx-light .heading p,html.tvx-light .progress-note,body.tvx-light .desc,body.tvx-light .muted,body.tvx-light .heading p,body.tvx-light .progress-note,body.light .desc,body.light .muted,body.light .heading p,body.light .progress-note{color:#64748b!important}html.tvx-light a,body.tvx-light a,body.light a{color:#2563eb!important}html.tvx-light .offer,body.tvx-light .offer,body.light .offer{background:#f8fafc!important}html.tvx-light .modal,body.tvx-light .modal,body.light .modal{background:rgba(15,23,42,.45)!important}</style>';
      let result=html;
      if(!result.includes('id="taskvexa-theme-sw-style"')) result=result.includes('</head>')?result.replace('</head>',bootstrap+style+'</head>'):style+result;
      if(!result.includes('theme.js')){const script='<script src="/theme.js?v=5"></script>';result=result.includes('</body>')?result.replace('</body>',script+'</body>'):result+script}
      const headers=new Headers(response.headers);headers.delete('content-length');headers.set('cache-control','no-store');
      return new Response(result,{status:response.status,statusText:response.statusText,headers});
    }catch(e){return fetch(request)}
  })());
});