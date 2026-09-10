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
 if(!l){l=document.createElement('link');l.id='filora-theme-css';l.rel='stylesheet';l.href='/filora-theme.css?v=5';(document.head||document.documentElement).appendChild(l)}else l.href='/filora-theme.css?v=5';
}
function ensurePromoterAccountTheme(){
 if(!/promoter-(dashboard|settings|submissions|wallet)\\.html$/i.test(location.pathname)) return;
 var old=document.getElementById('promoter-account-theme-css');
 if(old)old.remove();
 var l=document.createElement('link');l.id='promoter-account-theme-css';l.rel='stylesheet';l.href='/promoter-account-theme.css?v=5';(document.head||document.documentElement).appendChild(l);
}
function addPromoterReviewShortcut(){
 if(!/promoter-dashboard\\.html$/i.test(location.pathname))return;
 var sidebar=document.getElementById('sidebar');
 if(!sidebar)return;
 if(!document.getElementById('tvxPromoterReviewSection')){
  var section=document.createElement('div');section.id='tvxPromoterReviewSection';section.className='section-title';section.textContent='TASK REVIEW';
  var link=document.createElement('a');link.id='tvxPromoterReviewShortcut';link.className='nav';link.href='promoter-submissions.html';link.style.textDecoration='none';link.innerHTML='<i>✓</i><span>Review Submissions</span>';
  var logout=sidebar.querySelector('.logout');
  if(logout){sidebar.insertBefore(section,logout);sidebar.insertBefore(link,logout)}else{sidebar.appendChild(section);sidebar.appendChild(link)}
 }
 var settings=sidebar.querySelector('[data-page="settings"]');
 if(settings)settings.addEventListener('click',function(e){e.preventDefault();e.stopImmediatePropagation();location.href='promoter-settings.html';},true);
}
function setupPromoterMobileNav(){
 if(!/promoter-dashboard\\.html$/i.test(location.pathname))return;
 var bottom=document.querySelector('.bottom');
 if(!bottom)return;
 var buttons=bottom.querySelectorAll('button');
 if(buttons.length<5)return;
 /* Filora structure: Home / Tasks / + / Wallet / More. */
 var home=buttons[0],create=buttons[1],tasks=buttons[2],wallet=buttons[3],more=buttons[4];
 create.dataset.page='tasks';create.innerHTML='<i>✓</i>Tasks';
 tasks.dataset.page='create';tasks.innerHTML='<i>＋</i>';
 tasks.setAttribute('aria-label','Create Task');
 more.dataset.page='profile';more.innerHTML='<i>☰</i>More';
 more.setAttribute('aria-label','More');
}
function setup(){ensureFilora();apply();ensurePromoterAccountTheme();addPromoterReviewShortcut();setupPromoterMobileNav();}
try{localStorage.setItem(KEY,'dark')}catch(e){}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();
})();
