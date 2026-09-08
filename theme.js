(function(){
  'use strict';
  var KEY='taskvexa-theme';
  function getTheme(){try{return localStorage.getItem(KEY)==='dark'?'dark':'light'}catch(e){return 'light'}}
  function apply(theme){
    var light=theme!=='dark';
    document.documentElement.classList.toggle('tvx-light',light);
    document.documentElement.classList.toggle('tvx-dark',!light);
    if(document.body){document.body.classList.toggle('tvx-light',light);document.body.classList.toggle('light',light);document.body.classList.toggle('dark',!light)}
    var meta=document.querySelector('meta[name="theme-color"]');
    if(meta)meta.setAttribute('content',light?'#f6f7fb':'#0b1020');
    document.querySelectorAll('#themeToggle,#taskvexa-theme-global,#theme').forEach(function(b){b.textContent=light?'🌙':'☀️';b.title=light?'Switch to dark':'Switch to light';b.setAttribute('aria-label',light?'Switch to dark theme':'Switch to light theme')});
  }
  function ensureFilora(){
    if(document.getElementById('filora-theme-css'))return;
    var l=document.createElement('link');l.id='filora-theme-css';l.rel='stylesheet';l.href='/filora-theme.css?v=1';
    (document.head||document.documentElement).appendChild(l);
  }
  function setup(){
    ensureFilora();
    var b=document.getElementById('themeToggle')||document.getElementById('theme');
    if(!b){b=document.createElement('button');b.id='taskvexa-theme-global';b.type='button';b.className='taskvexa-theme-button';b.setAttribute('aria-label','Change theme');b.style.cssText='position:fixed;right:16px;bottom:82px;width:42px;height:42px;border-radius:50%;border:1px solid var(--filora-border,#e2e6ef);background:var(--filora-surface,#fff);z-index:2147483647;cursor:pointer';(document.body||document.documentElement).appendChild(b)}
    apply(getTheme());
  }
  try{if(!localStorage.getItem(KEY))localStorage.setItem(KEY,'light');if(localStorage.getItem(KEY)==='light')document.documentElement.classList.add('tvx-light')}catch(e){}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();
  document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('#taskvexa-theme-global,#themeToggle,#theme');if(b){e.preventDefault();e.stopPropagation();var next=getTheme()==='light'?'dark':'light';try{localStorage.setItem(KEY,next)}catch(err){}apply(next)}});
})();