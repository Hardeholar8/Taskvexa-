(function(){'use strict';
  const params=new URLSearchParams(window.location.search);
  const code=(params.get('ref')||'').trim();
  if(!code)return;

  function captureReferral(){
    const field=document.getElementById('referralCode');
    if(field&&!field.value){
      field.value=code;
      field.dispatchEvent(new Event('input',{bubbles:true}));
      field.dispatchEvent(new Event('change',{bubbles:true}));
    }
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',captureReferral,{once:true});
  }else{
    captureReferral();
  }

  const originalCreateClient=window.supabase?.createClient;
  if(originalCreateClient){
    window.supabase.createClient=function(){
      const client=originalCreateClient.apply(this,arguments);
      const originalSignUp=client.auth.signUp.bind(client.auth);
      client.auth.signUp=async function(credentials){
        const next=credentials&&typeof credentials==='object'?{...credentials}:credentials;
        if(next&&typeof next==='object'){
          next.options={...(next.options||{}),data:{...((next.options&&next.options.data)||{}),referral_code:code}};
        }
        return originalSignUp(next);
      };
      return client;
    };
  }
})();