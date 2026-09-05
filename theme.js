(function(){
  'use strict';
  var KEY='taskvexa-theme';
  function getTheme(){return localStorage.getItem(KEY)==='light'?'light':'dark'}
  function apply(theme){
    var light=theme==='light';
    document.documentElement.classList.toggle('tvx-light',light);
    if(document.body){document.body.classList.toggle('tvx-light',light);document.body.classList.toggle('light',light)}
    var meta=document.querySelector('meta[name="theme-color"]');
    if(meta)meta.setAttribute('content',light?'#f5f7fb':'#070a10');
    document.querySelectorAll('#themeToggle,#taskvexa-theme-global').forEach(function(b){b.textContent=light?'🌙':'☀️';b.title=light?'Switch to dark':'Switch to light';b.setAttribute('aria-label',light?'Switch to dark theme':'Switch to light theme')});
  }
  function toggle(){var next=getTheme()==='light'?'dark':'light';localStorage.setItem(KEY,next);apply(next)}
  function installStyles(){
    if(document.getElementById('taskvexa-theme-style'))return;
    var style=document.createElement('style');style.id='taskvexa-theme-style';
    style.textContent='html.tvx-light{background:#f5f7fb!important;color-scheme:light!important}html.tvx-light body,body.tvx-light,body.light{background:#f5f7fb!important;color:#111827!important}html.tvx-light header,body.tvx-light header,body.light header,html.tvx-light nav,body.tvx-light nav,body.light nav{background:#fff!important;color:#111827!important;border-color:#d9e0ea!important}html.tvx-light .card,html.tvx-light .task,html.tvx-light .box,html.tvx-light .loading,html.tvx-light .empty,html.tvx-light .modalbox,html.tvx-light .banner,html.tvx-light .service,html.tvx-light .choice,html.tvx-light .step,html.tvx-light .hero-card,html.tvx-light .offer,body.tvx-light .card,body.tvx-light .task,body.tvx-light .box,body.tvx-light .loading,body.tvx-light .empty,body.tvx-light .modalbox,body.tvx-light .banner,body.tvx-light .service,body.tvx-light .choice,body.tvx-light .step,body.tvx-light .hero-card,body.tvx-light .offer,body.light .card,body.light .task,body.light .box,body.light .loading,body.light .empty,body.light .modalbox,body.light .banner,body.light .service,body.light .choice,body.light .step,body.light .hero-card,body.light .offer{background:#fff!important;color:#111827!important;border-color:#d9e0ea!important}html.tvx-light input,html.tvx-light textarea,html.tvx-light select,body.tvx-light input,body.tvx-light textarea,body.tvx-light select,body.light input,body.light textarea,body.light select{background:#fff!important;color:#111827!important;border-color:#cbd5e1!important}html.tvx-light button:not(.taskvexa-theme-button),body.tvx-light button:not(.taskvexa-theme-button),body.light button:not(.taskvexa-theme-button){color:#111827!important}html.tvx-light .desc,html.tvx-light .muted,html.tvx-light .subtitle,html.tvx-light .heading p,html.tvx-light .progress-note,body.tvx-light .desc,body.tvx-light .muted,body.tvx-light .subtitle,body.tvx-light .heading p,body.tvx-light .progress-note,body.light .desc,body.light .muted,body.light .subtitle,body.light .heading p,body.light .progress-note{color:#64748b!important}html.tvx-light a,body.tvx-light a,body.light a{color:#2563eb!important}html.tvx-light .offerframe,body.tvx-light .offerframe,body.light .offerframe{background:#fff!important}html.tvx-light .modal,body.tvx-light .modal,body.light .modal{background:rgba(15,23,42,.45)!important}.taskvexa-theme-button,#themeToggle{position:fixed!important;right:14px!important;bottom:76px!important;width:44px!important;height:44px!important;border-radius:50%!important;border:1px solid #cbd5e1!important;background:#fff!important;color:#111827!important;font-size:19px!important;z-index:2147483647!important;box-shadow:0 6px 18px rgba(0,0,0,.2)!important;cursor:pointer!important;display:flex!important;align-items:center!important;justify-content:center!important}html:not(.tvx-light) .taskvexa-theme-button,html:not(.tvx-light) #themeToggle{background:#111827!important;color:#fff!important;border-color:#334155!important}';
    (document.head||document.documentElement).appendChild(style);
  }
  function setup(){
    apply(getTheme());installStyles();
    var b=document.getElementById('themeToggle');
    if(!b){b=document.createElement('button');b.id='taskvexa-theme-global';b.type='button';b.setAttribute('aria-label','Change theme');b.className='taskvexa-theme-button';(document.body||document.documentElement).appendChild(b)}
    apply(getTheme());
    if(window.isSecureContext&&'serviceWorker' in navigator){navigator.serviceWorker.register('/theme-sw.js?v=6',{scope:'/'}).catch(function(e){console.warn('Theme service worker:',e)})}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();
  document.addEventListener('click',function(e){
    var b=e.target.closest&&e.target.closest('#taskvexa-theme-global');if(b){e.preventDefault();toggle();return}
    var d=e.target.closest&&e.target.closest('#themeToggle');if(d){setTimeout(function(){apply(getTheme())},0)}
  });
})();