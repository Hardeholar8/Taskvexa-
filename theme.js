(function(){
'use strict';
/* TaskVexa Premium Dark Theme — dark mode is the only active theme for now. */
var KEY='taskvexa-theme';
function apply(){
 var root=document.documentElement,body=document.body;
 root.classList.remove('tvx-light');root.classList.add('tvx-dark');
 if(body){body.classList.remove('tvx-light','light');body.classList.add('tvx-dark','dark')}
 try{localStorage.setItem(KEY,'dark')}catch(e){}
 var meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.setAttribute('content','#080d18');
 document.querySelectorAll('#themeToggle,#taskvexa-theme-global,#theme').forEach(function(b){b.remove()});
}
function ensureFilora(){
 var l=document.getElementById('filora-theme-css');
 if(!l){l=document.createElement('link');l.id='filora-theme-css';l.rel='stylesheet';l.href='/filora-theme.css?v=3';(document.head||document.documentElement).appendChild(l)}else{l.href='/filora-theme.css?v=3'}
}
function addPromoterReviewShortcut(){
 if(!/promoter-dashboard\.html$/i.test(location.pathname)) return;
 if(document.getElementById('tvxPromoterReviewShortcut')) return;
 var sidebar=document.getElementById('sidebar');
 if(!sidebar) return;
 var section=document.createElement('div');
 section.className='section-title';
 section.textContent='TASK REVIEW';
 var link=document.createElement('a');
 link.id='tvxPromoterReviewShortcut';
 link.className='nav';
 link.href='promoter-submissions.html';
 link.style.textDecoration='none';
 link.innerHTML='<i>✓</i><span>Review Submissions</span>';
 section.style.marginTop='20px';
 sidebar.insertBefore(section,sidebar.querySelector('.logout'));
 sidebar.insertBefore(link,sidebar.querySelector('.logout'));
}
function setup(){ensureFilora();apply();addPromoterReviewShortcut();}
try{localStorage.setItem(KEY,'dark')}catch(e){}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();
})();
