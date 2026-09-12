(function(){
'use strict';
var KEY='taskvexa-theme';
var SESSION_KEY='taskvexa-login-session';
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
 if(!l){l=document.createElement('link');l.id='filora-theme-css';l.rel='stylesheet';l.href='/filora-theme.css?v=6';(document.head||document.documentElement).appendChild(l)}else l.href='/filora-theme.css?v=6';
}
function ensurePromoterAccountTheme(){
 if(!/promoter-(dashboard|settings|submissions|wallet)\.html$/i.test(location.pathname))return;
 var old=document.getElementById('promoter-account-theme-css');
 if(old)old.remove();
 var l=document.createElement('link');l.id='promoter-account-theme-css';l.rel='stylesheet';l.href='/promoter-account-theme.css?v=8';(document.head||document.documentElement).appendChild(l);
}
function addPromoterReviewShortcut(){
 if(!/promoter-dashboard\.html$/i.test(location.pathname))return;
 var sidebar=document.getElementById('sidebar');if(!sidebar)return;
 if(!document.getElementById('tvxPromoterReviewSection')){
  var section=document.createElement('div');section.id='tvxPromoterReviewSection';section.className='section-title';section.textContent='TASK REVIEW';
  var link=document.createElement('a');link.id='tvxPromoterReviewShortcut';link.className='nav';link.href='promoter-submissions.html';link.style.textDecoration='none';link.innerHTML='<i>✓</i><span>Review Submissions</span>';
  var logout=sidebar.querySelector('.logout');
  if(logout){sidebar.insertBefore(section,logout);sidebar.insertBefore(link,logout)}else{sidebar.appendChild(section);sidebar.appendChild(link)}
 }
 var settings=sidebar.querySelector('[data-page="settings"]');
 if(settings)settings.addEventListener('click',function(e){e.preventDefault();e.stopImmediatePropagation();location.href='promoter-settings.html';},true);
}
function rebuildPromoterDashboard(){
 if(!/promoter-dashboard\.html$/i.test(location.pathname))return;
 var home=document.getElementById('page-home');if(!home||home.dataset.tvxRebuilt==='1')return;
 var hero=home.querySelector('.hero'),stats=home.querySelector('.stats'),layout=home.querySelector('.layout');
 if(!hero||!stats||!layout)return;
 var cols=layout.children;
 if(!cols||cols.length<2)return;
 var left=cols[0],right=cols[1];
 var wallet=right.querySelector('.wallet');
 var campaign=left.children[0],recent=left.children[1],guide=right.querySelector('.card:not(.wallet)');
 if(wallet){wallet.classList.add('promoter-redesign-wallet');home.insertBefore(wallet,stats)}
 var newLayout=document.createElement('div');newLayout.className='layout promoter-redesign-grid';
 var mainCol=document.createElement('div'),sideCol=document.createElement('div');
 if(campaign)mainCol.appendChild(campaign);
 if(recent)mainCol.appendChild(recent);
 if(guide)sideCol.appendChild(guide);
 newLayout.appendChild(mainCol);newLayout.appendChild(sideCol);
 layout.replaceWith(newLayout);
 home.dataset.tvxRebuilt='1';
}
function replaceManualPaymentDetails(){
 if(!/promoter-dashboard\.html$/i.test(location.pathname))return;
 var page=document.getElementById('page-wallet');
 if(!page||page.dataset.tvxAutomaticDeposit==='1')return;
 var old=page.querySelector('#paymentDetails');
 if(!old)return;
 var card=old.closest('.card');
 if(!card)return;
 card.innerHTML='<div class="head"><div class="head-icon">⚡</div><div><h3>Automatic Deposit</h3><p>Fund your promoter wallet instantly</p></div></div><p class="muted" style="font-size:13px;line-height:1.8">Choose the amount you want to add and continue to the secure payment checkout. Your payment is verified automatically and your wallet is updated after confirmation.</p><a class="btn" href="promoter-wallet.html" style="display:inline-block;text-decoration:none">＋ Deposit Automatically</a>';
 page.dataset.tvxAutomaticDeposit='1';
}
function setupPromoterMobileNav(){
 if(!/promoter-dashboard\.html$/i.test(location.pathname))return;
 var bottom=document.querySelector('.bottom');
 if(!bottom){
  bottom=document.createElement('nav');bottom.className='bottom';
  bottom.innerHTML='<button class="active" data-page="home"><i>⌂</i>Home</button><button data-page="tasks"><i>✓</i>Tasks</button><button data-page="create" aria-label="Create Task"><i>＋</i></button><button data-page="wallet"><i>₦</i>Wallet</button><button data-page="profile"><i>☰</i>More</button>';
  document.body.appendChild(bottom);
 }
 var buttons=bottom.querySelectorAll('button');
 if(buttons.length>=5){
  buttons[0].dataset.page='home';buttons[0].innerHTML='<i>⌂</i>Home';
  buttons[1].dataset.page='tasks';buttons[1].innerHTML='<i>✓</i>Tasks';
  buttons[2].dataset.page='create';buttons[2].innerHTML='<i>＋</i>';buttons[2].setAttribute('aria-label','Create Task');
  buttons[3].dataset.page='wallet';buttons[3].innerHTML='<i>₦</i>Wallet';
  buttons[4].dataset.page='profile';buttons[4].innerHTML='<i>☰</i>More';buttons[4].setAttribute('aria-label','More');
 }
}
function setup(){
 apply();ensureFilora();ensurePromoterAccountTheme();
 addPromoterReviewShortcut();
 rebuildPromoterDashboard();
 replaceManualPaymentDetails();
 setupPromoterMobileNav();
}
function setupLoginSession(){
 var p=(location.pathname||'/').toLowerCase();
 var publicPage=p==='/'||p===''||/\/(index|login|register|forgot-password|reset-password)\.html$/i.test(p);
 if(!publicPage && sessionStorage.getItem(SESSION_KEY)!=='1'){
  location.replace('login.html');
  return;
 }
 var tries=0;
 function bind(){
  tries++;
  try{
   var client=window.supabaseClient;
   if(client&&client.auth&&typeof client.auth.onAuthStateChange==='function'){
    client.auth.onAuthStateChange(function(event){
     if(event==='SIGNED_IN')sessionStorage.setItem(SESSION_KEY,'1');
     if(event==='SIGNED_OUT')sessionStorage.removeItem(SESSION_KEY);
    });
    return;
   }
  }catch(e){}
  if(tries<100)setTimeout(bind,50);
 }
 bind();
}
try{localStorage.setItem(KEY,'dark')}catch(e){}
setupLoginSession();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();
})();
