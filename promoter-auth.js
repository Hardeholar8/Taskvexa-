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
    const {data:profile,error:pe}=await sb.from('profiles').select('id,role,username').eq('id',user.id).maybeSingle();
    if(pe||!profile) return {user,profile:null,account:null,error:pe||new Error('Promoter profile not found')};
    if(String(profile.role).toLowerCase()!=='promoter') return {user,profile,account:null,error:new Error('This account is not registered as a Promoter')};
    const {data:account,error:ae}=await sb.from('promoter_accounts').select('user_id,display_name,status').eq('user_id',user.id).maybeSingle();
    if(ae||!account) return {user,profile,account:null,error:ae||new Error('Promoter account record not found')};
    if(String(account.status).toLowerCase()!=='active') return {user,profile,account,error:new Error('Promoter account is not active')};
    return {user,profile,account,error:null};
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
