(function(){'use strict';try{
 const params=new URLSearchParams(window.location.search);const code=(params.get('ref')||'').trim();
 if(!code)return;
 const field=document.getElementById('referralCode');if(field&&!field.value)field.value=code;
 if(!window.supabase?.createClient)return;
 const original=window.supabase.createClient;
 window.supabase.createClient=function(){const client=original.apply(this,arguments);const originalSignUp=client.auth.signUp.bind(client.auth);client.auth.signUp=async function(credentials){const next=credentials&&typeof credentials==='object'?{...credentials}:credentials;if(next&&typeof next==='object'){next.options={...(next.options||{}),data:{...((next.options&&next.options.data)||{}),referral_code:code}}}return originalSignUp(next)};return client};
}catch(e){console.error('Referral capture error',e)}})();