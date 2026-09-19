(function(){
  const path=location.pathname.split('/').pop()||'promoter-dashboard.html';
  const nav=document.querySelector('.nav');
  if(nav) nav.remove();
  const items=[
    ['promoter-dashboard.html','⌂','Home'],
    ['promoter-campaigns.html','▣','Campaigns'],
    ['promoter-create.html','+','Create'],
    ['promoter-wallet.html','◈','Wallet'],
    ['promoter-settings.html','⋯','More']
  ];
  const el=document.createElement('nav');
  el.className='tvx-promoter-nav';
  el.setAttribute('aria-label','Promoter navigation');
  el.innerHTML=items.map(([href,icon,label],i)=>{
    const active=(path===href)||(path==='promoter-campaign-details.html'&&href==='promoter-campaigns.html');
    return `<a href="${href}" class="${active?'active ':''}${i===2?'create':''}" ${i===2?'aria-label="Create campaign"':''}><span>${icon}</span><small>${label}</small></a>`;
  }).join('');
  document.body.appendChild(el);
  const style=document.createElement('style');
  style.textContent=`.tvx-promoter-nav{position:fixed;left:0;right:0;bottom:0;z-index:9999;height:72px;padding:0 9px 4px;background:rgba(8,13,24,.97);border-top:1px solid #26344d;box-shadow:0 -12px 34px rgba(0,0,0,.3);backdrop-filter:blur(18px);display:flex;align-items:center;justify-content:space-around}.tvx-promoter-nav a{flex:1;min-width:0;height:56px;margin:7px 2px 0;border-radius:14px;text-decoration:none;color:#a8b3c7;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;font:700 10px Inter,system-ui,sans-serif}.tvx-promoter-nav a span{font-size:20px;line-height:21px;font-weight:500}.tvx-promoter-nav a small{font-size:9px}.tvx-promoter-nav a.active{color:#a477ff;background:rgba(112,72,255,.16);color:#b894ff!important}.tvx-promoter-nav a.create{flex:0 0 58px;width:58px;height:58px;margin:-18px 5px 0;border:4px solid #080d18;border-radius:50%;background:linear-gradient(145deg,#5d35ed,#8c45ff);color:#fff!important;box-shadow:0 8px 24px rgba(90,48,236,.5)}.tvx-promoter-nav a.create span{font-size:29px;line-height:1}.tvx-promoter-nav a.create small{display:none}body:has(.tvx-promoter-nav) main{padding-bottom:105px!important}@media(max-width:380px){.tvx-promoter-nav{height:69px;padding-left:5px;padding-right:5px}.tvx-promoter-nav a{margin-left:1px;margin-right:1px}.tvx-promoter-nav a.create{flex-basis:54px;width:54px;height:54px}}`;
  document.head.appendChild(style);
})();
