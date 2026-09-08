(function(){
'use strict';
var KEY='taskvexa-theme';
function getTheme(){try{return localStorage.getItem(KEY)==='dark'?'dark':'light'}catch(e){return 'light'}}
function apply(theme){
 var dark=theme==='dark',root=document.documentElement,body=document.body;
 root.classList.toggle('tvx-light',!dark);root.classList.toggle('tvx-dark',dark);
 if(body){body.classList.toggle('tvx-light',!dark);body.classList.toggle('light',!dark);body.classList.toggle('tvx-dark',dark);body.classList.toggle('dark',dark)}
 var meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.setAttribute('content',dark?'#0b1020':'#f6f7fb');
 document.querySelectorAll('#themeToggle,#taskvexa-theme-global,#theme').forEach(function(b){b.textContent=dark?'☀️':'🌙';b.title=dark?'Switch to light':'Switch to dark';b.setAttribute('aria-label',dark?'Switch to light theme':'Switch to dark theme')});
}
function ensureFilora(){
 var l=document.getElementById('filora-theme-css');
 if(!l){l=document.createElement('link');l.id='filora-theme-css';l.rel='stylesheet';l.href='/filora-theme.css?v=2';(document.head||document.documentElement).appendChild(l)}else{l.href='/filora-theme.css?v=2'}
}
function setup(){
 ensureFilora();
 var b=document.getElementById('themeToggle')||document.getElementById('theme');
 if(!b){b=document.createElement('button');b.id='taskvexa-theme-global';b.type='button';b.className='taskvexa-theme-button';b.setAttribute('aria-label','Change theme');b.style.cssText='position:fixed;right:16px;bottom:82px;width:42px;height:42px;border-radius:50%;border:1px solid var(--filora-border,#e2e6ef);background:var(--filora-surface,#fff);z-index:2147483647;cursor:pointer';(document.body||document.documentElement).appendChild(b)}
 apply(getTheme());
}
try{if(!localStorage.getItem(KEY))localStorage.setItem(KEY,'light')}catch(e){}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('#taskvexa-theme-global,#themeToggle,#theme');if(b){e.preventDefault();e.stopPropagation();var next=getTheme()==='light'?'dark':'light';try{localStorage.setItem(KEY,next)}catch(err){}apply(next)}});
})();
