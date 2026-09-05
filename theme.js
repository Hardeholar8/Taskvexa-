(function(){
  'use strict';
  var KEY='taskvexa-theme';
  function getTheme(){return localStorage.getItem(KEY)||'dark'}
  function apply(theme){
    var light=theme==='light';
    document.documentElement.classList.toggle('tvx-light',light);
    if(document.body){document.body.classList.toggle('tvx-light',light);document.body.classList.toggle('light',light)}
    document.querySelectorAll('#themeToggle,#taskvexa-theme-global').forEach(function(b){b.textContent=light?'🌙':'☀️';b.title=light?'Switch to dark':'Switch to light'});
  }
  function toggle(){var next=getTheme()==='light'?'dark':'light';localStorage.setItem(KEY,next);apply(next)}
  function installStyles(){
    if(document.getElementById('taskvexa-theme-style'))return;
    var style=document.createElement('style');
    style.id='taskvexa-theme-style';
    style.textContent='html.tvx-light,body.tvx-light,body.light{color-scheme:light!important}html.tvx-light body,body.tvx-light,body.light{background:#f5f7fb!important;color:#111827!important}html.tvx-light header,body.tvx-light header,body.light header{background:#fff!important;color:#111827!important;border-color:#d9e0ea!important}html.tvx-light .card,body.tvx-light .card,body.light .card,html.tvx-light .balance-card,body.tvx-light .balance-card,body.light .balance-card{background:#fff!important;color:#111827!important;border-color:#d9e0ea!important;box-shadow:0 8px 24px rgba(15,23,42,.08)!important}html.tvx-light input,body.tvx-light input,body.light input,html.tvx-light textarea,body.tvx-light textarea,body.light textarea,html.tvx-light select,body.tvx-light select,body.light select{background:#fff!important;color:#111827!important;border-color:#cbd5e1!important}html.tvx-light a,body.tvx-light a,body.light a{color:#2563eb!important}html.tvx-light .muted,body.tvx-light .muted,body.light .muted,html.tvx-light .subtitle,body.tvx-light .subtitle,body.light .subtitle{color:#64748b!important}.taskvexa-theme-button,#themeToggle{position:fixed!important;right:14px!important;bottom:76px!important;width:42px!important;height:42px!important;border-radius:50%!important;border:1px solid #d9e0ea!important;background:var(--card,#fff)!important;color:var(--text,#111827)!important;font-size:19px!important;z-index:2147483647!important;box-shadow:0 6px 18px rgba(0,0,0,.2)!important;cursor:pointer!important}';
    (document.head||document.documentElement).appendChild(style);
  }
  function setup(){
    apply(getTheme());
    installStyles();
    var b=document.getElementById('themeToggle');
    if(!b){
      b=document.createElement('button');b.id='taskvexa-theme-global';b.type='button';b.setAttribute('aria-label','Change theme');b.className='taskvexa-theme-button';document.body.appendChild(b);
    }
    apply(getTheme());
    if(window.isSecureContext&&'serviceWorker' in navigator){navigator.serviceWorker.register('/theme-sw.js?v=4',{scope:'/'}).catch(function(e){console.warn('Theme service worker:',e)});}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();
  document.addEventListener('click',function(e){
    var b=e.target.closest&&e.target.closest('#taskvexa-theme-global');
    if(b){e.preventDefault();toggle();return;}
    if(e.target.closest&&e.target.closest('#themeToggle')){
      setTimeout(function(){apply(getTheme())},0);
    }
  });
})();