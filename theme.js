(function(){
'use strict';
/* TaskVexa Premium Dark Theme — dark mode is the only active theme. */
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
 if(!l){l=document.createElement('link');l.id='filora-theme-css';l.rel='stylesheet';l.href='/filora-theme.css?v=4';(document.head||document.documentElement).appendChild(l)}else{l.href='/filora-theme.css?v=4'}
}
function ensurePromoterAccountTheme(){
 if(!/promoter-(dashboard|settings|submissions|wallet)\.html$/i.test(location.pathname)) return;
 if(document.getElementById('promoter-account-theme-css')) return;
 var l=document.createElement('link');l.id='promoter-account-theme-css';l.rel='stylesheet';l.href='/promoter-account-theme.css?v=1';(document.head||document.documentElement).appendChild(l);
}
function addPromoterReviewShortcut(){
 if(!/promoter-dashboard\.html$/i.test(location.pathname)) return;
 var sidebar=document.getElementById('sidebar');
 if(!sidebar) return;
 if(!document.getElementById('tvxPromoterReviewSection')){
  var section=document.createElement('div');section.id='tvxPromoterReviewSection';section.className='section-title';section.textContent='TASK REVIEW';
  var link=document.createElement('a');link.id='tvxPromoterReviewShortcut';link.className='nav';link.href='promoter-submissions.html';link.style.textDecoration='none';link.innerHTML='<i>✓</i><span>Review Submissions</span>';
  var logout=sidebar.querySelector('.logout');
  if(logout){sidebar.insertBefore(section,logout);sidebar.insertBefore(link,logout)}else{sidebar.appendChild(section);sidebar.appendChild(link)}
 }
 var settings=sidebar.querySelector('[data-page="settings"]');
 if(settings){settings.addEventListener('click',function(e){e.preventDefault();e.stopImmediatePropagation();location.href='promoter-settings.html';},true)}
}
function promoteMobileShortcut(){
 if(!/promoter-dashboard\.html$/i.test(location.pathname)) return;
 var bottom=document.querySelector('.bottom');
 if(!bottom||document.getElementById('tvxBottomReview')) return;
 var b=document.createElement('button');b.id='tvxBottomReview';b.innerHTML='<i>✓</i>Review';b.onclick=function(){location.href='promoter-submissions.html'};bottom.appendChild(b);
}
function setup(){ensureFilora();apply();ensurePromoterAccountTheme();addPromoterReviewShortcut();promoteMobileShortcut();}
try{localStorage.setItem(KEY,'dark')}catch(e){}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();
})();
