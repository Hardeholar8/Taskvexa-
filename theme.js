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
  function setup(){
    apply(getTheme());
    var b=document.getElementById('themeToggle');
    if(!b){
      b=document.createElement('button');b.id='taskvexa-theme-global';b.type='button';b.setAttribute('aria-label','Change theme');b.className='taskvexa-theme-button';document.body.appendChild(b);
    }
    var style=document.getElementById('taskvexa-theme-style');
    if(!style){style=document.createElement('style');style.id='taskvexa-theme-style';style.textContent='.taskvexa-theme-button,#themeToggle{position:fixed!important;right:14px!important;bottom:76px!important;width:42px!important;height:42px!important;border-radius:50%!important;border:1px solid #d9e0ea!important;background:var(--card,#fff)!important;color:var(--text,#111827)!important;font-size:19px!important;z-index:2147483647!important;box-shadow:0 6px 18px rgba(0,0,0,.2)!important;cursor:pointer!important}.tvx-light{color-scheme:light}.tvx-light body{background:#f5f7fb!important;color:#111827!important}';document.head.appendChild(style)}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();
  document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('#taskvexa-theme-global');if(b){e.preventDefault();toggle()}});
})();