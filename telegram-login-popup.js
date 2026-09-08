// TaskVexa post-login Telegram popup
(function(){
  async function showTelegramPopup(){
    if(sessionStorage.getItem('taskvexa-show-telegram-popup')!=='1') return;
    sessionStorage.removeItem('taskvexa-show-telegram-popup');
    try{
      const client=window.supabaseClient || window.supabase?.createClient?.('https://dxtlnrthlpdaobnbazny.supabase.co','sb_publishable_UUFlTjQiT3osVMRNFYiNuA_UukQ-9kY');
      if(!client) return;
      const {data,error}=await client.from('platform_settings').select('value').eq('key','telegram').maybeSingle();
      if(error) throw error;
      const value=data?.value;
      const link=typeof value==='string'?value:value?.group_link;
      if(!link || !/^https:\/\/(t\.me|telegram\.me)\//i.test(link)) return;
      const style=document.createElement('style');
      style.textContent='#taskvexaTelegramLoginModal{position:fixed;inset:0;z-index:999999;background:rgba(3,7,15,.82);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:18px;font-family:Inter,system-ui,sans-serif}#taskvexaTelegramLoginModal .tvx-card{position:relative;width:min(430px,100%);background:#fff;color:#111827;border-radius:22px;padding:30px 24px 24px;text-align:center;box-shadow:0 25px 80px rgba(0,0,0,.35)}#taskvexaTelegramLoginModal .tvx-close{position:absolute;right:10px;top:10px;width:30px;height:30px;border:0;border-radius:50%;background:#f1f3f6;color:#667085;font-size:20px;cursor:pointer}#taskvexaTelegramLoginModal .tvx-icon{width:58px;height:58px;margin:0 auto 14px;border-radius:18px;background:#eaf6ff;display:flex;align-items:center;justify-content:center;font-size:29px}#taskvexaTelegramLoginModal h2{margin:0 0 9px;font-size:23px;font-weight:900}#taskvexaTelegramLoginModal p{margin:0 auto 21px;color:#667085;font-size:14px;line-height:1.6;max-width:340px}#taskvexaTelegramLoginModal .tvx-join{display:block;width:100%;border-radius:12px;padding:14px 16px;background:#229ed9;color:#fff;font-size:15px;font-weight:850;text-decoration:none}#taskvexaTelegramLoginModal .tvx-note{margin-top:12px;font-size:11px;color:#98a2b3}';
      document.head.appendChild(style);
      const modal=document.createElement('div'); modal.id='taskvexaTelegramLoginModal'; modal.setAttribute('role','dialog'); modal.setAttribute('aria-modal','true');
      const safe=String(link).replace(/&/g,'&amp;').replace(/"/g,'&quot;');
      modal.innerHTML='<div class="tvx-card"><button class="tvx-close" aria-label="Close">×</button><div class="tvx-icon">✈️</div><h2>Join TaskVexa on Telegram</h2><p>Stay updated with TaskVexa announcements, important information and community updates.</p><a class="tvx-join" href="'+safe+'" target="_blank" rel="noopener noreferrer">Join Telegram</a><div class="tvx-note">Close this message to continue to your dashboard.</div></div>';
      document.body.appendChild(modal); document.body.style.overflow='hidden';
      modal.querySelector('.tvx-close').addEventListener('click',function(){modal.remove();style.remove();document.body.style.overflow='';},{once:true});
    }catch(e){console.warn('Telegram popup:',e)}
  }
  window.showTelegramLoginPopupIfNeeded=showTelegramPopup;
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(showTelegramPopup,200));
  else setTimeout(showTelegramPopup,200);
})();