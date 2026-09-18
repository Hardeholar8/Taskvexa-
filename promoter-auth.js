// TaskVexa Promoter authentication — cache version 20260918d.
// TaskVexa Promoter authentication — isolated from Worker auth.
(function(){
  const SUPABASE_URL='https://dxtlnrthlpdaobnbazny.supabase.co';
  const SUPABASE_KEY='sb_publishable_UUFlTjQiT3osVMRNFYiNuA_UukQ-9kY';
  const sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storageKey:'taskvexa-promoter-auth'}});
  window.promoterSupabase=sb;

  async function getPromoterContext(){
    const {data:{session},error:se}=await sb.auth.getSession();
    const user=session?.user;
    if(se||!user) return {user:null,profile:null,account:null,error:se||new Error('Not signed in')};
    // Validate the Promoter role/account through the secure catalog RPC instead of
    // direct profile/promoter_accounts queries, which can be blocked by RLS.
    const {error:ve}=await sb.rpc('get_promoter_task_catalog');
    if(ve) return {user,profile:null,account:null,error:ve};
    return {user,profile:null,account:{status:'active'},error:null};
  }

  window.getPromoterContextForLogin=getPromoterContext;
  window.requirePromoter=async function(){
    const ctx=await getPromoterContext();
    if(ctx.error){
      console.error('Promoter guard:',ctx.error);
      try{await sb.auth.signOut()}catch(e){}
      window.location.href='promoter-login.html?error='+encodeURIComponent(ctx.error.message||'Login failed');
      return null;
    }
    return ctx;
  };
  window.promoterLogout=async function(){
    try{await sb.auth.signOut()}catch(e){}
    window.location.href='promoter-login.html';
  };
})();
