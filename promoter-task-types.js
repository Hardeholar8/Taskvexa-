(function(){'use strict';
const SUPABASE_URL='https://dxtlnrthlpdaobnbazny.supabase.co';
const SUPABASE_KEY='sb_publishable_UUFlTjQiT3osVMRNFYiNuA_UukQ-9kY';
function init(){
 const platform=document.getElementById('taskPlatform'), workers=document.getElementById('workersNeeded'), priceBox=document.getElementById('priceBox'), price=document.getElementById('pricePerWorker'), total=document.getElementById('totalCost'), submit=document.getElementById('submitTaskButton');
 if(!platform||!workers||!submit||!window.supabase)return;
 const sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
 let types=[], platforms=[];
 const oldType=document.getElementById('taskType');
 if(!oldType){
  const wrap=document.createElement('div'); wrap.id='taskTypeWrap'; wrap.style.display='none';
  wrap.innerHTML='<label>Task Type</label><select id="taskType"><option value="">Select task type</option></select>';
  platform.parentElement.insertAdjacentElement('afterend',wrap);
 }
 const type=document.getElementById('taskType');
 async function loadTypes(){
  const {data,error}=await sb.rpc('get_promoter_task_types');
  if(error){console.error('task types',error);return}
  types=Array.isArray(data)?data:[]; updateTypes(); updateCost();
 }
 function updateTypes(){
  const p=platform.value; const list=types.filter(x=>String(x.platform).toLowerCase()===String(p).toLowerCase());
  const wrap=document.getElementById('taskTypeWrap');
  if(!list.length){wrap.style.display='none';type.innerHTML='<option value="">General task</option>';updateCost();return}
  wrap.style.display='block'; type.innerHTML='<option value="">Select task type</option>'+list.map(x=>'<option value="'+String(x.task_type).replace(/&/g,'&amp;').replace(/"/g,'&quot;')+'">'+String(x.task_type).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')+'</option>').join('');
 }
 function selected(){return types.find(x=>String(x.platform).toLowerCase()===String(platform.value).toLowerCase()&&String(x.task_type).toLowerCase()===String(type.value).toLowerCase())}
 function updateCost(){
  const s=selected(); const w=Number(workers.value); const general=!types.some(x=>String(x.platform).toLowerCase()===String(platform.value).toLowerCase());
  if((!s&&!general)||!Number.isInteger(w)||w<1){priceBox.classList.add('hidden');submit.disabled=true;return}
  let p=0;
  if(s)p=Number(s.promoter_price||0); else { const opt=window.__taskvexaPlatformSettings&&window.__taskvexaPlatformSettings.find(x=>String(x.platform).toLowerCase()===String(platform.value).toLowerCase()); p=Number(opt?.promoter_price||0); }
  price.textContent=p.toLocaleString('en-NG'); total.textContent=(p*w).toLocaleString('en-NG'); priceBox.classList.remove('hidden'); submit.disabled=(!s&&!general);
 }
 platform.addEventListener('change',updateTypes); type.addEventListener('change',updateCost); workers.addEventListener('input',updateCost);
 const oldSubmit=submit.cloneNode(true); submit.replaceWith(oldSubmit);
 const button=document.getElementById('submitTaskButton');
 button.addEventListener('click',async function(){
  const title=document.getElementById('taskTitle').value.trim(), description=document.getElementById('taskDescription').value.trim(), p=platform.value, url=document.getElementById('taskUrl').value.trim(), w=Number(workers.value), tt=type.value||null, chosen=selected();
  const general=!types.some(x=>String(x.platform).toLowerCase()===String(p).toLowerCase());
  if(!title||!description||!p||!url||!Number.isInteger(w)||w<1||(types.some(x=>String(x.platform).toLowerCase()===String(p).toLowerCase())&&!chosen)){document.getElementById('taskMessage').textContent='Please complete all task fields correctly.';document.getElementById('taskMessage').className='error';return}
  button.disabled=true;button.textContent='Submitting...';
  try{const {data,error}=await sb.rpc('create_promoter_task_v2',{p_title:title,p_description:description,p_platform:p,p_task_url:url,p_workers_needed:w,p_task_type:tt});if(error)throw error;if(!data?.success)throw new Error(data?.message||'Task could not be created.');document.getElementById('taskMessage').textContent='Task submitted successfully. Status: '+(data.status==='active'?'LIVE':'Pending Admin Review');document.getElementById('taskMessage').className='success';document.getElementById('taskTitle').value='';document.getElementById('taskDescription').value='';document.getElementById('taskUrl').value='';workers.value='1';platform.value='';type.innerHTML='<option value="">Select task type</option>';document.getElementById('taskTypeWrap').style.display='none';priceBox.classList.add('hidden');
  }catch(e){console.error('submit',e);document.getElementById('taskMessage').textContent=e.message||'Task could not be created.';document.getElementById('taskMessage').className='error'}finally{button.textContent='Submit Task';updateTypes()}
 });
 window.__taskvexaPlatformSettings=[];
 const originalLoad=window.loadSettings;
 if(typeof originalLoad==='function'){const old=originalLoad;window.loadSettings=async function(){await old();try{window.__taskvexaPlatformSettings=window.__taskvexaPlatformSettings||[];const {data}=await sb.rpc('get_promoter_task_settings');window.__taskvexaPlatformSettings=Array.isArray(data)?data:[];}catch(e){console.error(e)}updateTypes();updateCost()}}
 loadTypes();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();