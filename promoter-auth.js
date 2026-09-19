// TaskVexa Promoter authentication — stable session guard 20260919f.
(function(){
  const SUPABASE_URL='https://dxtlnrthlpdaobnbazny.supabase.co';
  const SUPABASE_KEY='sb_publishable_UUFlTjQiT3osVMRNFYiNuA_UukQ-9kY';
  const sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{
    auth:{
      persistSession:true,
      autoRefreshToken:true,
      detectSessionInUrl:true,
      storageKey:'taskvexa-promoter-auth'
    }
  });
  window.promoterSupabase=sb;

  async function getPromoterContext(){
    let lastError=null;
    for(let attempt=0;attempt<2;attempt++){
      const {data:{session}={},error:se}=await sb.auth.getSession();
      if(se){lastError=se;continue}
      const user=session?.user;
      if(!user) return {user:null,profile:null,account:null,error:new Error('Not signed in')};
      const {data:account,error:ve}=await sb.rpc('validate_promoter_session');
      if(!ve && account?.valid===true){
        return {user,profile:null,account:account.account||{status:'active'},error:null};
      }
      lastError=ve||new Error('Promoter account validation failed');
      await new Promise(r=>setTimeout(r,350));
    }
    return {user:null,profile:null,account:null,error:lastError};
  }

  window.getPromoterContextForLogin=getPromoterContext;

  window.requirePromoter=async function(){
    const ctx=await getPromoterContext();
    if(ctx.error){
      console.error('Promoter guard:',ctx.error);
      // Do not sign out on a transient validation/session error.
      // Only an actual missing session should send the user to login.
      if(ctx.error.message==='Not signed in'){
        window.location.href='promoter-login.html?error='+encodeURIComponent('Your Promoter session has expired. Please sign in again.');
      }else{
        const target=document.body;
        if(target){
          const box=document.createElement('div');
          box.style='position:fixed;inset:0;z-index:99999;display:grid;place-items:center;padding:24px;background:#070b14;color:#fff;font:14px system-ui;text-align:center';
          box.innerHTML='<div><b>Promoter session could not be verified.</b><br><span style="color:#94a3b8">Please wait a moment and refresh this page.</span></div>';
          target.appendChild(box);
        }
      }
      return null;
    }
    return ctx;
  };

  window.promoterLogout=async function(){
    try{await sb.auth.signOut()}catch(e){}
    window.location.href='promoter-login.html';
  };
})();