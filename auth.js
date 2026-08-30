// TASKVEXA AUTHENTICATION
const SUPABASE_URL="https://dxtlnrthlpdaobnbazny.supabase.co";
const SUPABASE_KEY="sb_publishable_UUFlTjQiT3osVMRNFYiNuA_UukQ-9kY";

if(!window.supabase){console.error("Supabase library did not load.");}
else{
 const supabaseClient=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
 window.supabaseClient=supabaseClient;
 const msg=t=>{const el=document.getElementById("message");if(el)el.textContent=t;else console.log(t)};

 const form=document.getElementById("registerForm");
 if(form){
  form.addEventListener("submit",async e=>{
   e.preventDefault();
   const button=document.getElementById("registerButton");
   const firstName=document.getElementById("firstName")?.value.trim()||"";
   const lastName=document.getElementById("lastName")?.value.trim()||"";
   const legacyFull=document.getElementById("fullName")?.value.trim()||"";
   const fullName=[firstName,lastName].filter(Boolean).join(" ")||legacyFull;
   const username=document.getElementById("username")?.value.trim()||"";
   const email=document.getElementById("email")?.value.trim().toLowerCase()||"";
   const referralCode=document.getElementById("referralCode")?.value.trim()||"";
   const password=document.getElementById("password")?.value||"";
   const confirm=document.getElementById("confirmPassword")?.value||"";
   const accountType=document.getElementById("accountType")?.value||"";

   if(!firstName||!lastName||!email||!password||!confirm||!accountType||(!username&&document.getElementById("username"))){msg("Please complete all required fields.");return;}
   if(password.length<6){msg("Password must be at least 6 characters.");return;}
   if(password!==confirm){msg("Passwords do not match.");return;}
   if(button){button.disabled=true;button.textContent="Creating Account...";}

   try{
    const metadata={full_name:fullName,first_name:firstName,last_name:lastName,username,account_type:accountType,role:accountType};
    if(referralCode)metadata.referral_code=referralCode;
    const {data,error}=await supabaseClient.auth.signUp({email,password,options:{data:metadata}});
    if(error){msg(error.message);if(button){button.disabled=false;button.textContent="Create Account";}return;}
    if(data?.user){
     form.style.display="none";
     const box=document.getElementById("successBox");if(box)box.style.display="block";else msg("Account created successfully. Please check your email.");
     return;
    }
    msg("Registration could not be completed. Please try again.");
    if(button){button.disabled=false;button.textContent="Create Account";}
   }catch(error){console.error("Registration error:",error);msg("Registration error: "+(error?.message||"Please try again."));if(button){button.disabled=false;button.textContent="Create Account";}}
  });
 }

 const loginForm=document.getElementById("loginForm");
 if(loginForm){loginForm.addEventListener("submit",async e=>{
  e.preventDefault();const email=document.getElementById("loginEmail")?.value.trim().toLowerCase()||"";const password=document.getElementById("loginPassword")?.value||"";const button=document.getElementById("loginButton");
  if(button){button.disabled=true;button.textContent="Logging in...";}
  try{
   const {data,error}=await supabaseClient.auth.signInWithPassword({email,password});
   if(error){msg(error.message);if(button){button.disabled=false;button.textContent="Login";}return;}
   if(!data?.user)throw new Error("Login could not be completed.");
   const {data:profile,error:pe}=await supabaseClient.from("profiles").select("role").eq("id",data.user.id).maybeSingle();
   if(pe)throw pe;
   if(!profile){await supabaseClient.auth.signOut();msg("Account profile not found. Please contact support.");if(button){button.disabled=false;button.textContent="Login";}return;}
   const role=String(profile.role||"").toLowerCase();
   if(role==="promoter")return window.location.href="promoter-dashboard.html";
   if(role==="admin")return window.location.href="admin.html";
   if(role==="worker")return window.location.href="dashboard.html";
   await supabaseClient.auth.signOut();msg("Your account type is not recognized. Please contact support.");if(button){button.disabled=false;button.textContent="Login";}
  }catch(error){console.error("Login error:",error);msg("Login error: "+(error?.message||"Please try again."));if(button){button.disabled=false;button.textContent="Login";}}
 });}

 const forgotButton=document.getElementById("forgotPassword");
 if(forgotButton){forgotButton.addEventListener("click",async e=>{e.preventDefault();const email=prompt("Enter your registered email:");if(!email)return;try{forgotButton.disabled=true;forgotButton.textContent="Sending...";const {error}=await supabaseClient.auth.resetPasswordForEmail(email.trim().toLowerCase(),{redirectTo:window.location.origin+"/reset-password.html"});if(error)msg(error.message);else msg("Password reset link sent. Please check your email.");}catch(error){msg("Password reset error: "+(error?.message||"Please try again."));}finally{forgotButton.disabled=false;forgotButton.textContent="Forgot Password?";}});}

 window.logoutUser=async()=>{try{await supabaseClient.auth.signOut();}catch(e){console.error("Logout error:",e)}window.location.href="login.html";};
 window.requireLogin=async()=>{const {data}=await supabaseClient.auth.getSession();if(!data.session){window.location.href="login.html";return false}return true;};
 window.getCurrentUserRole=async()=>{try{const {data:{user}}=await supabaseClient.auth.getUser();if(!user)return null;const {data,error}=await supabaseClient.from("profiles").select("role").eq("id",user.id).maybeSingle();if(error)return null;return data?.role||null;}catch(e){console.error("GET ROLE ERROR:",e);return null;}};
}